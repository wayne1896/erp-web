<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Venta;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{
    /**
     * Mostrar lista de clientes
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        
        $clientes = Cliente::when($search, function($query, $search) {
                return $query->where('nombre_completo', 'like', "%{$search}%")
                            ->orWhere('cedula_rnc', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'per_page']),
            'stats' => [
                'total' => Cliente::count(),
                'activos' => Cliente::where('activo', true)->count(),
                'con_credito' => Cliente::where('limite_credito', '>', 0)->count(),
            ]
        ]);
    }

    /**
     * Mostrar formulario para crear cliente
     */
    public function create()
    {
        return Inertia::render('Clientes/Create', [
            'tipos_cliente' => ['NATURAL', 'JURIDICO'],
            'tipos_contribuyente' => ['CONSUMIDOR_FINAL', 'CREDITO_FISCAL', 'GUBERNAMENTAL'],
            'provincias' => [
                'Distrito Nacional',
                'Santo Domingo',
                'Santiago',
                'La Vega',
                'San Cristóbal',
                'La Altagracia',
                'San Pedro de Macorís',
                'Puerto Plata',
                'Duarte',
                'Espaillat',
                'San Juan',
                'Azua',
                'Barahona',
                'Valverde',
                'María Trinidad Sánchez',
                'El Seibo',
                'Hato Mayor',
                'Monte Plata',
                'Pedernales',
                'Independencia',
                'San José de Ocoa',
                'Monte Cristi',
                'Sánchez Ramírez',
                'Peravia',
                'Samaná',
                'Santiago Rodríguez',
                'Dajabón',
                'Elías Piña',
                'Baoruco',
                'Hermanas Mirabal',
                'Monseñor Nouel',
                'La Romana',
                'Sanchez Ramirez'
            ]
        ]);
    }

    /**
     * Guardar nuevo cliente
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:clientes,codigo',
            'tipo_cliente' => 'required|in:NATURAL,JURIDICO',
            'nombre_completo' => 'required|string|max:255',
            'cedula_rnc' => 'required|string|max:20|unique:clientes,cedula_rnc',
            'telefono' => 'required|string|max:10',
            'telefono_alternativo' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'direccion' => 'required|string',
            'provincia' => 'required|string',
            'municipio' => 'required|string',
            'sector' => 'required|string',
            'tipo_contribuyente' => 'required|in:CONSUMIDOR_FINAL,CREDITO_FISCAL,GUBERNAMENTAL',
            'limite_credito' => 'nullable|numeric|min:0',
            'dias_credito' => 'nullable|integer|min:0',
            'descuento' => 'nullable|numeric|min:0|max:100',
            'activo' => 'boolean',
        ]);
        
        Cliente::create($validated);
        
        return redirect()->route('clientes.index')
            ->with('success', 'Cliente creado exitosamente.');
    }

    /**
     * Mostrar detalles de cliente
     */
    public function show(Cliente $cliente)
    {
        $ventas_recientes = Venta::where('cliente_id', $cliente->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        $estadisticas = [
            'total_ventas' => Venta::where('cliente_id', $cliente->id)->count(),
            'monto_total' => Venta::where('cliente_id', $cliente->id)->sum('total'),
            'saldo_actual' => $cliente->saldo_pendiente,
        ];
        
        return Inertia::render('Clientes/Show', [
            'cliente' => $cliente,
            'ventas_recientes' => $ventas_recientes,
            'estadisticas' => $estadisticas,
        ]);
    }

    /**
     * Mostrar formulario para editar cliente
     */
    public function edit(Cliente $cliente)
    {
        return Inertia::render('Clientes/Edit', [
            'cliente' => $cliente,
            'tipos_cliente' => ['NATURAL', 'JURIDICO'],
            'tipos_contribuyente' => ['CONSUMIDOR_FINAL', 'CREDITO_FISCAL', 'GUBERNAMENTAL'],
            'provincias' => [
                'Distrito Nacional',
                'Santo Domingo',
                'Santiago',
                'La Vega',
                'San Cristóbal',
                'La Altagracia',
                'San Pedro de Macorís',
                'Puerto Plata',
                'Duarte',
                'Espaillat',
                'San Juan',
                'Azua',
                'Barahona',
                'Valverde',
                'María Trinidad Sánchez',
                'El Seibo',
                'Hato Mayor',
                'Monte Plata',
                'Pedernales',
                'Independencia',
                'San José de Ocoa',
                'Monte Cristi',
                'Sánchez Ramírez',
                'Peravia',
                'Samaná',
                'Santiago Rodríguez',
                'Dajabón',
                'Elías Piña',
                'Baoruco',
                'Hermanas Mirabal',
                'Monseñor Nouel',
                'La Romana',
                'Sanchez Ramirez'
            ]
        ]);
    }

    /**
     * Actualizar cliente
     */
    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:clientes,codigo,' . $cliente->id,
            'tipo_cliente' => 'required|in:NATURAL,JURIDICO',
            'nombre_completo' => 'required|string|max:255',
            'cedula_rnc' => 'required|string|max:20|unique:clientes,cedula_rnc,' . $cliente->id,
            'telefono' => 'required|string|max:10',
            'telefono_alternativo' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'direccion' => 'required|string',
            'provincia' => 'required|string',
            'municipio' => 'required|string',
            'sector' => 'required|string',
            'tipo_contribuyente' => 'required|in:CONSUMIDOR_FINAL,CREDITO_FISCAL,GUBERNAMENTAL',
            'limite_credito' => 'nullable|numeric|min:0',
            'dias_credito' => 'nullable|integer|min:0',
            'descuento' => 'nullable|numeric|min:0|max:100',
            'activo' => 'boolean',
        ]);
        
        $cliente->update($validated);
        
        return redirect()->route('clientes.show', $cliente)
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    /**
     * Eliminar cliente
     */
    public function destroy(Cliente $cliente)
    {
        $cliente->delete();
        
        return redirect()->route('clientes.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * API: Buscar clientes para autocomplete (VENTAS)
     */
    public function buscar(Request $request)
    {
        Log::info('Buscando clientes para ventas', [
            'query' => $request->get('q'),
            'modo' => $request->get('modo', 'nombre'),
            'user_id' => auth()->id()
        ]);

        $query = $request->get('q');
        $modo = $request->get('modo', 'nombre');
        
        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $clientes = Cliente::where('activo', true)
            ->when($modo === 'cedula', function($q) use ($query) {
                return $q->where('cedula_rnc', 'like', "%{$query}%");
            })
            ->when($modo === 'email', function($q) use ($query) {
                return $q->where('email', 'like', "%{$query}%");
            })
            ->when($modo === 'nombre', function($q) use ($query) {
                return $q->where('nombre_completo', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get()
            ->map(function($cliente) {
                return [
                    'id' => $cliente->id,
                    'codigo' => $cliente->codigo,
                    'tipo' => $cliente->tipo_cliente === 'NATURAL' ? 'FISICA' : 'JURIDICA',
                    'tipo_cliente' => $cliente->tipo_cliente,
                    'cedula' => $cliente->cedula_rnc,
                    'cedula_rnc' => $cliente->cedula_rnc,
                    'nombre_completo' => $cliente->nombre_completo,
                    'email' => $cliente->email,
                    'telefono' => $cliente->telefono,
                    'direccion' => $cliente->direccion,
                    'limite_credito' => $cliente->limite_credito,
                    'saldo_pendiente' => $cliente->saldo_pendiente,
                ];
            });

        Log::info('Clientes encontrados', ['count' => $clientes->count()]);
            
        return response()->json($clientes);
    }
/**
 * Reporte de clientes
 */
public function reporteClientes()
{
    $clientes = Cliente::with(['ventas'])
        ->orderBy('nombre_completo')
        ->paginate(20);
    
    return Inertia::render('Clientes/Reporte', [
        'clientes' => $clientes,
    ]);
}
    /**
     * API: Crear cliente rápido desde ventas
     */
    public function storeApi(Request $request)
    {
        Log::info('Creando cliente desde API', $request->all());

        $request->validate([
            'tipo' => 'required|in:FISICA,JURIDICA',
            'cedula' => 'required|string|max:20|unique:clientes,cedula_rnc',
            'nombre_completo' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:500',
        ]);

        try {
            // Generar código único
            $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
            $numero = $ultimoCliente ? intval(preg_replace('/[^0-9]/', '', $ultimoCliente->codigo)) + 1 : 1;
            $codigo = 'CLI' . str_pad($numero, 6, '0', STR_PAD_LEFT);

            $cliente = Cliente::create([
                'codigo' => $codigo,
                'tipo_cliente' => $request->tipo === 'FISICA' ? 'NATURAL' : 'JURIDICO',
                'nombre_completo' => $request->nombre_completo,
                'cedula_rnc' => $request->cedula,
                'email' => $request->email,
                'telefono' => $request->telefono,
                'direccion' => $request->direccion,
                'provincia' => 'Distrito Nacional',
                'municipio' => 'Santo Domingo',
                'sector' => 'Centro',
                'tipo_contribuyente' => 'CONSUMIDOR_FINAL',
                'activo' => true,
                'limite_credito' => 0,
                'dias_credito' => 0,
                'descuento' => 0,
            ]);

            Log::info('Cliente creado exitosamente', ['cliente_id' => $cliente->id]);

            return response()->json([
                'success' => true,
                'cliente' => [
                    'id' => $cliente->id,
                    'codigo' => $cliente->codigo,
                    'tipo' => $cliente->tipo_cliente === 'NATURAL' ? 'FISICA' : 'JURIDICA',
                    'tipo_cliente' => $cliente->tipo_cliente,
                    'cedula' => $cliente->cedula_rnc,
                    'cedula_rnc' => $cliente->cedula_rnc,
                    'nombre_completo' => $cliente->nombre_completo,
                    'email' => $cliente->email,
                    'telefono' => $cliente->telefono,
                    'direccion' => $cliente->direccion,
                ],
                'message' => 'Cliente creado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error creando cliente desde API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente: ' . $e->getMessage()
            ], 500);
        }
    }
}