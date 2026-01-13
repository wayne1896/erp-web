<?php
// app/Http\Controllers/Web/ProveedorController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProveedorController extends Controller
{
    /**
     * Mostrar lista de proveedores
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        
        $proveedores = Proveedor::withCount('productos')
            ->when($search, function($query, $search) {
                return $query->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%")
                            ->orWhere('rnc', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return Inertia::render('Proveedores/Index', [
            'proveedores' => $proveedores,
            'filters' => $request->only(['search', 'per_page']),
            'stats' => [
                'total' => Proveedor::count(),
                'activos' => Proveedor::where('activo', true)->count(),
                'locales' => Proveedor::where('tipo_proveedor', 'LOCAL')->count(),
                'internacionales' => Proveedor::where('tipo_proveedor', 'INTERNACIONAL')->count(),
            ]
        ]);
    }

    /**
     * Mostrar formulario para crear proveedor
     */
    public function create()
{
    return Inertia::render('Proveedores/Create', [
        'tipos_proveedor' => [
            ['value' => 'LOCAL', 'label' => 'Local'],
            ['value' => 'INTERNACIONAL', 'label' => 'Internacional'],
        ],
    ]);
}

    /**
     * Guardar nuevo proveedor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:proveedores,codigo',
            'nombre' => 'required|string|max:255',
            'rnc' => 'nullable|string|max:11|unique:proveedores,rnc',
            'telefono' => 'required|string|max:10',
            'email' => 'nullable|email|max:255',
            'direccion' => 'required|string',
            'contacto_nombre' => 'nullable|string|max:255',
            'contacto_telefono' => 'nullable|string|max:10',
            'tipo_proveedor' => 'required|in:LOCAL,INTERNACIONAL',
            'dias_credito' => 'nullable|integer|min:0',
            'limite_credito' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);
        
        Proveedor::create($validated);
        
        return redirect()->route('proveedores.index')
            ->with('success', 'Proveedor creado exitosamente.');
    }

    /**
     * Mostrar detalles de proveedor
     */
    public function show(Proveedor $proveedor)
    {
        $proveedor->load(['productos' => function($query) {
            $query->where('activo', true)->limit(10);
        }]);
        
        return Inertia::render('Proveedores/Show', [
            'proveedor' => $proveedor,
            'productos' => $proveedor->productos,
            'estadisticas' => [
                'total_productos' => $proveedor->productos()->count(),
                'productos_activos' => $proveedor->productos()->where('activo', true)->count(),
                'valor_inventario' => $proveedor->productos()->sum('precio_compra'), // Ajustar según stock real
            ]
        ]);
    }

    /**
     * Mostrar formulario para editar proveedor
     */
    public function edit(Proveedor $proveedor)
    {
        return Inertia::render('Proveedores/Edit', [
            'proveedor' => $proveedor,
            'tipos_proveedor' => [
                ['value' => 'LOCAL', 'label' => 'Local'],
                ['value' => 'INTERNACIONAL', 'label' => 'Internacional'],
            ],
        ]);
    }

    /**
     * Actualizar proveedor
     */
    public function update(Request $request, Proveedor $proveedor)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:proveedores,codigo,' . $proveedor->id,
            'nombre' => 'required|string|max:255',
            'rnc' => 'nullable|string|max:11|unique:proveedores,rnc,' . $proveedor->id,
            'telefono' => 'required|string|max:10',
            'email' => 'nullable|email|max:255',
            'direccion' => 'required|string',
            'contacto_nombre' => 'nullable|string|max:255',
            'contacto_telefono' => 'nullable|string|max:10',
            'tipo_proveedor' => 'required|in:LOCAL,INTERNACIONAL',
            'dias_credito' => 'nullable|integer|min:0',
            'limite_credito' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);
        
        $proveedor->update($validated);
        
        return redirect()->route('proveedores.show', $proveedor)
            ->with('success', 'Proveedor actualizado exitosamente.');
    }

    /**
     * Eliminar proveedor
     */
    public function destroy(Proveedor $proveedor)
    {
        // Verificar si tiene productos asociados
        if ($proveedor->productos()->count() > 0) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar el proveedor porque tiene productos asociados.');
        }
        
        $proveedor->delete();
        
        return redirect()->route('proveedores.index')
            ->with('success', 'Proveedor eliminado exitosamente.');
    }

    /**
     * API: Buscar proveedores para autocomplete
     */
    public function buscar(Request $request)
    {
        $search = $request->query('q', '');
        
        $proveedores = Proveedor::where('activo', true)
            ->where(function($query) use ($search) {
                $query->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('rnc', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'codigo', 'nombre', 'rnc', 'telefono', 'email']);
        
        return response()->json($proveedores);
    }
}