<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\ClienteController;
use App\Http\Controllers\Web\CategoriaController;
use App\Http\Controllers\Web\ProveedorController;
use App\Http\Controllers\Web\ProductoController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\CajaController;
use App\Http\Controllers\Web\VentaController;
use App\Http\Controllers\Web\PedidoController;
use App\Http\Controllers\Web\AuditoriaController;
use App\Http\Controllers\Web\VentaPDFController; // CORREGIDO: PDFVentaController → VentaPDFController
use App\Http\Controllers\Web\CompanyProfileController;
use App\Http\Controllers\Web\AuditoriaSistemaController;
use App\Http\Controllers\Web\UserController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\PermissionController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Cliente;
use App\Models\InventarioSucursal;

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
        Route::post('/{caja}/egreso', [CajaController::class, 'registrarEgresso'])->name('caja.egreso');
        
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
        
        // Rutas PDF - CORREGIDAS: PDFVentaController → VentaPDFController
        Route::get('/{venta}/pdf', [VentaPDFController::class, 'generarPDF'])->name('ventas.pdf');
        Route::get('/{venta}/pdf/descargar', [VentaPDFController::class, 'generarPDF'])->name('ventas.pdf.descargar');
        Route::get('/{venta}/pdf/vista', [VentaPDFController::class, 'vistaPrevia'])->name('ventas.pdf.vista');
        Route::get('/{venta}/pdf/imprimir', [VentaPDFController::class, 'imprimir'])->name('ventas.pdf.imprimir');
        
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

    // ==================== PEDIDOS ====================
    Route::prefix('pedidos')->group(function () {
        // CRUD Básico
        Route::get('/', [PedidoController::class, 'index'])->name('pedidos.index');
        Route::get('/crear', [PedidoController::class, 'create'])->name('pedidos.create');
        Route::post('/', [PedidoController::class, 'store'])->name('pedidos.store');
        Route::get('/{pedido}', [PedidoController::class, 'show'])->name('pedidos.show');
        Route::get('/{pedido}/editar', [PedidoController::class, 'edit'])->name('pedidos.edit');
        Route::put('/{pedido}', [PedidoController::class, 'update'])->name('pedidos.update');
        Route::delete('/{pedido}', [PedidoController::class, 'destroy'])->name('pedidos.destroy');
        
        // Rutas adicionales específicas
        Route::post('/{pedido}/procesar', [PedidoController::class, 'procesar'])->name('pedidos.procesar');
        Route::post('/{pedido}/entregar', [PedidoController::class, 'entregar'])->name('pedidos.entregar');
        Route::post('/{pedido}/cancelar', [PedidoController::class, 'cancelar'])->name('pedidos.cancelar');
        Route::get('/{pedido}/detalles', [PedidoController::class, 'detalles'])->name('pedidos.detalles');
        
        // Para conversión a venta
        Route::post('/{pedido}/convertir-venta', [PedidoController::class, 'convertirAVenta'])->name('pedidos.convertir-venta');
    });

    // ==================== AUDITORÍA ====================
    Route::prefix('auditoria')->group(function () {
        Route::get('/', [AuditoriaController::class, 'index'])->name('auditoria.index');
        Route::get('/crear', [AuditoriaController::class, 'create'])->name('auditoria.create');
        Route::post('/', [AuditoriaController::class, 'store'])->name('auditoria.store');
        Route::get('/{auditoria}', [AuditoriaController::class, 'show'])->name('auditoria.show');
        Route::get('/{auditoria}/editar', [AuditoriaController::class, 'edit'])->name('auditoria.edit');
        Route::put('/{auditoria}', [AuditoriaController::class, 'update'])->name('auditoria.update');
        Route::delete('/{auditoria}', [AuditoriaController::class, 'destroy'])->name('auditoria.destroy');
        
        // Acciones específicas
        Route::post('/{auditoria}/aprobar', [AuditoriaController::class, 'aprobar'])->name('auditoria.aprobar');
        Route::post('/{auditoria}/rechazar', [AuditoriaController::class, 'rechazar'])->name('auditoria.rechazar');
        Route::post('/{auditoria}/exportar', [AuditoriaController::class, 'exportar'])->name('auditoria.exportar');
        
        // API Routes
        Route::get('/api/buscar', [AuditoriaController::class, 'buscar'])->name('auditoria.buscar');
        Route::get('/api/estadisticas', [AuditoriaController::class, 'estadisticas'])->name('auditoria.estadisticas');
        Route::post('/api/ejecutar', [AuditoriaController::class, 'ejecutar'])->name('auditoria.ejecutar');
    });

    // ==================== AUDITORÍA DE SISTEMA ====================
    Route::prefix('auditoria-sistema')->group(function () {
        Route::get('/', [AuditoriaSistemaController::class, 'index'])->name('auditoria-sistema.index');
        Route::get('/crear', [AuditoriaSistemaController::class, 'create'])->name('auditoria-sistema.create');
        Route::post('/', [AuditoriaSistemaController::class, 'store'])->name('auditoria-sistema.store');
        Route::get('/{auditoriaSistema}', [AuditoriaSistemaController::class, 'show'])->name('auditoria-sistema.show');
        Route::get('/{auditoriaSistema}/editar', [AuditoriaSistemaController::class, 'edit'])->name('auditoria-sistema.edit');
        Route::put('/{auditoriaSistema}', [AuditoriaSistemaController::class, 'update'])->name('auditoria-sistema.update');
        Route::delete('/{auditoriaSistema}', [AuditoriaSistemaController::class, 'destroy'])->name('auditoria-sistema.destroy');
        
        // Acciones específicas
        Route::post('/limpiar', [AuditoriaSistemaController::class, 'limpiar'])->name('auditoria-sistema.limpiar');
        Route::get('/exportar', [AuditoriaSistemaController::class, 'exportar'])->name('auditoria-sistema.exportar');
        Route::get('/dashboard', [AuditoriaSistemaController::class, 'dashboard'])->name('auditoria-sistema.dashboard');
        
        // API Routes
        Route::get('/api/estadisticas', [AuditoriaSistemaController::class, 'estadisticas'])->name('auditoria-sistema.estadisticas');
        Route::get('/api/actividades-recientes', [AuditoriaSistemaController::class, 'actividadesRecientes'])->name('auditoria-sistema.actividades-recientes');
        Route::get('/api/buscar', [AuditoriaSistemaController::class, 'buscar'])->name('auditoria-sistema.buscar');
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
                    'provincia' => 'Distrito Nacional',
                    'municipio' => 'Santo Domingo',
                    'sector' => 'Centro',
                    'tipo_contribuyente' => 'CONSUMIDOR_FINAL',
                    'dias_credito' => 0,
                    'descuento' => 0.00,
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
                'cliente_generico' => Cliente::where('cedula_rnc', '000-0000000-0')->first(),
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
    });
    
    // Ruta para login
    Route::post('login', [AuthController::class, 'login']);
    
    Route::get('/corregir-inventario-definitivo', function() {
        $productoId = 1;
        
        // Calcular ventas REALES
        $ventasTotales = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->where('detalle_ventas.producto_id', $productoId)
            ->where('ventas.sucursal_id', 1)
            ->sum('detalle_ventas.cantidad');
        
        \Log::info("Ventas totales del producto {$productoId}: {$ventasTotales}");
        
        // Stock inicial: 50
        $stockCorrecto = 50 - $ventasTotales;
        
        \Log::info("Stock CORRECTO: {$stockCorrecto}");
        
        // Actualizar inventario
        $inventario = InventarioSucursal::where('producto_id', $productoId)
            ->where('sucursal_id', 1)
            ->first();
        
        if ($inventario) {
            \Log::info("Stock actual en BD: {$inventario->stock_actual}");
            
            if ($inventario->stock_actual != $stockCorrecto) {
                // Actualizar directamente
                DB::table('inventario_sucursal')
                    ->where('id', $inventario->id)
                    ->update([
                        'stock_actual' => $stockCorrecto,
                        'updated_at' => now()
                    ]);
                
                \Log::info("✓ Inventario corregido a {$stockCorrecto}");
            } else {
                \Log::info("✓ Inventario ya está correcto");
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
});

// ==================== RUTAS DE GESTIÓN DE USUARIOS ====================
Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified'])
    ->names([
        'index' => 'users.index',
        'create' => 'users.create',
        'store' => 'users.store',
        'show' => 'users.show',
        'edit' => 'users.edit',
        'update' => 'users.update',
        'destroy' => 'users.destroy'
    ]);

Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
    ->middleware(['auth', 'verified'])
    ->name('users.toggle-status');

// ==================== RUTAS DE GESTIÓN DE ROLES ====================
Route::resource('roles', RoleController::class)
    ->middleware(['auth', 'verified'])
    ->names([
        'index' => 'roles.index',
        'create' => 'roles.create',
        'store' => 'roles.store',
        'show' => 'roles.show',
        'edit' => 'roles.edit',
        'update' => 'roles.update',
        'destroy' => 'roles.destroy'
    ]);

Route::get('roles/statistics', [RoleController::class, 'statistics'])
    ->middleware(['auth', 'verified'])
    ->name('roles.statistics');

// ==================== RUTAS DE GESTIÓN DE PERMISOS ====================
Route::resource('permissions', PermissionController::class)
    ->middleware(['auth', 'verified'])
    ->names([
        'index' => 'permissions.index',
        'create' => 'permissions.create',
        'store' => 'permissions.store',
        'show' => 'permissions.show',
        'edit' => 'permissions.edit',
        'update' => 'permissions.update',
        'destroy' => 'permissions.destroy'
    ]);

Route::get('permissions/statistics', [PermissionController::class, 'statistics'])
    ->middleware(['auth', 'verified'])
    ->name('permissions.statistics');

Route::post('permissions/sync-roles', [PermissionController::class, 'syncWithRoles'])
    ->middleware(['auth', 'verified'])
    ->name('permissions.sync-roles');

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

// ==================== RUTAS PÚBLICAS DE FACTURAS ====================
Route::prefix('facturas')->group(function () {
    Route::get('/verify/{venta}', [VentaPDFController::class, 'verificarFactura'])->name('facturas.verify');
});

// ==================== RUTAS DE PERFIL DE EMPRESA ====================
Route::prefix('configuracion')->group(function () {
    Route::get('/general', function () {
        return Inertia::render('Configuracion/General');
    })->name('configuracion.general');
    
    Route::get('/empresa', [CompanyProfileController::class, 'index'])->name('company-profile.index');
    Route::get('/empresa/editar', [CompanyProfileController::class, 'edit'])->name('company-profile.edit');
    Route::post('/empresa', [CompanyProfileController::class, 'store'])->name('company-profile.store');
    Route::post('/empresa/{id}', [CompanyProfileController::class, 'update'])->name('company-profile.update');
    Route::get('/empresa/api', [CompanyProfileController::class, 'getProfileData'])->name('company-profile.api');
    
    Route::get('/usuarios', function () {
        return Inertia::render('Configuracion/Usuarios');
    })->name('configuracion.usuarios');
    
    Route::get('/backup', function () {
        return Inertia::render('Configuracion/Backup');
    })->name('configuracion.backup');
});

require __DIR__ . '/auth.php';