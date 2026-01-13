<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ClienteController; 
use App\Http\Controllers\Web\CategoriaController; 
use App\Http\Controllers\Web\ProveedorController; 
use App\Http\Controllers\Web\ProductoController;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/productos-test', function() {
    try {
        $productos = \App\Models\Producto::with(['categoria', 'proveedor'])->paginate(10);
        $stats = [
            'total' => \App\Models\Producto::count(),
            'activos' => \App\Models\Producto::where('activo', true)->count(),
            'stock_bajo' => 0,
            'exento_itbis' => \App\Models\Producto::where('exento_itbis', true)->count(),
        ];
        
        return \Inertia\Inertia::render('Productos/Test', [
            'productos' => $productos,
            'stats' => $stats,
            'filters' => [],
            'categorias' => \App\Models\CategoriaProducto::all(['id', 'nombre']),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
})->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Clientes - CRUD completo
    Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::get('/clientes/crear', [ClienteController::class, 'create'])->name('clientes.create');
    Route::post('/clientes', [ClienteController::class, 'store'])->name('clientes.store');
    Route::get('/clientes/{cliente}', [ClienteController::class, 'show'])->name('clientes.show');
    Route::get('/clientes/{cliente}/editar', [ClienteController::class, 'edit'])->name('clientes.edit');
    Route::put('/clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
    Route::get('/api/clientes/buscar', [ClienteController::class, 'buscar'])->name('clientes.buscar');
    
    // Rutas de categorías
    Route::resource('categorias', CategoriaController::class);
    Route::get('/categorias/buscar', [CategoriaController::class, 'buscar'])->name('categorias.buscar');
        
    // Rutas de proveedores - ESPECIFICAR PARÁMETRO
    Route::resource('proveedores', ProveedorController::class)
        ->parameters(['proveedores' => 'proveedor']);
    
    // Alternativa: Definir rutas individualmente para más control
    /*
    Route::get('/proveedores', [ProveedorController::class, 'index'])->name('proveedores.index');
    Route::get('/proveedores/crear', [ProveedorController::class, 'create'])->name('proveedores.create');
    Route::post('/proveedores', [ProveedorController::class, 'store'])->name('proveedores.store');
    Route::get('/proveedores/{proveedor}', [ProveedorController::class, 'show'])->name('proveedores.show');
    Route::get('/proveedores/{proveedor}/editar', [ProveedorController::class, 'edit'])->name('proveedores.edit');
    Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
    Route::delete('/proveedores/{proveedor}', [ProveedorController::class, 'destroy'])->name('proveedores.destroy');
    */
    
    Route::get('/proveedores/buscar', [ProveedorController::class, 'buscar'])->name('proveedores.buscar');
    
    // Rutas de productos
    Route::resource('productos', ProductoController::class);
    Route::get('/productos/buscar', [ProductoController::class, 'buscar'])->name('productos.buscar');
    Route::get('/productos/{producto}/stock', [ProductoController::class, 'stock'])
        ->name('productos.stock');
    Route::post('/productos/{producto}/ajustar-stock', [ProductoController::class, 'ajustarStock'])
        ->name('productos.ajustar-stock');
    Route::post('/productos/{producto}/transferir-stock', [ProductoController::class, 'transferirStock'])
        ->name('productos.transferir-stock');
    Route::get('/inventario/reporte', [ProductoController::class, 'reporteInventario'])
        ->name('productos.reporte-inventario');
});

require __DIR__.'/auth.php';