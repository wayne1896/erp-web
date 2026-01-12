<?php
// app/Http/Controllers/Web/CategoriaController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CategoriaProducto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    /**
     * Mostrar lista de categorías
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        
        $categorias = CategoriaProducto::withCount('productos')
            ->when($search, function($query, $search) {
                return $query->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias,
            'filters' => $request->only(['search', 'per_page']),
            'stats' => [
                'total' => CategoriaProducto::count(),
                'con_productos' => CategoriaProducto::has('productos')->count(),
                'itbis_18' => CategoriaProducto::where('itbis_porcentaje', 18.00)->count(),
            ]
        ]);
    }

    /**
     * Mostrar formulario para crear categoría
     */
    public function create()
    {
        return Inertia::render('Categorias/Create', [
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)'],
                ['value' => 'EXENTO', 'label' => 'Exento'],
            ],
            'porcentajes_itbis' => [
                ['value' => 0, 'label' => '0%'],
                ['value' => 16, 'label' => '16%'],
                ['value' => 18, 'label' => '18%'],
            ]
        ]);
    }

    /**
     * Guardar nueva categoría
     */
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

    /**
     * Mostrar detalles de categoría
     */
    public function show(CategoriaProducto $categoria)
    {
        $categoria->load(['productos' => function($query) {
            $query->where('activo', true)->limit(10);
        }]);
        
        return Inertia::render('Categorias/Show', [
            'categoria' => $categoria,
            'productos' => $categoria->productos,
            'estadisticas' => [
                'total_productos' => $categoria->productos()->count(),
                'productos_activos' => $categoria->productos()->where('activo', true)->count(),
                'valor_inventario' => 0, // Se calculará cuando tengamos productos
            ]
        ]);
    }

    /**
     * Mostrar formulario para editar categoría
     */
    public function edit(CategoriaProducto $categoria)
    {
        return Inertia::render('Categorias/Edit', [
            'categoria' => $categoria,
            'tasas_itbis' => [
                ['value' => 'ITBIS1', 'label' => 'ITBIS 18% (General)'],
                ['value' => 'ITBIS2', 'label' => 'ITBIS 16% (Turismo)'],
                ['value' => 'ITBIS3', 'label' => 'ITBIS 0% (Selectivos)'],
                ['value' => 'EXENTO', 'label' => 'Exento'],
            ],
            'porcentajes_itbis' => [
                ['value' => 0, 'label' => '0%'],
                ['value' => 16, 'label' => '16%'],
                ['value' => 18, 'label' => '18%'],
            ]
        ]);
    }

    /**
     * Actualizar categoría
     */
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

    /**
     * Eliminar categoría
     */
    public function destroy(CategoriaProducto $categoria)
    {
        // Verificar si tiene productos asociados
        if ($categoria->productos()->count() > 0) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar la categoría porque tiene productos asociados.');
        }
        
        $categoria->delete();
        
        return redirect()->route('categorias.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }
    
    /**
     * API: Buscar categorías para autocomplete
     */
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