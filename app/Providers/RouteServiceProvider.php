<?php
// app/Providers/RouteServiceProvider.php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    protected function mapApiRoutes()
    {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
        
        // Rutas específicas para app móvil
        Route::prefix('api/mobile')
            ->middleware('api')
            ->namespace($this->namespace . '\Api\Mobile')
            ->group(base_path('routes/api_mobile.php'));
    }
}