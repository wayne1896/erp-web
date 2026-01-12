<?php
// app/Http\Controllers/Web/ProductoController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\CategoriaProducto;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoController extends Controller
{
    /**
     * Mostrar lista de productos
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        $categoriaId = $request->query('categoria_id');
        
        // Obtener la sucursal actual del usuario (ajusta según tu lógica)
        $sucursalActualId = auth()->user()->sucursal_id ?? 1; // Asume que el usuario tiene sucursal_id
        
        $productos = Producto::with(['categoria', 'proveedor'])
            ->when($search, function($query, $search) {
                return $query->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%")
                            ->orWhere('codigo_barras', 'like', "%{$search}%");
            })
            ->when($categoriaId, function($query, $categoriaId) {
                return $query->where('categoria_id', $categoriaId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        // Calcular estadísticas CORRECTAS para multi-sucursal
        $totalProductos = Producto::count();
        $productosActivos = Producto::where('activo', true)->count();
        $productosExentoItbis = Producto::where('exento_itbis', true)->count();
        
        // Calcular stock bajo específico para la sucursal actual usando el scope que ya tienes
        $productosStockBajo = Producto::stockBajo($sucursalActualId)->count();
        
        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'filters' => $request->only(['search', 'per_page', 'categoria_id']),
            'categorias' => CategoriaProducto::all(['id', 'nombre']),
            'stats' => [
                'total' => $totalProductos,
                'activos' => $productosActivos,
                'stock_bajo' => $productosStockBajo, // CORREGIDO: Usa el scope stockBajo
                'exento_itbis' => $productosExentoItbis,
            ],
            'sucursal_actual' => $sucursalActualId,
        ]);
    }

    /**
     * Mostrar formulario para crear producto
     */
    public function create()
    {
        return Inertia::render('Productos/Create', [
            'categorias' => CategoriaProducto::all(['id', 'nombre', 'codigo']),
            'proveedores' => Proveedor::where('activo', true)->get(['id', 'nombre', 'codigo']),
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)'],
                ['value' => 'EXENTO', 'label' => 'Exento'],
            ],
            'unidades_medida' => [
                ['value' => 'UNIDAD', 'label' => 'Unidad'],
                ['value' => 'PAR', 'label' => 'Par'],
                ['value' => 'JUEGO', 'label' => 'Juego'],
                ['value' => 'KILOGRAMO', 'label' => 'Kilogramo'],
                ['value' => 'GRAMO', 'label' => 'Gramo'],
                ['value' => 'LIBRA', 'label' => 'Libra'],
                ['value' => 'ONZA', 'label' => 'Onza'],
                ['value' => 'LITRO', 'label' => 'Litro'],
                ['value' => 'MILILITRO', 'label' => 'Mililitro'],
                ['value' => 'GALON', 'label' => 'Galón'],
                ['value' => 'METRO', 'label' => 'Metro'],
                ['value' => 'CENTIMETRO', 'label' => 'Centímetro'],
                ['value' => 'PULGADA', 'label' => 'Pulgada'],
                ['value' => 'CAJA', 'label' => 'Caja'],
                ['value' => 'PAQUETE', 'label' => 'Paquete'],
                ['value' => 'ROLLO', 'label' => 'Rollo'],
                ['value' => 'DOCENA', 'label' => 'Docena'],
            ]
        ]);
    }

    /**
     * Guardar nuevo producto
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:productos,codigo',
            'codigo_barras' => 'nullable|string|max:100|unique:productos,codigo_barras',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias_productos,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0|gte:precio_compra',
            'precio_mayor' => 'nullable|numeric|min:0',
            'tasa_itbis' => 'required|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'exento_itbis' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'stock_maximo' => 'nullable|numeric|min:0|gt:stock_minimo',
            'control_stock' => 'boolean',
            'unidad_medida' => 'required|in:UNIDAD,PAR,JUEGO,KILOGRAMO,GRAMO,LIBRA,ONZA,LITRO,MILILITRO,GALON,METRO,CENTIMETRO,PULGADA,CAJA,PAQUETE,ROLLO,DOCENA',
            'activo' => 'boolean',
        ]);
        
        $producto = Producto::create($validated);
        
        // IMPORTANTE: Crear registro de inventario en la sucursal actual
        if (auth()->user()->sucursal_id) {
            $producto->inventarios()->create([
                'sucursal_id' => auth()->user()->sucursal_id,
                'stock_actual' => 0,
                'stock_reservado' => 0,
                'stock_disponible' => 0,
                'costo_promedio' => $producto->precio_compra,
                'valor_inventario' => 0,
            ]);
        }
        
        return redirect()->route('productos.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Mostrar detalles de producto
     */
    public function show(Producto $producto)
    {
        // Obtener la sucursal actual
        $sucursalActualId = auth()->user()->sucursal_id ?? 1;
        
        $producto->load(['categoria', 'proveedor', 'inventarios' => function($query) use ($sucursalActualId) {
            $query->where('sucursal_id', $sucursalActualId);
        }]);
        
        // Obtener inventario de la sucursal actual
        $inventarioActual = $producto->inventarioEnSucursal($sucursalActualId);
        
        return Inertia::render('Productos/Show', [
            'producto' => $producto,
            'inventario_actual' => $inventarioActual,
            'estadisticas' => [
                'margen_ganancia' => $producto->margen_ganancia,
                'precio_con_itbis' => $producto->precio_venta_con_itbis,
                'valor_inventario_total' => $producto->valor_inventario_total,
                'stock_total' => $producto->stock_total,
                'stock_disponible_total' => $producto->stock_disponible_total,
                'stock_sucursal_actual' => $inventarioActual ? $inventarioActual->stock_actual : 0,
                'stock_disponible_sucursal_actual' => $inventarioActual ? $inventarioActual->stock_disponible : 0,
            ]
        ]);
    }

    /**
     * Mostrar formulario para editar producto
     */
    public function edit(Producto $producto)
    {
        return Inertia::render('Productos/Edit', [
            'producto' => $producto,
            'categorias' => CategoriaProducto::all(['id', 'nombre', 'codigo']),
            'proveedores' => Proveedor::where('activo', true)->get(['id', 'nombre', 'codigo']),
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)'],
                ['value' => 'EXENTO', 'label' => 'Exento'],
            ],
            'unidades_medida' => [
                ['value' => 'UNIDAD', 'label' => 'Unidad'],
                ['value' => 'PAR', 'label' => 'Par'],
                ['value' => 'JUEGO', 'label' => 'Juego'],
                ['value' => 'KILOGRAMO', 'label' => 'Kilogramo'],
                ['value' => 'GRAMO', 'label' => 'Gramo'],
                ['value' => 'LIBRA', 'label' => 'Libra'],
                ['value' => 'ONZA', 'label' => 'Onza'],
                ['value' => 'LITRO', 'label' => 'Litro'],
                ['value' => 'MILILITRO', 'label' => 'Mililitro'],
                ['value' => 'GALON', 'label' => 'Galón'],
                ['value' => 'METRO', 'label' => 'Metro'],
                ['value' => 'CENTIMETRO', 'label' => 'Centímetro'],
                ['value' => 'PULGADA', 'label' => 'Pulgada'],
                ['value' => 'CAJA', 'label' => 'Caja'],
                ['value' => 'PAQUETE', 'label' => 'Paquete'],
                ['value' => 'ROLLO', 'label' => 'Rollo'],
                ['value' => 'DOCENA', 'label' => 'Docena'],
            ]
        ]);
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:productos,codigo,' . $producto->id,
            'codigo_barras' => 'nullable|string|max:100|unique:productos,codigo_barras,' . $producto->id,
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias_productos,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0|gte:precio_compra',
            'precio_mayor' => 'nullable|numeric|min:0',
            'tasa_itbis' => 'required|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'exento_itbis' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'stock_maximo' => 'nullable|numeric|min:0',
            'control_stock' => 'boolean',
            'unidad_medida' => 'required|in:UNIDAD,PAR,JUEGO,KILOGRAMO,GRAMO,LIBRA,ONZA,LITRO,MILILITRO,GALON,METRO,CENTIMETRO,PULGADA,CAJA,PAQUETE,ROLLO,DOCENA',
            'activo' => 'boolean',
        ]);
        
        $producto->update($validated);
        
        return redirect()->route('productos.show', $producto)
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Eliminar producto
     */
    public function destroy(Producto $producto)
    {
        // Verificar si tiene ventas o movimientos de inventario
        // Aquí deberías agregar validaciones según tu lógica de negocio
        
        $producto->delete();
        
        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * API: Buscar productos para autocomplete
     */
    public function buscar(Request $request)
    {
        $search = $request->query('q', '');
        $con_stock = $request->query('con_stock', false);
        $sucursalId = $request->query('sucursal_id', auth()->user()->sucursal_id ?? 1);
        
        $query = Producto::where('activo', true)
            ->where(function($query) use ($search) {
                $query->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('codigo_barras', 'like', "%{$search}%");
            });
        
        // Si se requiere solo productos con stock
        if ($con_stock) {
            $query->whereHas('inventarios', function($q) use ($sucursalId) {
                $q->where('sucursal_id', $sucursalId)
                  ->where('stock_disponible', '>', 0);
            });
        }
        
        $productos = $query->limit(10)
            ->get(['id', 'codigo', 'nombre', 'precio_venta', 'itbis_porcentaje', 'unidad_medida']);
        
        return response()->json($productos);
    }
}