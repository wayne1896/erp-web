<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\DireccionEntrega;
use App\Http\Resources\PedidoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PedidoController extends Controller
{
    // GET /api/pedidos
    public function index(Request $request)
    {
        // Filtra pedidos del usuario actual
        $pedidos = Pedido::with([
            'cliente', 
            'detalles.producto.categoria',
            'usuario',
            'sucursal',
            'direccionEntrega',
            'repartidor'
        ])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return PedidoResource::collection($pedidos);
    }
    
    // POST /api/pedidos (CREAR DESDE APP)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'fecha_entrega' => 'required|date|after_or_equal:today',
            'tipo_pedido' => 'required|in:LOCAL,DOMICILIO,RESERVA,PREVENTA',
            'prioridad' => 'required|in:BAJA,MEDIA,ALTA,URGENTE',
            'condicion_pago' => 'required|in:CONTADO,CREDITO,MIXTO',
            'anticipo' => 'nullable|numeric|min:0',
            'notas' => 'nullable|string|max:1000',
            'direccion_entrega' => 'required_if:tipo_pedido,DOMICILIO|array',
            'direccion_entrega.nombre_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:255',
            'direccion_entrega.telefono_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:20',
            'direccion_entrega.direccion' => 'required_if:tipo_pedido,DOMICILIO|string|max:500',
            'direccion_entrega.ciudad' => 'nullable|string|max:100',
            'direccion_entrega.provincia' => 'nullable|string|max:100',
            'direccion_entrega.sector' => 'nullable|string|max:100',
            'direccion_entrega.codigo_postal' => 'nullable|string|max:20',
            'direccion_entrega.instrucciones_entrega' => 'nullable|string|max:500',
            'direccion_entrega.latitud' => 'nullable|numeric',
            'direccion_entrega.longitud' => 'nullable|numeric',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.descuento' => 'nullable|integer|min:0|max:100',
        ]);
        
        return DB::transaction(function () use ($validated, $request) {
            // Calcular totales
            $subtotal = 0;
            $descuentoTotal = 0;
            $itbisTotal = 0;
            $total = 0;
            
            $detallesCalculados = [];
            
            foreach ($validated['items'] as $item) {
                $producto = \App\Models\Producto::find($item['producto_id']);
                if (!$producto) {
                    throw new \Exception("Producto no encontrado: {$item['producto_id']}");
                }
                
                $cantidad = $item['cantidad'];
                $precio = $producto->precio_venta;
                $descuentoPorcentaje = $item['descuento'] ?? 0;
                
                $subtotalItem = $cantidad * $precio;
                $descuentoMonto = ($subtotalItem * $descuentoPorcentaje) / 100;
                $subtotalConDescuento = $subtotalItem - $descuentoMonto;
                $itbis = $subtotalConDescuento * 0.18; // 18% ITBIS
                $totalItem = $subtotalConDescuento + $itbis;
                
                $subtotal += $subtotalItem;
                $descuentoTotal += $descuentoMonto;
                $itbisTotal += $itbis;
                $total += $totalItem;
                
                $detallesCalculados[] = [
                    'producto_id' => $item['producto_id'],
                    'cantidad_solicitada' => $cantidad,
                    'precio_unitario' => $precio,
                    'descuento' => $descuentoPorcentaje,
                    'descuento_monto' => $descuentoMonto,
                    'subtotal' => $subtotalConDescuento,
                    'itbis_porcentaje' => 18.00,
                    'itbis_monto' => $itbis,
                    'total' => $totalItem,
                ];
            }
            
            // Crear pedido
            $pedido = Pedido::create([
                'cliente_id' => $validated['cliente_id'],
                'user_id' => $request->user()->id,
                'sucursal_id' => $request->user()->sucursal_id ?? 1,
                'fecha_pedido' => now(),
                'fecha_entrega' => $validated['fecha_entrega'],
                'estado' => 'PENDIENTE',
                'prioridad' => $validated['prioridad'],
                'tipo_pedido' => $validated['tipo_pedido'],
                'condicion_pago' => $validated['condicion_pago'],
                'anticipo' => $validated['anticipo'] ?? 0,
                'saldo_pendiente' => $total - ($validated['anticipo'] ?? 0),
                'notas' => $validated['notas'] ?? '',
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'itbis' => $itbisTotal,
                'total' => $total,
                'numero_pedido' => $this->generarNumeroPedido(),
            ]);
            
            // Crear dirección de entrega si aplica
            if ($validated['tipo_pedido'] === 'DOMICILIO' && isset($validated['direccion_entrega'])) {
                $pedido->direccionEntrega()->create([
                    'nombre_contacto' => $validated['direccion_entrega']['nombre_contacto'] ?? '',
                    'telefono_contacto' => $validated['direccion_entrega']['telefono_contacto'] ?? '',
                    'direccion' => $validated['direccion_entrega']['direccion'] ?? '',
                    'ciudad' => $validated['direccion_entrega']['ciudad'] ?? '',
                    'provincia' => $validated['direccion_entrega']['provincia'] ?? '',
                    'sector' => $validated['direccion_entrega']['sector'] ?? '',
                    'codigo_postal' => $validated['direccion_entrega']['codigo_postal'] ?? '',
                    'instrucciones_entrega' => $validated['direccion_entrega']['instrucciones_entrega'] ?? '',
                    'latitud' => $validated['direccion_entrega']['latitud'] ?? null,
                    'longitud' => $validated['direccion_entrega']['longitud'] ?? null,
                ]);
            }
            
            // Agregar detalles
            foreach ($detallesCalculados as $detalle) {
                $detalle['pedido_id'] = $pedido->id;
                PedidoItem::create($detalle);
            }
            
            return new PedidoResource($pedido->load([
                'cliente', 
                'detalles.producto',
                'direccionEntrega'
            ]));
        });
    }
    
    // GET /api/pedidos/{id}
    public function show($id)
    {
        $pedido = Pedido::with([
            'cliente', 
            'detalles.producto.categoria',
            'usuario',
            'sucursal',
            'direccionEntrega',
            'repartidor'
        ])
            ->where('id', $id)
            ->firstOrFail();
            
        // Cargar log si existe
        $pedido->log = \App\Models\LogPedido::where('pedido_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return new PedidoResource($pedido);
    }
    
    // PUT /api/pedidos/{id}
    public function update(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        
        // Validar que el pedido pertenezca al usuario y esté en estado PENDIENTE
        if ($pedido->user_id !== $request->user()->id || $pedido->estado !== 'PENDIENTE') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden editar pedidos propios en estado PENDIENTE'
            ], 403);
        }
        
        $validated = $request->validate([
            'fecha_entrega' => 'required|date|after_or_equal:today',
            'tipo_pedido' => 'required|in:LOCAL,DOMICILIO,RESERVA,PREVENTA',
            'prioridad' => 'required|in:BAJA,MEDIA,ALTA,URGENTE',
            'condicion_pago' => 'required|in:CONTADO,CREDITO,MIXTO',
            'anticipo' => 'nullable|numeric|min:0',
            'notas' => 'nullable|string|max:1000',
            'direccion_entrega' => 'required_if:tipo_pedido,DOMICILIO|array',
            'direccion_entrega.nombre_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:255',
            'direccion_entrega.telefono_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:20',
            'direccion_entrega.direccion' => 'required_if:tipo_pedido,DOMICILIO|string|max:500',
            'direccion_entrega.ciudad' => 'nullable|string|max:100',
            'direccion_entrega.provincia' => 'nullable|string|max:100',
            'direccion_entrega.sector' => 'nullable|string|max:100',
            'direccion_entrega.codigo_postal' => 'nullable|string|max:20',
            'direccion_entrega.instrucciones_entrega' => 'nullable|string|max:500',
            'direccion_entrega.latitud' => 'nullable|numeric',
            'direccion_entrega.longitud' => 'nullable|numeric',
        ]);
        
        return DB::transaction(function () use ($validated, $pedido) {
            // Actualizar datos del pedido
            $pedido->update([
                'fecha_entrega' => $validated['fecha_entrega'],
                'prioridad' => $validated['prioridad'],
                'tipo_pedido' => $validated['tipo_pedido'],
                'condicion_pago' => $validated['condicion_pago'],
                'anticipo' => $validated['anticipo'] ?? 0,
                'saldo_pendiente' => $pedido->total - ($validated['anticipo'] ?? 0),
                'notas' => $validated['notas'] ?? '',
            ]);
            
            // Actualizar o crear dirección de entrega
            if ($validated['tipo_pedido'] === 'DOMICILIO') {
                $direccionData = $validated['direccion_entrega'] ?? [];
                
                if ($pedido->direccionEntrega) {
                    // Actualizar existente
                    $pedido->direccionEntrega()->update([
                        'nombre_contacto' => $direccionData['nombre_contacto'] ?? '',
                        'telefono_contacto' => $direccionData['telefono_contacto'] ?? '',
                        'direccion' => $direccionData['direccion'] ?? '',
                        'ciudad' => $direccionData['ciudad'] ?? '',
                        'provincia' => $direccionData['provincia'] ?? '',
                        'sector' => $direccionData['sector'] ?? '',
                        'codigo_postal' => $direccionData['codigo_postal'] ?? '',
                        'instrucciones_entrega' => $direccionData['instrucciones_entrega'] ?? '',
                        'latitud' => $direccionData['latitud'] ?? null,
                        'longitud' => $direccionData['longitud'] ?? null,
                    ]);
                } else {
                    // Crear nueva
                    $pedido->direccionEntrega()->create([
                        'nombre_contacto' => $direccionData['nombre_contacto'] ?? '',
                        'telefono_contacto' => $direccionData['telefono_contacto'] ?? '',
                        'direccion' => $direccionData['direccion'] ?? '',
                        'ciudad' => $direccionData['ciudad'] ?? '',
                        'provincia' => $direccionData['provincia'] ?? '',
                        'sector' => $direccionData['sector'] ?? '',
                        'codigo_postal' => $direccionData['codigo_postal'] ?? '',
                        'instrucciones_entrega' => $direccionData['instrucciones_entrega'] ?? '',
                        'latitud' => $direccionData['latitud'] ?? null,
                        'longitud' => $direccionData['longitud'] ?? null,
                    ]);
                }
            } elseif ($pedido->direccionEntrega && $validated['tipo_pedido'] !== 'DOMICILIO') {
                // Eliminar dirección si cambia a un tipo que no es DOMICILIO
                $pedido->direccionEntrega()->delete();
            }
            
            return new PedidoResource($pedido->load([
                'cliente', 
                'detalles.producto',
                'direccionEntrega'
            ]));
        });
    }
    
    // POST /api/pedidos/{id}/procesar
    public function procesar(Request $request, $id)
    {
        $pedido = Pedido::findOrFail($id);
        
        // Validar que el pedido pertenezca al usuario
        if ($pedido->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para procesar este pedido'
            ], 403);
        }
        
        $pedido->update([
            'estado' => 'PROCESADO',
            'notas' => $request->notas,
            'fecha_procesado' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Pedido procesado correctamente',
            'pedido' => new PedidoResource($pedido->load(['cliente', 'detalles.producto']))
        ]);
    }
    
    // DELETE /api/pedidos/{id}
    public function destroy($id)
    {
        $pedido = Pedido::findOrFail($id);
        
        // Validar que el pedido pertenezca al usuario
        if ($pedido->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para eliminar este pedido'
            ], 403);
        }
        
        // Restaurar inventario
        foreach ($pedido->detalles as $detalle) {
            \App\Models\Producto::where('id', $detalle->producto_id)->increment('stock', $detalle->cantidad_solicitada);
        }
        
        $pedido->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Pedido eliminado correctamente'
        ]);
    }
    
    // Generar número de pedido único
    private function generarNumeroPedido()
    {
        do {
            $numero = 'PED-' . date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (Pedido::where('numero_pedido', $numero)->exists());
        
        return $numero;
    }
}