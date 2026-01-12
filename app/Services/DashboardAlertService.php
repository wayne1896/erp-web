<?php
// app/Services/DashboardAlertService.php

namespace App\Services;

use App\Models\User;
use App\Models\Notificacion;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\Caja;
use App\Models\Cliente;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardAlertService
{
    protected $pushService;
    
    public function __construct(PushNotificationService $pushService)
    {
        $this->pushService = $pushService;
    }
    
    /**
     * Revisar y enviar alertas automáticas del dashboard
     */
    public function revisarAlertasAutomaticas(): array
    {
        $resultados = [];
        
        // 1. Alertas de inventario bajo
        $resultados['inventario'] = $this->revisarAlertasInventario();
        
        // 2. Alertas de ventas atípicas
        $resultados['ventas'] = $this->revisarAlertasVentas();
        
        // 3. Alertas de caja
        $resultados['caja'] = $this->revisarAlertasCaja();
        
        // 4. Alertas de clientes
        $resultados['clientes'] = $this->revisarAlertasClientes();
        
        // 5. Alertas de sincronización
        $resultados['sincronizacion'] = $this->revisarAlertasSincronizacion();
        
        return [
            'total_alertas_generadas' => array_sum(array_map('count', $resultados)),
            'detalles' => $resultados,
            'fecha_revision' => now()->toISOString(),
        ];
    }
    
    /**
     * Revisar alertas de inventario bajo stock
     */
    private function revisarAlertasInventario(): array
    {
        $alertas = [];
        $hoy = now();
        
        // Productos sin stock
        $productosSinStock = Producto::whereHas('inventario', function($query) {
            $query->where('stock_disponible', '<=', 0);
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->get();
        
        foreach ($productosSinStock as $producto) {
            // Obtener usuarios de la sucursal con permisos de inventario
            $usuarios = User::whereHas('sucursal', function($query) use ($producto) {
                $query->whereHas('inventario', function($q) use ($producto) {
                    $q->where('producto_id', $producto->id);
                });
            })
            ->whereIn('tipo_usuario', ['admin', 'gerente', 'almacen'])
            ->get();
            
            foreach ($usuarios as $usuario) {
                $this->pushService->enviarAlertaInventario(
                    $usuario,
                    $producto->nombre,
                    0,
                    $producto->stock_minimo,
                    $usuario->sucursal->nombre ?? 'Principal'
                );
                
                $alertas[] = [
                    'tipo' => 'inventario_sin_stock',
                    'producto_id' => $producto->id,
                    'usuario_id' => $usuario->id,
                    'mensaje' => "{$producto->nombre} agotado",
                ];
            }
        }
        
        // Productos bajo stock mínimo (menos del 20%)
        $productosBajoStock = Producto::whereHas('inventario', function($query) {
            $query->whereColumn('stock_disponible', '<', DB::raw('productos.stock_minimo * 0.2'));
        })
        ->where('activo', true)
        ->where('control_stock', true)
        ->get();
        
        foreach ($productosBajoStock as $producto) {
            $inventario = $producto->inventario->first();
            $stockActual = $inventario ? $inventario->stock_disponible : 0;
            
            $usuarios = User::whereHas('sucursal', function($query) use ($producto) {
                $query->whereHas('inventario', function($q) use ($producto) {
                    $q->where('producto_id', $producto->id);
                });
            })
            ->whereIn('tipo_usuario', ['admin', 'gerente', 'almacen'])
            ->get();
            
            foreach ($usuarios as $usuario) {
                $this->pushService->enviarAlertaInventario(
                    $usuario,
                    $producto->nombre,
                    $stockActual,
                    $producto->stock_minimo,
                    $usuario->sucursal->nombre ?? 'Principal'
                );
                
                $alertas[] = [
                    'tipo' => 'inventario_bajo_stock',
                    'producto_id' => $producto->id,
                    'usuario_id' => $usuario->id,
                    'mensaje' => "{$producto->nombre} bajo stock crítico",
                ];
            }
        }
        
        return $alertas;
    }
    
    /**
     * Revisar alertas de ventas atípicas
     */
    private function revisarAlertasVentas(): array
    {
        $alertas = [];
        $hoy = now();
        
        // Ventas con montos muy altos (posible error)
        $montoPromedio = Venta::whereDate('fecha_venta', $hoy)
            ->where('estado', 'PROCESADA')
            ->avg('total') ?? 0;
        
        $montoAlto = $montoPromedio * 5; // 5 veces el promedio
        
        $ventasAtipicas = Venta::whereDate('fecha_venta', $hoy)
            ->where('estado', 'PROCESADA')
            ->where('total', '>', $montoAlto)
            ->get();
        
        foreach ($ventasAtipicas as $venta) {
            $usuarios = User::whereIn('tipo_usuario', ['admin', 'gerente'])
                ->where('sucursal_id', $venta->sucursal_id)
                ->get();
            
            foreach ($usuarios as $usuario) {
                $this->pushService->enviarAUsuario(
                    $usuario,
                    '⚠️ Venta Atípica Detectada',
                    "Venta #{$venta->numero_factura} por RD$ " . 
                    number_format($venta->total, 2) . 
                    " (Promedio: RD$ " . number_format($montoPromedio, 2) . ")",
                    Notificacion::TIPO_VENTA,
                    Notificacion::NIVEL_ALTA,
                    [
                        'accion' => 'revisar_venta',
                        'ruta' => '/ventas/' . $venta->id,
                        'venta_id' => $venta->id,
                        'numero_factura' => $venta->numero_factura,
                        'monto' => $venta->total,
                        'promedio_diario' => $montoPromedio,
                    ]
                );
                
                $alertas[] = [
                    'tipo' => 'venta_atipica',
                    'venta_id' => $venta->id,
                    'usuario_id' => $usuario->id,
                    'mensaje' => "Venta #{$venta->numero_factura} con monto atípico",
                ];
            }
        }
        
        // Ventas offline pendientes por más de 24 horas
        $ventasOfflinePendientes = Venta::where('offline', true)
            ->whereNull('fecha_sincronizacion')
            ->where('created_at', '<', $hoy->subDay())
            ->get();
        
        foreach ($ventasOfflinePendientes as $venta) {
            $this->pushService->enviarAUsuario(
                $venta->vendedor,
                '🔄 Ventas Offline Pendientes',
                "Tienes ventas offline pendientes por más de 24 horas",
                Notificacion::TIPO_SINCRONIZACION,
                Notificacion::NIVEL_MEDIA,
                [
                    'accion' => 'sincronizar',
                    'ruta' => '/sincronizacion',
                    'ventas_pendientes' => $ventasOfflinePendientes->count(),
                ]
            );
            
            $alertas[] = [
                'tipo' => 'ventas_offline_pendientes',
                'venta_id' => $venta->id,
                'usuario_id' => $venta->user_id,
                'mensaje' => "Venta offline pendiente por más de 24 horas",
            ];
        }
        
        return $alertas;
    }
    
    /**
     * Revisar alertas de caja
     */
    private function revisarAlertasCaja(): array
    {
        $alertas = [];
        
        // Cajas abiertas por más de 12 horas
        $cajasLargas = Caja::where('estado', 'abierta')
            ->where('fecha_apertura', '<', now()->subHours(12))
            ->get();
        
        foreach ($cajasLargas as $caja) {
            $this->pushService->enviarAUsuario(
                $caja->usuario,
                '🏦 Caja Abierta por Mucho Tiempo',
                "Tu caja lleva más de 12 horas abierta. Considera hacer un cierre parcial.",
                Notificacion::TIPO_CAJA,
                Notificacion::NIVEL_MEDIA,
                [
                    'accion' => 'ver_caja',
                    'ruta' => '/caja',
                    'caja_id' => $caja->id,
                    'horas_abierta' => $caja->fecha_apertura->diffInHours(now()),
                ]
            );
            
            $alertas[] = [
                'tipo' => 'caja_larga_duracion',
                'caja_id' => $caja->id,
                'usuario_id' => $caja->user_id,
                'mensaje' => "Caja abierta por más de 12 horas",
            ];
        }
        
        // Cajas con diferencia importante
        $cajasConDiferencia = Caja::where('estado', 'cerrada')
            ->whereDate('fecha_cierre', today())
            ->where(function($query) {
                $query->where('diferencia', '>', 1000)
                      ->orWhere('diferencia', '<', -1000);
            })
            ->get();
        
        foreach ($cajasConDiferencia as $caja) {
            $usuarios = User::whereIn('tipo_usuario', ['admin', 'gerente'])
                ->where('sucursal_id', $caja->sucursal_id)
                ->get();
            
            foreach ($usuarios as $usuario) {
                $this->pushService->enviarAUsuario(
                    $usuario,
                    '💰 Diferencia en Caja',
                    "Caja #{$caja->id} tiene una diferencia de RD$ " . 
                    number_format(abs($caja->diferencia), 2),
                    Notificacion::TIPO_CAJA,
                    Notificacion::NIVEL_ALTA,
                    [
                        'accion' => 'revisar_caja',
                        'ruta' => '/caja/' . $caja->id,
                        'caja_id' => $caja->id,
                        'diferencia' => $caja->diferencia,
                        'vendedor' => $caja->usuario->name,
                    ]
                );
                
                $alertas[] = [
                    'tipo' => 'caja_con_diferencia',
                    'caja_id' => $caja->id,
                    'usuario_id' => $usuario->id,
                    'mensaje' => "Caja con diferencia importante",
                ];
            }
        }
        
        return $alertas;
    }
    
    /**
     * Revisar alertas de clientes
     */
    private function revisarAlertasClientes(): array
    {
        $alertas = [];
        
        // Clientes que exceden límite de crédito
        $clientesExcedidos = Cliente::where('activo', true)
            ->where('limite_credito', '>', 0)
            ->get()
            ->filter(function($cliente) {
                return $cliente->excede_limite_credito;
            });
        
        foreach ($clientesExcedidos as $cliente) {
            $usuarios = User::whereIn('tipo_usuario', ['admin', 'gerente', 'vendedor'])
                ->where('sucursal_id', function($query) use ($cliente) {
                    $query->select('sucursal_id')
                        ->from('ventas')
                        ->where('cliente_id', $cliente->id)
                        ->orderBy('fecha_venta', 'desc')
                        ->limit(1);
                })
                ->get();
            
            foreach ($usuarios as $usuario) {
                $this->pushService->enviarAUsuario(
                    $usuario,
                    '💳 Cliente Excede Límite de Crédito',
                    "{$cliente->nombre_completo} ha excedido su límite de crédito",
                    Notificacion::TIPO_CLIENTE,
                    Notificacion::NIVEL_ALTA,
                    [
                        'accion' => 'ver_cliente',
                        'ruta' => '/clientes/' . $cliente->id,
                        'cliente_id' => $cliente->id,
                        'nombre_cliente' => $cliente->nombre_completo,
                        'limite_credito' => $cliente->limite_credito,
                        'saldo_pendiente' => $cliente->saldo_pendiente,
                    ]
                );
                
                $alertas[] = [
                    'tipo' => 'cliente_excede_credito',
                    'cliente_id' => $cliente->id,
                    'usuario_id' => $usuario->id,
                    'mensaje' => "Cliente {$cliente->nombre_completo} excede límite de crédito",
                ];
            }
        }
        
        // Clientes inactivos por más de 90 días (clientes frecuentes)
        $clientesInactivos = Cliente::where('activo', true)
            ->whereHas('ventas', function($query) {
                $query->where('fecha_venta', '<', now()->subDays(90));
            }, '>=', 5) // Al menos 5 ventas previas
            ->whereDoesntHave('ventas', function($query) {
                $query->where('fecha_venta', '>=', now()->subDays(90));
            })
            ->get();
        
        foreach ($clientesInactivos as $cliente) {
            $vendedores = User::whereHas('ventas', function($query) use ($cliente) {
                $query->where('cliente_id', $cliente->id)
                    ->orderBy('fecha_venta', 'desc')
                    ->limit(1);
            })
            ->get();
            
            foreach ($vendedores as $vendedor) {
                $this->pushService->enviarAUsuario(
                    $vendedor,
                    '👥 Cliente Inactivo',
                    "{$cliente->nombre_completo} no ha comprado en más de 90 días",
                    Notificacion::TIPO_CLIENTE,
                    Notificacion::NIVEL_MEDIA,
                    [
                        'accion' => 'contactar_cliente',
                        'ruta' => '/clientes/' . $cliente->id,
                        'cliente_id' => $cliente->id,
                        'nombre_cliente' => $cliente->nombre_completo,
                        'ultima_compra' => $cliente->ventas()->latest()->first()?->fecha_venta?->format('d/m/Y'),
                        'dias_inactivo' => 90,
                    ]
                );
                
                $alertas[] = [
                    'tipo' => 'cliente_inactivo',
                    'cliente_id' => $cliente->id,
                    'usuario_id' => $vendedor->id,
                    'mensaje' => "Cliente {$cliente->nombre_completo} inactivo por 90 días",
                ];
            }
        }
        
        return $alertas;
    }
    
    /**
     * Revisar alertas de sincronización
     */
    private function revisarAlertasSincronizacion(): array
    {
        $alertas = [];
        
        // Usuarios con muchas ventas offline pendientes
        $usuariosConVentasOffline = User::whereHas('ventas', function($query) {
            $query->where('offline', true)
                  ->whereNull('fecha_sincronizacion')
                  ->where('created_at', '<', now()->subHours(2));
        })
        ->withCount(['ventas as ventas_offline_pendientes' => function($query) {
            $query->where('offline', true)
                  ->whereNull('fecha_sincronizacion');
        }])
        ->having('ventas_offline_pendientes', '>', 10)
        ->get();
        
        foreach ($usuariosConVentasOffline as $usuario) {
            $this->pushService->enviarAUsuario(
                $usuario,
                '🔄 Muchas Ventas Offline Pendientes',
                "Tienes {$usuario->ventas_offline_pendientes} ventas esperando sincronización",
                Notificacion::TIPO_SINCRONIZACION,
                Notificacion::NIVEL_ALTA,
                [
                    'accion' => 'sincronizar',
                    'ruta' => '/sincronizacion',
                    'ventas_pendientes' => $usuario->ventas_offline_pendientes,
                ]
            );
            
            $alertas[] = [
                'tipo' => 'ventas_offline_acumuladas',
                'usuario_id' => $usuario->id,
                'mensaje' => "Usuario con {$usuario->ventas_offline_pendientes} ventas offline pendientes",
            ];
        }
        
        return $alertas;
    }
}