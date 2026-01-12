<?php
// app/Http/Controllers/Api/Mobile/SyncController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SincronizacionMovil;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\Venta;
use App\Models\Pedido;
use App\Models\InventarioSucursal;
use Carbon\Carbon;

class SyncController extends Controller
{
    /**
     * Sincronización inicial (primera vez)
     */
    public function syncInicial(Request $request)
    {
        $request->validate([
            'dispositivo_id' => 'nullable|string',
            'ultima_sincronizacion' => 'nullable|date',
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        DB::beginTransaction();
        
        try {
            // Registrar inicio de sincronización
            $sync = SincronizacionMovil::create([
                'user_id' => $user->id,
                'dispositivo_id' => $request->dispositivo_id,
                'tipo_sincronizacion' => 'INICIAL',
                'fecha_sincronizacion' => now(),
                'estado' => 'PENDIENTE',
            ]);
            
            // 1. Productos activos de la sucursal
            $productos = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
                $q->where('sucursal_id', $sucursalId);
            }])
            ->where('activo', true)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'codigo_barras' => $producto->codigo_barras,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'precio_venta' => (float) $producto->precio_venta,
                    'precio_con_itbis' => (float) $producto->precio_con_itbis,
                    'precio_mayor' => (float) $producto->precio_mayor,
                    'tasa_itbis' => $producto->tasa_itbis,
                    'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                    'exento_itbis' => (bool) $producto->exento_itbis,
                    'unidad_medida' => $producto->unidad_medida,
                    'stock_disponible' => $producto->inventario->first()->stock_disponible ?? 0,
                    'stock_minimo' => (float) $producto->stock_minimo,
                    'control_stock' => (bool) $producto->control_stock,
                    'categoria' => $producto->categoria->nombre ?? '',
                    'created_at' => $producto->created_at,
                    'updated_at' => $producto->updated_at,
                ];
            });
            
            // 2. Clientes activos
            $clientes = Cliente::where('activo', true)
                ->get()
                ->map(function ($cliente) {
                    return [
                        'id' => $cliente->id,
                        'codigo' => $cliente->codigo,
                        'nombre_completo' => $cliente->nombre_completo,
                        'cedula_rnc' => $cliente->cedula_rnc,
                        'identificacion_formateada' => $cliente->identificacion_formateada,
                        'telefono' => $cliente->telefono,
                        'email' => $cliente->email,
                        'direccion' => $cliente->direccion,
                        'provincia' => $cliente->provincia,
                        'municipio' => $cliente->municipio,
                        'tipo_contribuyente' => $cliente->tipo_contribuyente,
                        'limite_credito' => (float) $cliente->limite_credito,
                        'dias_credito' => $cliente->dias_credito,
                        'descuento' => (float) $cliente->descuento,
                        'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                        'created_at' => $cliente->created_at,
                        'updated_at' => $cliente->updated_at,
                    ];
                });
            
            // 3. Ventas pendientes del vendedor
            $ventasPendientes = Venta::with(['detalles.producto'])
                ->where('user_id', $user->id)
                ->where('sucursal_id', $sucursalId)
                ->where('estado', 'PENDIENTE')
                ->get()
                ->map(function ($venta) {
                    return [
                        'id' => $venta->id,
                        'numero_factura' => $venta->numero_factura,
                        'ncf' => $venta->ncf,
                        'cliente_id' => $venta->cliente_id,
                        'fecha_venta' => $venta->fecha_venta->format('Y-m-d'),
                        'estado' => $venta->estado,
                        'condicion_pago' => $venta->condicion_pago,
                        'subtotal' => (float) $venta->subtotal,
                        'descuento' => (float) $venta->descuento,
                        'itbis' => (float) $venta->itbis,
                        'total' => (float) $venta->total,
                        'notas' => $venta->notas,
                        'detalles' => $venta->detalles->map(function ($detalle) {
                            return [
                                'producto_id' => $detalle->producto_id,
                                'producto_nombre' => $detalle->producto->nombre ?? '',
                                'cantidad' => (float) $detalle->cantidad,
                                'precio_unitario' => (float) $detalle->precio_unitario,
                                'descuento' => (float) $detalle->descuento,
                                'itbis_porcentaje' => (float) $detalle->itbis_porcentaje,
                                'subtotal' => (float) $detalle->subtotal,
                            ];
                        }),
                        'created_at' => $venta->created_at,
                        'updated_at' => $venta->updated_at,
                    ];
                });
            
            // 4. Pedidos pendientes del vendedor
            $pedidosPendientes = Pedido::with(['detalles.producto', 'cliente'])
                ->where('user_id', $user->id)
                ->where('sucursal_id', $sucursalId)
                ->where('estado', 'PENDIENTE')
                ->get()
                ->map(function ($pedido) {
                    return [
                        'id' => $pedido->id,
                        'numero_pedido' => $pedido->numero_pedido,
                        'cliente_id' => $pedido->cliente_id,
                        'cliente_nombre' => $pedido->cliente->nombre_completo ?? '',
                        'fecha_pedido' => $pedido->fecha_pedido->format('Y-m-d'),
                        'fecha_entrega' => $pedido->fecha_entrega ? $pedido->fecha_entrega->format('Y-m-d') : null,
                        'estado' => $pedido->estado,
                        'total' => (float) $pedido->total,
                        'notas' => $pedido->notas,
                        'detalles' => $pedido->detalles->map(function ($detalle) {
                            return [
                                'producto_id' => $detalle->producto_id,
                                'producto_nombre' => $detalle->producto->nombre ?? '',
                                'cantidad' => (float) $detalle->cantidad,
                                'precio_unitario' => (float) $detalle->precio_unitario,
                                'subtotal' => (float) $detalle->subtotal,
                            ];
                        }),
                        'created_at' => $pedido->created_at,
                        'updated_at' => $pedido->updated_at,
                    ];
                });
            
            // Actualizar registro de sincronización
            $sync->update([
                'registros_enviados' => $productos->count() + $clientes->count() + 
                                       $ventasPendientes->count() + $pedidosPendientes->count(),
                'estado' => 'COMPLETADA',
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Sincronización inicial completada',
                'data' => [
                    'productos' => $productos,
                    'clientes' => $clientes,
                    'ventas_pendientes' => $ventasPendientes,
                    'pedidos_pendientes' => $pedidosPendientes,
                    'timestamp' => now()->toISOString(),
                    'configuracion' => [
                        'itbis_porcentaje' => 18.00,
                        'moneda' => 'DOP',
                        'simbolo_moneda' => 'RD$',
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            if (isset($sync)) {
                $sync->update([
                    'estado' => 'ERROR',
                    'observaciones' => $e->getMessage(),
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error en sincronización: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Sincronización incremental (solo cambios)
     */
    public function syncIncremental(Request $request)
    {
        $request->validate([
            'ultima_sincronizacion' => 'required|date',
            'dispositivo_id' => 'nullable|string',
            'datos_locales' => 'nullable|array', // Datos creados/modificados en la app
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        $ultimaSync = Carbon::parse($request->ultima_sincronizacion);
        
        DB::beginTransaction();
        
        try {
            $sync = SincronizacionMovil::create([
                'user_id' => $user->id,
                'dispositivo_id' => $request->dispositivo_id,
                'tipo_sincronizacion' => 'INCREMENTAL',
                'fecha_sincronizacion' => now(),
                'estado' => 'PENDIENTE',
            ]);
            
            // ========== RECIBIR DATOS DE LA APP ==========
            $datosRecibidos = 0;
            $errores = [];
            
            if ($request->has('datos_locales')) {
                foreach ($request->datos_locales as $tipo => $items) {
                    switch ($tipo) {
                        case 'ventas':
                            foreach ($items as $ventaData) {
                                try {
                                    $this->procesarVentaDesdeMovil($ventaData, $user, $sucursalId);
                                    $datosRecibidos++;
                                } catch (\Exception $e) {
                                    $errores[] = "Venta {$ventaData['numero_factura']}: " . $e->getMessage();
                                }
                            }
                            break;
                            
                        case 'pedidos':
                            foreach ($items as $pedidoData) {
                                try {
                                    $this->procesarPedidoDesdeMovil($pedidoData, $user, $sucursalId);
                                    $datosRecibidos++;
                                } catch (\Exception $e) {
                                    $errores[] = "Pedido {$pedidoData['numero_pedido']}: " . $e->getMessage();
                                }
                            }
                            break;
                            
                        case 'clientes':
                            foreach ($items as $clienteData) {
                                try {
                                    $this->procesarClienteDesdeMovil($clienteData);
                                    $datosRecibidos++;
                                } catch (\Exception $e) {
                                    $errores[] = "Cliente {$clienteData['nombre_completo']}: " . $e->getMessage();
                                }
                            }
                            break;
                    }
                }
            }
            
            // ========== ENVIAR DATOS ALTERADOS ==========
            $cambios = [
                'productos_actualizados' => [],
                'clientes_actualizados' => [],
                'inventario_actualizado' => [],
                'ventas_procesadas' => [],
                'pedidos_procesados' => [],
            ];
            
            // Productos actualizados
            $cambios['productos_actualizados'] = Producto::with(['inventario' => function($q) use ($sucursalId) {
                    $q->where('sucursal_id', $sucursalId);
                }])
                ->where('activo', true)
                ->where('updated_at', '>', $ultimaSync)
                ->get()
                ->map(function ($producto) {
                    return [
                        'id' => $producto->id,
                        'precio_venta' => (float) $producto->precio_venta,
                        'precio_con_itbis' => (float) $producto->precio_con_itbis,
                        'stock_disponible' => $producto->inventario->first()->stock_disponible ?? 0,
                        'updated_at' => $producto->updated_at,
                    ];
                });
            
            // Clientes actualizados
            $cambios['clientes_actualizados'] = Cliente::where('activo', true)
                ->where('updated_at', '>', $ultimaSync)
                ->get()
                ->map(function ($cliente) {
                    return [
                        'id' => $cliente->id,
                        'nombre_completo' => $cliente->nombre_completo,
                        'telefono' => $cliente->telefono,
                        'limite_credito' => (float) $cliente->limite_credito,
                        'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                        'updated_at' => $cliente->updated_at,
                    ];
                });
            
            // Inventario actualizado
            $cambios['inventario_actualizado'] = InventarioSucursal::with('producto')
                ->where('sucursal_id', $sucursalId)
                ->where('updated_at', '>', $ultimaSync)
                ->get()
                ->map(function ($inventario) {
                    return [
                        'producto_id' => $inventario->producto_id,
                        'stock_disponible' => (float) $inventario->stock_disponible,
                        'updated_at' => $inventario->updated_at,
                    ];
                });
            
            // Ventas procesadas (cambiaron de estado)
            $cambios['ventas_procesadas'] = Venta::where('user_id', $user->id)
                ->where('sucursal_id', $sucursalId)
                ->whereIn('estado', ['PROCESADA', 'ANULADA'])
                ->where('updated_at', '>', $ultimaSync)
                ->get()
                ->map(function ($venta) {
                    return [
                        'id' => $venta->id,
                        'numero_factura' => $venta->numero_factura,
                        'estado' => $venta->estado,
                        'updated_at' => $venta->updated_at,
                    ];
                });
            
            // Pedidos procesados
            $cambios['pedidos_procesados'] = Pedido::where('user_id', $user->id)
                ->where('sucursal_id', $sucursalId)
                ->whereIn('estado', ['PROCESADO', 'CANCELADO'])
                ->where('updated_at', '>', $ultimaSync)
                ->get()
                ->map(function ($pedido) {
                    return [
                        'id' => $pedido->id,
                        'numero_pedido' => $pedido->numero_pedido,
                        'estado' => $pedido->estado,
                        'updated_at' => $pedido->updated_at,
                    ];
                });
            
            // Actualizar registro de sincronización
            $sync->update([
                'registros_recibidos' => $datosRecibidos,
                'registros_enviados' => collect($cambios)->map(fn($item) => count($item))->sum(),
                'estado' => 'COMPLETADA',
                'observaciones' => $errores ? implode('; ', $errores) : null,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Sincronización incremental completada',
                'data' => [
                    'cambios' => $cambios,
                    'errores' => $errores,
                    'timestamp' => now()->toISOString(),
                    'resumen' => [
                        'datos_recibidos' => $datosRecibidos,
                        'cambios_enviados' => collect($cambios)->map(fn($item) => count($item))->sum(),
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            if (isset($sync)) {
                $sync->update([
                    'estado' => 'ERROR',
                    'observaciones' => $e->getMessage(),
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error en sincronización: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Procesar venta recibida desde móvil
     */
    private function procesarVentaDesdeMovil(array $data, $user, $sucursalId)
    {
        // Validar datos básicos
        if (empty($data['cliente_id']) || empty($data['detalles'])) {
            throw new \Exception('Datos de venta incompletos');
        }
        
        DB::transaction(function () use ($data, $user, $sucursalId) {
            // Crear venta
            $venta = Venta::create([
                'numero_factura' => 'TEMP-' . time() . '-' . $user->id,
                'ncf' => null, // Se asignará al procesar
                'tipo_comprobante' => 'FACTURA',
                'cliente_id' => $data['cliente_id'],
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'fecha_venta' => now(),
                'estado' => 'PENDIENTE',
                'condicion_pago' => $data['condicion_pago'] ?? 'CONTADO',
                'dias_credito' => $data['dias_credito'] ?? 0,
                'subtotal' => 0,
                'descuento' => 0,
                'itbis' => 0,
                'total' => 0,
                'notas' => $data['notas'] ?? 'Creada desde app móvil',
            ]);
            
            $subtotal = 0;
            $descuento = 0;
            $itbis = 0;
            
            // Crear detalles
            foreach ($data['detalles'] as $detalleData) {
                $producto = Producto::find($detalleData['producto_id']);
                
                if (!$producto) {
                    throw new \Exception("Producto no encontrado: {$detalleData['producto_id']}");
                }
                
                // Verificar stock
                $inventario = InventarioSucursal::where('producto_id', $producto->id)
                    ->where('sucursal_id', $sucursalId)
                    ->first();
                
                if ($inventario && $producto->control_stock) {
                    if ($inventario->stock_disponible < $detalleData['cantidad']) {
                        throw new \Exception("Stock insuficiente para {$producto->nombre}");
                    }
                }
                
                // Calcular valores
                $precio = $detalleData['precio_unitario'] ?? $producto->precio_venta;
                $cantidad = $detalleData['cantidad'];
                $descuentoItem = $detalleData['descuento'] ?? 0;
                $subtotalItem = $precio * $cantidad;
                
                // Calcular ITBIS
                $itbisPorcentaje = $producto->exento_itbis ? 0 : $producto->itbis_porcentaje;
                $itbisItem = $subtotalItem * ($itbisPorcentaje / 100);
                
                // Crear detalle
                \App\Models\DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precio,
                    'descuento' => $descuentoItem,
                    'subtotal' => $subtotalItem,
                    'itbis_porcentaje' => $itbisPorcentaje,
                    'itbis_monto' => $itbisItem,
                    'total' => $subtotalItem - $descuentoItem + $itbisItem,
                ]);
                
                $subtotal += $subtotalItem;
                $descuento += $descuentoItem;
                $itbis += $itbisItem;
            }
            
            // Actualizar totales
            $venta->update([
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'itbis' => $itbis,
                'total' => $subtotal - $descuento + $itbis,
            ]);
            
            // Reservar stock si es necesario
            if ($data['reservar_stock'] ?? false) {
                foreach ($data['detalles'] as $detalleData) {
                    $inventario = InventarioSucursal::where('producto_id', $detalleData['producto_id'])
                        ->where('sucursal_id', $sucursalId)
                        ->first();
                    
                    if ($inventario) {
                        $inventario->reservarStock($detalleData['cantidad']);
                    }
                }
            }
        });
    }
    
    /**
     * Procesar pedido recibido desde móvil
     */
    private function procesarPedidoDesdeMovil(array $data, $user, $sucursalId)
    {
        // Similar a procesarVentaDesdeMovil pero para pedidos
        // Implementación simplificada
    }
    
    /**
     * Procesar cliente recibido desde móvil
     */
    private function procesarClienteDesdeMovil(array $data)
    {
        // Validar datos del cliente
        $validated = validator($data, [
            'nombre_completo' => 'required|string|max:255',
            'cedula_rnc' => 'nullable|string|max:11',
            'telefono' => 'required|string|max:10',
            'email' => 'nullable|email',
            'direccion' => 'required|string',
            'provincia' => 'required|string',
            'municipio' => 'required|string',
        ])->validate();
        
        // Buscar cliente existente o crear nuevo
        $cliente = Cliente::updateOrCreate(
            ['cedula_rnc' => $validated['cedula_rnc']],
            array_merge($validated, [
                'codigo' => 'CLI-' . strtoupper(uniqid()),
                'tipo_cliente' => 'NATURAL',
                'tipo_contribuyente' => 'CONSUMIDOR_FINAL',
                'activo' => true,
            ])
        );
        
        return $cliente;
    }
    
    /**
     * Estado de sincronización
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        $ultimaSync = SincronizacionMovil::where('user_id', $user->id)
            ->where('estado', 'COMPLETADA')
            ->latest()
            ->first();
        
        return response()->json([
            'ultima_sincronizacion' => $ultimaSync ? $ultimaSync->fecha_sincronizacion->toISOString() : null,
            'estado' => 'disponible',
            'timestamp_servidor' => now()->toISOString(),
        ]);
    }
}