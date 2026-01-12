<?php
// routes/api_mobile.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\SyncController;
use App\Http\Controllers\Api\Mobile\ProductoController;
use App\Http\Controllers\Api\Mobile\ClienteController;
use App\Http\Controllers\Api\Mobile\VentaController;
use App\Http\Controllers\Api\Mobile\PedidoController;

/*
|--------------------------------------------------------------------------
| API Routes para App Móvil
|--------------------------------------------------------------------------
|
| Todas las rutas aquí son específicas para la app móvil
| Prefix: /api/mobile/v1
|
*/

Route::prefix('v1')->group(function () {
    
    // ==================== AUTENTICACIÓN ====================
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    
    // ==================== SINCRONIZACIÓN ====================
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('sync/inicial', [SyncController::class, 'syncInicial']);
        Route::post('sync/incremental', [SyncController::class, 'syncIncremental']);
        Route::get('sync/status', [SyncController::class, 'status']);
    });
    
    // ==================== CATÁLOGOS (Solo lectura) ====================
    Route::middleware('auth:sanctum')->group(function () {
        // Productos
        Route::get('productos', [ProductoController::class, 'index']);
        Route::get('productos/{id}', [ProductoController::class, 'show']);
        Route::get('productos/search/{term}', [ProductoController::class, 'search']);
        
        // Clientes
        Route::get('clientes', [ClienteController::class, 'index']);
        Route::get('clientes/{id}', [ClienteController::class, 'show']);
        Route::get('clientes/search/{term}', [ClienteController::class, 'search']);
        
        // Inventario
        Route::get('inventario/sucursal/{sucursalId}', [ProductoController::class, 'inventarioSucursal']);
        Route::get('inventario/producto/{productoId}', [ProductoController::class, 'stockProducto']);
    });
    
    // ==================== OPERACIONES (Lectura/Escritura) ====================
    Route::middleware('auth:sanctum')->group(function () {
        // Ventas
        Route::get('ventas', [VentaController::class, 'index']);
        Route::get('ventas/{id}', [VentaController::class, 'show']);
        Route::post('ventas', [VentaController::class, 'store']);
        Route::post('ventas/{id}/procesar', [VentaController::class, 'procesar']);
        
        // Pedidos
        Route::get('pedidos', [PedidoController::class, 'index']);
        Route::get('pedidos/{id}', [PedidoController::class, 'show']);
        Route::post('pedidos', [PedidoController::class, 'store']);
        Route::post('pedidos/{id}/procesar', [PedidoController::class, 'procesar']);
        Route::delete('pedidos/{id}', [PedidoController::class, 'destroy']);
    });
    
    // routes/api_mobile.php - Sección de sincronización

Route::prefix('sync')->middleware(['auth:sanctum', 'mobile.api'])->group(function () {
    Route::post('/', [SincronizacionController::class, 'sincronizar']);
    Route::post('/parcial', [SincronizacionController::class, 'sincronizacionParcial']);
    Route::get('/pending', [SincronizacionController::class, 'pendientes']);
    Route::post('/force', [SincronizacionController::class, 'forzarSincronizacion']);
    Route::get('/historial', [SincronizacionController::class, 'historial']);
    Route::get('/status', [SincronizacionController::class, 'status']);
    
    // Resolución de conflictos
    Route::get('/conflictos', [SincronizacionController::class, 'conflictos']);
    Route::post('/conflictos/{id}/resolver', [SincronizacionController::class, 'resolverConflicto']);
    
    // Limpieza de datos offline antiguos
    Route::post('/limpiar', [SincronizacionController::class, 'limpiarDatosAntiguos']);
});
// routes/api_mobile.php - Sección de dashboard

Route::prefix('dashboard')->middleware(['auth:sanctum', 'mobile.api'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/ejecutivo', [DashboardController::class, 'ejecutivo']);
    Route::get('/modulo/{modulo}', [DashboardController::class, 'porModulo']);
    Route::get('/metricas', [DashboardController::class, 'metricas']);
    Route::get('/alertas', [DashboardController::class, 'alertas']);
    
    // Widgets específicos
    Route::get('/widget/ventas-hoy', [DashboardController::class, 'widgetVentasHoy']);
    Route::get('/widget/productos-top', [DashboardController::class, 'widgetProductosTop']);
    Route::get('/widget/clientes-activos', [DashboardController::class, 'widgetClientesActivos']);
    Route::get('/widget/inventario-alertas', [DashboardController::class, 'widgetInventarioAlertas']);
    
    // Actualización en tiempo real
    Route::get('/live-update', [DashboardController::class, 'liveUpdate']);
});
    // ==================== CONSULTAS RÁPIDAS ====================
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('dashboard/vendedor', [VentaController::class, 'dashboardVendedor']);
        Route::get('estadisticas/diarias', [VentaController::class, 'estadisticasDiarias']);
    });
});