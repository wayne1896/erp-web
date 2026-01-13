<?php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CategoriaProducto;
use App\Models\Producto;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        
        $categorias = CategoriaProducto::withCount('productos')
            ->when($search, function($query, $search) {
                return $query->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%")
                            ->orWhere('descripcion', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        $stats = [
            'total' => CategoriaProducto::count(),
            'con_productos' => CategoriaProducto::has('productos')->count(),
            'itbis_18' => CategoriaProducto::where('tasa_itbis', 'ITBIS1')->count(),
            'itbis_16' => CategoriaProducto::where('tasa_itbis', 'ITBIS2')->count(),
            'itbis_0' => CategoriaProducto::where('tasa_itbis', 'ITBIS3')->count(),
            'exento' => CategoriaProducto::where('tasa_itbis', 'EXENTO')->count(),
        ];
        
        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias,
            'filters' => $request->only(['search', 'per_page']),
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('Categorias/Create', [
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)', 'porcentaje' => 18],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)', 'porcentaje' => 16],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)', 'porcentaje' => 0],
                ['value' => 'EXENTO', 'label' => 'Exento', 'porcentaje' => 0],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias_productos,nombre',
            'codigo' => 'required|string|max:10|unique:categorias_productos,codigo',
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'tasa_itbis' => 'required|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'descripcion' => 'nullable|string',
        ]);
        
        CategoriaProducto::create($validated);
        
        return redirect()->route('categorias.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    public function show(CategoriaProducto $categoria)
    {
        // Cargar productos de esta categoría con sus relaciones
        // IMPORTANTE: Si no tienes la relación proveedor, no la cargues
        $productos = $categoria->productos()
            ->with([
                'categoria',
                'inventarios.sucursal'
                // 'proveedor' // REMOVER si no existe la relación
            ])
            ->where('activo', true)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        // Si necesitas estadísticas de la categoría
        $estadisticas = [
            'total_productos' => $categoria->productos()->count(),
            'productos_activos' => $categoria->productos()->where('activo', true)->count(),
            'valor_inventario_total' => $productos->sum(function($producto) {
                return $producto->inventarios->sum('valor_inventario') ?? 0;
            }),
            'stock_total' => $productos->sum(function($producto) {
                return $producto->inventarios->sum('stock_disponible') ?? 0;
            }),
        ];
        
        return Inertia::render('Categorias/Show', [
            'categoria' => $categoria,
            'productos' => $productos,
            'estadisticas' => $estadisticas,
        ]);
    }

    public function edit(CategoriaProducto $categoria)
    {
        $categoria->loadCount('productos');
        
        return Inertia::render('Categorias/Edit', [
            'categoria' => $categoria,
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)', 'porcentaje' => 18],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)', 'porcentaje' => 16],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)', 'porcentaje' => 0],
                ['value' => 'EXENTO', 'label' => 'Exento', 'porcentaje' => 0],
            ],
        ]);
    }

    public function update(Request $request, CategoriaProducto $categoria)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias_productos,nombre,' . $categoria->id,
            'codigo' => 'required|string|max:10|unique:categorias_productos,codigo,' . $categoria->id,
            'itbis_porcentaje' => 'required|numeric|min:0|max:100',
            'tasa_itbis' => 'required|in:ITBIS1,ITBIS2,ITBIS3,EXENTO',
            'descripcion' => 'nullable|string',
        ]);
        
        $categoria->update($validated);
        
        return redirect()->route('categorias.show', $categoria)
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(CategoriaProducto $categoria)
    {
        if ($categoria->productos()->count() > 0) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar la categoría porque tiene productos asociados.');
        }
        
        $categoria->delete();
        
        return redirect()->route('categorias.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }
    
    public function buscar(Request $request)
    {
        $search = $request->query('q', '');
        
        $categorias = CategoriaProducto::where(function($query) use ($search) {
                $query->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'nombre', 'codigo', 'itbis_porcentaje', 'tasa_itbis']);
        
        return response()->json($categorias);
    }
}