<?php
// routes/api.php

// ... otras rutas ...

Route::prefix('mobile')->middleware(['auth:sanctum', 'mobile.api'])->group(function () {
    
    // Rutas de productos para móvil
    Route::prefix('productos')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'show']);
        Route::get('/buscar/rapido', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'buscarRapido']);
        Route::post('/escanear', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'escanearCodigoBarras']);
        Route::get('/categorias', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'categorias']);
        Route::post('/actualizar-stock', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'actualizarStock']);
        Route::get('/reporte/bajo-stock', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'reporteBajoStock']);
        Route::post('/sincronizar', [\App\Http\Controllers\Api\Mobile\ProductoController::class, 'sincronizar']);
    });
    
    // ... otras rutas móviles ...
});