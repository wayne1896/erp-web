<?php

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
                $q->where('sucursal_id', $sucursal->id)
                  ->with('sucursal');
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
                
                // Crear inventario
                $inventario = InventarioSucursal::create([
                    'producto_id' => $producto->id,
                    'sucursal_id' => $sucursal_id,
                    'stock_actual' => $stock_inicial,
                    'stock_reservado' => 0,
                    'costo_promedio' => $costo_inicial,
                ]);
                
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
        Log::info('Producto cargado en show:', [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'inventarios' => $producto->inventarios->toArray()
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
            $q->where('sucursal_id', $sucursal->id)
              ->with('sucursal');
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
        Log::info('Cargando stock para producto:', ['id' => $producto->id, 'nombre' => $producto->nombre]);
        
        // Cargar las relaciones necesarias con eager loading
        $producto->load([
            'categoria', 
            'inventarios' => function($query) {
                $query->with('sucursal')
                      ->orderBy('sucursal_id');
            }
        ]);
        
        // Log detallado
        Log::info('Producto cargado con relaciones:', [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'categoria' => $producto->categoria ? $producto->categoria->nombre : null,
            'inventarios_count' => $producto->inventarios->count(),
            'inventarios' => $producto->inventarios->map(function($inv) {
                return [
                    'id' => $inv->id,
                    'sucursal_id' => $inv->sucursal_id,
                    'sucursal_nombre' => $inv->sucursal ? $inv->sucursal->nombre : 'No encontrada',
                    'stock_actual' => $inv->stock_actual,
                    'stock_disponible' => $inv->stock_disponible,
                    'costo_promedio' => $inv->costo_promedio,
                ];
            })->toArray()
        ]);
        
        // Obtener todas las sucursales activas
        $sucursales = Sucursal::activas()->orderBy('nombre')->get();
        
        Log::info('Sucursales encontradas:', [
            'count' => $sucursales->count(),
            'sucursales' => $sucursales->pluck('nombre')->toArray()
        ]);
        
        return Inertia::render('Productos/Stock', [
            'producto' => $producto,
            'sucursales' => $sucursales,
        ]);
    }

    /**
     * Ajustar stock del producto
     */
    /**
 * Ajustar stock del producto - VERSIÓN CORREGIDA
 */
public function ajustarStock(Request $request, Producto $producto)
{
    // Debug: Mostrar lo que llega
    \Log::info('=== AJUSTAR STOCK INICIADO ===');
    \Log::info('Producto ID:', ['id' => $producto->id]);
    \Log::info('Datos recibidos:', $request->all());
    \Log::info('Usuario:', ['id' => $request->user()->id, 'name' => $request->user()->name]);

    // Validar datos
    $validated = $request->validate([
        'sucursal_id' => 'required|exists:sucursales,id',
        'cantidad' => 'required|numeric|min:0.01',
        'tipo' => 'required|in:entrada,salida,ajuste',
        'costo' => 'nullable|numeric|min:0',
        'motivo' => 'required|string|max:255',
    ]);

    \Log::info('Datos validados:', $validated);

    $sucursal = Sucursal::find($validated['sucursal_id']);
    \Log::info('Sucursal encontrada:', [
        'id' => $sucursal->id,
        'nombre' => $sucursal->nombre,
        'activa' => $sucursal->activa
    ]);

    // Buscar inventario existente
    $inventario = InventarioSucursal::where('producto_id', $producto->id)
        ->where('sucursal_id', $sucursal->id)
        ->first();

    \Log::info('Inventario buscado:', [
        'existe' => $inventario ? 'Sí' : 'No',
        'producto_id' => $producto->id,
        'sucursal_id' => $sucursal->id
    ]);

    // Si no existe, crearlo
    if (!$inventario) {
        \Log::info('Creando nuevo inventario...');
        $inventario = new InventarioSucursal([
            'producto_id' => $producto->id,
            'sucursal_id' => $sucursal->id,
            'stock_actual' => 0,
            'stock_reservado' => 0,
            'costo_promedio' => $validated['costo'] ?? $producto->precio_compra ?? 0,
        ]);
        $inventario->save();
        \Log::info('Inventario creado:', $inventario->toArray());
    } else {
        \Log::info('Inventario existente:', [
            'stock_actual' => $inventario->stock_actual,
            'stock_disponible' => $inventario->stock_disponible,
            'costo_promedio' => $inventario->costo_promedio
        ]);
    }

    $cantidadAnterior = $inventario->stock_actual;
    \Log::info('Cantidad anterior:', ['cantidad' => $cantidadAnterior]);

    DB::beginTransaction();
    
    try {
        \Log::info('Iniciando transacción para tipo: ' . $validated['tipo']);
        
        switch ($validated['tipo']) {
            case 'entrada':
                \Log::info('Procesando ENTRADA', [
                    'cantidad' => $validated['cantidad'],
                    'costo' => $validated['costo'] ?? null
                ]);
                
                // Usar el método incrementarStock del modelo
                $inventario->incrementarStock(
                    floatval($validated['cantidad']),
                    isset($validated['costo']) ? floatval($validated['costo']) : null
                );
                break;
                
            case 'salida':
                \Log::info('Procesando SALIDA', [
                    'cantidad' => $validated['cantidad'],
                    'stock_disponible' => $inventario->stock_disponible
                ]);
                
                // Verificar stock
                if ($inventario->stock_disponible < floatval($validated['cantidad'])) {
                    throw new \Exception('Stock insuficiente. Disponible: ' . $inventario->stock_disponible);
                }
                
                // Usar el método decrementarStock del modelo
                $inventario->decrementarStock(floatval($validated['cantidad']));
                break;
                
            case 'ajuste':
                \Log::info('Procesando AJUSTE', [
                    'nuevo_stock' => $validated['cantidad'],
                    'stock_anterior' => $cantidadAnterior
                ]);
                
                $inventario->stock_actual = floatval($validated['cantidad']);
                $inventario->save();
                break;
        }

        // Forzar recálculo de campos calculados
        $inventario->refresh();
        \Log::info('Inventario actualizado:', [
            'stock_actual' => $inventario->stock_actual,
            'stock_disponible' => $inventario->stock_disponible,
            'costo_promedio' => $inventario->costo_promedio,
            'valor_inventario' => $inventario->valor_inventario
        ]);

        // Registrar movimiento
        $movimiento = MovimientoInventario::create([
            'producto_id' => $producto->id,
            'sucursal_id' => $sucursal->id,
            'usuario_id' => $request->user()->id,
            'tipo' => $validated['tipo'],
            'cantidad' => floatval($validated['cantidad']),
            'cantidad_anterior' => $cantidadAnterior,
            'cantidad_nueva' => $inventario->stock_actual,
            'costo' => $inventario->costo_promedio,
            'motivo' => $validated['motivo'],
            'referencia' => 'AJUSTE_MANUAL_' . now()->format('YmdHis'),
        ]);

        \Log::info('Movimiento registrado:', $movimiento->toArray());
        
        DB::commit();
        \Log::info('=== TRANSACCIÓN COMPLETADA CON ÉXITO ===');

        // Retornar respuesta Inertia correctamente
        return back()->with([
            'success' => 'Stock ajustado correctamente',
            'inventario_actualizado' => [
                'stock_actual' => $inventario->stock_actual,
                'stock_disponible' => $inventario->stock_disponible,
                'costo_promedio' => $inventario->costo_promedio
            ]
        ]);
                
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error al ajustar stock: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'producto_id' => $producto->id,
            'sucursal_id' => $sucursal->id
        ]);
        
        return back()->with('error', 'Error al ajustar stock: ' . $e->getMessage());
    }
}
    /**
 * Buscar productos para autocompletado
 */
    public function buscar(Request $request)
    {
        $termino = $request->get('q', '');
        
        if (strlen($termino) < 2) {
            return response()->json([]);
        }
        
        $productos = Producto::where('nombre', 'like', "%{$termino}%")
            ->orWhere('codigo', 'like', "%{$termino}%")
            ->orWhere('codigo_barras', 'like', "%{$termino}%")
            ->activos()
            ->with(['categoria', 'inventarios'])
            ->limit(20)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'nombre' => $producto->nombre,
                    'precio_venta' => $producto->precio_venta,
                    'precio_venta_con_itbis' => $producto->precio_venta_con_itbis,
                    'unidad_medida' => $producto->unidad_medida,
                    'unidad_medida_texto' => $producto->unidad_medida_texto,
                    'stock_total' => $producto->stock_total,
                    'stock_disponible_total' => $producto->stock_disponible_total,
                    'control_stock' => $producto->control_stock,
                    'categoria' => $producto->categoria ? $producto->categoria->nombre : null,
                ];
            });
        
        return response()->json($productos);
    }
    /**
 * Transferir stock entre sucursales
 */
public function transferirStock(Request $request, Producto $producto)
{
    \Log::info('=== TRANSFERIR STOCK INICIADO ===');
    \Log::info('Producto:', [
        'id' => $producto->id,
        'nombre' => $producto->nombre,
        'unidad_medida' => $producto->unidad_medida
    ]);
    
    \Log::info('Datos recibidos:', $request->all());
    \Log::info('Usuario:', ['id' => $request->user()->id, 'name' => $request->user()->name]);

    try {
        // Validar datos
        $validated = $request->validate([
            'sucursal_origen_id' => 'required|exists:sucursales,id',
            'sucursal_destino_id' => 'required|exists:sucursales,id|different:sucursal_origen_id',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:500',
        ]);

        \Log::info('Datos validados:', $validated);

        // Obtener sucursales
        $sucursalOrigen = Sucursal::findOrFail($validated['sucursal_origen_id']);
        $sucursalDestino = Sucursal::findOrFail($validated['sucursal_destino_id']);

        \Log::info('Sucursales encontradas:', [
            'origen' => ['id' => $sucursalOrigen->id, 'nombre' => $sucursalOrigen->nombre],
            'destino' => ['id' => $sucursalDestino->id, 'nombre' => $sucursalDestino->nombre]
        ]);

        // Buscar inventarios
        $inventarioOrigen = InventarioSucursal::where('producto_id', $producto->id)
            ->where('sucursal_id', $sucursalOrigen->id)
            ->first();

        $inventarioDestino = InventarioSucursal::where('producto_id', $producto->id)
            ->where('sucursal_id', $sucursalDestino->id)
            ->first();

        \Log::info('Inventarios encontrados:', [
            'origen' => $inventarioOrigen ? [
                'id' => $inventarioOrigen->id,
                'stock_actual' => $inventarioOrigen->stock_actual,
                'stock_disponible' => $inventarioOrigen->stock_disponible,
                'costo_promedio' => $inventarioOrigen->costo_promedio
            ] : null,
            'destino' => $inventarioDestino ? [
                'id' => $inventarioDestino->id,
                'stock_actual' => $inventarioDestino->stock_actual,
                'stock_disponible' => $inventarioDestino->stock_disponible,
                'costo_promedio' => $inventarioDestino->costo_promedio
            ] : null
        ]);

        // Si no existe inventario en origen, crear uno con stock 0
        if (!$inventarioOrigen) {
            \Log::info('Creando inventario en origen (stock 0)...');
            $inventarioOrigen = InventarioSucursal::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalOrigen->id,
                'stock_actual' => 0,
                'stock_reservado' => 0,
                'costo_promedio' => $producto->precio_compra ?? 0,
            ]);
            \Log::info('Inventario origen creado:', $inventarioOrigen->toArray());
        }

        // Verificar stock disponible en origen
        $cantidadTransferir = floatval($validated['cantidad']);
        $stockDisponibleOrigen = floatval($inventarioOrigen->stock_disponible);
        
        \Log::info('Verificando stock:', [
            'cantidad_a_transferir' => $cantidadTransferir,
            'stock_disponible_origen' => $stockDisponibleOrigen
        ]);

        if ($stockDisponibleOrigen < $cantidadTransferir) {
            \Log::error('Stock insuficiente en origen', [
                'disponible' => $stockDisponibleOrigen,
                'requerido' => $cantidadTransferir
            ]);
            return back()->with('error', 'Stock insuficiente en sucursal de origen. Disponible: ' . $stockDisponibleOrigen . ' ' . $producto->unidad_medida);
        }

        // Si no existe inventario en destino, crearlo
        if (!$inventarioDestino) {
            \Log::info('Creando inventario en destino...');
            $inventarioDestino = InventarioSucursal::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalDestino->id,
                'stock_actual' => 0,
                'stock_reservado' => 0,
                'costo_promedio' => $inventarioOrigen->costo_promedio,
            ]);
            \Log::info('Inventario destino creado:', $inventarioDestino->toArray());
        }

        // Registrar cantidades anteriores
        $cantidadAnteriorOrigen = floatval($inventarioOrigen->stock_actual);
        $cantidadAnteriorDestino = floatval($inventarioDestino->stock_actual);

        \Log::info('Cantidades anteriores:', [
            'origen' => $cantidadAnteriorOrigen,
            'destino' => $cantidadAnteriorDestino
        ]);

        DB::beginTransaction();
        
        try {
            \Log::info('Iniciando transacción de transferencia...');

            // Realizar transferencia: decrementar en origen
            \Log::info('Decrementando stock en origen...');
            $inventarioOrigen->decrementarStock($cantidadTransferir);
            
            // Refrescar para obtener valores actualizados
            $inventarioOrigen->refresh();
            
            \Log::info('Stock origen después de decrementar:', [
                'stock_actual' => $inventarioOrigen->stock_actual,
                'stock_disponible' => $inventarioOrigen->stock_disponible
            ]);

            // Realizar transferencia: incrementar en destino
            \Log::info('Incrementando stock en destino...');
            $inventarioDestino->incrementarStock($cantidadTransferir, $inventarioOrigen->costo_promedio);
            
            // Refrescar para obtener valores actualizados
            $inventarioDestino->refresh();
            
            \Log::info('Stock destino después de incrementar:', [
                'stock_actual' => $inventarioDestino->stock_actual,
                'stock_disponible' => $inventarioDestino->stock_disponible,
                'costo_promedio' => $inventarioDestino->costo_promedio
            ]);

            // Verificar que el usuario existe antes de crear movimientos
            if (!\App\Models\User::where('id', $request->user()->id)->exists()) {
                throw new \Exception("El usuario con ID {$request->user()->id} no existe en la base de datos");
            }

            // Registrar movimiento en origen (salida)
            \Log::info('Registrando movimiento en origen...');
            $movimientoOrigen = MovimientoInventario::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalOrigen->id,
                'usuario_id' => $request->user()->id,
                'tipo' => 'salida',
                'cantidad' => $cantidadTransferir,
                'cantidad_anterior' => $cantidadAnteriorOrigen,
                'cantidad_nueva' => floatval($inventarioOrigen->stock_actual),
                'costo' => floatval($inventarioOrigen->costo_promedio),
                'motivo' => 'Transferencia a ' . $sucursalDestino->nombre . ' - ' . $validated['motivo'],
                'referencia' => 'TRANSFERENCIA_' . now()->format('YmdHis'),
            ]);
            
            \Log::info('Movimiento origen creado:', $movimientoOrigen->toArray());

            // Registrar movimiento en destino (entrada)
            \Log::info('Registrando movimiento en destino...');
            $movimientoDestino = MovimientoInventario::create([
                'producto_id' => $producto->id,
                'sucursal_id' => $sucursalDestino->id,
                'usuario_id' => $request->user()->id,
                'tipo' => 'entrada',
                'cantidad' => $cantidadTransferir,
                'cantidad_anterior' => $cantidadAnteriorDestino,
                'cantidad_nueva' => floatval($inventarioDestino->stock_actual),
                'costo' => floatval($inventarioDestino->costo_promedio),
                'motivo' => 'Transferencia desde ' . $sucursalOrigen->nombre . ' - ' . $validated['motivo'],
                'referencia' => 'TRANSFERENCIA_' . now()->format('YmdHis'),
            ]);
            
            \Log::info('Movimiento destino creado:', $movimientoDestino->toArray());

            DB::commit();
            
            \Log::info('=== TRANSFERENCIA COMPLETADA CON ÉXITO ===');
            \Log::info('Resumen transferencia:', [
                'producto' => $producto->nombre,
                'origen' => $sucursalOrigen->nombre,
                'destino' => $sucursalDestino->nombre,
                'cantidad' => $cantidadTransferir,
                'unidad' => $producto->unidad_medida,
                'nuevo_stock_origen' => $inventarioOrigen->stock_actual,
                'nuevo_stock_destino' => $inventarioDestino->stock_actual
            ]);

            $mensajeExito = sprintf(
                'Transferencia realizada exitosamente. %s %s transferidos de %s a %s.',
                $cantidadTransferir,
                $producto->unidad_medida,
                $sucursalOrigen->nombre,
                $sucursalDestino->nombre
            );

            return back()->with([
                'success' => $mensajeExito,
                'transferencia' => [
                    'origen' => $sucursalOrigen->nombre,
                    'destino' => $sucursalDestino->nombre,
                    'cantidad' => $cantidadTransferir,
                    'unidad' => $producto->unidad_medida,
                    'nuevo_stock_origen' => $inventarioOrigen->stock_actual,
                    'nuevo_stock_destino' => $inventarioDestino->stock_actual
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en transacción de transferencia: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'producto_id' => $producto->id,
                'sucursal_origen_id' => $sucursalOrigen->id,
                'sucursal_destino_id' => $sucursalDestino->id
            ]);
            
            throw $e;
        }

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Error de validación en transferencia: ' . json_encode($e->errors()));
        return back()->withErrors($e->errors())->withInput();
        
    } catch (\Illuminate\Database\QueryException $e) {
        \Log::error('Error de base de datos en transferencia: ' . $e->getMessage(), [
            'sql' => $e->getSql(),
            'bindings' => $e->getBindings()
        ]);
        return back()->with('error', 'Error de base de datos: ' . $e->getMessage());
        
    } catch (\Exception $e) {
        \Log::error('Error general en transferencia: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        return back()->with('error', 'Error al realizar la transferencia: ' . $e->getMessage());
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
                $q->where('sucursal_id', $sucursal->id)
                  ->with('sucursal');
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
     * Debug endpoint para verificar datos
     */
    public function debugStock(Producto $producto)
    {
        // Cargar todas las relaciones
        $producto->load([
            'categoria',
            'inventarios.sucursal',
            'inventarios.producto'
        ]);
        
        // Obtener inventarios por separado
        $inventarios = InventarioSucursal::where('producto_id', $producto->id)
            ->with(['sucursal', 'producto'])
            ->get();
        
        return response()->json([
            'producto' => $producto,
            'inventarios_directos' => $inventarios,
            'sucursales' => Sucursal::activas()->get(),
            'relationships' => [
                'has_inventarios' => $producto->inventarios()->exists(),
                'inventarios_count' => $producto->inventarios()->count(),
                'inventarios_list' => $producto->inventarios->pluck('id')
            ],
            'database_check' => [
                'productos_table' => DB::table('productos')->where('id', $producto->id)->first(),
                'inventario_sucursal_table' => DB::table('inventario_sucursal')
                    ->where('producto_id', $producto->id)
                    ->get()
            ]
        ]);
    }
}