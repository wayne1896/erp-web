<?php
// app/Http/Controllers/Web/DashboardController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Caja;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Mostrar dashboard principal
     */
    public function index()
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Métricas del día
        $hoyInicio = now()->startOfDay();
        $hoyFin = now()->endOfDay();
        
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereBetween('fecha_venta', [$hoyInicio, $hoyFin])
            ->where('estado', 'PROCESADA');
            
        $metrics = [
            'ventas_hoy' => [
                'total' => $ventasHoy->count(),
                'monto' => $ventasHoy->sum('total'),
                'variacion_diaria' => $this->calcularVariacionVentas($sucursalId, $user->id),
            ],
            'clientes' => [
                'atendidos_hoy' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $user->id)
                    ->whereDate('fecha_venta', today())
                    ->distinct('cliente_id')
                    ->count('cliente_id'),
                'nuevos_hoy' => Cliente::where('user_id', $user->id)
                    ->whereDate('created_at', today())
                    ->count(),
            ],
            'inventario' => [
                'productos_bajo_stock' => Producto::whereHas('inventario', function($query) use ($sucursalId) {
                    $query->where('sucursal_id', $sucursalId)
                          ->whereColumn('stock_disponible', '<', 'productos.stock_minimo');
                })
                ->where('activo', true)
                ->where('control_stock', true)
                ->count(),
                'alerta_stock' => false, // Se calcula abajo
            ],
            'caja' => $this->obtenerEstadoCaja($user, $sucursalId),
            'meta_diaria' => $this->calcularMetaDiaria($user, $sucursalId),
        ];
        
        // Determinar alerta de stock
        $metrics['inventario']['alerta_stock'] = $metrics['inventario']['productos_bajo_stock'] > 0;
        
        // Ventas recientes
        $recentSales = Venta::with(['cliente:id,nombre_completo'])
            ->where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->limit(10)
            ->get()
            ->map(function($venta) {
                return [
                    'id' => $venta->id,
                    'numero_factura' => $venta->numero_factura,
                    'cliente_nombre' => $venta->cliente->nombre_completo ?? 'Consumidor Final',
                    'total' => (float) $venta->total,
                    'condicion_pago' => $venta->condicion_pago,
                    'fecha_venta' => $venta->fecha_venta->toISOString(),
                    'estado' => $venta->estado,
                    'items_count' => $venta->detalles()->count(),
                ];
            });
        
        // Alertas
        $alerts = $this->obtenerAlertasDashboard($user, $sucursalId);
        
        // Datos para gráficos
        $charts = [
            'ventas_por_hora' => $this->obtenerVentasPorHora($sucursalId, $user->id),
            'ventas_por_metodo' => $this->obtenerVentasPorMetodo($sucursalId, $user->id),
        ];
        
        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'recentSales' => $recentSales,
            'alerts' => $alerts,
            'charts' => $charts,
        ]);
    }
    
    /**
     * API para actualizar dashboard en tiempo real
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        // Métricas rápidas (sin cálculos pesados)
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA');
            
        $metrics = [
            'ventas_hoy' => [
                'total' => $ventasHoy->count(),
                'monto' => $ventasHoy->sum('total'),
            ],
            'caja' => $this->obtenerEstadoCaja($user, $sucursalId),
        ];
        
        // Alertas recientes
        $alerts = $this->obtenerAlertasUrgentes($user, $sucursalId);
        
        // Ventas de la última hora para gráfico
        $ventasUltimaHora = $this->obtenerVentasUltimaHora($sucursalId, $user->id);
        
        return response()->json([
            'metrics' => $metrics,
            'alerts' => $alerts,
            'charts' => [
                'ventas_por_hora' => $ventasUltimaHora,
            ],
        ]);
    }
    
    /**
     * Métodos auxiliares
     */
    private function calcularVariacionVentas($sucursalId, $userId)
    {
        $hoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        $ayer = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->whereDate('fecha_venta', today()->subDay())
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        if ($ayer == 0) {
            return $hoy > 0 ? 100 : 0;
        }
        
        return round((($hoy - $ayer) / $ayer) * 100, 2);
    }
    
    private function obtenerEstadoCaja($user, $sucursalId)
    {
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->first();
            
        if (!$caja) {
            return [
                'abierta' => false,
                'monto_inicial' => 0,
                'monto_actual' => 0,
            ];
        }
        
        return [
            'abierta' => true,
            'monto_inicial' => (float) $caja->monto_inicial,
            'monto_actual' => (float) $caja->efectivo,
            'total_ventas' => (float) $caja->total_ventas,
            'fecha_apertura' => $caja->fecha_apertura->format('H:i'),
        ];
    }
    
    private function calcularMetaDiaria($user, $sucursalId)
    {
        // Meta basada en promedio histórico
        $promedioMensual = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereMonth('fecha_venta', now()->month)
            ->where('estado', 'PROCESADA')
            ->avg('total') ?? 0;
            
        $meta = $promedioMensual * 1.2; // 20% más que el promedio
        
        $ventasHoy = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->sum('total');
            
        return [
            'objetivo' => round($meta, 2),
            'progreso' => round($ventasHoy, 2),
            'porcentaje' => $meta > 0 ? round(($ventasHoy / $meta) * 100, 2) : 0,
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
            
        if (!$cajaAbierta && $user->esVendedor()) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Caja no abierta',
                'message' => 'Debes abrir caja para comenzar a registrar ventas',
                'action' => 'Abrir Caja',
                'actionUrl' => '/caja/abrir',
            ];
        }
        
        // Productos bajo stock
        $productosBajoStock = Producto::whereHas('inventario', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->whereColumn('stock_disponible', '<', 'productos.stock_minimo');
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        if ($productosBajoStock > 0) {
            $alerts[] = [
                'type' => 'danger',
                'title' => "{$productosBajoStock} productos bajo stock mínimo",
                'message' => 'Revisa el inventario y realiza pedidos',
                'action' => 'Ver Inventario',
                'actionUrl' => '/inventario',
            ];
        }
        
        // Ventas offline pendientes
        $ventasOffline = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('offline', true)
            ->whereNull('fecha_sincronizacion')
            ->count();
            
        if ($ventasOffline > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => "{$ventasOffline} ventas offline pendientes",
                'message' => 'Sincroniza para registrar las ventas en el sistema',
                'action' => 'Sincronizar',
                'actionUrl' => '/sincronizacion',
            ];
        }
        
        return $alerts;
    }
    
    private function obtenerVentasPorHora($sucursalId, $userId)
    {
        $ventasPorHora = [];
        $hoy = now();
        
        for ($hora = 8; $hora <= 20; $hora++) {
            $inicio = $hoy->copy()->setTime($hora, 0, 0);
            $fin = $hoy->copy()->setTime($hora, 59, 59);
            
            $monto = Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            $ventasPorHora[] = [
                'hora' => sprintf('%02d:00', $hora),
                'monto' => (float) $monto,
                'ventas' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $userId)
                    ->whereBetween('fecha_venta', [$inicio, $fin])
                    ->where('estado', 'PROCESADA')
                    ->count(),
            ];
        }
        
        return $ventasPorHora;
    }
    
    private function obtenerVentasPorMetodo($sucursalId, $userId)
    {
        return Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->whereDate('fecha_venta', today())
            ->where('estado', 'PROCESADA')
            ->selectRaw('condicion_pago as metodo, COUNT(*) as cantidad, SUM(total) as monto')
            ->groupBy('condicion_pago')
            ->get()
            ->map(function($item) {
                return [
                    'metodo' => $item->metodo,
                    'cantidad' => $item->cantidad,
                    'monto' => (float) $item->monto,
                ];
            });
    }
    
    private function obtenerAlertasUrgentes($user, $sucursalId)
    {
        // Obtener alertas urgentes de notificaciones
        return Notificacion::where('user_id', $user->id)
            ->where('nivel', 'urgente')
            ->where('leido', false)
            ->where('fecha_expiracion', '>', now())
            ->orderBy('fecha_envio', 'desc')
            ->limit(5)
            ->get()
            ->map(function($notificacion) {
                return [
                    'type' => 'danger',
                    'title' => $notificacion->titulo,
                    'message' => $notificacion->mensaje,
                    'action' => 'Ver',
                    'actionUrl' => '/notificaciones/' . $notificacion->id,
                ];
            });
    }
    
    private function obtenerVentasUltimaHora($sucursalId, $userId)
    {
        $ventasPorHora = [];
        $hoy = now();
        
        for ($i = 0; $i < 12; $i++) {
            $hora = $hoy->copy()->subHours($i);
            $inicio = $hora->copy()->startOfHour();
            $fin = $hora->copy()->endOfHour();
            
            $monto = Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->whereBetween('fecha_venta', [$inicio, $fin])
                ->where('estado', 'PROCESADA')
                ->sum('total');
                
            $ventasPorHora[] = [
                'hora' => $hora->format('H:00'),
                'monto' => (float) $monto,
            ];
        }
        
        return array_reverse($ventasPorHora);
    }
}