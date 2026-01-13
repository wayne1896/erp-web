<?php
// app/Http/Controllers/Web/ProductoController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Sucursal;
use App\Models\CategoriaProducto;
use App\Models\InventarioSucursal;
use App\Models\MovimientoInventario;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Obtener sucursal activa del usuario o sucursal principal
        $sucursal = $request->user()->sucursal ?? Sucursal::principal();
        
        // Query base con relaciones
        $query = Producto::with([
            'categoria', 
            'inventarios' => function($q) use ($sucursal) {
                $q->where('sucursal_id', $sucursal->id);
            }
        ]);
        
        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%")
                  ->orWhere('codigo_barras', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }
        
        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('activo', $request->estado === 'activo');
        }
        
        // Filtro por control de stock
        if ($request->filled('control_stock')) {
            $query->where('control_stock', $request->control_stock === 'true');
        }
        
        // Ordenamiento
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        // Estadísticas
        $stats = [
            'total' => Producto::count(),
            'activos' => Producto::where('activo', true)->count(),
            'stock_bajo' => Producto::whereHas('inventarios', function($q) use ($sucursal) {
                $q->where('sucursal_id', $sucursal->id)
                  ->whereRaw('stock_disponible <= stock_minimo')
                  ->where('control_stock', true);
            })->count(),
            'exento_itbis' => Producto::where('exento_itbis', true)->count(),
            'total_valor_inventario' => InventarioSucursal::where('sucursal_id', $sucursal->id)
                ->sum('valor_inventario'),
        ];
        
        // Paginación
        $perPage = $request->per_page ?? 10;
        $productos = $query->paginate($perPage);
        
        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'filters' => $request->only(['search', 'categoria_id', 'estado', 'control_stock', 'per_page', 'sort', 'direction']),
            'categorias' => CategoriaProducto::all(),
            'stats' => $stats,
            'sucursal' => $sucursal,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Productos/Create', [
            'categorias' => CategoriaProducto::orderBy('nombre')->get(),
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS General (18%)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS Reducido (16%)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS Mínimo (0%)'],
                ['value' => 'EXENTO', 'label' => 'Exento de ITBIS (0%)']
            ],
            'unidades_medida' => ['UNIDAD', 'KILO', 'LITRO', 'METRO', 'CAJA', 'PAQUETE', 'SACO'],
            'sucursales' => Sucursal::activas()->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Log para depuración
        Log::info('Datos recibidos para crear producto:', $request->all());
        
        // Procesar valores booleanos
        $request->merge([
            'exento_itbis' => $request->boolean('exento_itbis'),
            'control_stock' => $request->boolean('control_stock'),
            'activo' => $request->boolean('activo'),
            'precio_mayor' => $request->precio_mayor ?: null,
            'stock_inicial' => $request->control_stock ? ($request->stock_inicial ?: 0) : 0,
            'costo_inicial' => $request->control_stock ? ($request->costo_inicial ?: $request->precio_compra) : 0,
        ]);

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:productos',
            'codigo_barras' => 'nullable|string|max:50|unique:productos,codigo_barras',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias_productos,id',
            'unidad_medida' => 'required|string|max:20',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'precio_mayor' => 'nullable|numeric|min:0',
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'exento_itbis' => 'boolean',
            'tasa_itbis' => 'required|string|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'control_stock' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'stock_inicial' => 'nullable|numeric|min:0',
            'costo_inicial' => 'nullable|numeric|min:0',
            'sucursal_id' => 'required_if:control_stock,true|exists:sucursales,id',
            'activo' => 'boolean'
        ]);

        Log::info('Datos validados:', $validated);

        // Iniciar transacción para crear producto e inventario
        DB::beginTransaction();
        
        try {
            // Crear el producto (sin sucursal_id ya que no está en la tabla productos)
            $productoData = $validated;
            unset($productoData['sucursal_id'], $productoData['stock_inicial'], $productoData['costo_inicial']);
            
            $producto = Producto::create($productoData);
            Log::info('Producto creado:', $producto->toArray());
            
            // Si tiene control de stock
            if ($validated['control_stock']) {
                $sucursal_id = $validated['sucursal_id'] ?? ($request->user()->sucursal_id ?? Sucursal::principal()->id);
                $stock_inicial = $validated['stock_inicial'] ?? 0;
                $costo_inicial = $validated['costo_inicial'] ?? $validated['precio_compra'];
                
                // Crear o actualizar inventario
                $inventario = InventarioSucursal::updateOrCreate(
                    [
                        'producto_id' => $producto->id,
                        'sucursal_id' => $sucursal_id,
                    ],
                    [
                        'stock_actual' => $stock_inicial,
                        'stock_reservado' => 0,
                        'costo_promedio' => $costo_inicial,
                    ]
                );
                
                Log::info('Inventario creado:', $inventario->toArray());
                
                // Registrar movimiento inicial si hay stock
                if ($stock_inicial > 0) {
                    MovimientoInventario::create([
                        'producto_id' => $producto->id,
                        'sucursal_id' => $sucursal_id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'entrada',
                        'cantidad' => $stock_inicial,
                        'cantidad_anterior' => 0,
                        'cantidad_nueva' => $stock_inicial,
                        'costo' => $costo_inicial,
                        'motivo' => 'Stock inicial al crear producto',
                    ]);
                    Log::info('Movimiento de inventario creado para stock inicial');
                }
            } else {
                // Si no controla stock, crear inventarios en todas las sucursales activas
                $sucursales = Sucursal::activas()->get();
                foreach ($sucursales as $sucursal) {
                    InventarioSucursal::create([
                        'producto_id' => $producto->id,
                        'sucursal_id' => $sucursal->id,
                        'stock_actual' => 0,
                        'stock_reservado' => 0,
                        'costo_promedio' => $validated['precio_compra'],
                    ]);
                }
            }
            
            DB::commit();
            Log::info('Transacción completada exitosamente');
            
            return redirect()->route('productos.index')
                ->with('success', 'Producto creado exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear producto: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Error al crear el producto: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
   /**
 * Display the specified resource.
 */
public function show(Producto $producto)
{
    $sucursal = request()->user()->sucursal ?? Sucursal::principal();
    
    // Cargar todas las relaciones necesarias
    $producto->load([
        'categoria',
        'inventarios.sucursal',
        'movimientos' => function($q) {
            $q->with(['sucursal', 'usuario'])
              ->orderBy('created_at', 'desc')
              ->limit(10);
        }
    ]);
    
    // Verificar que la carga de relaciones funcionó
    \Log::info('Producto cargado con relaciones:', [
        'id' => $producto->id,
        'nombre' => $producto->nombre,
        'categoria' => $producto->categoria ? $producto->categoria->nombre : null,
        'inventarios_count' => $producto->inventarios->count(),
        'movimientos_count' => $producto->movimientos->count(),
    ]);
    
    return Inertia::render('Productos/Show', [
        'producto' => $producto,
        'movimientos' => $producto->movimientos,
        'sucursal_actual' => $sucursal,
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Producto $producto)
    {
        $sucursal = request()->user()->sucursal ?? Sucursal::principal();
        
        $producto->load(['inventarios' => function($q) use ($sucursal) {
            $q->where('sucursal_id', $sucursal->id);
        }]);
        
        return Inertia::render('Productos/Edit', [
            'producto' => $producto,
            'categorias' => CategoriaProducto::orderBy('nombre')->get(),
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS General (18%)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS Reducido (16%)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS Mínimo (0%)'],
                ['value' => 'EXENTO', 'label' => 'Exento de ITBIS (0%)']
            ],
            'unidades_medida' => [
                'UNIDAD', 'KILO', 'LITRO', 'METRO', 'CAJA', 'PAQUETE', 'SACO'
            ],
            'sucursales' => Sucursal::activas()->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Producto $producto)
    {
        // Procesar valores booleanos
        $request->merge([
            'exento_itbis' => $request->boolean('exento_itbis'),
            'control_stock' => $request->boolean('control_stock'),
            'activo' => $request->boolean('activo'),
            'precio_mayor' => $request->precio_mayor ?: null,
        ]);

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:productos,codigo,' . $producto->id,
            'codigo_barras' => 'nullable|string|max:50|unique:productos,codigo_barras,' . $producto->id,
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias_productos,id',
            'unidad_medida' => 'required|string|max:20',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'precio_mayor' => 'nullable|numeric|min:0',
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'exento_itbis' => 'boolean',
            'tasa_itbis' => 'required|string|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'control_stock' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'activo' => 'boolean'
        ]);

        $producto->update($validated);

        return redirect()->route('productos.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Producto $producto)
    {
        // Verificar si hay inventario en alguna sucursal
        $tieneInventario = $producto->inventarios()->exists();
        
        if ($tieneInventario) {
            return back()->with('error', 'No se puede eliminar el producto porque tiene inventario registrado.');
        }
        
        // Verificar si hay movimientos relacionados
        $tieneMovimientos = MovimientoInventario::where('producto_id', $producto->id)->exists();
        
        if ($tieneMovimientos) {
            return back()->with('error', 'No se puede eliminar el producto porque tiene movimientos de inventario registrados.');
        }
        
        $producto->delete();

        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Mostrar página de gestión de stock
     */
    public function stock(Producto $producto)
    {
        $producto->load(['categoria', 'inventarios.sucursal']);
        
        return Inertia::render('Productos/Stock', [
            'producto' => $producto,
            'sucursales' => Sucursal::activas()->get(),
            'inventario_total' => $producto->inventarios()->sum('stock_actual'),
            'valor_total_inventario' => $producto->inventarios()->sum('valor_inventario'),
        ]);
    }

    /**
     * Ajustar stock del producto
     */
    public function ajustarStock(Request $request, Producto $producto)
    {
        \Log::info('Ajustar stock solicitado', [
            'producto_id' => $producto->id,
            'datos' => $request->all()
        ]);
    
        $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'cantidad' => 'required|numeric|min:0.01',
            'tipo' => 'required|in:entrada,salida,ajuste',
            'costo' => 'nullable|numeric|min:0',
            'motivo' => 'required|string|max:255',
        ]);
    
        $sucursal = Sucursal::find($request->sucursal_id);
        $inventario = InventarioSucursal::where('producto_id', $producto->id)
            ->where('sucursal_id', $sucursal->id)
            ->first();
        
        if (!$inventario) {
            $inventario = InventarioSucursal::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursal->id,
                'stock_actual' => 0,
                'stock_reservado' => 0,
                'costo_promedio' => $request->costo ?? $producto->precio_compra ?? 0,
            ]);
        }
        
        $cantidadAnterior = $inventario->stock_actual;
        
        DB::beginTransaction();
        
        try {
            switch ($request->tipo) {
                case 'entrada':
                    $inventario->incrementarStock($request->cantidad, $request->costo);
                    break;
                case 'salida':
                    if ($inventario->stock_disponible < $request->cantidad) {
                        throw new \Exception('Stock insuficiente. Disponible: ' . $inventario->stock_disponible);
                    }
                    $inventario->decrementarStock($request->cantidad);
                    break;
                case 'ajuste':
                    $inventario->stock_actual = $request->cantidad;
                    $inventario->save();
                    break;
            }
            
            // Registrar movimiento
            MovimientoInventario::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursal->id,
                'usuario_id' => $request->user()->id,
                'tipo' => $request->tipo,
                'cantidad' => $request->cantidad,
                'cantidad_anterior' => $cantidadAnterior,
                'cantidad_nueva' => $inventario->stock_actual,
                'costo' => $inventario->costo_promedio,
                'motivo' => $request->motivo,
            ]);
            
            DB::commit();
            
            return redirect()->back()
                ->with('success', 'Stock ajustado correctamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al ajustar stock: ' . $e->getMessage());
            return back()->with('error', 'Error al ajustar stock: ' . $e->getMessage());
        }
    }

    /**
     * Transferir stock entre sucursales
     */
    public function transferirStock(Request $request, Producto $producto)
    {
        $request->validate([
            'sucursal_origen_id' => 'required|exists:sucursales,id',
            'sucursal_destino_id' => 'required|exists:sucursales,id|different:sucursal_origen_id',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:255',
        ]);

        DB::beginTransaction();
        
        try {
            $inventarioOrigen = $producto->inventarioSucursal($request->sucursal_origen_id);
            $inventarioDestino = $producto->inventarioSucursal($request->sucursal_destino_id);
            
            if (!$inventarioOrigen) {
                throw new \Exception('No hay inventario en la sucursal de origen');
            }
            
            // Verificar stock disponible en origen
            if ($inventarioOrigen->stock_disponible < $request->cantidad) {
                throw new \Exception('Stock insuficiente en sucursal de origen. Disponible: ' . $inventarioOrigen->stock_disponible);
            }
            
            // Si no existe inventario en destino, crearlo
            if (!$inventarioDestino) {
                $inventarioDestino = InventarioSucursal::create([
                    'producto_id' => $producto->id,
                    'sucursal_id' => $request->sucursal_destino_id,
                    'stock_actual' => 0,
                    'stock_reservado' => 0,
                    'costo_promedio' => $inventarioOrigen->costo_promedio,
                ]);
            }
            
            // Registrar cantidad anterior para auditoría
            $cantidadAnteriorOrigen = $inventarioOrigen->stock_actual;
            $cantidadAnteriorDestino = $inventarioDestino->stock_actual;
            
            // Realizar transferencia
            $inventarioOrigen->decrementarStock($request->cantidad);
            $inventarioDestino->incrementarStock($request->cantidad, $inventarioOrigen->costo_promedio);
            
            // Registrar movimientos
            MovimientoInventario::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $request->sucursal_origen_id,
                'usuario_id' => $request->user()->id,
                'tipo' => 'salida',
                'cantidad' => $request->cantidad,
                'cantidad_anterior' => $cantidadAnteriorOrigen,
                'cantidad_nueva' => $inventarioOrigen->stock_actual,
                'costo' => $inventarioOrigen->costo_promedio,
                'motivo' => 'Transferencia a sucursal ' . $request->sucursal_destino_id . ' - ' . $request->motivo,
            ]);
            
            MovimientoInventario::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $request->sucursal_destino_id,
                'usuario_id' => $request->user()->id,
                'tipo' => 'entrada',
                'cantidad' => $request->cantidad,
                'cantidad_anterior' => $cantidadAnteriorDestino,
                'cantidad_nueva' => $inventarioDestino->stock_actual,
                'costo' => $inventarioDestino->costo_promedio,
                'motivo' => 'Transferencia desde sucursal ' . $request->sucursal_origen_id . ' - ' . $request->motivo,
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Transferencia realizada exitosamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al transferir stock: ' . $e->getMessage());
        }
    }

    /**
     * Reporte de inventario
     */
    public function reporteInventario(Request $request)
    {
        $sucursal = $request->user()->sucursal ?? Sucursal::principal();
        $categoria_id = $request->categoria_id;
        
        $query = Producto::with([
            'categoria',
            'inventarios' => function($q) use ($sucursal) {
                $q->where('sucursal_id', $sucursal->id);
            }
        ]);
        
        if ($categoria_id) {
            $query->where('categoria_id', $categoria_id);
        }
        
        // Filtros adicionales
        if ($request->filled('stock_bajo')) {
            $query->whereHas('inventarios', function($q) use ($sucursal) {
                $q->where('sucursal_id', $sucursal->id)
                  ->whereRaw('stock_disponible <= stock_minimo')
                  ->where('control_stock', true);
            });
        }
        
        if ($request->filled('sin_stock')) {
            $query->whereHas('inventarios', function($q) use ($sucursal) {
                $q->where('sucursal_id', $sucursal->id)
                  ->where('stock_disponible', '<=', 0)
                  ->where('control_stock', true);
            });
        }
        
        $productos = $query->orderBy('nombre')->get();
        
        // Estadísticas del reporte
        $estadisticas = [
            'total_productos' => $productos->count(),
            'total_valor' => $productos->sum(function($producto) {
                return $producto->inventarios->first()->valor_inventario ?? 0;
            }),
            'total_stock' => $productos->sum(function($producto) {
                return $producto->inventarios->first()->stock_disponible ?? 0;
            }),
            'productos_stock_bajo' => $productos->filter(function($producto) {
                return $producto->inventarios->first() && 
                       $producto->control_stock && 
                       $producto->inventarios->first()->stock_disponible <= ($producto->stock_minimo ?? 0);
            })->count(),
        ];
        
        return Inertia::render('Inventario/Reporte', [
            'productos' => $productos,
            'categorias' => CategoriaProducto::all(),
            'estadisticas' => $estadisticas,
            'filters' => $request->only(['categoria_id', 'stock_bajo', 'sin_stock']),
            'sucursal' => $sucursal,
        ]);
    }

    /**
     * Exportar reporte de inventario a PDF/Excel
     */
    public function exportarInventario(Request $request)
    {
        $sucursal = $request->user()->sucursal ?? Sucursal::principal();
        
        // Similar a reporteInventario pero para exportación
        // Puedes implementar exportación a PDF o Excel aquí
        
        return response()->json(['message' => 'Exportación implementada aquí']);
    }
}