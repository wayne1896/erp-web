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
    Route::get('/dashboard/data', [DashboardController::class, 'getDashboardData'])->name('dashboard.data');

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
        Route::delete('/{venta}', [VentaController::class, 'destroy'])->name('ventas.destroy');
        
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
        
        // Exportación de ventas
        Route::get('/ventas/exportar', [VentaController::class, 'export'])->name('ventas.export');
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

// ==================== RUTAS TEMPORALES (ELIMINAR DESPUÉS) ====================
Route::get('/crear-cliente-generico', function() {
    try {
        // Verificar si ya existe
        $cliente = Cliente::where('cedula_rnc', '000-0000000-0')->first();
        
        if (!$cliente) {
            // Generar código
            $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
            $codigo = $ultimoCliente ? 'CLI' . str_pad($ultimoCliente->id + 1, 6, '0', STR_PAD_LEFT) : 'CLI000001';
            
            $cliente = Cliente::create([
                'codigo' => $codigo,
                'tipo_cliente' => 'NATURAL',
                'cedula_rnc' => '000-0000000-0',
                'nombre_completo' => 'CONSUMIDOR FINAL',
                'email' => '',
                'telefono' => '',
                'direccion' => 'No especificada',
                // --- CAMPOS FALTANTES ---
                'provincia' => 'Distrito Nacional', // O el valor que necesites
                'municipio' => 'Santo Domingo', // O 'No especificado'
                'sector' => 'Centro', // O 'No especificado'
                'tipo_contribuyente' => 'CONSUMIDOR_FINAL',
                'dias_credito' => 0,
                'descuento' => 0.00,
                // --- FIN CAMPOS FALTANTES ---
                'activo' => true,
                'limite_credito' => 0,
                'saldo_pendiente' => 0,
            ]);
            
            $mensaje = 'Cliente genérico creado exitosamente';
        } else {
            // Si existe pero no tiene código, asignarle uno
            if (empty($cliente->codigo)) {
                $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
                $codigo = $ultimoCliente ? 'CLI' . str_pad($ultimoCliente->id + 1, 6, '0', STR_PAD_LEFT) : 'CLI000001';
                $cliente->codigo = $codigo;
                $cliente->save();
            }
            
            $mensaje = 'Cliente genérico ya existía';
        }
        
        return response()->json([
            'success' => true,
            'message' => $mensaje,
            'cliente' => $cliente
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ruta para probar conexión y mostrar datos de prueba
Route::get('/debug/ventas', function() {
    try {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'sucursal_id' => $sucursalId,
            ],
            'caja_abierta' => \App\Models\Caja::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->where('estado', 'abierta')
                ->whereNull('fecha_cierre')
                ->exists(),
            'cliente_generico' => \App\Models\Cliente::where('cedula_rnc', '000-0000000-0')->first(),
            'productos_disponibles' => \App\Models\Producto::count(),
            'inventario_sucursal' => \App\Models\InventarioSucursal::where('sucursal_id', $sucursalId)->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
    Route::get('/corregir-inventario-definitivo', function() {
        $productoId = 1;
        
        // Calcular ventas REALES
        $ventasTotales = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->where('detalle_ventas.producto_id', $productoId)
            ->where('ventas.sucursal_id', 1)
            ->sum('detalle_ventas.cantidad');
        
        Log::info("Ventas totales del producto {$productoId}: {$ventasTotales}");
        
        // Stock inicial: 50
        $stockCorrecto = 50 - $ventasTotales;
        
        Log::info("Stock CORRECTO: {$stockCorrecto}");
        
        // Actualizar inventario
        $inventario = \App\Models\InventarioSucursal::where('producto_id', $productoId)
            ->where('sucursal_id', 1)
            ->first();
        
        if ($inventario) {
            Log::info("Stock actual en BD: {$inventario->stock_actual}");
            
            if ($inventario->stock_actual != $stockCorrecto) {
                // Actualizar directamente
                DB::table('inventario_sucursal')
                    ->where('id', $inventario->id)
                    ->update([
                        'stock_actual' => $stockCorrecto,
                        'updated_at' => now()
                    ]);
                
                Log::info("✓ Inventario corregido a {$stockCorrecto}");
            } else {
                Log::info("✓ Inventario ya está correcto");
            }
        }
        
        return response()->json([
            'ventas_totales' => $ventasTotales,
            'stock_correcto' => $stockCorrecto,
            'stock_anterior' => $inventario->stock_actual ?? null
        ]);
    });
    Route::get('/verificar-ventas', function() {
        $ventas = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
            ->where('detalle_ventas.producto_id', 1)
            ->where('ventas.sucursal_id', 1)
            ->select(
                'ventas.id as venta_id',
                'ventas.numero_factura',
                'ventas.created_at',
                'productos.nombre',
                'detalle_ventas.cantidad',
                'detalle_ventas.precio_unitario'
            )
            ->orderBy('ventas.id', 'asc')
            ->get();
        
        $totalVendido = $ventas->sum('cantidad');
        
        return response()->json([
            'ventas' => $ventas,
            'total_vendido' => $totalVendido,
            'stock_inicial' => 50,
            'stock_actual_deberia_ser' => 50 - $totalVendido,
            'stock_actual_en_bd' => DB::table('inventario_sucursal')
                ->where('producto_id', 1)
                ->where('sucursal_id', 1)
                ->value('stock_actual')
        ]);
    });
})->middleware(['auth', 'verified']);

require __DIR__ . '/auth.php';