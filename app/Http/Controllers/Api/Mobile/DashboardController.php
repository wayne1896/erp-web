<?php
// app/Http\Controllers/Api/Mobile/DashboardController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\MetricaDashboard;
use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\InventarioSucursal;
use App\Models\Caja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Dashboard principal móvil
     * GET /api/mobile/dashboard
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $cacheKey = "mobile.dashboard.{$user->id}.{$sucursalId}";
        $cacheTime = 60; // 1 minuto para datos en tiempo real
        
        $dashboard = Cache::remember($cacheKey, $cacheTime, function () use ($user, $sucursalId) {
            return [
                'resumen_hoy' => $this->obtenerResumenHoy($user, $sucursalId),
                'metricas_principales' => $this->obtenerMetricasPrincipales($user, $sucursalId),
                'alertas_urgentes' => $this->obtenerAlertasUrgentes($user, $sucursalId),
                'ventas_recientes' => $this->obtenerVentasRecientes($user, $sucursalId, 5),
                'productos_top' => $this->obtenerProductosTop($sucursalId, 5),
                'estado_caja' => $this->obtenerEstadoCaja($user, $sucursalId),
                'metas' => $this->obtenerMetasProgreso($user, $sucursalId),
                'graficos' => $this->obtenerDatosGraficos($user, $sucursalId),
            ];
        });
        
        // Datos en tiempo real (no cacheados)
        $dashboard['tiempo_real'] = [
            'hora_actual' => now()->format('H:i'),
            'ventas_hoy_en_vivo' => $this->contarVentasHoyEnVivo($sucursalId, $user->id),
            'clientes_activos_hoy' => $this->contarClientesActivosHoy($sucursalId),
            'productos_bajo_stock' => $this->contarProductosBajoStock($sucursalId),
            'caja_actual' => $this->obtenerCajaActualEnVivo($user, $sucursalId),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'metadata' => [
                'fecha_consulta' => now()->toISOString(),
                'usuario' => $user->name,
                'sucursal' => $user->sucursal->nombre ?? 'Principal',
                'rol' => $user->tipo_usuario,
            ]
        ]);
    }
    
    /**
     * Dashboard ejecutivo (para gerentes/admin)
     * GET /api/mobile/dashboard/ejecutivo
     */
    public function ejecutivo(Request $request)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->esAdministrador() && $user->tipo_usuario !== 'gerente') {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para ver el dashboard ejecutivo'
            ], 403);
        }
        
        $sucursalId = $request->get('sucursal_id', $user->sucursal_id);
        
        $dashboard = [
            'resumen_general' => $this->obtenerResumenGeneral($sucursalId),
            'metricas_sucursales' => $this->obtenerMetricasSucursales(),
            'indicadores_financieros' => $this->obtenerIndicadoresFinancieros($sucursalId),
            'performance_vendedores' => $this->obtenerPerformanceVendedores($sucursalId),
            'analisis_clientes' => $this->obtenerAnalisisClientes($sucursalId),
            'control_inventario' => $this->obtenerControlInventario($sucursalId),
            'tendencias' => $this->obtenerTendencias($sucursalId),
            'alertas_gerenciales' => $this->obtenerAlertasGerenciales($sucursalId),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'metadata' => [
                'nivel' => 'ejecutivo',
                'fecha_generacion' => now()->toISOString(),
                'sucursal' => $sucursalId,
            ]
        ]);
    }
    
    /**
     * Dashboard específico por módulo
     * GET /api/mobile/dashboard/modulo/{modulo}
     */
    public function porModulo(Request $request, $modulo)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $data = match($modulo) {
            'ventas' => $this->obtenerDashboardVentas($user, $sucursalId),
            'inventario' => $this->obtenerDashboardInventario($sucursalId),
            'clientes' => $this->obtenerDashboardClientes($sucursalId),
            'caja' => $this->obtenerDashboardCaja($user, $sucursalId),
            'vendedor' => $this->obtenerDashboardVendedor($user, $sucursalId),
            default => throw new \Exception("Módulo {$modulo} no válido"),
        };
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'modulo' => $modulo,
            'fecha_consulta' => now()->format('Y-m-d H:i:s'),
        ]);
    }
    
    /**
     * Métricas detalladas por período
     * GET /api/mobile/dashboard/metricas
     */
    public function metricas(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|in:ventas,clientes,productos,inventario,caja,vendedor',
            'periodo' => 'required|in:hoy,semana,mes,anio,personalizado',
            'fecha_inicio' => 'required_if:periodo,personalizado|date',
            'fecha_fin' => 'required_if:periodo,personalizado|date|after_or_equal:fecha_inicio',
            'agrupar_por' => 'nullable|in:hora,dia,semana,mes,vendedor,producto',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $datos = $this->obtenerMetricasDetalladas(
            $user,
            $sucursalId,
            $request->tipo,
            $request->periodo,
            $request->agrupar_por,
            $request->fecha_inicio,
            $request->fecha_fin
        );
        
        return response()->json([
            'success' => true,
            'data' => $datos,
            'parametros' => $request->all(),
            'resumen' => $this->generarResumenMetricas($datos),
        ]);
    }
    
    /**
     * Alertas y notificaciones del dashboard
     * GET /api/mobile/dashboard/alertas
     */
    public function alertas(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $alertas = [
            'urgentes' => $this->obtenerAlertasUrgentes($user, $sucursalId),
            'advertencias' => $this->obtenerAlertasAdvertencias($sucursalId),
            'informativas' => $this->obtenerAlertasInformativas($sucursalId),
            'metas' => $this->obtenerAlertasMetas($user, $sucursalId),
        ];
        
        $totalAlertas = count($alertas['urgentes']) + count($alertas['advertencias']);
        
        return response()->json([
            'success' => true,
            'data' => $alertas,
            'resumen' => [
                'total_alertas' => $totalAlertas,
                'urgentes' => count($alertas['urgentes']),
                'advertencias' => count($alertas['advertencias']),
                'informativas' => count($alertas['informativas']),
                'sin_leer' => $this->contarAlertasSinLeer($user->id),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
    
    /**
     * Métodos auxiliares privados
     */
    
    private function obtenerResumenHoy($user, $sucursalId)
    {
        $hoyInicio = now()->startOfDay();
        $hoyFin = now()->endOfDay();
        
        // Ventas hoy
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereBetween('fecha_venta', [$hoyInicio, $hoyFin])
            ->where('estado', 'PROCESADA');
            
        $totalVentasHoy = $ventasHoy->count();
        $montoVentasHoy = $ventasHoy->sum('total');
        $promedioVentaHoy = $totalVentasHoy > 0 ? $montoVentasHoy / $totalVentasHoy : 0;
        
        // Comparar con ayer
        $ayerInicio = now()->subDay()->startOfDay();
        $ayerFin = now()->subDay()->endOfDay();
        
        $ventasAyer = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereBetween('fecha_venta', [$ayerInicio, $ayerFin])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $variacionVentas = $ventasAyer > 0 ? 
            (($montoVentasHoy - $ventasAyer) / $ventasAyer) * 100 : 
            ($montoVentasHoy > 0 ? 100 : 0);
        
        // Clientes nuevos hoy
        $clientesNuevosHoy = Cliente::where('activo', true)
            ->where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();
            
        // Productos bajo stock
        $productosBajoStock = Producto::whereHas('inventario', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->whereColumn('stock_disponible', '<', 'productos.stock_minimo');
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        return [
            'ventas' => [
                'total' => $totalVentasHoy,
                'monto' => (float) $montoVentasHoy,
                'promedio' => (float) $promedioVentaHoy,
                'variacion_diaria' => round($variacionVentas, 2),
                'tendencia' => $variacionVentas >= 0 ? 'subiendo' : 'bajando',
            ],
            'clientes' => [
                'nuevos_hoy' => $clientesNuevosHoy,
                'atendidos_hoy' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $user->id)
                    ->whereDate('fecha_venta', today())
                    ->distinct('cliente_id')
                    ->count('cliente_id'),
            ],
            'inventario' => [
                'productos_bajo_stock' => $productosBajoStock,
                'alerta_stock' => $productosBajoStock > 0,
            ],
            'caja' => [
                'abierta' => $this->tieneCajaAbierta($user, $sucursalId),
                'monto_actual' => $this->obtenerMontoCajaActual($user, $sucursalId),
            ],
            'meta_diaria' => [
                'objetivo' => $this->calcularMetaDiariaVentas($user, $sucursalId),
                'progreso' => $this->calcularProgresoMetaDiaria($user, $sucursalId, $montoVentasHoy),
                'porcentaje' => $this->calcularPorcentajeMetaDiaria($user, $sucursalId, $montoVentasHoy),
            ],
        ];
    }
    
    private function obtenerMetricasPrincipales($user, $sucursalId)
    {
        $metricas = [];
        
        // 1. Ventas del mes
        $mesInicio = now()->startOfMonth();
        $mesFin = now()->endOfMonth();
        
        $ventasMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$mesInicio, $mesFin])
            ->where('estado', 'PROCESADA');
            
        $metricas['ventas_mes'] = [
            'titulo' => 'Ventas del Mes',
            'valor' => (float) $ventasMes->sum('total'),
            'icono' => '💰',
            'unidad' => 'RD$',
            'tendencia' => $this->calcularTendenciaVentasMensual($sucursalId),
            'detalle' => $ventasMes->count() . ' transacciones',
            'color' => 'primary',
        ];
        
        // 2. Clientes activos mes
        $clientesActivosMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$mesInicio, $mesFin])
            ->distinct('cliente_id')
            ->count('cliente_id');
            
        $metricas['clientes_activos'] = [
            'titulo' => 'Clientes Activos',
            'valor' => $clientesActivosMes,
            'icono' => '👥',
            'unidad' => 'clientes',
            'tendencia' => $this->calcularTendenciaClientes($sucursalId),
            'detalle' => 'Este mes',
            'color' => 'success',
        ];
        
        // 3. Ticket promedio
        $ticketPromedio = $ventasMes->avg('total');
        $metricas['ticket_promedio'] = [
            'titulo' => 'Ticket Promedio',
            'valor' => round($ticketPromedio ?? 0, 2),
            'icono' => '📊',
            'unidad' => 'RD$',
            'tendencia' => $this->calcularTendenciaTicket($sucursalId),
            'detalle' => 'Por venta',
            'color' => 'info',
        ];
        
        // 4. Productos vendidos mes
        $productosVendidos = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->where('ventas.sucursal_id', $sucursalId)
            ->whereBetween('ventas.fecha_venta', [$mesInicio, $mesFin])
            ->where('ventas.estado', 'PROCESADA')
            ->sum('detalle_ventas.cantidad');
            
        $metricas['productos_vendidos'] = [
            'titulo' => 'Productos Vendidos',
            'valor' => (float) $productosVendidos,
            'icono' => '📦',
            'unidad' => 'unidades',
            'tendencia' => $this->calcularTendenciaProductos($sucursalId),
            'detalle' => 'Este mes',
            'color' => 'warning',
        ];
        
        // 5. Deuda pendiente
        $deudaPendiente = Venta::where('sucursal_id', $sucursalId)
            ->where('condicion_pago', 'CREDITO')
            ->where('estado', 'PROCESADA')
            ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)')
            ->sum('total');
            
        $metricas['deuda_pendiente'] = [
            'titulo' => 'Deuda Pendiente',
            'valor' => (float) $deudaPendiente,
            'icono' => '💳',
            'unidad' => 'RD$',
            'tendencia' => $this->calcularTendenciaDeuda($sucursalId),
            'detalle' => 'Por cobrar',
            'color' => $deudaPendiente > 0 ? 'danger' : 'secondary',
        ];
        
        // 6. Eficiencia de ventas (para vendedores)
        if ($user->esVendedor()) {
            $eficiencia = $this->calcularEficienciaVendedor($user->id, $sucursalId);
            $metricas['eficiencia'] = [
                'titulo' => 'Eficiencia',
                'valor' => round($eficiencia, 1),
                'icono' => '⭐',
                'unidad' => '%',
                'tendencia' => $this->calcularTendenciaEficiencia($user->id, $sucursalId),
                'detalle' => 'Tasa de conversión',
                'color' => $eficiencia >= 80 ? 'success' : ($eficiencia >= 60 ? 'warning' : 'danger'),
            ];
        }
        
        return $metricas;
    }
    
    private function obtenerAlertasUrgentes($user, $sucursalId)
    {
        $alertas = [];
        
        // 1. Caja no abierta (para vendedores)
        if ($user->esVendedor() && !$this->tieneCajaAbierta($user, $sucursalId)) {
            $alertas[] = [
                'id' => 'caja_no_abierta',
                'titulo' => 'Caja no abierta',
                'mensaje' => 'Debes abrir caja para registrar ventas',
                'tipo' => 'urgente',
                'accion' => 'abrir_caja',
                'prioridad' => 'alta',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // 2. Productos sin stock crítico
        $productosSinStock = Producto::whereHas('inventario', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->where('stock_disponible', '<=', 0);
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        if ($productosSinStock > 0) {
            $alertas[] = [
                'id' => 'productos_sin_stock',
                'titulo' => "{$productosSinStock} productos sin stock",
                'mensaje' => 'Hay productos agotados en inventario',
                'tipo' => 'urgente',
                'accion' => 'ver_inventario',
                'prioridad' => 'alta',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // 3. Ventas pendientes de sincronización
        $ventasPendientesSync = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('offline', true)
            ->whereNull('fecha_sincronizacion')
            ->count();
            
        if ($ventasPendientesSync > 0) {
            $alertas[] = [
                'id' => 'ventas_pendientes_sync',
                'titulo' => "{$ventasPendientesSync} ventas pendientes",
                'mensaje' => 'Hay ventas offline esperando sincronización',
                'tipo' => 'urgente',
                'accion' => 'sincronizar',
                'prioridad' => 'alta',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // 4. Clientes con límite de crédito excedido
        $clientesExcedidos = Cliente::where('activo', true)
            ->whereHas('ventas', function($query) {
                $query->where('condicion_pago', 'CREDITO')
                      ->where('estado', 'PROCESADA')
                      ->whereRaw('total > (SELECT COALESCE(SUM(monto), 0) FROM pagos_ventas WHERE venta_id = ventas.id)');
            })
            ->whereColumn('limite_credito', '<', DB::raw('(
                SELECT COALESCE(SUM(total - COALESCE((SELECT SUM(monto) FROM pagos_ventas WHERE venta_id = ventas.id), 0)), 0)
                FROM ventas
                WHERE cliente_id = clientes.id
                AND condicion_pago = "CREDITO"
                AND estado = "PROCESADA"
            )'))
            ->count();
            
        if ($clientesExcedidos > 0) {
            $alertas[] = [
                'id' => 'clientes_excedidos_credito',
                'titulo' => "{$clientesExcedidos} clientes exceden crédito",
                'mensaje' => 'Clientes han superado su límite de crédito',
                'tipo' => 'urgente',
                'accion' => 'ver_clientes',
                'prioridad' => 'alta',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // 5. Caja con diferencia importante
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->first();
            
        if ($caja && abs($caja->diferencia ?? 0) > 1000) {
            $alertas[] = [
                'id' => 'caja_con_diferencia',
                'titulo' => 'Diferencia en caja',
                'mensaje' => 'Hay una diferencia importante en el efectivo',
                'tipo' => 'urgente',
                'accion' => 'ver_caja',
                'prioridad' => 'alta',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        return $alertas;
    }
    
    private function obtenerVentasRecientes($user, $sucursalId, $limite = 5)
    {
        return Venta::with(['cliente', 'detalles.producto'])
            ->where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->limit($limite)
            ->get()
            ->map(function($venta) {
                return [
                    'id' => $venta->id,
                    'numero_factura' => $venta->numero_factura,
                    'cliente' => $venta->cliente->nombre_completo ?? 'Consumidor Final',
                    'total' => (float) $venta->total,
                    'metodo_pago' => $venta->condicion_pago,
                    'fecha' => $venta->fecha_venta->format('H:i'),
                    'items' => $venta->detalles->count(),
                    'estado_pago' => $venta->condicion_pago === 'CREDITO' ? 
                        ($venta->esta_pagada ? 'pagada' : 'pendiente') : 'contado',
                ];
            });
    }
    
    private function obtenerProductosTop($sucursalId, $limite = 5)
    {
        return DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
            ->select(
                'productos.id',
                'productos.codigo',
                'productos.nombre',
                DB::raw('SUM(detalle_ventas.cantidad) as total_vendido'),
                DB::raw('SUM(detalle_ventas.cantidad * detalle_ventas.precio_unitario) as total_monto')
            )
            ->where('ventas.sucursal_id', $sucursalId)
            ->where('ventas.estado', 'PROCESADA')
            ->whereDate('ventas.fecha_venta', '>=', now()->subDays(30))
            ->groupBy('productos.id', 'productos.codigo', 'productos.nombre')
            ->orderByDesc('total_vendido')
            ->limit($limite)
            ->get()
            ->map(function($producto) {
                return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'nombre' => $producto->nombre,
                    'total_vendido' => (float) $producto->total_vendido,
                    'total_monto' => (float) $producto->total_monto,
                ];
            });
    }
    
    private function obtenerEstadoCaja($user, $sucursalId)
    {
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->first();
            
        if (!$caja) {
            return [
                'estado' => 'cerrada',
                'mensaje' => 'Caja cerrada',
                'accion_recomendada' => 'Abrir caja para comenzar',
            ];
        }
        
        $ventasHoy = Venta::where('caja_id', $caja->id)
            ->where('estado', 'PROCESADA')
            ->whereDate('fecha_venta', today());
            
        return [
            'estado' => 'abierta',
            'caja_id' => $caja->id,
            'monto_inicial' => (float) $caja->monto_inicial,
            'efectivo_actual' => (float) $caja->efectivo,
            'total_ventas' => (float) $caja->total_ventas,
            'ventas_hoy' => [
                'cantidad' => $ventasHoy->count(),
                'monto' => (float) $ventasHoy->sum('total'),
            ],
            'fecha_apertura' => $caja->fecha_apertura->format('H:i'),
            'horas_abierta' => $caja->fecha_apertura->diffInHours(now()),
            'diferencia' => (float) ($caja->diferencia ?? 0),
            'recomendacion_cierre' => $caja->fecha_apertura->diffInHours(now()) >= 8 ?
                'Considerar cierre de caja' : null,
        ];
    }
    
    private function obtenerMetasProgreso($user, $sucursalId)
    {
        $hoy = now();
        
        // Meta diaria de ventas
        $metaDiaria = $this->calcularMetaDiariaVentas($user, $sucursalId);
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        // Meta mensual
        $metaMensual = $this->calcularMetaMensualVentas($sucursalId);
        $ventasMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$hoy->startOfMonth(), $hoy->endOfMonth()])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        // Días del mes transcurridos
        $diasTranscurridos = $hoy->day;
        $diasTotalesMes = $hoy->daysInMonth;
        $progresoTiempo = ($diasTranscurridos / $diasTotalesMes) * 100;
        
        return [
            'diaria' => [
                'meta' => (float) $metaDiaria,
                'actual' => (float) $ventasHoy,
                'progreso' => $metaDiaria > 0 ? ($ventasHoy / $metaDiaria) * 100 : 0,
                'restante' => max(0, $metaDiaria - $ventasHoy),
                'horas_restantes' => max(0, 24 - $hoy->hour),
                'estado' => $ventasHoy >= $metaDiaria ? 'cumplida' : 
                           ($ventasHoy >= ($metaDiaria * 0.7) ? 'en_progreso' : 'atrasada'),
            ],
            'mensual' => [
                'meta' => (float) $metaMensual,
                'actual' => (float) $ventasMes,
                'progreso' => $metaMensual > 0 ? ($ventasMes / $metaMensual) * 100 : 0,
                'progreso_tiempo' => round($progresoTiempo, 2),
                'dias_restantes' => $diasTotalesMes - $diasTranscurridos,
                'proyeccion' => $diasTranscurridos > 0 ? 
                    ($ventasMes / $diasTranscurridos) * $diasTotalesMes : 0,
                'estado' => $ventasMes >= $metaMensual ? 'cumplida' : 
                           ($ventasMes >= ($metaMensual * ($progresoTiempo / 100)) ? 'en_curso' : 'atrasada'),
            ],
            'clientes' => [
                'meta_mensual' => 50, // Ejemplo
                'actual' => Cliente::where('activo', true)
                    ->whereMonth('created_at', $hoy->month)
                    ->count(),
                'nuevos_hoy' => Cliente::where('activo', true)
                    ->whereDate('created_at', today())
                    ->count(),
            ],
        ];
    }
    
    private function obtenerDatosGraficos($user, $sucursalId)
    {
        $hoy = now();
        
        // Ventas por hora hoy
        $ventasPorHora = [];
        for ($hora = 8; $hora <= 20; $hora++) {
            $inicio = $hoy->copy()->setTime($hora, 0, 0);
            $fin = $hoy->copy()->setTime($hora, 59, 59);
            
            $monto = Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            $ventasPorHora[] = [
                'hora' => sprintf('%02d:00', $hora),
                'monto' => (float) $monto,
                'ventas' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $user->id)
                    ->whereBetween('fecha_venta', [$inicio, $fin])
                    ->where('estado', 'PROCESADA')
                    ->count(),
            ];
        }
        
        // Ventas últimos 7 días
        $ventasUltimos7Dias = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = $hoy->copy()->subDays($i);
            $inicio = $fecha->copy()->startOfDay();
            $fin = $fecha->copy()->endOfDay();
            
            $monto = Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            $ventasUltimos7Dias[] = [
                'fecha' => $fecha->format('d/m'),
                'dia' => $fecha->dayName,
                'monto' => (float) $monto,
                'ventas' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $user->id)
                    ->whereBetween('fecha_venta', [$inicio, $fin])
                    ->where('estado', 'PROCESADA')
                    ->count(),
            ];
        }
        
        // Ventas por método de pago (mes actual)
        $ventasPorMetodo = DB::table('ventas')
            ->select(
                'condicion_pago',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(total) as monto')
            )
            ->where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereBetween('fecha_venta', [$hoy->startOfMonth(), $hoy->endOfMonth()])
            ->where('estado', 'PROCESADA')
            ->groupBy('condicion_pago')
            ->get()
            ->map(function($item) {
                return [
                    'metodo' => $item->condicion_pago,
                    'cantidad' => $item->cantidad,
                    'monto' => (float) $item->monto,
                    'porcentaje' => 0, // Se calcula después
                ];
            });
            
        // Calcular porcentajes
        $totalMontoMetodos = $ventasPorMetodo->sum('monto');
        $ventasPorMetodo = $ventasPorMetodo->map(function($item) use ($totalMontoMetodos) {
            $item['porcentaje'] = $totalMontoMetodos > 0 ? 
                round(($item['monto'] / $totalMontoMetodos) * 100, 1) : 0;
            return $item;
        });
        
        // Top categorías de productos
        $topCategorias = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
            ->join('categorias_productos', 'productos.categoria_id', '=', 'categorias_productos.id')
            ->select(
                'categorias_productos.id',
                'categorias_productos.nombre',
                DB::raw('SUM(detalle_ventas.cantidad) as total_unidades'),
                DB::raw('SUM(detalle_ventas.cantidad * detalle_ventas.precio_unitario) as total_monto')
            )
            ->where('ventas.sucursal_id', $sucursalId)
            ->where('ventas.user_id', $user->id)
            ->whereBetween('ventas.fecha_venta', [$hoy->startOfMonth(), $hoy->endOfMonth()])
            ->where('ventas.estado', 'PROCESADA')
            ->groupBy('categorias_productos.id', 'categorias_productos.nombre')
            ->orderByDesc('total_monto')
            ->limit(5)
            ->get();
        
        return [
            'ventas_por_hora' => $ventasPorHora,
            'ventas_ultimos_7_dias' => $ventasUltimos7Dias,
            'ventas_por_metodo' => $ventasPorMetodo,
            'top_categorias' => $topCategorias,
            'tendencias' => $this->calcularTendencias($ventasUltimos7Dias),
        ];
    }
    
    private function calcularMetaDiariaVentas($user, $sucursalId)
    {
        // Calcular meta basada en promedio histórico
        $mesActual = now()->month;
        $anioActual = now()->year;
        
        // Obtener promedio de ventas diarias del mes anterior
        $mesAnterior = now()->subMonth();
        $ventasMesAnterior = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereMonth('fecha_venta', $mesAnterior->month)
            ->whereYear('fecha_venta', $mesAnterior->year)
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $diasMesAnterior = $mesAnterior->daysInMonth;
        $promedioDiario = $diasMesAnterior > 0 ? $ventasMesAnterior / $diasMesAnterior : 0;
        
        // Ajustar por día de la semana (los fines de semana suelen vender más)
        $diaSemana = now()->dayOfWeek;
        $factorDia = match($diaSemana) {
            0, 6 => 1.3, // Sábado y Domingo
            5 => 1.2,    // Viernes
            default => 1.0,
        };
        
        // Meta diaria = promedio histórico * factor día * factor crecimiento (5%)
        $meta = $promedioDiario * $factorDia * 1.05;
        
        // Mínimo RD$5,000 para vendedores activos
        return max(5000, round($meta, 2));
    }
    
    private function calcularEficienciaVendedor($userId, $sucursalId)
    {
        $hoy = now();
        
        // Total de clientes atendidos
        $clientesAtendidos = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->whereDate('fecha_venta', today())
            ->distinct('cliente_id')
            ->count('cliente_id');
            
        // Total de clientes que entraron (estimado basado en histórico)
        $clientesPotenciales = $this->estimarClientesPotenciales($sucursalId);
        
        // Eficiencia = clientes atendidos / clientes potenciales
        if ($clientesPotenciales > 0) {
            return ($clientesAtendidos / $clientesPotenciales) * 100;
        }
        
        return $clientesAtendidos > 0 ? 100 : 0;
    }
    
    private function estimarClientesPotenciales($sucursalId)
    {
        // Estimación basada en promedio histórico por día de semana
        $diaSemana = now()->dayOfWeek;
        
        $promedio = DB::table('ventas')
            ->select(DB::raw('AVG(clientes_dia) as promedio'))
            ->fromSub(function($query) use ($sucursalId) {
                $query->from('ventas')
                    ->select(
                        DB::raw('DATE(fecha_venta) as fecha'),
                        DB::raw('COUNT(DISTINCT cliente_id) as clientes_dia')
                    )
                    ->where('sucursal_id', $sucursalId)
                    ->where('estado', 'PROCESADA')
                    ->whereRaw('DAYOFWEEK(fecha_venta) = ?', [$diaSemana + 1]) // MySQL usa 1=Domingo
                    ->groupBy(DB::raw('DATE(fecha_venta)'));
            }, 'sub')
            ->first();
            
        return round($promedio->promedio ?? 30, 0); // Default 30 si no hay datos
    }
    
    private function contarVentasHoyEnVivo($sucursalId, $userId)
    {
        return [
            'total' => Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->whereDate('fecha_venta', today())
                ->where('estado', 'PROCESADA')
                ->count(),
            'ultima_hora' => Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->where('fecha_venta', '>=', now()->subHour())
                ->where('estado', 'PROCESADA')
                ->count(),
            'monto_total' => Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->whereDate('fecha_venta', today())
                ->where('estado', 'PROCESADA')
                ->sum('total'),
        ];
    }
    
    private function obtenerDashboardVentas($user, $sucursalId)
    {
        $hoy = now();
        $inicioMes = $hoy->startOfMonth();
        $finMes = $hoy->endOfMonth();
        
        // Estadísticas detalladas de ventas
        $ventasMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioMes, $finMes])
            ->where('estado', 'PROCESADA');
            
        if ($user->esVendedor()) {
            $ventasMes->where('user_id', $user->id);
        }
        
        $totalVentas = $ventasMes->count();
        $totalMonto = $ventasMes->sum('total');
        
        // Ventas por vendedor
        $ventasPorVendedor = DB::table('ventas')
            ->join('users', 'ventas.user_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(*) as total_ventas'),
                DB::raw('SUM(ventas.total) as total_monto'),
                DB::raw('AVG(ventas.total) as promedio_venta')
            )
            ->where('ventas.sucursal_id', $sucursalId)
            ->whereBetween('ventas.fecha_venta', [$inicioMes, $finMes])
            ->where('ventas.estado', 'PROCESADA')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_monto')
            ->get();
            
        // Ventas por hora del día
        $ventasPorHora = DB::table('ventas')
            ->select(
                DB::raw('HOUR(fecha_venta) as hora'),
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(total) as monto')
            )
            ->where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioMes, $finMes])
            ->where('estado', 'PROCESADA')
            ->groupBy(DB::raw('HOUR(fecha_venta)'))
            ->orderBy('hora')
            ->get();
            
        return [
            'resumen' => [
                'total_ventas' => $totalVentas,
                'total_monto' => (float) $totalMonto,
                'promedio_venta' => $totalVentas > 0 ? $totalMonto / $totalVentas : 0,
                'ventas_credito' => $ventasMes->where('condicion_pago', 'CREDITO')->count(),
                'ventas_contado' => $ventasMes->where('condicion_pago', 'CONTADO')->count(),
                'ticket_promedio' => $totalVentas > 0 ? $totalMonto / $totalVentas : 0,
            ],
            'por_vendedor' => $ventasPorVendedor,
            'por_hora' => $ventasPorHora,
            'por_dia_semana' => $this->calcularVentasPorDiaSemana($sucursalId),
            'tendencias' => $this->calcularTendenciasVentas($sucursalId),
        ];
    }
    
    private function calcularTendenciasVentas($sucursalId)
    {
        $hoy = now();
        $tendencias = [];
        
        // Comparar esta semana vs semana anterior
        $inicioSemana = $hoy->copy()->startOfWeek();
        $finSemana = $hoy->copy()->endOfWeek();
        
        $ventasEstaSemana = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioSemana, $finSemana])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $inicioSemanaAnterior = $hoy->copy()->subWeek()->startOfWeek();
        $finSemanaAnterior = $hoy->copy()->subWeek()->endOfWeek();
        
        $ventasSemanaAnterior = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioSemanaAnterior, $finSemanaAnterior])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $tendencias['semanal'] = [
            'actual' => (float) $ventasEstaSemana,
            'anterior' => (float) $ventasSemanaAnterior,
            'variacion' => $ventasSemanaAnterior > 0 ? 
                (($ventasEstaSemana - $ventasSemanaAnterior) / $ventasSemanaAnterior) * 100 : 
                ($ventasEstaSemana > 0 ? 100 : 0),
        ];
        
        // Comparar este mes vs mes anterior
        $inicioMes = $hoy->copy()->startOfMonth();
        $finMes = $hoy->copy()->endOfMonth();
        
        $ventasEsteMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioMes, $finMes])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $inicioMesAnterior = $hoy->copy()->subMonth()->startOfMonth();
        $finMesAnterior = $hoy->copy()->subMonth()->endOfMonth();
        
        $ventasMesAnterior = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioMesAnterior, $finMesAnterior])
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $tendencias['mensual'] = [
            'actual' => (float) $ventasEsteMes,
            'anterior' => (float) $ventasMesAnterior,
            'variacion' => $ventasMesAnterior > 0 ? 
                (($ventasEsteMes - $ventasMesAnterior) / $ventasMesAnterior) * 100 : 
                ($ventasEsteMes > 0 ? 100 : 0),
        ];
        
        return $tendencias;
    }
}