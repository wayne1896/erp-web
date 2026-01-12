<?php
// app/Http\Controllers/Api/Mobile/SincronizacionController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\SincronizacionMovil;
use App\Models\DatoOffline;
use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\InventarioSucursal;
use App\Models\Caja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SincronizacionController extends Controller
{
    /**
     * Sincronización completa offline
     * POST /api/mobile/sync
     */
    public function sincronizar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dispositivo_id' => 'required|string|max:100',
            'ultima_sincronizacion' => 'required|date',
            'datos_pendientes' => 'required|array',
            'datos_pendientes.*.tabla' => 'required|string|max:50',
            'datos_pendientes.*.accion' => 'required|in:create,update,delete',
            'datos_pendientes.*.datos' => 'required|array',
            'datos_pendientes.*.checksum' => 'required|string',
            'datos_pendientes.*.fecha_creacion' => 'required|date',
            'datos_pendientes.*.dependencias' => 'nullable|array',
            'metadatos_dispositivo' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error en datos de sincronización'
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        // Iniciar registro de sincronización
        $sincronizacion = SincronizacionMovil::create([
            'user_id' => $user->id,
            'dispositivo_id' => $request->dispositivo_id,
            'tipo_sincronizacion' => 'completa',
            'estado' => 'procesando',
            'datos_enviados' => $request->datos_pendientes,
            'total_registros' => count($request->datos_pendientes),
            'fecha_inicio' => now(),
            'version_app' => $request->header('X-App-Version', '1.0.0'),
            'plataforma' => $request->header('X-Platform', 'android'),
            'ip_dispositivo' => $request->ip(),
            'conexion_tipo' => $this->detectarTipoConexion($request),
            'latitud' => $request->input('metadatos_dispositivo.latitud'),
            'longitud' => $request->input('metadatos_dispositivo.longitud'),
            'bateria_inicial' => $request->input('metadatos_dispositivo.bateria'),
        ]);

        DB::beginTransaction();

        try {
            $resultados = [
                'exitosos' => [],
                'fallidos' => [],
                'conflictos' => [],
                'datos_servidor' => [],
            ];

            // Procesar cada dato pendiente
            foreach ($request->datos_pendientes as $indice => $datoOffline) {
                try {
                    $resultado = $this->procesarDatoOffline(
                        $datoOffline, 
                        $user, 
                        $sucursalId,
                        $sincronizacion->id
                    );
                    
                    if ($resultado['estado'] === 'exitoso') {
                        $resultados['exitosos'][] = [
                            'indice' => $indice,
                            'tabla' => $datoOffline['tabla'],
                            'id_offline' => $datoOffline['datos']['id_offline'] ?? null,
                            'id_servidor' => $resultado['id_servidor'],
                            'accion' => $datoOffline['accion'],
                        ];
                    } else {
                        $resultados['fallidos'][] = [
                            'indice' => $indice,
                            'tabla' => $datoOffline['tabla'],
                            'error' => $resultado['error'],
                            'accion' => $datoOffline['accion'],
                        ];
                    }
                    
                } catch (\Exception $e) {
                    $resultados['fallidos'][] = [
                        'indice' => $indice,
                        'tabla' => $datoOffline['tabla'],
                        'error' => 'Error interno: ' . $e->getMessage(),
                        'accion' => $datoOffline['accion'],
                    ];
                }
            }

            // Obtener datos actualizados del servidor
            $resultados['datos_servidor'] = $this->obtenerDatosServidor(
                $request->ultima_sincronizacion,
                $sucursalId,
                $user->id
            );

            // Actualizar estadísticas de sincronización
            $sincronizacion->registros_exitosos = count($resultados['exitosos']);
            $sincronizacion->registros_fallidos = count($resultados['fallidos']);
            $sincronizacion->marcarComoExitosa(
                $resultados['datos_servidor'],
                $resultados['fallidos']
            );

            DB::commit();

            // Invalidar caches relevantes
            $this->invalidarCaches($sucursalId);

            return response()->json([
                'success' => true,
                'message' => 'Sincronización completada',
                'data' => $resultados,
                'sincronizacion' => [
                    'id' => $sincronizacion->id,
                    'estado' => $sincronizacion->estado,
                    'eficiencia' => $sincronizacion->eficiencia,
                    'duracion_segundos' => $sincronizacion->duracion_segundos,
                    'fecha_fin' => $sincronizacion->fecha_fin->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            $sincronizacion->marcarComoFallida('Error en transacción: ' . $e->getMessage());
            
            \Log::error('Error en sincronización móvil', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'sincronizacion_id' => $sincronizacion->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error en sincronización: ' . $e->getMessage(),
                'sincronizacion_id' => $sincronizacion->id,
            ], 500);
        }
    }

    /**
     * Sincronización parcial (más rápida)
     * POST /api/mobile/sync/parcial
     */
    public function sincronizacionParcial(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dispositivo_id' => 'required|string|max:100',
            'tipo_datos' => 'required|array',
            'tipo_datos.*' => 'in:ventas,clientes,productos,inventario,caja',
            'fecha_desde' => 'nullable|date',
            'limite' => 'nullable|integer|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $sincronizacion = SincronizacionMovil::create([
            'user_id' => $user->id,
            'dispositivo_id' => $request->dispositivo_id,
            'tipo_sincronizacion' => 'parcial',
            'estado' => 'procesando',
            'fecha_inicio' => now(),
            'version_app' => $request->header('X-App-Version'),
            'plataforma' => $request->header('X-Platform'),
        ]);

        try {
            $datosServidor = [];
            
            foreach ($request->tipo_datos as $tipo) {
                $datosServidor[$tipo] = match($tipo) {
                    'ventas' => $this->obtenerVentasRecientes(
                        $sucursalId,
                        $user->id,
                        $request->fecha_desde,
                        $request->limite
                    ),
                    'clientes' => $this->obtenerClientesRecientes(
                        $sucursalId,
                        $request->fecha_desde,
                        $request->limite
                    ),
                    'productos' => $this->obtenerProductosActualizados(
                        $sucursalId,
                        $request->fecha_desde
                    ),
                    'inventario' => $this->obtenerInventarioActualizado(
                        $sucursalId,
                        $request->fecha_desde
                    ),
                    'caja' => $this->obtenerEstadoCaja(
                        $sucursalId,
                        $user->id
                    ),
                    default => [],
                };
            }

            $sincronizacion->marcarComoExitosa($datosServidor);

            return response()->json([
                'success' => true,
                'message' => 'Sincronización parcial completada',
                'data' => $datosServidor,
                'metadata' => [
                    'sincronizacion_id' => $sincronizacion->id,
                    'fecha_sincronizacion' => now()->toISOString(),
                    'total_tipos_datos' => count($request->tipo_datos),
                ]
            ]);

        } catch (\Exception $e) {
            $sincronizacion->marcarComoFallida($e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error en sincronización parcial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos pendientes de sincronizar
     * GET /api/mobile/sync/pending
     */
    public function pendientes(Request $request)
    {
        $user = $request->user();
        
        $pendientes = DatoOffline::paraSincronizar($user->id, $request->dispositivo_id)
            ->porPrioridad()
            ->limit(100)
            ->get()
            ->map(function($dato) {
                return [
                    'id' => $dato->id,
                    'tabla' => $dato->tabla,
                    'accion' => $dato->accion,
                    'datos' => $dato->datos,
                    'checksum' => $dato->checksum,
                    'fecha_creacion_offline' => $dato->fecha_creacion_offline->toISOString(),
                    'dependencias' => $dato->dependencias,
                    'prioridad' => $dato->prioridad,
                    'intentos' => $dato->intentos,
                ];
            });

        $estadisticas = [
            'total_pendientes' => DatoOffline::paraSincronizar($user->id)->count(),
            'por_tabla' => DatoOffline::paraSincronizar($user->id)
                ->select('tabla', DB::raw('COUNT(*) as total'))
                ->groupBy('tabla')
                ->get()
                ->pluck('total', 'tabla'),
            'por_prioridad' => DatoOffline::paraSincronizar($user->id)
                ->select('prioridad', DB::raw('COUNT(*) as total'))
                ->groupBy('prioridad')
                ->get()
                ->pluck('total', 'prioridad'),
            'fecha_mas_antigua' => DatoOffline::paraSincronizar($user->id)
                ->min('fecha_creacion_offline'),
        ];

        return response()->json([
            'success' => true,
            'data' => $pendientes,
            'estadisticas' => $estadisticas,
            'metadata' => [
                'dispositivo_id' => $request->dispositivo_id,
                'fecha_consulta' => now()->toISOString(),
                'limite' => 100,
            ]
        ]);
    }

    /**
     * Forzar sincronización de datos específicos
     * POST /api/mobile/sync/force
     */
    public function forzarSincronizacion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'datos_ids' => 'required|array',
            'datos_ids.*' => 'integer|exists:datos_offline,id',
            'dispositivo_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        $sincronizacion = SincronizacionMovil::create([
            'user_id' => $user->id,
            'dispositivo_id' => $request->dispositivo_id,
            'tipo_sincronizacion' => 'forzada',
            'estado' => 'procesando',
            'fecha_inicio' => now(),
        ]);

        DB::beginTransaction();

        try {
            $resultados = [];
            $datos = DatoOffline::whereIn('id', $request->datos_ids)
                ->where('user_id', $user->id)
                ->get();

            foreach ($datos as $dato) {
                try {
                    $dato->procesar();
                    
                    $resultado = $this->procesarDatoOffline([
                        'tabla' => $dato->tabla,
                        'accion' => $dato->accion,
                        'datos' => $dato->datos,
                    ], $user, $sucursalId, $sincronizacion->id);
                    
                    if ($resultado['estado'] === 'exitoso') {
                        $dato->marcarComoCompletado($sincronizacion->id);
                        $resultados[] = [
                            'id' => $dato->id,
                            'estado' => 'exitoso',
                            'id_servidor' => $resultado['id_servidor'],
                        ];
                    } else {
                        $dato->marcarComoError($resultado['error']);
                        $resultados[] = [
                            'id' => $dato->id,
                            'estado' => 'fallido',
                            'error' => $resultado['error'],
                        ];
                    }
                    
                } catch (\Exception $e) {
                    $dato->marcarComoError($e->getMessage());
                    $resultados[] = [
                        'id' => $dato->id,
                        'estado' => 'error',
                        'error' => $e->getMessage(),
                    ];
                }
            }

            $sincronizacion->marcarComoExitosa([], $resultados);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sincronización forzada completada',
                'data' => $resultados,
                'sincronizacion_id' => $sincronizacion->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            $sincronizacion->marcarComoFallida($e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error en sincronización forzada: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de sincronizaciones
     * GET /api/mobile/sync/historial
     */
    public function historial(Request $request)
    {
        $user = $request->user();
        
        $perPage = $request->get('per_page', 20);
        
        $sincronizaciones = SincronizacionMovil::where('user_id', $user->id)
            ->orderBy('fecha_inicio', 'desc')
            ->paginate($perPage)
            ->through(function($sync) {
                return [
                    'id' => $sync->id,
                    'tipo_sincronizacion' => $sync->tipo_sincronizacion,
                    'estado' => $sync->estado,
                    'total_registros' => $sync->total_registros,
                    'registros_exitosos' => $sync->registros_exitosos,
                    'registros_fallidos' => $sync->registros_fallidos,
                    'eficiencia' => $sync->eficiencia,
                    'duracion_segundos' => $sync->duracion_segundos,
                    'tamano_datos_kb' => $sync->tamano_datos_kb,
                    'velocidad_transferencia' => $sync->velocidad_transferencia,
                    'fecha_inicio' => $sync->fecha_inicio->format('Y-m-d H:i:s'),
                    'fecha_fin' => $sync->fecha_fin?->format('Y-m-d H:i:s'),
                    'plataforma' => $sync->plataforma,
                    'version_app' => $sync->version_app,
                    'conexion_tipo' => $sync->conexion_tipo,
                ];
            });

        $estadisticas = [
            'total_sincronizaciones' => SincronizacionMovil::where('user_id', $user->id)->count(),
            'exitosas' => SincronizacionMovil::where('user_id', $user->id)->exitosas()->count(),
            'fallidas' => SincronizacionMovil::where('user_id', $user->id)->fallidas()->count(),
            'promedio_eficiencia' => SincronizacionMovil::where('user_id', $user->id)
                ->exitosas()
                ->avg('eficiencia'),
            'total_datos_sincronizados_mb' => SincronizacionMovil::where('user_id', $user->id)
                ->exitosas()
                ->sum('tamano_datos_kb') / 1024,
            'ultima_sincronizacion' => SincronizacionMovil::where('user_id', $user->id)
                ->exitosas()
                ->latest('fecha_fin')
                ->first()
                ?->fecha_fin
                ?->format('Y-m-d H:i:s'),
        ];

        return response()->json([
            'success' => true,
            'data' => $sincronizaciones->items(),
            'pagination' => [
                'current_page' => $sincronizaciones->currentPage(),
                'per_page' => $sincronizaciones->perPage(),
                'total' => $sincronizaciones->total(),
                'last_page' => $sincronizaciones->lastPage(),
            ],
            'estadisticas' => $estadisticas,
        ]);
    }

    /**
     * Verificar estado de conexión y preparar sincronización
     * GET /api/mobile/sync/status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;

        // Verificar conexión a servicios externos
        $servicios = [
            'api_principal' => $this->verificarServicioAPI(),
            'base_datos' => $this->verificarBaseDatos(),
            'servicio_fiscal' => $this->verificarServicioFiscal(),
            'almacenamiento' => $this->verificarAlmacenamiento(),
        ];

        // Obtener métricas de sincronización
        $pendientes = DatoOffline::paraSincronizar($user->id)->count();
        $ultimaSync = SincronizacionMovil::where('user_id', $user->id)
            ->exitosas()
            ->latest('fecha_fin')
            ->first();

        // Calcular recomendaciones
        $recomendaciones = $this->generarRecomendaciones($pendientes, $ultimaSync);

        $estado = [
            'conexion' => [
                'estado' => $servicios['api_principal'] ? 'conectado' : 'desconectado',
                'servicios' => $servicios,
                'latencia_ms' => $this->medirLatencia(),
            ],
            'sincronizacion' => [
                'pendientes' => $pendientes,
                'ultima_sincronizacion' => $ultimaSync?->fecha_fin?->toISOString(),
                'dias_desde_ultima_sync' => $ultimaSync ? 
                    now()->diffInDays($ultimaSync->fecha_fin) : null,
                'tamano_estimado_kb' => $this->calcularTamanoEstimado($user->id),
            ],
            'dispositivo' => [
                'bateria_recomendada' => '>20%',
                'almacenamiento_recomendado' => '>100MB',
                'conexion_recomendada' => 'WiFi o 4G',
            ],
            'recomendaciones' => $recomendaciones,
            'timestamp' => now()->toISOString(),
        ];

        return response()->json([
            'success' => true,
            'data' => $estado,
            'ready_for_sync' => $pendientes > 0 && $servicios['api_principal'],
        ]);
    }

    /**
     * Métodos auxiliares privados
     */
    
    private function procesarDatoOffline($datoOffline, $user, $sucursalId, $sincronizacionId)
    {
        // Validar checksum
        $checksumCalculado = md5(json_encode($datoOffline['datos']) . $datoOffline['tabla'] . $datoOffline['accion']);
        if ($checksumCalculado !== $datoOffline['checksum']) {
            throw new \Exception('Checksum inválido. Datos corruptos.');
        }

        return match($datoOffline['tabla']) {
            'ventas' => $this->procesarVentaOffline($datoOffline['datos'], $user, $sucursalId),
            'clientes' => $this->procesarClienteOffline($datoOffline['datos'], $user),
            'productos' => $this->procesarProductoOffline($datoOffline['datos'], $sucursalId),
            'inventario' => $this->procesarInventarioOffline($datoOffline['datos'], $sucursalId, $user),
            'caja_movimientos' => $this->procesarMovimientoCajaOffline($datoOffline['datos'], $user, $sucursalId),
            'pagos' => $this->procesarPagoOffline($datoOffline['datos'], $user),
            default => throw new \Exception("Tabla {$datoOffline['tabla']} no soportada"),
        };
    }

    private function procesarVentaOffline($datos, $user, $sucursalId)
    {
        DB::beginTransaction();
        
        try {
            // Verificar si ya existe (por si hubo reintento)
            $ventaExistente = Venta::where('offline_id', $datos['offline_id'] ?? null)
                ->where('user_id', $user->id)
                ->first();

            if ($ventaExistente) {
                return [
                    'estado' => 'exitoso',
                    'id_servidor' => $ventaExistente->id,
                    'mensaje' => 'Venta ya existente',
                ];
            }

            // Generar número de factura si no existe
            if (empty($datos['numero_factura'])) {
                $datos['numero_factura'] = $this->generarNumeroFactura($sucursalId);
            }

            // Generar NCF si aplica
            if (empty($datos['ncf']) && $datos['tipo_comprobante'] !== 'CONSUMO') {
                $datos['ncf'] = $this->generarNCF($datos['tipo_comprobante']);
            }

            // Crear venta
            $venta = Venta::create([
                'numero_factura' => $datos['numero_factura'],
                'ncf' => $datos['ncf'] ?? null,
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'cliente_id' => $datos['cliente_id'],
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'fecha_venta' => $datos['fecha_venta'],
                'estado' => 'PROCESADA',
                'condicion_pago' => $datos['condicion_pago'],
                'dias_credito' => $datos['dias_credito'] ?? 0,
                'subtotal' => $datos['subtotal'],
                'descuento' => $datos['descuento'] ?? 0,
                'itbis' => $datos['itbis'] ?? 0,
                'total' => $datos['total'],
                'notas' => $datos['notas'] ?? null,
                'offline_id' => $datos['offline_id'],
                'offline' => true,
                'fecha_sincronizacion' => now(),
            ]);

            // Crear detalles
            foreach ($datos['detalles'] as $detalle) {
                DB::table('detalle_ventas')->insert([
                    'venta_id' => $venta->id,
                    'producto_id' => $detalle['producto_id'],
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'descuento' => $detalle['descuento'] ?? 0,
                    'subtotal' => $detalle['subtotal'],
                    'itbis_porcentaje' => $detalle['itbis_porcentaje'] ?? 18.00,
                    'itbis_monto' => $detalle['itbis_monto'] ?? 0,
                    'total' => $detalle['total'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Actualizar inventario
                if ($detalle['actualizar_inventario'] ?? true) {
                    $inventario = InventarioSucursal::where('producto_id', $detalle['producto_id'])
                        ->where('sucursal_id', $sucursalId)
                        ->first();

                    if ($inventario) {
                        $inventario->decrementarStock($detalle['cantidad']);
                    }
                }
            }

            // Crear pago si es de contado
            if ($datos['condicion_pago'] === 'CONTADO' && isset($datos['pago'])) {
                DB::table('pagos_ventas')->insert([
                    'venta_id' => $venta->id,
                    'monto' => $datos['pago']['monto'],
                    'metodo_pago' => $datos['pago']['metodo_pago'],
                    'referencia' => $datos['pago']['referencia'] ?? null,
                    'fecha_pago' => $datos['fecha_venta'],
                    'user_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return [
                'estado' => 'exitoso',
                'id_servidor' => $venta->id,
                'numero_factura' => $venta->numero_factura,
                'ncf' => $venta->ncf,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function procesarClienteOffline($datos, $user)
    {
        // Verificar si ya existe por cédula/RNC
        $clienteExistente = Cliente::where('cedula_rnc', $datos['cedula_rnc'])
            ->where('activo', true)
            ->first();

        if ($clienteExistente) {
            return [
                'estado' => 'exitoso',
                'id_servidor' => $clienteExistente->id,
                'mensaje' => 'Cliente ya existente',
            ];
        }

        $cliente = Cliente::create([
            'codigo' => $this->generarCodigoCliente($datos['tipo_cliente']),
            'nombre_completo' => $datos['nombre_completo'],
            'cedula_rnc' => $datos['cedula_rnc'],
            'tipo_cliente' => $datos['tipo_cliente'],
            'telefono' => $datos['telefono'] ?? null,
            'email' => $datos['email'] ?? null,
            'direccion' => $datos['direccion'] ?? null,
            'provincia' => $datos['provincia'] ?? null,
            'municipio' => $datos['municipio'] ?? null,
            'limite_credito' => $datos['limite_credito'] ?? 0,
            'dias_credito' => $datos['dias_credito'] ?? 0,
            'activo' => true,
            'user_id' => $user->id,
            'offline_id' => $datos['offline_id'] ?? null,
        ]);

        return [
            'estado' => 'exitoso',
            'id_servidor' => $cliente->id,
            'codigo' => $cliente->codigo,
        ];
    }

    private function obtenerDatosServidor($ultimaSincronizacion, $sucursalId, $userId)
    {
        $fecha = Carbon::parse($ultimaSincronizacion);
        
        return [
            'ventas' => $this->obtenerVentasRecientes($sucursalId, $userId, $fecha),
            'clientes' => $this->obtenerClientesRecientes($sucursalId, $fecha),
            'productos' => $this->obtenerProductosActualizados($sucursalId, $fecha),
            'inventario' => $this->obtenerInventarioActualizado($sucursalId, $fecha),
            'caja' => $this->obtenerEstadoCaja($sucursalId, $userId),
            'configuraciones' => $this->obtenerConfiguracionesActualizadas($fecha),
        ];
    }

    private function obtenerVentasRecientes($sucursalId, $userId, $fechaDesde = null, $limite = 500)
    {
        $query = Venta::with(['detalles.producto', 'cliente', 'pagos'])
            ->where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->where('offline', false)
            ->orderBy('updated_at', 'desc');

        if ($fechaDesde) {
            $query->where('updated_at', '>', $fechaDesde);
        }

        if ($limite) {
            $query->limit($limite);
        }

        return $query->get()->map(function($venta) {
            return [
                'id' => $venta->id,
                'numero_factura' => $venta->numero_factura,
                'ncf' => $venta->ncf,
                'cliente_id' => $venta->cliente_id,
                'fecha_venta' => $venta->fecha_venta->toISOString(),
                'total' => (float) $venta->total,
                'estado' => $venta->estado,
                'condicion_pago' => $venta->condicion_pago,
                'detalles' => $venta->detalles->map(function($detalle) {
                    return [
                        'producto_id' => $detalle->producto_id,
                        'cantidad' => (float) $detalle->cantidad,
                        'precio_unitario' => (float) $detalle->precio_unitario,
                    ];
                }),
                'updated_at' => $venta->updated_at->toISOString(),
            ];
        });
    }

    private function obtenerClientesRecientes($sucursalId, $fechaDesde = null, $limite = 200)
    {
        $query = Cliente::where('activo', true)
            ->orderBy('updated_at', 'desc');

        if ($fechaDesde) {
            $query->where('updated_at', '>', $fechaDesde);
        }

        if ($limite) {
            $query->limit($limite);
        }

        return $query->get()->map(function($cliente) {
            return [
                'id' => $cliente->id,
                'codigo' => $cliente->codigo,
                'nombre_completo' => $cliente->nombre_completo,
                'cedula_rnc' => $cliente->cedula_rnc,
                'telefono' => $cliente->telefono,
                'limite_credito' => (float) $cliente->limite_credito,
                'dias_credito' => $cliente->dias_credito,
                'updated_at' => $cliente->updated_at->toISOString(),
            ];
        });
    }

    private function obtenerProductosActualizados($sucursalId, $fechaDesde = null)
    {
        $query = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->orderBy('updated_at', 'desc');

        if ($fechaDesde) {
            $query->where('updated_at', '>', $fechaDesde);
        }

        return $query->get()->map(function($producto) {
            $inventario = $producto->inventario->first();
            
            return [
                'id' => $producto->id,
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'precio_venta' => (float) $producto->precio_venta,
                'precio_con_itbis' => (float) $producto->precio_con_itbis,
                'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                'exento_itbis' => (bool) $producto->exento_itbis,
                'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
                'updated_at' => $producto->updated_at->toISOString(),
            ];
        });
    }

    private function obtenerInventarioActualizado($sucursalId, $fechaDesde = null)
    {
        $query = InventarioSucursal::with('producto')
            ->where('sucursal_id', $sucursalId)
            ->orderBy('updated_at', 'desc');

        if ($fechaDesde) {
            $query->where('updated_at', '>', $fechaDesde);
        }

        return $query->get()->map(function($inventario) {
            return [
                'producto_id' => $inventario->producto_id,
                'stock_disponible' => (float) $inventario->stock_disponible,
                'costo_promedio' => (float) $inventario->costo_promedio,
                'updated_at' => $inventario->updated_at->toISOString(),
            ];
        });
    }

    private function obtenerEstadoCaja($sucursalId, $userId)
    {
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->where('estado', 'abierta')
            ->first();

        if (!$caja) {
            return null;
        }

        return [
            'id' => $caja->id,
            'monto_inicial' => (float) $caja->monto_inicial,
            'efectivo' => (float) $caja->efectivo,
            'total_ventas' => (float) $caja->total_ventas,
            'fecha_apertura' => $caja->fecha_apertura->toISOString(),
            'updated_at' => $caja->updated_at->toISOString(),
        ];
    }

    private function obtenerConfiguracionesActualizadas($fechaDesde)
    {
        // Obtener configuraciones relevantes para móvil
        $configuraciones = [];
        
        // Tasa ITBIS actual
        $configuraciones['itbis_porcentaje'] = 18.00;
        
        // Secuencias NCF disponibles
        $configuraciones['secuencias_ncf'] = DB::table('secuencias_ncf')
            ->where('activo', true)
            ->where('fecha_vigencia_hasta', '>=', now())
            ->get()
            ->map(function($secuencia) {
                return [
                    'tipo_comprobante' => $secuencia->tipo_comprobante,
                    'prefijo' => $secuencia->prefijo,
                    'secuencia_actual' => $secuencia->secuencia_actual,
                ];
            });
        
        // Lista de provincias y municipios RD
        $configuraciones['provincias'] = $this->obtenerProvinciasRD();
        
        return $configuraciones;
    }

    private function obtenerProvinciasRD()
    {
        // Lista completa de provincias y municipios de RD
        return [
            [
                'id' => 1,
                'nombre' => 'Distrito Nacional',
                'municipios' => ['Santo Domingo Este', 'Santo Domingo Oeste', 'Santo Domingo Norte']
            ],
            [
                'id' => 2,
                'nombre' => 'Santiago',
                'municipios' => ['Santiago', 'Tamboril', 'Licey']
            ],
            // ... agregar todas las provincias
        ];
    }

    private function generarRecomendaciones($pendientes, $ultimaSync)
    {
        $recomendaciones = [];
        
        if ($pendientes > 50) {
            $recomendaciones[] = [
                'tipo' => 'advertencia',
                'mensaje' => "Tienes {$pendientes} registros pendientes por sincronizar",
                'accion' => 'Realiza una sincronización completa usando WiFi',
            ];
        }
        
        if ($ultimaSync && now()->diffInHours($ultimaSync->fecha_fin) > 24) {
            $recomendaciones[] = [
                'tipo' => 'advertencia',
                'mensaje' => 'Última sincronización hace más de 24 horas',
                'accion' => 'Sincroniza para obtener datos actualizados',
            ];
        }
        
        if ($pendientes === 0) {
            $recomendaciones[] = [
                'tipo' => 'informacion',
                'mensaje' => 'Todo sincronizado correctamente',
                'accion' => 'Puedes continuar trabajando',
            ];
        }
        
        return $recomendaciones;
    }

    private function detectarTipoConexion($request)
    {
        $userAgent = $request->header('User-Agent', '');
        
        if (strpos($userAgent, 'WiFi') !== false) {
            return 'wifi';
        } elseif (strpos($userAgent, '4G') !== false || strpos($userAgent, 'LTE') !== false) {
            return '4g';
        } elseif (strpos($userAgent, '3G') !== false) {
            return '3g';
        } else {
            return 'desconocido';
        }
    }

    private function invalidarCaches($sucursalId)
    {
        $caches = [
            "mobile.productos.sucursal.{$sucursalId}",
            "mobile.clientes.sucursal.{$sucursalId}",
            "mobile.ventas.hoy.{$sucursalId}",
        ];
        
        foreach ($caches as $cacheKey) {
            Cache::forget($cacheKey);
        }
    }
}