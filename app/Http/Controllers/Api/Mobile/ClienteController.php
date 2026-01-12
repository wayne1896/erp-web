<?php
// app/Http/Controllers/Api/Mobile/ClienteController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Venta;
use App\Models\PagoVenta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClienteController extends Controller
{
    /**
     * Listar clientes para app móvil
     * GET /api/mobile/clientes
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $perPage = $request->get('per_page', 30);
        $page = $request->get('page', 1);

        $cacheKey = "mobile.clientes.sucursal.{$sucursalId}.page{$page}.per{$perPage}";
        
        if ($request->has('search')) {
            $cacheKey .= ".search." . md5($request->search);
        }

        $data = Cache::remember($cacheKey, 300, function () use ($request, $perPage, $sucursalId) {
            $query = Cliente::where('activo', true)
                ->select([
                    'id',
                    'codigo',
                    'nombre_completo',
                    'cedula_rnc',
                    'tipo_cliente',
                    'telefono',
                    'email',
                    'direccion',
                    'limite_credito',
                    'dias_credito',
                    'descuento',
                    'total_compras',
                    'fecha_ultima_compra',
                ]);

            // Búsqueda por múltiples campos
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre_completo', 'LIKE', "%{$search}%")
                      ->orWhere('cedula_rnc', 'LIKE', "%{$search}%")
                      ->orWhere('codigo', 'LIKE', "%{$search}%")
                      ->orWhere('telefono', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Filtrar por tipo de cliente
            if ($request->has('tipo_cliente')) {
                $query->where('tipo_cliente', $request->tipo_cliente);
            }

            // Ordenar
            $orderBy = $request->get('order_by', 'nombre_completo');
            $orderDir = $request->get('order_dir', 'asc');
            $query->orderBy($orderBy, $orderDir);

            return $query->paginate($perPage)->through(function($cliente) {
                return [
                    'id' => $cliente->id,
                    'codigo' => $cliente->codigo,
                    'nombre' => $cliente->nombre_completo,
                    'cedula_rnc' => $cliente->cedula_rnc,
                    'cedula_rnc_formateada' => $cliente->identificacion_formateada,
                    'tipo_cliente' => $cliente->tipo_cliente,
                    'telefono' => $cliente->telefono,
                    'email' => $cliente->email,
                    'direccion' => $cliente->direccion_completa,
                    'limite_credito' => (float) $cliente->limite_credito,
                    'dias_credito' => (int) $cliente->dias_credito,
                    'descuento' => (float) $cliente->descuento,
                    'total_compras' => (float) $cliente->total_comprado,
                    'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                    'excede_limite_credito' => $cliente->excede_limite_credito,
                    'fecha_ultima_compra' => $cliente->fecha_ultima_compra?->format('Y-m-d'),
                    'dias_sin_comprar' => $cliente->fecha_ultima_compra ? 
                        now()->diffInDays($cliente->fecha_ultima_compra) : null,
                ];
            });
        });

        $estadisticas = [
            'total_clientes' => Cliente::where('activo', true)->count(),
            'clientes_credito' => Cliente::where('activo', true)->where('limite_credito', '>', 0)->count(),
            'clientes_con_deuda' => Cliente::where('activo', true)->whereHas('ventas', function($q) {
                $q->where('condicion_pago', 'CREDITO')
                  ->where('estado', 'PROCESADA')
                  ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)');
            })->count(),
            'total_credito_otorgado' => Cliente::where('activo', true)->sum('limite_credito'),
            'total_deuda_pendiente' => $this->calcularDeudaTotal(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data->items(),
            'pagination' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage(),
            ],
            'estadisticas' => $estadisticas,
            'filtros' => [
                'search' => $request->search,
                'tipo_cliente' => $request->tipo_cliente,
                'order_by' => $request->order_by ?? 'nombre_completo',
                'order_dir' => $request->order_dir ?? 'asc',
            ]
        ]);
    }

    /**
     * Buscar cliente rápidamente (para ventas)
     * GET /api/mobile/clientes/buscar
     */
    public function buscar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'termino' => 'required|string|min:2|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $termino = $request->termino;

        $clientes = Cliente::where('activo', true)
            ->where(function($query) use ($termino) {
                $query->where('cedula_rnc', 'LIKE', "{$termino}%")
                      ->orWhere('nombre_completo', 'LIKE', "%{$termino}%")
                      ->orWhere('telefono', 'LIKE', "{$termino}%")
                      ->orWhere('codigo', 'LIKE', "{$termino}%");
            })
            ->limit(15)
            ->get()
            ->map(function($cliente) {
                return [
                    'id' => $cliente->id,
                    'codigo' => $cliente->codigo,
                    'nombre' => $cliente->nombre_completo,
                    'cedula_rnc' => $cliente->cedula_rnc,
                    'cedula_rnc_formateada' => $cliente->identificacion_formateada,
                    'telefono' => $cliente->telefono,
                    'email' => $cliente->email,
                    'limite_credito' => (float) $cliente->limite_credito,
                    'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                    'disponible_credito' => max(0, (float) $cliente->limite_credito - $cliente->saldo_pendiente),
                    'excede_limite' => $cliente->excede_limite_credito,
                    'puede_comprar_credito' => (float) $cliente->limite_credito > 0 && 
                                               $cliente->saldo_pendiente < $cliente->limite_credito,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $clientes,
            'count' => $clientes->count(),
            'termino_busqueda' => $termino,
        ]);
    }

    /**
     * Crear nuevo cliente desde móvil
     * POST /api/mobile/clientes
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_completo' => 'required|string|max:255',
            'cedula_rnc' => ['required', 'string', 'max:20', new \App\Rules\CedulaRNC],
            'tipo_cliente' => 'required|in:NATURAL,JURIDICA,EXTRANJERO',
            'telefono' => 'nullable|string|max:20',
            'telefono_alternativo' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string|max:500',
            'provincia' => 'nullable|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'sector' => 'nullable|string|max:100',
            'tipo_contribuyente' => 'nullable|in:INFORMAL,REGIMEN_GENERAL,REGIMEN_ESPECIAL',
            'limite_credito' => 'nullable|numeric|min:0',
            'dias_credito' => 'nullable|integer|min:0|max:365',
            'descuento' => 'nullable|numeric|min:0|max:100',
            'notas' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error de validación'
            ], 422);
        }

        // Verificar si la cédula/RNC ya existe
        $clienteExistente = Cliente::where('cedula_rnc', $request->cedula_rnc)
            ->where('activo', true)
            ->first();

        if ($clienteExistente) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe un cliente activo con esta cédula/RNC',
                'cliente_existente' => [
                    'id' => $clienteExistente->id,
                    'nombre' => $clienteExistente->nombre_completo,
                    'cedula_rnc' => $clienteExistente->identificacion_formateada,
                ]
            ], 409);
        }

        DB::beginTransaction();

        try {
            // Generar código único
            $codigo = $this->generarCodigoCliente($request->tipo_cliente);

            $cliente = Cliente::create([
                'codigo' => $codigo,
                'nombre_completo' => $request->nombre_completo,
                'cedula_rnc' => $request->cedula_rnc,
                'tipo_cliente' => $request->tipo_cliente,
                'telefono' => $request->telefono,
                'telefono_alternativo' => $request->telefono_alternativo,
                'email' => $request->email,
                'direccion' => $request->direccion,
                'provincia' => $request->provincia,
                'municipio' => $request->municipio,
                'sector' => $request->sector,
                'tipo_contribuyente' => $request->tipo_contribuyente,
                'limite_credito' => $request->limite_credito ?? 0,
                'dias_credito' => $request->dias_credito ?? 0,
                'descuento' => $request->descuento ?? 0,
                'activo' => true,
                'user_id' => $request->user()->id,
            ]);

            // Registrar en auditoría
            DB::table('auditoria_clientes')->insert([
                'cliente_id' => $cliente->id,
                'accion' => 'creacion_movil',
                'user_id' => $request->user()->id,
                'detalles' => json_encode([
                    'datos_nuevos' => $request->all(),
                    'ip' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Invalidar cache de clientes
            Cache::flush();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'data' => [
                    'id' => $cliente->id,
                    'codigo' => $cliente->codigo,
                    'nombre' => $cliente->nombre_completo,
                    'cedula_rnc_formateada' => $cliente->identificacion_formateada,
                    'limite_credito' => (float) $cliente->limite_credito,
                    'dias_credito' => $cliente->dias_credito,
                    'descuento' => (float) $cliente->descuento,
                    'qr_data' => $this->generarQRCliente($cliente),
                    'timestamp' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error al crear cliente móvil', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle completo de un cliente
     * GET /api/mobile/clientes/{id}
     */
    public function show(Request $request, $id)
    {
        $cliente = Cliente::with(['ventas' => function($query) {
            $query->orderBy('fecha_venta', 'desc')->limit(10);
        }])->where('activo', true)
          ->where(function($query) use ($id) {
              $query->where('id', $id)
                    ->orWhere('cedula_rnc', $id)
                    ->orWhere('codigo', $id);
          })
          ->firstOrFail();

        $resumenCredito = $this->calcularResumenCredito($cliente);
        $ventasRecientes = $this->obtenerVentasRecientes($cliente->id, 10);
        $pagosRecientes = $this->obtenerPagosRecientes($cliente->id, 10);

        $data = [
            'informacion_personal' => [
                'id' => $cliente->id,
                'codigo' => $cliente->codigo,
                'nombre_completo' => $cliente->nombre_completo,
                'cedula_rnc' => $cliente->cedula_rnc,
                'cedula_rnc_formateada' => $cliente->identificacion_formateada,
                'tipo_cliente' => $cliente->tipo_cliente,
                'tipo_contribuyente' => $cliente->tipo_contribuyente,
                'telefono' => $cliente->telefono,
                'telefono_alternativo' => $cliente->telefono_alternativo,
                'email' => $cliente->email,
                'direccion_completa' => $cliente->direccion_completa,
                'fecha_registro' => $cliente->created_at->format('Y-m-d'),
                'registrado_por' => $cliente->user->name ?? 'Sistema',
            ],
            'informacion_comercial' => [
                'limite_credito' => (float) $cliente->limite_credito,
                'dias_credito' => $cliente->dias_credito,
                'descuento' => (float) $cliente->descuento,
                'total_compras' => (float) $cliente->total_comprado,
                'fecha_ultima_compra' => $cliente->fecha_ultima_compra?->format('Y-m-d H:i'),
                'dias_sin_comprar' => $cliente->fecha_ultima_compra ? 
                    now()->diffInDays($cliente->fecha_ultima_compra) : null,
                'promedio_compra' => $cliente->ventas->count() > 0 ? 
                    $cliente->total_comprado / $cliente->ventas->count() : 0,
            ],
            'resumen_credito' => $resumenCredito,
            'ventas_recientes' => $ventasRecientes,
            'pagos_recientes' => $pagosRecientes,
            'estadisticas' => [
                'total_ventas' => $cliente->ventas->count(),
                'ventas_credito' => $cliente->ventas()->where('condicion_pago', 'CREDITO')->count(),
                'ventas_contado' => $cliente->ventas()->where('condicion_pago', 'CONTADO')->count(),
                'ventas_pendientes' => $cliente->ventas()
                    ->where('condicion_pago', 'CREDITO')
                    ->where('estado', 'PROCESADA')
                    ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)')
                    ->count(),
            ],
            'alertas' => $this->generarAlertasCliente($cliente),
            'qr_data' => $this->generarQRCliente($cliente),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Actualizar información del cliente
     * PUT /api/mobile/clientes/{id}
     */
    public function update(Request $request, $id)
    {
        $cliente = Cliente::where('activo', true)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre_completo' => 'sometimes|required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'telefono_alternativo' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string|max:500',
            'provincia' => 'nullable|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'sector' => 'nullable|string|max:100',
            'limite_credito' => 'nullable|numeric|min:0',
            'dias_credito' => 'nullable|integer|min:0|max:365',
            'descuento' => 'nullable|numeric|min:0|max:100',
            'notas' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $datosAnteriores = $cliente->toArray();

            $cliente->update($request->only([
                'nombre_completo', 'telefono', 'telefono_alternativo', 'email',
                'direccion', 'provincia', 'municipio', 'sector',
                'limite_credito', 'dias_credito', 'descuento'
            ]));

            // Registrar en auditoría
            DB::table('auditoria_clientes')->insert([
                'cliente_id' => $cliente->id,
                'accion' => 'actualizacion_movil',
                'user_id' => $request->user()->id,
                'detalles' => json_encode([
                    'datos_anteriores' => $datosAnteriores,
                    'datos_nuevos' => $cliente->toArray(),
                    'campos_modificados' => array_keys($request->all()),
                    'ip' => $request->ip(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Cache::flush();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cliente actualizado exitosamente',
                'data' => [
                    'id' => $cliente->id,
                    'nombre' => $cliente->nombre_completo,
                    'limite_credito' => (float) $cliente->limite_credito,
                    'dias_credito' => $cliente->dias_credito,
                    'descuento' => (float) $cliente->descuento,
                    'timestamp' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ventas de un cliente
     * GET /api/mobile/clientes/{id}/ventas
     */
    public function ventasCliente(Request $request, $id)
    {
        $cliente = Cliente::where('activo', true)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'estado' => 'nullable|in:PENDIENTE,PROCESADA,ANULADA',
            'condicion_pago' => 'nullable|in:CONTADO,CREDITO',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $cliente->ventas()->with(['detalles.producto', 'pagos'])
            ->orderBy('fecha_venta', 'desc');

        // Aplicar filtros
        if ($request->fecha_inicio) {
            $query->whereDate('fecha_venta', '>=', $request->fecha_inicio);
        }
        if ($request->fecha_fin) {
            $query->whereDate('fecha_venta', '<=', $request->fecha_fin);
        }
        if ($request->estado) {
            $query->where('estado', $request->estado);
        }
        if ($request->condicion_pago) {
            $query->where('condicion_pago', $request->condicion_pago);
        }

        $perPage = $request->get('per_page', 20);
        $ventas = $query->paginate($perPage)->through(function($venta) {
            return [
                'id' => $venta->id,
                'numero_factura' => $venta->numero_factura,
                'ncf' => $venta->ncf,
                'fecha_venta' => $venta->fecha_venta->format('Y-m-d H:i'),
                'condicion_pago' => $venta->condicion_pago,
                'estado' => $venta->estado,
                'subtotal' => (float) $venta->subtotal,
                'descuento' => (float) $venta->descuento,
                'itbis' => (float) $venta->itbis,
                'total' => (float) $venta->total,
                'pagado' => (float) $venta->pagado,
                'saldo' => (float) $venta->saldo,
                'esta_pagada' => $venta->esta_pagada,
                'esta_vencida' => $venta->esta_vencida,
                'dias_vencimiento' => $venta->dias_vencimiento,
                'items_count' => $venta->detalles->count(),
                'pagos_count' => $venta->pagos->count(),
                'fecha_vencimiento' => $venta->fecha_vencimiento?->format('Y-m-d'),
            ];
        });

        $estadisticas = [
            'total_ventas' => $cliente->ventas()->count(),
            'ventas_periodo' => $ventas->total(),
            'total_monto' => $cliente->ventas()->sum('total'),
            'saldo_pendiente_total' => (float) $cliente->saldo_pendiente,
            'ventas_credito_pendientes' => $cliente->ventas()
                ->where('condicion_pago', 'CREDITO')
                ->where('estado', 'PROCESADA')
                ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)')
                ->count(),
            'ventas_vencidas' => $cliente->ventas()
                ->where('condicion_pago', 'CREDITO')
                ->where('estado', 'PROCESADA')
                ->where('fecha_vencimiento', '<', now())
                ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $ventas->items(),
            'pagination' => [
                'current_page' => $ventas->currentPage(),
                'per_page' => $ventas->perPage(),
                'total' => $ventas->total(),
                'last_page' => $ventas->lastPage(),
            ],
            'estadisticas' => $estadisticas,
            'filtros_aplicados' => $request->only(['fecha_inicio', 'fecha_fin', 'estado', 'condicion_pago']),
        ]);
    }

    /**
     * Métodos auxiliares privados
     */
    
    private function generarCodigoCliente($tipoCliente)
    {
        $prefix = match($tipoCliente) {
            'NATURAL' => 'CLI-N',
            'JURIDICA' => 'CLI-J',
            'EXTRANJERO' => 'CLI-E',
            default => 'CLI',
        };

        $year = date('Y');
        $ultimo = Cliente::where('codigo', 'LIKE', "{$prefix}-{$year}-%")
            ->orderBy('codigo', 'desc')
            ->first();

        $numero = $ultimo ? (int) substr($ultimo->codigo, -4) + 1 : 1;

        return sprintf('%s-%s-%04d', $prefix, $year, $numero);
    }

    private function calcularResumenCredito($cliente)
    {
        $ventasCredito = $cliente->ventas()
            ->where('condicion_pago', 'CREDITO')
            ->where('estado', 'PROCESADA')
            ->get();

        $saldoPendiente = (float) $cliente->saldo_pendiente;
        $limiteCredito = (float) $cliente->limite_credito;
        $disponible = max(0, $limiteCredito - $saldoPendiente);
        $usoCredito = $limiteCredito > 0 ? ($saldoPendiente / $limiteCredito) * 100 : 0;

        // Calcular ventas vencidas
        $ventasVencidas = $ventasCredito->filter(function($venta) {
            return $venta->esta_vencida && !$venta->esta_pagada;
        });

        $totalVencido = $ventasVencidas->sum('saldo');

        return [
            'limite_credito' => $limiteCredito,
            'saldo_pendiente' => $saldoPendiente,
            'disponible_credito' => $disponible,
            'porcentaje_uso' => round($usoCredito, 2),
            'estado_credito' => $this->determinarEstadoCredito($usoCredito, $ventasVencidas->count()),
            'ventas_credito_activas' => $ventasCredito->where('esta_pagada', false)->count(),
            'ventas_vencidas' => $ventasVencidas->count(),
            'total_vencido' => $totalVencido,
            'dias_promedio_pago' => $this->calcularDiasPromedioPago($cliente->id),
        ];
    }

    private function determinarEstadoCredito($usoCredito, $ventasVencidas)
    {
        if ($ventasVencidas > 3) {
            return 'SUSPENDIDO';
        } elseif ($ventasVencidas > 0) {
            return 'EN_MORA';
        } elseif ($usoCredito >= 90) {
            return 'ALTO_RIESGO';
        } elseif ($usoCredito >= 70) {
            return 'ALERTA';
        } elseif ($usoCredito >= 50) {
            return 'NORMAL';
        } else {
            return 'BUENO';
        }
    }

    private function calcularDiasPromedioPago($clienteId)
    {
        $pagos = PagoVenta::whereHas('venta', function($query) use ($clienteId) {
            $query->where('cliente_id', $clienteId)
                  ->where('condicion_pago', 'CREDITO');
        })
        ->where('created_at', '>', now()->subMonths(6))
        ->get();

        if ($pagos->isEmpty()) {
            return null;
        }

        $totalDias = 0;
        $contador = 0;

        foreach ($pagos as $pago) {
            $venta = $pago->venta;
            if ($venta) {
                $diasPago = $pago->created_at->diffInDays($venta->fecha_venta);
                $totalDias += $diasPago;
                $contador++;
            }
        }

        return $contador > 0 ? round($totalDias / $contador) : null;
    }

    private function obtenerVentasRecientes($clienteId, $limit = 10)
    {
        return Venta::where('cliente_id', $clienteId)
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($venta) {
                return [
                    'id' => $venta->id,
                    'numero_factura' => $venta->numero_factura,
                    'fecha' => $venta->fecha_venta->format('Y-m-d'),
                    'total' => (float) $venta->total,
                    'condicion_pago' => $venta->condicion_pago,
                    'pagado' => (float) $venta->pagado,
                    'saldo' => (float) $venta->saldo,
                    'estado' => $venta->estado,
                ];
            });
    }

    private function obtenerPagosRecientes($clienteId, $limit = 10)
    {
        return PagoVenta::whereHas('venta', function($query) use ($clienteId) {
            $query->where('cliente_id', $clienteId);
        })
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get()
        ->map(function($pago) {
            return [
                'id' => $pago->id,
                'venta_id' => $pago->venta_id,
                'numero_factura' => $pago->venta->numero_factura,
                'monto' => (float) $pago->monto,
                'metodo_pago' => $pago->metodo_pago,
                'referencia' => $pago->referencia,
                'fecha_pago' => $pago->created_at->format('Y-m-d H:i'),
            ];
        });
    }

    private function generarAlertasCliente($cliente)
    {
        $alertas = [];

        // Alerta por exceso de crédito
        if ($cliente->excede_limite_credito) {
            $alertas[] = [
                'tipo' => 'riesgo',
                'codigo' => 'EXCEDE_LIMITE_CREDITO',
                'mensaje' => 'Cliente excede límite de crédito',
                'detalle' => 'Límite: RD$ ' . number_format($cliente->limite_credito, 2) . 
                           ' | Saldo: RD$ ' . number_format($cliente->saldo_pendiente, 2),
                'accion_recomendada' => 'Suspender ventas a crédito hasta reducir saldo',
            ];
        }

        // Alerta por ventas vencidas
        $ventasVencidas = $cliente->ventas()
            ->where('condicion_pago', 'CREDITO')
            ->where('estado', 'PROCESADA')
            ->where('fecha_vencimiento', '<', now())
            ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)')
            ->count();

        if ($ventasVencidas > 0) {
            $alertas[] = [
                'tipo' => 'advertencia',
                'codigo' => 'VENTAS_VENCIDAS',
                'mensaje' => "Cliente tiene {$ventasVencidas} venta(s) vencida(s)",
                'detalle' => 'Verificar historial de pagos',
                'accion_recomendada' => 'Contactar al cliente para acordar pago',
            ];
        }

        // Alerta por mucho tiempo sin comprar (solo para clientes frecuentes)
        if ($cliente->fecha_ultima_compra) {
            $diasSinComprar = now()->diffInDays($cliente->fecha_ultima_compra);
            $comprasPasadas = $cliente->ventas()->count();
            
            if ($comprasPasadas > 5 && $diasSinComprar > 60) {
                $alertas[] = [
                    'tipo' => 'informacion',
                    'codigo' => 'CLIENTE_INACTIVO',
                    'mensaje' => 'Cliente inactivo por más de 60 días',
                    'detalle' => "Última compra: {$cliente->fecha_ultima_compra->format('d/m/Y')}",
                    'accion_recomendada' => 'Realizar seguimiento comercial',
                ];
            }
        }

        return $alertas;
    }

    private function generarQRCliente($cliente)
    {
        $data = [
            'tipo' => 'cliente',
            'id' => $cliente->id,
            'codigo' => $cliente->codigo,
            'nombre' => $cliente->nombre_completo,
            'cedula_rnc' => $cliente->cedula_rnc,
            'telefono' => $cliente->telefono,
            'email' => $cliente->email,
            'fecha_creacion' => $cliente->created_at->format('Y-m-d'),
        ];

        return base64_encode(json_encode($data));
    }

    private function calcularDeudaTotal()
    {
        return Cliente::where('activo', true)
            ->withSum(['ventas as saldo_pendiente_sum' => function($query) {
                $query->where('condicion_pago', 'CREDITO')
                      ->where('estado', 'PROCESADA')
                      ->select(DB::raw('SUM(total - COALESCE((SELECT SUM(monto) FROM pagos_ventas WHERE venta_id = ventas.id), 0))'));
            }])
            ->get()
            ->sum('saldo_pendiente_sum');
    }
}