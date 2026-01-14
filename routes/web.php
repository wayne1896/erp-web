<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\ClienteController;
use App\Http\Controllers\Web\CategoriaController;
use App\Http\Controllers\Web\ProveedorController;
use App\Http\Controllers\Web\ProductoController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\CajaController;
use App\Http\Controllers\Web\VentaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // ==================== PROFILE ====================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ==================== CLIENTES ====================
    Route::prefix('clientes')->group(function () {
        Route::get('/', [ClienteController::class, 'index'])->name('clientes.index');
        Route::get('/crear', [ClienteController::class, 'create'])->name('clientes.create');
        Route::post('/', [ClienteController::class, 'store'])->name('clientes.store');
        Route::get('/{cliente}', [ClienteController::class, 'show'])->name('clientes.show');
        Route::get('/{cliente}/editar', [ClienteController::class, 'edit'])->name('clientes.edit');
        Route::put('/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
        Route::delete('/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
        
        // API Routes
        Route::get('/api/buscar', [ClienteController::class, 'buscar'])->name('clientes.buscar');
        Route::post('/api/store', [ClienteController::class, 'storeApi'])->name('clientes.store.api');
    });

    // ==================== CATEGORÍAS ====================
    Route::prefix('categorias')->group(function () {
        Route::get('/', [CategoriaController::class, 'index'])->name('categorias.index');
        Route::get('/crear', [CategoriaController::class, 'create'])->name('categorias.create');
        Route::post('/', [CategoriaController::class, 'store'])->name('categorias.store');
        Route::get('/{categoria}', [CategoriaController::class, 'show'])->name('categorias.show');
        Route::get('/{categoria}/editar', [CategoriaController::class, 'edit'])->name('categorias.edit');
        Route::put('/{categoria}', [CategoriaController::class, 'update'])->name('categorias.update');
        Route::delete('/{categoria}', [CategoriaController::class, 'destroy'])->name('categorias.destroy');
        
        // API Routes
        Route::get('/api/buscar', [CategoriaController::class, 'buscar'])->name('categorias.buscar');
    });

    // ==================== PROVEEDORES ====================
    Route::prefix('proveedores')->group(function () {
        Route::get('/', [ProveedorController::class, 'index'])->name('proveedores.index');
        Route::get('/crear', [ProveedorController::class, 'create'])->name('proveedores.create');
        Route::post('/', [ProveedorController::class, 'store'])->name('proveedores.store');
        Route::get('/{proveedor}', [ProveedorController::class, 'show'])->name('proveedores.show');
        Route::get('/{proveedor}/editar', [ProveedorController::class, 'edit'])->name('proveedores.edit');
        Route::put('/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
        Route::delete('/{proveedor}', [ProveedorController::class, 'destroy'])->name('proveedores.destroy');
        
        // API Routes
        Route::get('/api/buscar', [ProveedorController::class, 'buscar'])->name('proveedores.buscar');
    });

    // ==================== PRODUCTOS ====================
    Route::prefix('productos')->group(function () {
        Route::get('/', [ProductoController::class, 'index'])->name('productos.index');
        Route::get('/crear', [ProductoController::class, 'create'])->name('productos.create');
        Route::post('/', [ProductoController::class, 'store'])->name('productos.store');
        Route::get('/{producto}', [ProductoController::class, 'show'])->name('productos.show');
        Route::get('/{producto}/editar', [ProductoController::class, 'edit'])->name('productos.edit');
        Route::put('/{producto}', [ProductoController::class, 'update'])->name('productos.update');
        Route::delete('/{producto}', [ProductoController::class, 'destroy'])->name('productos.destroy');
        
        // Rutas específicas de stock
        Route::get('/{producto}/stock', [ProductoController::class, 'stock'])->name('productos.stock');
        Route::post('/{producto}/ajustar-stock', [ProductoController::class, 'ajustarStock'])->name('productos.ajustar-stock');
        Route::post('/{producto}/transferir-stock', [ProductoController::class, 'transferirStock'])->name('productos.transferir-stock');
        
        // API Routes
        Route::get('/api/buscar', [ProductoController::class, 'buscar'])->name('productos.buscar');
        Route::get('/api/{producto}/stock', [ProductoController::class, 'verificarStock'])->name('productos.verificar-stock');
        Route::get('/api/{producto}/debug-stock', [ProductoController::class, 'debugStock'])->name('productos.debug-stock');
    });

    // ==================== DASHBOARD ====================
    Route::prefix('dashboard')->group(function () {
        Route::get('/data', [DashboardController::class, 'getDashboardData'])->name('dashboard.data');
        Route::get('/resumen', [DashboardController::class, 'resumen'])->name('dashboard.resumen');
    });

    // ==================== CAJA ====================
    Route::prefix('caja')->group(function () {
        Route::get('/', [CajaController::class, 'index'])->name('caja.index');
        Route::get('/abrir', [CajaController::class, 'create'])->name('caja.create');
        Route::post('/abrir', [CajaController::class, 'store'])->name('caja.store');
        Route::get('/{caja}/cerrar', [CajaController::class, 'edit'])->name('caja.edit');
        Route::put('/{caja}', [CajaController::class, 'update'])->name('caja.update');
        Route::get('/{caja}/movimientos', [CajaController::class, 'movimientos'])->name('caja.movimientos');
        Route::post('/{caja}/ingreso', [CajaController::class, 'registrarIngreso'])->name('caja.ingreso');
        Route::post('/{caja}/egreso', [CajaController::class, 'registrarEgreso'])->name('caja.egreso');
        
        // Ver caja actual
        Route::get('/actual', [CajaController::class, 'cajaActual'])->name('caja.actual');
        
        // Reportes
        Route::get('/reportes/diario', [CajaController::class, 'reporteDiario'])->name('caja.reporte-diario');
    });

    // ==================== VENTAS ====================
    Route::prefix('ventas')->group(function () {
        // CRUD Básico
        Route::get('/', [VentaController::class, 'index'])->name('ventas.index');
        Route::get('/crear', [VentaController::class, 'create'])->name('ventas.create');
        Route::post('/', [VentaController::class, 'store'])->name('ventas.store');
        Route::get('/{venta}', [VentaController::class, 'show'])->name('ventas.show');
        Route::get('/{venta}/editar', [VentaController::class, 'edit'])->name('ventas.edit');
        Route::put('/{venta}', [VentaController::class, 'update'])->name('ventas.update');
        
        // Acciones específicas
        Route::post('/{venta}/anular', [VentaController::class, 'anular'])->name('ventas.anular');
        Route::get('/{venta}/imprimir', [VentaController::class, 'imprimir'])->name('ventas.imprimir');
        Route::get('/{venta}/pdf', [VentaController::class, 'generarPDF'])->name('ventas.pdf');
        
        // API para ventas
        Route::get('/api/buscar-productos', [VentaController::class, 'buscarProductos'])->name('ventas.buscar-productos');
        Route::get('/api/buscar-clientes', [VentaController::class, 'buscarClientes'])->name('ventas.buscar-clientes');
        Route::get('/api/producto/{producto}/stock', [VentaController::class, 'verificarStock'])->name('ventas.verificar-stock');
        Route::post('/api/procesar-rapida', [VentaController::class, 'procesarVentaRapida'])->name('ventas.procesar-rapida');
        
        // Reportes
        Route::get('/reportes/diario', [VentaController::class, 'reporteDiario'])->name('ventas.reporte-diario');
        Route::get('/reportes/mensual', [VentaController::class, 'reporteMensual'])->name('ventas.reporte-mensual');
        Route::get('/reportes/productos', [VentaController::class, 'reporteProductos'])->name('ventas.reporte-productos');
        Route::get('/reportes/general', [VentaController::class, 'reporteVentas'])->name('ventas.reporte-general');
    });

    // ==================== REPORTES GENERALES ====================
    Route::prefix('reportes')->group(function () {
        // Reportes de ventas (alias para compatibilidad)
        Route::get('/ventas/general', [VentaController::class, 'reporteVentas'])->name('reportes.ventas.general');
        Route::get('/ventas/diario', [VentaController::class, 'reporteDiario'])->name('reportes.ventas.diario');
        Route::get('/ventas/mensual', [VentaController::class, 'reporteMensual'])->name('reportes.ventas.mensual');
        Route::get('/ventas/productos', [VentaController::class, 'reporteProductos'])->name('reportes.ventas.productos');
        
        // Reportes de inventario
        Route::get('/inventario', [ProductoController::class, 'reporteInventario'])->name('reportes.inventario');
        
        // Reportes de caja
        Route::get('/caja', [CajaController::class, 'reporteCaja'])->name('reportes.caja');
        
        // Reportes de clientes
        Route::get('/clientes', [ClienteController::class, 'reporteClientes'])->name('reportes.clientes');
    });

    // ==================== CONFIGURACIÓN ====================
    Route::prefix('configuracion')->group(function () {
        Route::get('/general', function () {
            return Inertia::render('Configuracion/General');
        })->name('configuracion.general');
        
        Route::get('/empresa', function () {
            return Inertia::render('Configuracion/Empresa');
        })->name('configuracion.empresa');
        
        Route::get('/usuarios', function () {
            return Inertia::render('Configuracion/Usuarios');
        })->name('configuracion.usuarios');
        
        Route::get('/backup', function () {
            return Inertia::render('Configuracion/Backup');
        })->name('configuracion.backup');
    });
});

// ==================== RUTAS PÚBLICAS ====================
Route::get('/status', function () {
    return response()->json([
        'status' => 'online',
        'timestamp' => now(),
        'version' => Application::VERSION,
        'app_name' => config('app.name'),
        'environment' => app()->environment(),
    ]);
})->name('status');

Route::get('/health', function () {
    return response()->json([
        'healthy' => true,
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'timestamp' => now()->toDateTimeString(),
    ]);
})->name('health');

require __DIR__ . '/auth.php';