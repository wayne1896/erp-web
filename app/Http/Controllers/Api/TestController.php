<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;

// Ruta pública para probar conexión
Route::get('/test', function () {
    return response()->json([
        'message' => 'API Laravel funcionando',
        'timestamp' => now(),
        'data' => [
            ['id' => 1, 'nombre' => 'Producto prueba 1', 'precio' => 100],
            ['id' => 2, 'nombre' => 'Producto prueba 2', 'precio' => 200],
        ]
    ]);
});

// Ruta de login para Android
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (después)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/productos', [ProductoController::class, 'index']);
    // ... otras rutas
});