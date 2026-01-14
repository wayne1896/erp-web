<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Caja;
use App\Models\Sucursal;
use App\Models\DetalleVenta;
use App\Models\InventarioSucursal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Mostrar dashboard principal
     */
    public function index()
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Obtener sucursal actual
        $sucursal = Sucursal::find($sucursalId);
        
        // Si no hay sucursal asignada, usar la primera activa
        if (!$sucursal) {
            $sucursal = Sucursal::activas()->first();
            $sucursalId = $sucursal->id ?? null;
        }
        
        // Si no hay sucursal activa, retornar dashboard básico
        if (!$sucursalId) {
            return Inertia::render('Dashboard', [
                'metrics' => $this->getEmptyMetrics(),
                'recentSales' => [],
                'topProducts' => [],
                'alerts' => [],
                'charts' => $this->getEmptyCharts(),
                'performance' => $this->getEmptyPerformance(),
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'usuario', // CAMBIO: Usa campo 'role'
                ],
            ]);
        }
        
        // Métricas del día
        $hoy = now();
        $ayer = $hoy->copy()->subDay();
        $inicioSemana = $hoy->copy()->startOfWeek();
        $inicioMes = $hoy->copy()->startOfMonth();
        
        // Ventas del día
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', $hoy)
            ->where('estado', 'PROCESADA');
            
        $ventasAyer = Venta::where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', $ayer)
            ->where('estado', 'PROCESADA');
            
        $ventasSemana = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioSemana, $hoy])
            ->where('estado', 'PROCESADA');
            
        $ventasMes = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$inicioMes, $hoy])
            ->where('estado', 'PROCESADA');
        
        // Calcular variaciones
        $totalHoy = $ventasHoy->sum('total') ?? 0;
        $totalAyer = $ventasAyer->sum('total') ?? 0;
        $variacionDiaria = $this->calcularVariacion($totalHoy, $totalAyer);
        
        // Métricas principales
        $metrics = [
            'ventas' => [
                'hoy' => [
                    'total' => (float) $totalHoy,
                    'count' => $ventasHoy->count(),
                    'ticket_promedio' => $ventasHoy->count() > 0 ? (float) $totalHoy / $ventasHoy->count() : 0,
                    'variacion' => $variacionDiaria,
                ],
                'semana' => [
                    'total' => (float) ($ventasSemana->sum('total') ?? 0),
                    'count' => $ventasSemana->count(),
                ],
                'mes' => [
                    'total' => (float) ($ventasMes->sum('total') ?? 0),
                    'count' => $ventasMes->count(),
                ],
            ],
            'clientes' => [
                'total' => Cliente::count(),
                'nuevos_hoy' => Cliente::whereDate('created_at', $hoy)->count(),
                'nuevos_semana' => Cliente::whereBetween('created_at', [$inicioSemana, $hoy])->count(),
            ],
            'inventario' => [
                'total_productos' => Producto::where('activo', true)->count(),
                'productos_bajo_stock' => Producto::whereHas('inventarios', function($query) use ($sucursalId) {
                    $query->where('sucursal_id', $sucursalId)
                          ->whereColumn('stock_disponible', '<=', 'productos.stock_minimo');
                })
                ->where('activo', true)
                ->where('control_stock', true)
                ->count(),
                'valor_total_inventario' => InventarioSucursal::where('sucursal_id', $sucursalId)
                    ->sum('valor_inventario') ?? 0,
            ],
            'caja' => $this->obtenerEstadoCaja($user, $sucursalId),
            'sucursal' => [
                'nombre' => $sucursal->nombre ?? 'Sin sucursal',
                'activa' => $sucursal->activa ?? false,
                'direccion' => $sucursal->direccion ?? '',
            ],
        ];
        
        // Ventas recientes
        $recentSales = Venta::with(['cliente:id,nombre_completo', 'detalles.producto:id,nombre'])
            ->where('sucursal_id', $sucursalId)
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->limit(8)
            ->get()
            ->map(function($venta) {
                return [
                    'id' => $venta->id,
                    'numero_factura' => $venta->numero_factura,
                    'cliente_nombre' => $venta->cliente->nombre_completo ?? 'Consumidor Final',
                    'total' => (float) $venta->total,
                    'condicion_pago' => $venta->condicion_pago,
                    'fecha_venta' => $venta->fecha_venta->format('d/m/Y H:i'),
                    'estado' => $venta->estado,
                    'items_count' => $venta->detalles->count(),
                    'items' => $venta->detalles->take(2)->map(function($detalle) {
                        return [
                            'producto' => $detalle->producto->nombre ?? 'Producto',
                            'cantidad' => $detalle->cantidad,
                            'precio' => (float) $detalle->precio_unitario,
                        ];
                    }),
                ];
            });
        
        // Productos más vendidos del mes
        try {
            if (Schema::hasTable('detalle_ventas')) {
                $topProducts = DB::table('detalle_ventas')
                    ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
                    ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
                    ->select(
                        'productos.id',
                        'productos.nombre',
                        'productos.codigo',
                        DB::raw('SUM(detalle_ventas.cantidad) as total_vendido'),
                        DB::raw('SUM(detalle_ventas.total) as total_ingresos')
                    )
                    ->where('ventas.sucursal_id', $sucursalId)
                    ->where('ventas.estado', 'PROCESADA')
                    ->whereBetween('ventas.fecha_venta', [$inicioMes, $hoy])
                    ->groupBy('productos.id', 'productos.nombre', 'productos.codigo')
                    ->orderByDesc('total_vendido')
                    ->limit(5)
                    ->get()
                    ->map(function($product) {
                        return [
                            'id' => $product->id,
                            'nombre' => $product->nombre,
                            'codigo' => $product->codigo,
                            'total_vendido' => (float) $product->total_vendido,
                            'total_ingresos' => (float) $product->total_ingresos,
                        ];
                    });
            } else {
                // Si la tabla no existe, usar datos de prueba
                $topProducts = collect([
                    [
                        'id' => 1,
                        'nombre' => 'Producto Ejemplo 1',
                        'codigo' => 'PROD001',
                        'total_vendido' => 25,
                        'total_ingresos' => 1250.00,
                    ],
                    [
                        'id' => 2,
                        'nombre' => 'Producto Ejemplo 2',
                        'codigo' => 'PROD002',
                        'total_vendido' => 18,
                        'total_ingresos' => 900.00,
                    ],
                    [
                        'id' => 3,
                        'nombre' => 'Producto Ejemplo 3',
                        'codigo' => 'PROD003',
                        'total_vendido' => 12,
                        'total_ingresos' => 600.00,
                    ],
                ]);
            }
        } catch (\Exception $e) {
            // Si hay error, retornar array vacío
            $topProducts = collect([]);
        }
        
        // Alertas y notificaciones
        $alerts = $this->obtenerAlertasDashboard($user, $sucursalId);
        
        // Datos para gráficos
        $charts = [
            'ventas_por_dia' => $this->obtenerVentasUltimos7Dias($sucursalId),
            'ventas_por_metodo' => $this->obtenerVentasPorMetodo($sucursalId),
            'ventas_por_hora' => $this->obtenerVentasPorHora($sucursalId),
        ];
        
        // Métricas de rendimiento
        $performance = [
            'ticket_promedio' => $metrics['ventas']['hoy']['ticket_promedio'],
            'conversion_cliente' => $metrics['ventas']['hoy']['count'] > 0 && $metrics['clientes']['nuevos_hoy'] > 0 
                ? round(($metrics['ventas']['hoy']['count'] / $metrics['clientes']['nuevos_hoy']) * 100, 2)
                : 0,
            'meta_diaria' => $this->calcularMetaDiaria($sucursalId),
        ];
        
        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
            'alerts' => $alerts,
            'charts' => $charts,
            'performance' => $performance,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'usuario', // CAMBIO: Usa campo 'role' directamente
                'avatar' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path)
                    : null,
            ],
        ]);
    }
    
    /**
     * API para actualizar dashboard en tiempo real
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        $hoy = now();
        
        // Métricas rápidas
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', $hoy)
            ->where('estado', 'PROCESADA');
            
        $metrics = [
            'ventas_hoy' => [
                'total' => (float) $ventasHoy->sum('total'),
                'count' => $ventasHoy->count(),
            ],
            'caja' => $this->obtenerEstadoCaja($user, $sucursalId),
            'clientes_nuevos_hoy' => Cliente::whereDate('created_at', $hoy)->count(),
        ];
        
        // Alertas urgentes
        $alerts = $this->obtenerAlertasUrgentes($user, $sucursalId);
        
        // Ventas de las últimas horas
        $ventasUltimasHoras = $this->obtenerVentasUltimasHoras($sucursalId);
        
        return response()->json([
            'metrics' => $metrics,
            'alerts' => $alerts,
            'charts' => [
                'ventas_ultimas_horas' => $ventasUltimasHoras,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
    
    /**
     * Métodos auxiliares
     */
    private function calcularVariacion($actual, $anterior)
    {
        if ($anterior == 0) {
            return $actual > 0 ? 100 : 0;
        }
        
        return round((($actual - $anterior) / $anterior) * 100, 2);
    }
    
    private function obtenerEstadoCaja($user, $sucursalId)
    {
        try {
            $caja = Caja::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->where('estado', 'abierta')
                ->whereNull('fecha_cierre')
                ->first();
                
            if (!$caja) {
                return [
                    'abierta' => false,
                    'monto_inicial' => 0,
                    'monto_actual' => 0,
                    'total_ventas' => 0,
                    'fecha_apertura' => null,
                ];
            }
            
            // Calcular ventas desde la apertura de la caja
            $ventasDesdeApertura = Venta::where('sucursal_id', $sucursalId)
                ->where('caja_id', $caja->id)
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            // Usar el efectivo actual de la caja o calcularlo
            $efectivoActual = $caja->efectivo ?: ($caja->monto_inicial + $ventasDesdeApertura);
            
            return [
                'abierta' => true,
                'monto_inicial' => (float) $caja->monto_inicial,
                'monto_actual' => (float) $efectivoActual,
                'total_ventas' => (float) $ventasDesdeApertura,
                'fecha_apertura' => $caja->fecha_apertura ? $caja->fecha_apertura->format('H:i') : 'Hoy',
                'caja_id' => $caja->id,
            ];
        } catch (\Exception $e) {
            // Si hay error con la caja, retornar caja cerrada
            return [
                'abierta' => false,
                'monto_inicial' => 0,
                'monto_actual' => 0,
                'total_ventas' => 0,
                'fecha_apertura' => null,
            ];
        }
    }
    
    private function calcularMetaDiaria($sucursalId)
    {
        // Promedio de ventas de los últimos 30 días
        $promedio30Dias = Venta::where('sucursal_id', $sucursalId)
            ->where('estado', 'PROCESADA')
            ->whereDate('fecha_venta', '>=', now()->subDays(30))
            ->avg('total') ?? 0;
            
        $meta = $promedio30Dias * 1.15; // 15% más que el promedio
            
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        return [
            'objetivo' => round($meta, 2),
            'progreso' => round($ventasHoy, 2),
            'porcentaje' => $meta > 0 ? min(round(($ventasHoy / $meta) * 100, 2), 100) : 0,
        ];
    }
    
    private function obtenerAlertasDashboard($user, $sucursalId)
    {
        $alerts = [];
        
        // Caja no abierta
        $cajaAbierta = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->exists();
            
        if (!$cajaAbierta) {
            $alerts[] = [
                'type' => 'warning',
                'icon' => '💰',
                'title' => 'Caja cerrada',
                'message' => 'Abre caja para registrar ventas',
                'action' => 'Abrir Caja',
                'actionUrl' => '/caja/abrir',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // Productos bajo stock
        $productosBajoStock = Producto::whereHas('inventarios', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->whereColumn('stock_disponible', '<', 'productos.stock_minimo');
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        if ($productosBajoStock > 0) {
            $alerts[] = [
                'type' => 'danger',
                'icon' => '📦',
                'title' => "Stock bajo: {$productosBajoStock} productos",
                'message' => 'Revisa el inventario urgentemente',
                'action' => 'Ver Inventario',
                'actionUrl' => '/inventario',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        // Sin ventas hoy
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->count();
            
        if ($ventasHoy == 0 && now()->hour >= 12) {
            $alerts[] = [
                'type' => 'info',
                'icon' => '📊',
                'title' => 'Sin ventas hoy',
                'message' => 'Aún no se han registrado ventas',
                'action' => 'Nueva Venta',
                'actionUrl' => '/ventas/crear',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        return $alerts;
    }
    
    private function obtenerVentasUltimos7Dias($sucursalId)
    {
        $ventasPorDia = [];
        $hoy = now();
        
        for ($i = 6; $i >= 0; $i--) {
            $fecha = $hoy->copy()->subDays($i);
            $inicio = $fecha->copy()->startOfDay();
            $fin = $fecha->copy()->endOfDay();
            
            $ventas = Venta::where('sucursal_id', $sucursalId)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->get();
                
            $ventasPorDia[] = [
                'dia' => $fecha->isoFormat('ddd'),
                'fecha' => $fecha->format('d/m'),
                'ventas' => $ventas->count(),
                'total' => (float) $ventas->sum('total'),
                'ticket_promedio' => $ventas->count() > 0 ? (float) $ventas->sum('total') / $ventas->count() : 0,
            ];
        }
        
        return $ventasPorDia;
    }
    
    private function obtenerVentasPorMetodo($sucursalId)
    {
        try {
            return Venta::where('sucursal_id', $sucursalId)
                ->whereDate('fecha_venta', '>=', now()->subDays(7))
                ->where('estado', 'PROCESADA')
                ->selectRaw('condicion_pago as metodo, COUNT(*) as cantidad, SUM(total) as monto')
                ->groupBy('condicion_pago')
                ->orderByDesc('monto')
                ->get()
                ->map(function($item) {
                    return [
                        'metodo' => $item->metodo,
                        'cantidad' => $item->cantidad,
                        'monto' => (float) $item->monto,
                    ];
                });
        } catch (\Exception $e) {
            return collect([]);
        }
    }
    
    private function obtenerVentasPorHora($sucursalId)
    {
        $ventasPorHora = [];
        
        for ($hora = 8; $hora <= 21; $hora++) {
            $hoy = now();
            $inicio = $hoy->copy()->setTime($hora, 0, 0);
            $fin = $hoy->copy()->setTime($hora, 59, 59);
            
            $ventas = Venta::where('sucursal_id', $sucursalId)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->get();
                
            $ventasPorHora[] = [
                'hora' => sprintf('%02d:00', $hora),
                'ventas' => $ventas->count(),
                'total' => (float) $ventas->sum('total'),
            ];
        }
        
        return $ventasPorHora;
    }
    
    private function obtenerAlertasUrgentes($user, $sucursalId)
    {
        $alerts = [];
        
        // Aquí deberías tener un modelo Notificacion si lo necesitas
        // Por ahora retornar alertas básicas
        
        // Alertas de stock bajo
        $productosBajoStock = Producto::whereHas('inventarios', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->whereColumn('stock_disponible', '<', 'productos.stock_minimo');
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        if ($productosBajoStock > 0) {
            $alerts[] = [
                'type' => 'danger',
                'icon' => '📦',
                'title' => "Stock bajo: {$productosBajoStock} productos",
                'message' => 'Revisa el inventario urgentemente',
                'timestamp' => now()->format('H:i'),
            ];
        }
        
        return $alerts;
    }
    
    private function obtenerVentasUltimasHoras($sucursalId)
    {
        $ventasPorHora = [];
        $hoy = now();
        
        for ($i = 0; $i < 6; $i++) {
            $hora = $hoy->copy()->subHours($i);
            $inicio = $hora->copy()->startOfHour();
            $fin = $hora->copy()->endOfHour();
            
            $total = Venta::where('sucursal_id', $sucursalId)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            $ventasPorHora[] = [
                'hora' => $hora->format('H:00'),
                'total' => (float) $total,
            ];
        }
        
        return array_reverse($ventasPorHora);
    }
    
    private function getEmptyMetrics()
    {
        return [
            'ventas' => [
                'hoy' => [
                    'total' => 0,
                    'count' => 0,
                    'ticket_promedio' => 0,
                    'variacion' => 0,
                ],
                'semana' => [
                    'total' => 0,
                    'count' => 0,
                ],
                'mes' => [
                    'total' => 0,
                    'count' => 0,
                ],
            ],
            'clientes' => [
                'total' => 0,
                'nuevos_hoy' => 0,
                'nuevos_semana' => 0,
            ],
            'inventario' => [
                'total_productos' => 0,
                'productos_bajo_stock' => 0,
                'valor_total_inventario' => 0,
            ],
            'caja' => [
                'abierta' => false,
                'monto_inicial' => 0,
                'monto_actual' => 0,
                'total_ventas' => 0,
                'fecha_apertura' => null,
            ],
            'sucursal' => [
                'nombre' => 'Sin sucursal asignada',
                'activa' => false,
                'direccion' => '',
            ],
        ];
    }
    
    private function getEmptyCharts()
    {
        return [
            'ventas_por_dia' => [],
            'ventas_por_metodo' => [],
            'ventas_por_hora' => [],
        ];
    }
    
    private function getEmptyPerformance()
    {
        return [
            'ticket_promedio' => 0,
            'conversion_cliente' => 0,
            'meta_diaria' => [
                'objetivo' => 0,
                'progreso' => 0,
                'porcentaje' => 0,
            ],
        ];
    }
}