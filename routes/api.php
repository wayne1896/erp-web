<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ClienteController; // ← Agregar

// ==================== RUTAS API PARA ANDROID ====================

// Grupo de rutas de productos
Route::prefix('productos')->group(function () {
    Route::get('/', [ProductoController::class, 'index']);
    Route::get('/{id}', [ProductoController::class, 'show']);
    Route::get('/categorias/list', [ProductoController::class, 'categorias']);
});

// Grupo de rutas de clientes - CORREGIDO
Route::prefix('clientes')->group(function () {
    Route::get('/', [ClienteController::class, 'index']);
    Route::get('/{id}', [ClienteController::class, 'show']);
    Route::post('/', [ClienteController::class, 'store']);
    Route::get('/buscar/buscar', [ClienteController::class, 'buscar']);
    Route::get('/estadisticas/estadisticas', [ClienteController::class, 'estadisticas']);
});

// Rutas de prueba
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando',
        'timestamp' => now()->toDateTimeString()
    ]);
});

Route::get('/ping', function () {
    return response()->json(['status' => 'success', 'message' => 'pong']);
});