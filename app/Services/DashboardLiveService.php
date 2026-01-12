<?php
// app/Services/DashboardLiveService.php

namespace App\Services;

use App\Models\Venta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Caja;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardLiveService
{
    public function getLiveData($userId, $sucursalId)
    {
        $cacheKey = "dashboard.live.{$userId}.{$sucursalId}";
        
        return Cache::remember($cacheKey, 30, function () use ($userId, $sucursalId) {
            return [
                'timestamp' => now()->toISOString(),
                'ventas' => $this->getLiveVentas($userId, $sucursalId),
                'caja' => $this->getLiveCaja($userId, $sucursalId),
                'alertas' => $this->getLiveAlertas($userId, $sucursalId),
                'metricas' => $this->getLiveMetricas($userId, $sucursalId),
            ];
        });
    }
    
    private function getLiveVentas($userId, $sucursalId)
    {
        $ultimaHora = now()->subHour();
        
        return [
            'ultima_hora' => [
                'cantidad' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $userId)
                    ->where('fecha_venta', '>=', $ultimaHora)
                    ->where('estado', 'PROCESADA')
                    ->count(),
                'monto' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $userId)
                    ->where('fecha_venta', '>=', $ultimaHora)
                    ->where('estado', 'PROCESADA')
                    ->sum('total'),
            ],
            'ultima_venta' => Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->where('estado', 'PROCESADA')
                ->latest('fecha_venta')
                ->first()
                ?->only(['id', 'numero_factura', 'total', 'fecha_venta']),
        ];
    }
    
    private function getLiveCaja($userId, $sucursalId)
    {
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->where('estado', 'abierta')
            ->first();
            
        if (!$caja) {
            return ['estado' => 'cerrada'];
        }
        
        return [
            'estado' => 'abierta',
            'efectivo' => (float) $caja->efectivo,
            'ventas_desde_apertura' => Venta::where('caja_id', $caja->id)
                ->where('estado', 'PROCESADA')
                ->sum('total'),
            'horas_abierta' => $caja->fecha_apertura->diffInHours(now()),
        ];
    }
    
    private function getLiveAlertas($userId, $sucursalId)
    {
        $alertas = [];
        
        // Productos agotados
        $productosAgotados = Producto::whereHas('inventario', function($query) use ($sucursalId) {
            $query->where('sucursal_id', $sucursalId)
                  ->where('stock_disponible', '<=', 0);
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->count();
        
        if ($productosAgotados > 0) {
            $alertas[] = [
                'tipo' => 'inventario',
                'mensaje' => "{$productosAgotados} productos agotados",
                'nivel' => 'alto',
            ];
        }
        
        // Ventas offline pendientes
        $ventasOffline = Venta::where('sucursal_id', $sucursalId)
            ->where('user_id', $userId)
            ->where('offline', true)
            ->whereNull('fecha_sincronizacion')
            ->count();
            
        if ($ventasOffline > 0) {
            $alertas[] = [
                'tipo' => 'sincronizacion',
                'mensaje' => "{$ventasOffline} ventas pendientes de sincronizar",
                'nivel' => 'medio',
            ];
        }
        
        return $alertas;
    }
    
    private function getLiveMetricas($userId, $sucursalId)
    {
        $hoy = now();
        $inicioHoy = $hoy->copy()->startOfDay();
        
        return [
            'ventas_hoy' => [
                'meta' => 50000, // Ejemplo
                'actual' => Venta::where('sucursal_id', $sucursalId)
                    ->where('user_id', $userId)
                    ->where('fecha_venta', '>=', $inicioHoy)
                    ->where('estado', 'PROCESADA')
                    ->sum('total'),
                'progreso' => 0, // Se calcula en frontend
            ],
            'clientes_hoy' => Venta::where('sucursal_id', $sucursalId)
                ->where('user_id', $userId)
                ->where('fecha_venta', '>=', $inicioHoy)
                ->where('estado', 'PROCESADA')
                ->distinct('cliente_id')
                ->count('cliente_id'),
            'productos_vendidos_hoy' => DB::table('detalle_ventas')
                ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
                ->where('ventas.sucursal_id', $sucursalId)
                ->where('ventas.user_id', $userId)
                ->where('ventas.fecha_venta', '>=', $inicioHoy)
                ->where('ventas.estado', 'PROCESADA')
                ->sum('detalle_ventas.cantidad'),
        ];
    }
}