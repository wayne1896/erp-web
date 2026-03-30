<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ClienteController; // ← Agregar
use App\Http\Controllers\Api\PedidoController; // ← Agregar para pedidos
use App\Http\Controllers\Api\Mobile\AuthController; // ← Agregar para autenticación

// ==================== RUTAS API PARA ANDROID ====================

// ==================== RUTAS API PARA ANDROID ====================

// ==================== AUTENTICACIÓN ====================
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

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

// ==================== RUTAS DE PEDIDOS ====================
Route::prefix('pedidos')->group(function () {
    Route::get('/', [PedidoController::class, 'index'])->middleware('auth:sanctum');
    Route::get('/{id}', [PedidoController::class, 'show'])->middleware('auth:sanctum');
    Route::post('/', [PedidoController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [PedidoController::class, 'update'])->middleware('auth:sanctum');
    Route::post('/{id}/procesar', [PedidoController::class, 'procesar'])->middleware('auth:sanctum');
    Route::delete('/{id}', [PedidoController::class, 'destroy'])->middleware('auth:sanctum');
});

// ==================== RUTAS DE PRUEBA (SIN NINGÚN MIDDLEWARE) ====================
require_once __DIR__ . '/api_puras.php';

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

// ==================== RUTAS DE PEDIDOS ====================
// Grupo de rutas de pedidos para la app móvil (con autenticación)
Route::middleware('auth:sanctum')->prefix('pedidos')->group(function () {
    Route::get('/', [PedidoController::class, 'index']);
    Route::get('/{id}', [PedidoController::class, 'show']);
    Route::post('/', [PedidoController::class, 'store']);
    Route::post('/{id}/procesar', [PedidoController::class, 'procesar']);
    Route::delete('/{id}', [PedidoController::class, 'destroy']);
});