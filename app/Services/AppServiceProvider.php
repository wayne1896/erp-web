<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => auth()->user() ? [
                        'id' => auth()->user()->id,
                        'name' => auth()->user()->name,
                        'email' => auth()->user()->email,
                        'tipo_usuario' => auth()->user()->tipo_usuario,
                        'sucursal_id' => auth()->user()->sucursal_id,
                        'sucursal' => auth()->user()->sucursal ? [
                            'id' => auth()->user()->sucursal->id,
                            'nombre' => auth()->user()->sucursal->nombre,
                        ] : null,
                        'notificaciones_sin_leer' => auth()->user()->notificaciones_sin_leer ?? 0,
                        'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
                        'roles' => auth()->user()->getRoleNames(),
                    ] : null,
                ];
            },
            
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                    'warning' => session('warning'),
                    'info' => session('info'),
                ];
            },
            
            'config' => function () {
                return [
                    'app_name' => config('app.name', 'ERP Dominicano'),
                    'version' => config('app.version', '1.0.0'),
                    'itbis_porcentaje' => 18.00,
                    'moneda' => 'RD$',
                    'provincias_rd' => $this->getProvinciasRD(),
                ];
            },
            
            'notificaciones' => function () {
                if (auth()->check()) {
                    return [
                        'count' => auth()->user()->notificaciones_sin_leer ?? 0,
                        'recientes' => \App\Models\Notificacion::where('user_id', auth()->id())
                            ->validas()
                            ->noLeidas()
                            ->orderBy('fecha_envio', 'desc')
                            ->limit(5)
                            ->get()
                            ->map(function($notificacion) {
                                return [
                                    'id' => $notificacion->id,
                                    'titulo' => $notificacion->titulo,
                                    'mensaje' => $notificacion->mensaje,
                                    'tipo' => $notificacion->tipo,
                                    'icono' => $notificacion->icono_tipo,
                                    'tiempo_transcurrido' => $notificacion->tiempo_transcurrido,
                                    'data' => $notificacion->data,
                                ];
                            }),
                    ];
                }
                return null;
            },
        ]);
    }
    
    private function getProvinciasRD()
    {
        return [
            ['id' => 1, 'nombre' => 'Distrito Nacional'],
            ['id' => 2, 'nombre' => 'Santiago'],
            ['id' => 3, 'nombre' => 'Santo Domingo'],
            ['id' => 4, 'nombre' => 'La Vega'],
            ['id' => 5, 'nombre' => 'San Cristóbal'],
            ['id' => 6, 'nombre' => 'La Altagracia'],
            ['id' => 7, 'nombre' => 'San Pedro de Macorís'],
            ['id' => 8, 'nombre' => 'Duarte'],
            ['id' => 9, 'nombre' => 'Espaillat'],
            ['id' => 10, 'nombre' => 'San Juan'],
            ['id' => 11, 'nombre' => 'Puerto Plata'],
            ['id' => 12, 'nombre' => 'Azua'],
            ['id' => 13, 'nombre' => 'Monte Plata'],
            ['id' => 14, 'nombre' => 'Valverde'],
            ['id' => 15, 'nombre' => 'Peravia'],
            ['id' => 16, 'nombre' => 'María Trinidad Sánchez'],
            ['id' => 17, 'nombre' => 'Barahona'],
            ['id' => 18, 'nombre' => 'Hato Mayor'],
            ['id' => 19, 'nombre' => 'Dajabón'],
            ['id' => 20, 'nombre' => 'Montecristi'],
            ['id' => 21, 'nombre' => 'Sánchez Ramírez'],
            ['id' => 22, 'nombre' => 'El Seibo'],
            ['id' => 23, 'nombre' => 'Hermanas Mirabal'],
            ['id' => 24, 'nombre' => 'Samana'],
            ['id' => 25, 'nombre' => 'Baoruco'],
            ['id' => 26, 'nombre' => 'San José de Ocoa'],
            ['id' => 27, 'nombre' => 'Independencia'],
            ['id' => 28, 'nombre' => 'Elías Piña'],
            ['id' => 29, 'nombre' => 'Santiago Rodríguez'],
            ['id' => 30, 'nombre' => 'Pedernales'],
            ['id' => 31, 'nombre' => 'Monseñor Nouel'],
            ['id' => 32, 'nombre' => 'La Romana'],
        ];
    }
}