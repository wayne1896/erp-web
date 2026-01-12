<?php
// app/Http/Controllers\Api\Mobile\ProductoController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\InventarioSucursal;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    /**
     * Listar productos para app móvil
     * GET /api/mobile/productos
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $cacheKey = "mobile.productos.sucursal.{$sucursalId}";
        $cacheTime = 300; // 5 minutos
        
        $productos = Cache::remember($cacheKey, $cacheTime, function () use ($sucursalId) {
            return Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
                $q->where('sucursal_id', $sucursalId);
            }])
            ->where('activo', true)
            ->select([
                'id',
                'codigo',
                'codigo_barras',
                'nombre',
                'descripcion',
                'categoria_id',
                'precio_venta',
                'precio_mayor',
                'tasa_itbis',
                'itbis_porcentaje',
                'exento_itbis',
                'unidad_medida',
                'stock_minimo',
                'control_stock',
                'updated_at',
            ])
            ->get()
            ->map(function($producto) {
                $inventario = $producto->inventario->first();
                
                return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'codigo_barras' => $producto->codigo_barras,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'categoria' => $producto->categoria->nombre,
                    'categoria_id' => $producto->categoria_id,
                    'precio_venta' => (float) $producto->precio_venta,
                    'precio_con_itbis' => $this->calcularPrecioConItbis($producto),
                    'precio_mayor' => (float) $producto->precio_mayor,
                    'tasa_itbis' => $producto->tasa_itbis,
                    'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                    'exento_itbis' => (bool) $producto->exento_itbis,
                    'unidad_medida' => $producto->unidad_medida,
                    'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
                    'stock_minimo' => (float) $producto->stock_minimo,
                    'control_stock' => (bool) $producto->control_stock,
                    'bajo_stock_minimo' => $inventario ? 
                        ($inventario->stock_disponible < $producto->stock_minimo) : false,
                    'imagen_url' => $producto->imagen_url ?: asset('images/productos/default.png'),
                    'updated_at' => $producto->updated_at->toISOString(),
                ];
            });
        });
        
        // Filtrar por búsqueda si existe
        if ($request->has('search')) {
            $search = strtolower($request->search);
            $productos = $productos->filter(function($producto) use ($search) {
                return str_contains(strtolower($producto['nombre']), $search) ||
                       str_contains(strtolower($producto['codigo']), $search) ||
                       str_contains(strtolower($producto['codigo_barras']), $search);
            })->values();
        }
        
        // Filtrar por categoría si existe
        if ($request->has('categoria_id')) {
            $productos = $productos->where('categoria_id', $request->categoria_id)->values();
        }
        
        // Filtrar solo con stock disponible
        if ($request->boolean('solo_con_stock')) {
            $productos = $productos->where('stock_disponible', '>', 0)->values();
        }
        
        // Filtrar productos bajo stock mínimo
        if ($request->boolean('bajo_stock')) {
            $productos = $productos->where('bajo_stock_minimo', true)->values();
        }
        
        // Ordenar
        $orderBy = $request->get('order_by', 'nombre');
        $orderDir = $request->get('order_dir', 'asc');
        
        $productos = $productos->sortBy($orderBy, SORT_REGULAR, $orderDir === 'desc')->values();
        
        // Paginación
        $perPage = $request->get('per_page', 50);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;
        
        $paginated = $productos->slice($offset, $perPage)->values();
        
        return response()->json([
            'success' => true,
            'data' => $paginated,
            'pagination' => [
                'total' => $productos->count(),
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($productos->count() / $perPage),
            ],
            'metadata' => [
                'total_productos' => $productos->count(),
                'total_con_stock' => $productos->where('stock_disponible', '>', 0)->count(),
                'total_bajo_stock' => $productos->where('bajo_stock_minimo', true)->count(),
            ],
        ]);
    }
    
    /**
     * Obtener un producto específico por ID o código
     * GET /api/mobile/productos/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        // Buscar por ID o código de barras
        $producto = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->where(function($query) use ($id) {
            $query->where('id', $id)
                  ->orWhere('codigo', $id)
                  ->orWhere('codigo_barras', $id);
        })
        ->first();
        
        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }
        
        $inventario = $producto->inventario->first();
        
        $data = [
            'id' => $producto->id,
            'codigo' => $producto->codigo,
            'codigo_barras' => $producto->codigo_barras,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'categoria' => $producto->categoria->nombre,
            'categoria_id' => $producto->categoria_id,
            'precio_venta' => (float) $producto->precio_venta,
            'precio_con_itbis' => $this->calcularPrecioConItbis($producto),
            'precio_mayor' => (float) $producto->precio_mayor,
            'tasa_itbis' => $producto->tasa_itbis,
            'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
            'exento_itbis' => (bool) $producto->exento_itbis,
            'unidad_medida' => $producto->unidad_medida,
            'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
            'stock_minimo' => (float) $producto->stock_minimo,
            'control_stock' => (bool) $producto->control_stock,
            'bajo_stock_minimo' => $inventario ? 
                ($inventario->stock_disponible < $producto->stock_minimo) : false,
            'imagen_url' => $producto->imagen_url ?: asset('images/productos/default.png'),
            'detalles' => [
                'fecha_creacion' => $producto->created_at->toISOString(),
                'ultima_actualizacion' => $producto->updated_at->toISOString(),
                'costo_promedio' => $inventario ? (float) $inventario->costo_promedio : 0,
                'valor_inventario' => $inventario ? 
                    (float) ($inventario->stock_disponible * $inventario->costo_promedio) : 0,
            ],
            'movimientos_recientes' => $this->obtenerMovimientosRecientes($producto->id, $sucursalId),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
    
    /**
     * Búsqueda rápida de productos
     * GET /api/mobile/productos/buscar/rapido
     */
    public function buscarRapido(Request $request)
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        $termino = $request->termino;
        
        $productos = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->where(function($query) use ($termino) {
            $query->where('codigo', 'LIKE', "%{$termino}%")
                  ->orWhere('codigo_barras', 'LIKE', "%{$termino}%")
                  ->orWhere('nombre', 'LIKE', "%{$termino}%")
                  ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        })
        ->limit(20)
        ->get()
        ->map(function($producto) {
            $inventario = $producto->inventario->first();
            
            return [
                'id' => $producto->id,
                'codigo' => $producto->codigo,
                'codigo_barras' => $producto->codigo_barras,
                'nombre' => $producto->nombre,
                'precio_venta' => (float) $producto->precio_venta,
                'precio_con_itbis' => $this->calcularPrecioConItbis($producto),
                'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
                'unidad_medida' => $producto->unidad_medida,
                'imagen_url' => $producto->imagen_url ?: asset('images/productos/default.png'),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $productos,
            'count' => $productos->count()
        ]);
    }
    
    /**
     * Escanear código de barras
     * POST /api/mobile/productos/escanear
     */
    public function escanearCodigoBarras(Request $request)
    {
        $request->validate([
            'codigo_barras' => 'required|string'
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        $codigoBarras = $request->codigo_barras;
        
        $producto = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->where('codigo_barras', $codigoBarras)
        ->first();
        
        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado para este código de barras',
                'codigo_barras' => $codigoBarras
            ], 404);
        }
        
        $inventario = $producto->inventario->first();
        
        $data = [
            'id' => $producto->id,
            'codigo' => $producto->codigo,
            'codigo_barras' => $producto->codigo_barras,
            'nombre' => $producto->nombre,
            'precio_venta' => (float) $producto->precio_venta,
            'precio_con_itbis' => $this->calcularPrecioConItbis($producto),
            'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
            'unidad_medida' => $producto->unidad_medida,
            'imagen_url' => $producto->imagen_url ?: asset('images/productos/default.png'),
            'timestamp' => now()->toISOString(),
        ];
        
        // Registrar escaneo en logs
        $this->registrarEscaneo($user->id, $producto->id, $sucursalId, $codigoBarras);
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Producto escaneado correctamente'
        ]);
    }
    
    /**
     * Obtener categorías de productos
     * GET /api/mobile/productos/categorias
     */
    public function categorias(Request $request)
    {
        $cacheKey = 'mobile.categorias.productos';
        $cacheTime = 600; // 10 minutos
        
        $categorias = Cache::remember($cacheKey, $cacheTime, function () {
            return Categoria::where('activo', true)
                ->select(['id', 'nombre', 'descripcion', 'imagen_url'])
                ->orderBy('nombre')
                ->get()
                ->map(function($categoria) {
                    return [
                        'id' => $categoria->id,
                        'nombre' => $categoria->nombre,
                        'descripcion' => $categoria->descripcion,
                        'imagen_url' => $categoria->imagen_url ?: asset('images/categorias/default.png'),
                        'total_productos' => $categoria->productos()->where('activo', true)->count(),
                    ];
                });
        });
        
        return response()->json([
            'success' => true,
            'data' => $categorias,
            'count' => $categorias->count()
        ]);
    }
    
    /**
     * Actualizar stock desde móvil (para ajustes rápidos)
     * POST /api/mobile/productos/actualizar-stock
     */
    public function actualizarStock(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|integer|exists:productos,id',
            'cantidad' => 'required|numeric',
            'tipo_movimiento' => 'required|in:entrada,salida,ajuste',
            'motivo' => 'required|string|max:255',
            'referencia' => 'nullable|string|max:100',
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        DB::beginTransaction();
        
        try {
            $producto = Producto::findOrFail($request->producto_id);
            $inventario = InventarioSucursal::where('producto_id', $producto->id)
                ->where('sucursal_id', $sucursalId)
                ->firstOrFail();
            
            $cantidadAnterior = $inventario->stock_disponible;
            
            // Actualizar stock según tipo de movimiento
            switch ($request->tipo_movimiento) {
                case 'entrada':
                    $inventario->stock_disponible += $request->cantidad;
                    break;
                case 'salida':
                    if ($inventario->stock_disponible < $request->cantidad && $producto->control_stock) {
                        throw new \Exception('Stock insuficiente');
                    }
                    $inventario->stock_disponible -= $request->cantidad;
                    break;
                case 'ajuste':
                    $inventario->stock_disponible = $request->cantidad;
                    break;
            }
            
            $inventario->save();
            
            // Registrar movimiento
            $movimiento = [
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalId,
                'usuario_id' => $user->id,
                'tipo_movimiento' => $request->tipo_movimiento,
                'cantidad' => $request->cantidad,
                'stock_anterior' => $cantidadAnterior,
                'stock_nuevo' => $inventario->stock_disponible,
                'motivo' => $request->motivo,
                'referencia' => $request->referencia,
                'origen' => 'app_movil',
                'created_at' => now(),
            ];
            
            DB::table('movimientos_inventario')->insert($movimiento);
            
            // Invalidar cache
            Cache::forget("mobile.productos.sucursal.{$sucursalId}");
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Stock actualizado correctamente',
                'data' => [
                    'producto_id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'stock_anterior' => $cantidadAnterior,
                    'stock_nuevo' => $inventario->stock_disponible,
                    'diferencia' => $inventario->stock_disponible - $cantidadAnterior,
                    'timestamp' => now()->toISOString(),
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar stock: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener reporte de productos bajo stock mínimo
     * GET /api/mobile/productos/reporte/bajo-stock
     */
    public function reporteBajoStock(Request $request)
    {
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        
        $productos = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->where('control_stock', true)
        ->get()
        ->filter(function($producto) {
            $inventario = $producto->inventario->first();
            return $inventario && $inventario->stock_disponible < $producto->stock_minimo;
        })
        ->map(function($producto) {
            $inventario = $producto->inventario->first();
            
            return [
                'id' => $producto->id,
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria->nombre,
                'stock_disponible' => (float) $inventario->stock_disponible,
                'stock_minimo' => (float) $producto->stock_minimo,
                'diferencia' => (float) ($inventario->stock_disponible - $producto->stock_minimo),
                'unidad_medida' => $producto->unidad_medida,
                'prioridad' => $this->calcularPrioridadStock(
                    $inventario->stock_disponible, 
                    $producto->stock_minimo
                ),
            ];
        })
        ->sortBy('prioridad')
        ->values();
        
        $totalBajoStock = $productos->count();
        $totalFaltante = $productos->sum(function($producto) {
            return abs($producto['diferencia']);
        });
        
        return response()->json([
            'success' => true,
            'data' => $productos,
            'resumen' => [
                'total_productos_bajo_stock' => $totalBajoStock,
                'total_unidades_faltantes' => $totalFaltante,
                'productos_criticos' => $productos->where('prioridad', 'critico')->count(),
                'productos_bajo_minimo' => $productos->where('prioridad', 'bajo')->count(),
                'timestamp' => now()->toISOString(),
            ]
        ]);
    }
    
    /**
     * Métodos auxiliares privados
     */
    
    private function calcularPrecioConItbis($producto)
    {
        if ($producto->exento_itbis) {
            return (float) $producto->precio_venta;
        }
        
        $itbis = $producto->precio_venta * ($producto->itbis_porcentaje / 100);
        return (float) ($producto->precio_venta + $itbis);
    }
    
    private function obtenerMovimientosRecientes($productoId, $sucursalId, $limit = 10)
    {
        return DB::table('movimientos_inventario')
            ->where('producto_id', $productoId)
            ->where('sucursal_id', $sucursalId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get([
                'id',
                'tipo_movimiento',
                'cantidad',
                'stock_anterior',
                'stock_nuevo',
                'motivo',
                'referencia',
                'created_at'
            ])
            ->map(function($movimiento) {
                return [
                    'tipo' => $movimiento->tipo_movimiento,
                    'cantidad' => (float) $movimiento->cantidad,
                    'stock_anterior' => (float) $movimiento->stock_anterior,
                    'stock_nuevo' => (float) $movimiento->stock_nuevo,
                    'motivo' => $movimiento->motivo,
                    'referencia' => $movimiento->referencia,
                    'fecha' => $movimiento->created_at,
                ];
            });
    }
    
    private function registrarEscaneo($usuarioId, $productoId, $sucursalId, $codigoBarras)
    {
        DB::table('logs_escaneo')->insert([
            'usuario_id' => $usuarioId,
            'producto_id' => $productoId,
            'sucursal_id' => $sucursalId,
            'codigo_barras' => $codigoBarras,
            'fecha_escaneo' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
    
    private function calcularPrioridadStock($stockDisponible, $stockMinimo)
    {
        $porcentaje = ($stockDisponible / $stockMinimo) * 100;
        
        if ($porcentaje <= 20) {
            return 'critico';
        } elseif ($porcentaje <= 50) {
            return 'bajo';
        } elseif ($porcentaje < 100) {
            return 'advertencia';
        }
        
        return 'normal';
    }
    
    /**
     * Sincronización offline para app móvil
     * POST /api/mobile/productos/sincronizar
     */
    public function sincronizar(Request $request)
    {
        $request->validate([
            'ultima_sincronizacion' => 'required|date',
            'cambios_locales' => 'nullable|array',
        ]);
        
        $user = $request->user();
        $sucursalId = $user->sucursal_id;
        $ultimaSync = $request->ultima_sincronizacion;
        
        // Obtener cambios desde el servidor
        $productosActualizados = Producto::with(['categoria', 'inventario' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId);
        }])
        ->where('activo', true)
        ->where('updated_at', '>', $ultimaSync)
        ->orWhereHas('inventario', function($q) use ($sucursalId, $ultimaSync) {
            $q->where('sucursal_id', $sucursalId)
              ->where('updated_at', '>', $ultimaSync);
        })
        ->get()
        ->map(function($producto) {
            $inventario = $producto->inventario->first();
            
            return [
                'id' => $producto->id,
                'codigo' => $producto->codigo,
                'codigo_barras' => $producto->codigo_barras,
                'nombre' => $producto->nombre,
                'precio_venta' => (float) $producto->precio_venta,
                'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
                'updated_at' => $producto->updated_at->toISOString(),
                'inventario_updated_at' => $inventario ? $inventario->updated_at->toISOString() : null,
            ];
        });
        
        // Procesar cambios locales si existen
        $cambiosProcesados = [];
        if ($request->has('cambios_locales')) {
            foreach ($request->cambios_locales as $cambio) {
                // Aquí procesarías los cambios locales (ventas offline, ajustes, etc.)
                $cambiosProcesados[] = $this->procesarCambioLocal($cambio, $user);
            }
        }
        
        return response()->json([
            'success' => true,
            'sincronizacion' => [
                'fecha_sincronizacion' => now()->toISOString(),
                'productos_actualizados' => $productosActualizados,
                'total_actualizados' => $productosActualizados->count(),
                'cambios_procesados' => $cambiosProcesados,
                'cache_invalidado' => true,
            ]
        ]);
    }
    
    private function procesarCambioLocal($cambio, $user)
    {
        // Implementar lógica para procesar cambios locales
        // Esto podría incluir ventas offline, ajustes de stock, etc.
        
        return [
            'id_cambio' => $cambio['id'] ?? null,
            'tipo' => $cambio['tipo'] ?? 'desconocido',
            'procesado' => true,
            'fecha_procesamiento' => now()->toISOString(),
        ];
    }
}