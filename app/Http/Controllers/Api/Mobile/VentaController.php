<?php
// app/Http/Controllers/Api/Mobile/VentaController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\VentaDetalle;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\InventarioSucursal;
use App\Models\Caja;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Rules\CedulaRNC;
use Carbon\Carbon;

class VentaController extends Controller
{
    /**
     * Crear nueva venta desde móvil
     * POST /api/mobile/ventas
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'nullable|integer|exists:clientes,id',
            'tipo_documento' => 'required|in:factura,consumo,ncf,credito_fiscal',
            'tipo_pago' => 'required|in:contado,credito',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,mixto',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|integer|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.001',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'items.*.descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
            'observaciones' => 'nullable|string|max:500',
            'fecha_venta' => 'nullable|date',
            'offline_id' => 'nullable|string', // Para sincronización offline
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error de validación'
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        DB::beginTransaction();

        try {
            // Verificar caja abierta
            $caja = Caja::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->where('estado', 'abierta')
                ->first();

            if (!$caja && $request->metodo_pago !== 'credito') {
                throw new \Exception('No hay caja abierta para registrar ventas');
            }

            // Generar número de documento
            $numeroDocumento = $this->generarNumeroDocumento(
                $request->tipo_documento, 
                $sucursalId
            );

            // Calcular totales
            $totales = $this->calcularTotalesVenta($request->items);

            // Crear venta
            $venta = Venta::create([
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'cliente_id' => $request->cliente_id,
                'caja_id' => $caja->id ?? null,
                'numero_documento' => $numeroDocumento,
                'tipo_documento' => $request->tipo_documento,
                'tipo_pago' => $request->tipo_pago,
                'metodo_pago' => $request->metodo_pago,
                'subtotal' => $totales['subtotal'],
                'descuento_global' => $totales['descuento_total'],
                'itbis' => $totales['itbis_total'],
                'total' => $totales['total'],
                'estado' => $request->tipo_pago === 'credito' ? 'pendiente' : 'completada',
                'observaciones' => $request->observaciones,
                'fecha_venta' => $request->fecha_venta ?: now(),
                'offline_id' => $request->offline_id,
                'es_offline' => !empty($request->offline_id),
            ]);

            // Crear detalles de venta y actualizar inventario
            foreach ($request->items as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                
                // Verificar stock si aplica
                if ($producto->control_stock) {
                    $inventario = InventarioSucursal::where('producto_id', $producto->id)
                        ->where('sucursal_id', $sucursalId)
                        ->first();

                    if (!$inventario || $inventario->stock_disponible < $item['cantidad']) {
                        throw new \Exception("Stock insuficiente para: {$producto->nombre}");
                    }

                    // Actualizar stock
                    $inventario->stock_disponible -= $item['cantidad'];
                    $inventario->save();
                }

                // Crear detalle
                VentaDetalle::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => $item['cantidad'] * $item['precio_unitario'],
                    'descuento_porcentaje' => $item['descuento_porcentaje'] ?? 0,
                    'descuento_monto' => ($item['cantidad'] * $item['precio_unitario']) * 
                                      (($item['descuento_porcentaje'] ?? 0) / 100),
                    'itbis_porcentaje' => $producto->itbis_porcentaje,
                    'itbis_monto' => $this->calcularITBISItem(
                        $item['cantidad'] * $item['precio_unitario'],
                        $item['descuento_porcentaje'] ?? 0,
                        $producto->itbis_porcentaje,
                        $producto->exento_itbis
                    ),
                ]);
            }

            // Registrar pago si es contado
            if ($request->tipo_pago === 'contado') {
                $pago = Pago::create([
                    'venta_id' => $venta->id,
                    'caja_id' => $caja->id,
                    'monto' => $totales['total'],
                    'metodo_pago' => $request->metodo_pago,
                    'referencia' => $this->generarReferenciaPago($request->metodo_pago),
                    'estado' => 'completado',
                    'fecha_pago' => now(),
                ]);

                // Actualizar caja
                $caja->increment('total_ventas', $totales['total']);
                $caja->increment('efectivo', 
                    $request->metodo_pago === 'efectivo' ? $totales['total'] : 0
                );
                $caja->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Venta registrada exitosamente',
                'data' => [
                    'venta_id' => $venta->id,
                    'numero_documento' => $venta->numero_documento,
                    'total' => $venta->total,
                    'fecha' => $venta->fecha_venta->format('Y-m-d H:i:s'),
                    'qr_data' => $this->generarQRVenta($venta),
                    'items_count' => count($request->items),
                    'offline_id' => $request->offline_id,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error al crear venta móvil', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ventas del día actual
     * GET /api/mobile/ventas/hoy
     */
    public function ventasHoy(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $fechaInicio = now()->startOfDay();
        $fechaFin = now()->endOfDay();

        $ventas = Venta::with(['cliente', 'user', 'detalles.producto'])
            ->where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$fechaInicio, $fechaFin])
            ->where('estado', 'completada')
            ->orderBy('fecha_venta', 'desc')
            ->get()
            ->map(function($venta) {
                return [
                    'id' => $venta->id,
                    'numero_documento' => $venta->numero_documento,
                    'cliente' => $venta->cliente ? [
                        'nombre' => $venta->cliente->nombre,
                        'cedula_rnc' => $venta->cliente->cedula_rnc,
                    ] : null,
                    'vendedor' => $venta->user->name,
                    'total' => (float) $venta->total,
                    'itbis' => (float) $venta->itbis,
                    'metodo_pago' => $venta->metodo_pago,
                    'fecha' => $venta->fecha_venta->format('H:i'),
                    'items_count' => $venta->detalles->count(),
                    'estado' => $venta->estado,
                ];
            });

        $resumen = [
            'total_ventas' => $ventas->count(),
            'total_monto' => $ventas->sum('total'),
            'total_itbis' => $ventas->sum('itbis'),
            'por_metodo_pago' => $ventas->groupBy('metodo_pago')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('total')
                ];
            }),
            'hora_pico' => $this->calcularHoraPico($ventas),
        ];

        return response()->json([
            'success' => true,
            'data' => $ventas,
            'resumen' => $resumen,
            'metadata' => [
                'fecha' => now()->format('Y-m-d'),
                'hora_consulta' => now()->format('H:i:s'),
            ]
        ]);
    }

    /**
     * Obtener detalle de una venta específica
     * GET /api/mobile/ventas/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $venta = Venta::with([
            'cliente',
            'user',
            'detalles.producto.categoria',
            'pagos'
        ])
        ->where('sucursal_id', $sucursalId)
        ->where('id', $id)
        ->orWhere('numero_documento', $id)
        ->firstOrFail();

        $data = [
            'venta' => [
                'id' => $venta->id,
                'numero_documento' => $venta->numero_documento,
                'tipo_documento' => $venta->tipo_documento,
                'fecha_venta' => $venta->fecha_venta->format('Y-m-d H:i:s'),
                'estado' => $venta->estado,
                'tipo_pago' => $venta->tipo_pago,
                'metodo_pago' => $venta->metodo_pago,
            ],
            'cliente' => $venta->cliente ? [
                'id' => $venta->cliente->id,
                'nombre' => $venta->cliente->nombre,
                'cedula_rnc' => $venta->cliente->cedula_rnc_formateada,
                'telefono' => $venta->cliente->telefono,
                'email' => $venta->cliente->email,
            ] : null,
            'vendedor' => [
                'id' => $venta->user->id,
                'nombre' => $venta->user->name,
                'email' => $venta->user->email,
            ],
            'items' => $venta->detalles->map(function($detalle) {
                return [
                    'producto_id' => $detalle->producto_id,
                    'codigo' => $detalle->producto->codigo,
                    'nombre' => $detalle->producto->nombre,
                    'cantidad' => (float) $detalle->cantidad,
                    'precio_unitario' => (float) $detalle->precio_unitario,
                    'subtotal' => (float) $detalle->subtotal,
                    'descuento' => (float) $detalle->descuento_monto,
                    'itbis_porcentaje' => (float) $detalle->itbis_porcentaje,
                    'itbis_monto' => (float) $detalle->itbis_monto,
                    'total_linea' => (float) ($detalle->subtotal - $detalle->descuento_monto + $detalle->itbis_monto),
                ];
            }),
            'totales' => [
                'subtotal' => (float) $venta->subtotal,
                'descuento_global' => (float) $venta->descuento_global,
                'itbis' => (float) $venta->itbis,
                'total' => (float) $venta->total,
            ],
            'pagos' => $venta->pagos->map(function($pago) {
                return [
                    'id' => $pago->id,
                    'metodo' => $pago->metodo_pago,
                    'monto' => (float) $pago->monto,
                    'referencia' => $pago->referencia,
                    'fecha' => $pago->fecha_pago->format('H:i:s'),
                    'estado' => $pago->estado,
                ];
            }),
            'informacion_tributaria' => $this->generarInformacionTributaria($venta),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Anular una venta
     * POST /api/mobile/ventas/{id}/anular
     */
    public function anular(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motivo' => 'required|string|max:500',
            'password' => 'required|string', // Para verificación de supervisor
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        // Verificar permisos de supervisor
        if (!$user->hasPermission('anular_ventas')) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para anular ventas'
            ], 403);
        }

        DB::beginTransaction();

        try {
            $venta = Venta::with(['detalles.producto', 'pagos'])
                ->where('sucursal_id', $sucursalId)
                ->where('id', $id)
                ->where('estado', 'completada')
                ->firstOrFail();

            // Verificar que no sea muy antigua (máximo 7 días)
            if ($venta->fecha_venta->diffInDays(now()) > 7) {
                throw new \Exception('No se pueden anular ventas con más de 7 días');
            }

            // Revertir inventario
            foreach ($venta->detalles as $detalle) {
                if ($detalle->producto->control_stock) {
                    $inventario = InventarioSucursal::where('producto_id', $detalle->producto_id)
                        ->where('sucursal_id', $sucursalId)
                        ->first();

                    if ($inventario) {
                        $inventario->stock_disponible += $detalle->cantidad;
                        $inventario->save();
                    }
                }
            }

            // Revertir pagos si existen
            foreach ($venta->pagos as $pago) {
                if ($pago->estado === 'completado' && $pago->caja_id) {
                    $caja = Caja::find($pago->caja_id);
                    if ($caja) {
                        $caja->decrement('total_ventas', $pago->monto);
                        $caja->decrement('efectivo', 
                            $pago->metodo_pago === 'efectivo' ? $pago->monto : 0
                        );
                        $caja->save();
                    }
                    $pago->estado = 'revertido';
                    $pago->save();
                }
            }

            // Marcar venta como anulada
            $venta->estado = 'anulada';
            $venta->motivo_anulacion = $request->motivo;
            $venta->anulado_por = $user->id;
            $venta->fecha_anulacion = now();
            $venta->save();

            // Registrar en auditoría
            DB::table('auditoria_ventas')->insert([
                'venta_id' => $venta->id,
                'accion' => 'anulacion',
                'user_id' => $user->id,
                'detalles' => json_encode([
                    'motivo' => $request->motivo,
                    'totales' => [
                        'subtotal' => $venta->subtotal,
                        'itbis' => $venta->itbis,
                        'total' => $venta->total,
                    ],
                    'fecha_original' => $venta->fecha_venta,
                    'fecha_anulacion' => now(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Venta anulada exitosamente',
                'data' => [
                    'venta_id' => $venta->id,
                    'numero_documento' => $venta->numero_documento,
                    'total_anulado' => $venta->total,
                    'fecha_anulacion' => now()->format('Y-m-d H:i:s'),
                    'motivo' => $request->motivo,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al anular venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    
    private function generarNumeroDocumento($tipoDocumento, $sucursalId)
    {
        $prefix = match($tipoDocumento) {
            'factura' => 'FAC',
            'consumo' => 'CON',
            'ncf' => 'NCF',
            'credito_fiscal' => 'CF',
            default => 'DOC',
        };

        $year = date('Y');
        $month = date('m');
        
        // Obtener último número
        $ultimo = Venta::where('tipo_documento', $tipoDocumento)
            ->where('sucursal_id', $sucursalId)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $numero = $ultimo ? ((int) substr($ultimo->numero_documento, -6)) + 1 : 1;

        return sprintf('%s-%s%02d-%06d', 
            $prefix, 
            substr($year, -2), 
            $month, 
            $numero
        );
    }

    private function calcularTotalesVenta($items)
    {
        $subtotal = 0;
        $descuentoTotal = 0;
        $itbisTotal = 0;

        foreach ($items as $item) {
            $producto = Producto::find($item['producto_id']);
            
            $subtotalLinea = $item['cantidad'] * $item['precio_unitario'];
            $descuentoLinea = $subtotalLinea * (($item['descuento_porcentaje'] ?? 0) / 100);
            $itbisLinea = $this->calcularITBISItem(
                $subtotalLinea,
                $item['descuento_porcentaje'] ?? 0,
                $producto->itbis_porcentaje,
                $producto->exento_itbis
            );

            $subtotal += $subtotalLinea;
            $descuentoTotal += $descuentoLinea;
            $itbisTotal += $itbisLinea;
        }

        return [
            'subtotal' => $subtotal,
            'descuento_total' => $descuentoTotal,
            'itbis_total' => $itbisTotal,
            'total' => $subtotal - $descuentoTotal + $itbisTotal,
        ];
    }

    private function calcularITBISItem($subtotal, $descuento, $porcentajeITBIS, $exento)
    {
        if ($exento) {
            return 0;
        }

        $baseImponible = $subtotal - ($subtotal * ($descuento / 100));
        return $baseImponible * ($porcentajeITBIS / 100);
    }

    private function generarReferenciaPago($metodoPago)
    {
        return match($metodoPago) {
            'efectivo' => 'EF-' . strtoupper(uniqid()),
            'tarjeta' => 'TJ-' . strtoupper(uniqid()),
            'transferencia' => 'TR-' . strtoupper(uniqid()),
            'mixto' => 'MX-' . strtoupper(uniqid()),
            default => 'REF-' . strtoupper(uniqid()),
        };
    }

    private function generarQRVenta($venta)
    {
        $data = [
            'version' => '1.0',
            'fecha' => $venta->fecha_venta->format('Y-m-d\TH:i:s'),
            'rnc' => config('app.rnc_empresa'), // Configurar en .env
            'razon_social' => config('app.razon_social'),
            'ncf' => $venta->numero_documento,
            'monto' => $venta->total,
            'itbis' => $venta->itbis,
            'estado' => 'completado',
        ];

        return base64_encode(json_encode($data));
    }

    private function calcularHoraPico($ventas)
    {
        if ($ventas->isEmpty()) {
            return null;
        }

        $ventasPorHora = $ventas->groupBy(function($venta) {
            return Carbon::parse($venta['fecha'])->format('H');
        });

        $horaPico = $ventasPorHora->sortByDesc->count()->keys()->first();

        return [
            'hora' => $horaPico . ':00',
            'total_ventas' => $ventasPorHora[$horaPico]->count(),
            'total_monto' => $ventasPorHora[$horaPico]->sum('total'),
        ];
    }

    private function generarInformacionTributaria($venta)
    {
        return [
            'rnc_empresa' => config('app.rnc_empresa'),
            'razon_social' => config('app.razon_social'),
            'direccion' => config('app.direccion_empresa'),
            'telefono' => config('app.telefono_empresa'),
            'ncf' => $venta->numero_documento,
            'fecha_emision' => $venta->fecha_venta->format('Y-m-d H:i:s'),
            'fecha_vencimiento_ncf' => $venta->fecha_venta->copy()->addMonth()->format('Y-m-d'),
            'tasa_itbis' => '18%',
            'total_itbis' => number_format($venta->itbis, 2),
            'total_gravado' => number_format($venta->subtotal - $venta->descuento_global, 2),
            'total_exento' => $venta->detalles->where('producto.exento_itbis', true)->sum('subtotal'),
            'total_factura' => number_format($venta->total, 2),
            'qr_code' => $this->generarQRVenta($venta),
        ];
    }

    /**
     * Reporte de ventas por período
     * GET /api/mobile/ventas/reporte
     */
    public function reporte(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'tipo_reporte' => 'in:diario,semanal,mensual,vendedor,producto',
            'vendedor_id' => 'nullable|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $query = Venta::with(['user', 'cliente', 'detalles.producto'])
            ->where('sucursal_id', $sucursalId)
            ->where('estado', 'completada')
            ->whereBetween('fecha_venta', [
                $request->fecha_inicio . ' 00:00:00',
                $request->fecha_fin . ' 23:59:59'
            ]);

        if ($request->vendedor_id) {
            $query->where('user_id', $request->vendedor_id);
        }

        $ventas = $query->get();

        // Generar reporte según tipo
        $reporte = match($request->tipo_reporte) {
            'diario' => $this->generarReporteDiario($ventas),
            'vendedor' => $this->generarReporteVendedor($ventas),
            'producto' => $this->generarReporteProducto($ventas),
            default => $this->generarReporteGeneral($ventas),
        };

        return response()->json([
            'success' => true,
            'data' => $reporte,
            'metadata' => [
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'total_registros' => $ventas->count(),
                'generado_en' => now()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    private function generarReporteGeneral($ventas)
    {
        return [
            'resumen' => [
                'total_ventas' => $ventas->count(),
                'total_monto' => $ventas->sum('total'),
                'promedio_venta' => $ventas->avg('total'),
                'venta_maxima' => $ventas->max('total'),
                'venta_minima' => $ventas->min('total'),
                'total_itbis' => $ventas->sum('itbis'),
            ],
            'por_tipo_pago' => $ventas->groupBy('tipo_pago')->map(function($group) {
                return [
                    'cantidad' => $group->count(),
                    'monto_total' => $group->sum('total'),
                    'porcentaje' => round(($group->count() / $ventas->count()) * 100, 2)
                ];
            }),
            'por_metodo_pago' => $ventas->groupBy('metodo_pago')->map(function($group) {
                return [
                    'cantidad' => $group->count(),
                    'monto_total' => $group->sum('total')
                ];
            }),
            'por_hora' => $ventas->groupBy(function($venta) {
                return $venta->fecha_venta->format('H');
            })->map(function($group, $hora) {
                return [
                    'hora' => $hora . ':00',
                    'cantidad' => $group->count(),
                    'monto_total' => $group->sum('total')
                ];
            })->sortKeys(),
        ];
    }

    private function generarReporteDiario($ventas)
    {
        return $ventas->groupBy(function($venta) {
            return $venta->fecha_venta->format('Y-m-d');
        })->map(function($group, $fecha) {
            return [
                'fecha' => $fecha,
                'cantidad_ventas' => $group->count(),
                'monto_total' => $group->sum('total'),
                'promedio_venta' => $group->avg('total'),
                'hora_pico' => $group->groupBy(function($venta) {
                    return $venta->fecha_venta->format('H');
                })->sortByDesc->count()->keys()->first() . ':00',
            ];
        })->sortKeys();
    }

    private function generarReporteVendedor($ventas)
    {
        return $ventas->groupBy('user_id')->map(function($group) {
            $user = $group->first()->user;
            return [
                'vendedor_id' => $user->id,
                'nombre' => $user->name,
                'email' => $user->email,
                'cantidad_ventas' => $group->count(),
                'monto_total' => $group->sum('total'),
                'promedio_venta' => $group->avg('total'),
                'venta_maxima' => $group->max('total'),
                'comision_calculada' => $group->sum('total') * 0.02, // 2% de comisión
                'productos_vendidos' => $group->sum(function($venta) {
                    return $venta->detalles->sum('cantidad');
                }),
            ];
        })->values();
    }

    private function generarReporteProducto($ventas)
    {
        $productos = [];

        foreach ($ventas as $venta) {
            foreach ($venta->detalles as $detalle) {
                $productoId = $detalle->producto_id;
                
                if (!isset($productos[$productoId])) {
                    $productos[$productoId] = [
                        'producto_id' => $productoId,
                        'codigo' => $detalle->producto->codigo,
                        'nombre' => $detalle->producto->nombre,
                        'cantidad_total' => 0,
                        'monto_total' => 0,
                        'ventas_count' => 0,
                    ];
                }

                $productos[$productoId]['cantidad_total'] += $detalle->cantidad;
                $productos[$productoId]['monto_total'] += 
                    ($detalle->cantidad * $detalle->precio_unitario) - 
                    $detalle->descuento_monto + $detalle->itbis_monto;
                $productos[$productoId]['ventas_count']++;
            }
        }

        // Ordenar por monto total descendente
        usort($productos, function($a, $b) {
            return $b['monto_total'] <=> $a['monto_total'];
        });

        return [
            'productos' => array_slice($productos, 0, 20), // Top 20 productos
            'total_productos' => count($productos),
            'resumen' => [
                'total_unidades' => array_sum(array_column($productos, 'cantidad_total')),
                'total_monto' => array_sum(array_column($productos, 'monto_total')),
                'producto_mas_vendido' => $productos[0] ?? null,
            ]
        ];
    }
}