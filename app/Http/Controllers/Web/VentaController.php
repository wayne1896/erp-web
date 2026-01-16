<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Caja;
use App\Models\InventarioSucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class VentaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $query = Venta::with(['cliente', 'vendedor'])
            ->where('sucursal_id', $sucursalId);
            
        // Filtros
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('condicion_pago') && $request->condicion_pago) {
            $query->where('condicion_pago', $request->condicion_pago);
        }
        
        if ($request->has('fecha_inicio') && $request->fecha_inicio) {
            // Usar Carbon para manejo correcto de datetime
            $query->where('fecha_venta', '>=', Carbon::parse($request->fecha_inicio)->startOfDay());
        }
        
        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->where('fecha_venta', '<=', Carbon::parse($request->fecha_fin)->endOfDay());
        }
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_factura', 'like', "%{$search}%")
                  ->orWhere('ncf', 'like', "%{$search}%")
                  ->orWhereHas('cliente', function($q) use ($search) {
                      $q->where('nombre_completo', 'like', "%{$search}%")
                        ->orWhere('cedula_rnc', 'like', "%{$search}%");
                  });
            });
        }
        
        $ventas = $query->orderBy('fecha_venta', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        return Inertia::render('Ventas/Index', [
            'ventas' => $ventas,
            'filtros' => $request->only(['search', 'estado', 'condicion_pago', 'fecha_inicio', 'fecha_fin']),
            'estados' => ['PENDIENTE', 'PROCESADA', 'ANULADA'],
            'condicionesPago' => ['CONTADO', 'CREDITO'],
        ]);
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Verificar caja abierta
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->whereNull('fecha_cierre')
            ->first();
            
        if (!$caja) {
            return redirect()->route('cajas.index')
                ->with('error', 'Debe abrir una caja antes de realizar ventas');
        }
        
        return Inertia::render('Ventas/Create', [
            'tiposComprobante' => ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
            'condicionesPago' => ['CONTADO', 'CREDITO'],
            'caja' => $caja,
            'clienteDefault' => null,
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación mejorada para datetime
        $request->validate([
            'tipo_comprobante' => 'required|in:FACTURA,NOTA_CREDITO,NOTA_DEBITO',
            'cliente_id' => 'nullable|exists:clientes,id',
            'condicion_pago' => 'required|in:CONTADO,CREDITO',
            'tipo_pago' => 'required|in:EFECTIVO,TARJETA_DEBITO,TARJETA_CREDITO,TRANSFERENCIA,CHEQUE,PAGO_MOVIL,CREDITO',
            'dias_credito' => 'required_if:condicion_pago,CREDITO|integer|min:0',
            'fecha_venta' => 'required|date', // Mejor usar date para mayor flexibilidad
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|numeric|min:0.01',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
            'productos.*.descuento' => 'required|numeric|min:0|max:100',
            'descuento_global' => 'required|numeric|min:0|max:100',
            'notas' => 'nullable|string|max:500',
        ]);
        
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Verificar caja abierta
        $caja = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->whereNull('fecha_cierre')
            ->first();
            
        if (!$caja) {
            return response()->json([
                'success' => false,
                'message' => 'No hay caja abierta. Por favor, abre una caja antes de realizar ventas.'
            ], 400);
        }
        
        // Si no hay cliente_id, usar cliente genérico (Consumidor Final)
        if (!$request->cliente_id) {
            $clienteGenerico = Cliente::where('cedula_rnc', '000-0000000-0')->first();
            
            if (!$clienteGenerico) {
                $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
                $codigo = $ultimoCliente ? 'CLI' . str_pad($ultimoCliente->id + 1, 6, '0', STR_PAD_LEFT) : 'CLI000001';    
                
                try {
                    $clienteGenerico = Cliente::create([
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
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error al crear cliente genérico: ' . $e->getMessage()
                    ], 500);
                }
            }
            
            $clienteId = $clienteGenerico->id;
        } else {
            $clienteId = $request->cliente_id;
        }
        
        DB::beginTransaction();
        
        try {
            // Generar número de factura usando año de la fecha_venta
            $fechaVenta = Carbon::parse($request->fecha_venta);
            $anoVenta = $fechaVenta->year;
            
            $ultimaFactura = Venta::where('sucursal_id', $sucursalId)
                ->whereYear('fecha_venta', $anoVenta)
                ->max('numero_factura');
                
            if ($ultimaFactura) {
                // Extraer solo los últimos 6 dígitos numéricos
                $ultimoNumero = (int) substr($ultimaFactura, -6);
                $nuevoNumero = $ultimoNumero + 1;
            } else {
                $nuevoNumero = 1;
            }
            
            $numeroFactura = $anoVenta . str_pad($nuevoNumero, 6, '0', STR_PAD_LEFT);
            
            // Filtrar solo los campos necesarios de productos
            $productosValidos = [];
            foreach ($request->productos as $productoData) {
                $productosValidos[] = [
                    'producto_id' => $productoData['producto_id'],
                    'cantidad' => $productoData['cantidad'],
                    'precio_unitario' => $productoData['precio_unitario'],
                    'descuento' => $productoData['descuento'] ?? 0,
                ];
            }
            
            // Calcular totales
            $subtotal = 0;
            $descuentoProductos = 0;
            $itbisTotal = 0;
            
            $detallesCalculados = [];
            $productosConStockInsuficiente = [];
            
            foreach ($productosValidos as $productoData) {
                $producto = Producto::find($productoData['producto_id']);
                
                if (!$producto) {
                    throw new \Exception("Producto no encontrado: {$productoData['producto_id']}");
                }
                
                // Verificar stock
                $inventario = InventarioSucursal::where('producto_id', $producto->id)
                    ->where('sucursal_id', $sucursalId)
                    ->first();
                    
                if (!$inventario) {
                    throw new \Exception("No hay inventario para el producto: {$producto->nombre}");
                }
                
                if ($inventario->stock_disponible < $productoData['cantidad']) {
                    $productosConStockInsuficiente[] = [
                        'producto' => $producto->nombre,
                        'stock_disponible' => $inventario->stock_disponible,
                        'cantidad_solicitada' => $productoData['cantidad']
                    ];
                    continue;
                }
                
                // Calcular montos
                $cantidad = floatval($productoData['cantidad']);
                $precioUnitario = floatval($productoData['precio_unitario']);
                $descuentoPorcentaje = floatval($productoData['descuento']);
                $itbisPorcentaje = floatval($producto->itbis_porcentaje);
                
                $subtotalItem = $cantidad * $precioUnitario;
                $descuentoItem = $subtotalItem * ($descuentoPorcentaje / 100);
                $subtotalConDescuento = $subtotalItem - $descuentoItem;
                $itbisItem = $subtotalConDescuento * ($itbisPorcentaje / 100);
                
                $detallesCalculados[] = [
                    'producto' => $producto,
                    'inventario' => $inventario,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioUnitario,
                    'descuento_porcentaje' => $descuentoPorcentaje,
                    'descuento_monto' => $descuentoItem,
                    'itbis_porcentaje' => $itbisPorcentaje,
                    'itbis_monto' => $itbisItem,
                    'subtotal' => $subtotalItem,
                    'subtotal_con_descuento' => $subtotalConDescuento,
                    'total_item' => $subtotalConDescuento + $itbisItem,
                ];
                
                $subtotal += $subtotalItem;
                $descuentoProductos += $descuentoItem;
                $itbisTotal += $itbisItem;
            }
            
            if (!empty($productosConStockInsuficiente)) {
                $mensajeError = "Stock insuficiente:\n";
                foreach ($productosConStockInsuficiente as $item) {
                    $mensajeError .= "- {$item['producto']}: Disponible: {$item['stock_disponible']}, Solicitado: {$item['cantidad_solicitada']}\n";
                }
                throw new \Exception($mensajeError);
            }
            
            // Calcular descuento global
            $subtotalDespuesDescuentosProductos = $subtotal - $descuentoProductos;
            $descuentoGlobalPorcentaje = floatval($request->descuento_global);
            $descuentoGlobalMonto = $subtotalDespuesDescuentosProductos * ($descuentoGlobalPorcentaje / 100);
            
            $total = ($subtotal - $descuentoProductos - $descuentoGlobalMonto) + $itbisTotal;
            $descuentoTotal = $descuentoProductos + $descuentoGlobalMonto;
            
            // Crear venta con datetime
            $venta = Venta::create([
                'numero_factura' => $numeroFactura,
                'ncf' => 'B01' . str_pad(rand(1, 999999999), 11, '0', STR_PAD_LEFT),
                'tipo_comprobante' => $request->tipo_comprobante,
                'cliente_id' => $clienteId,
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'caja_id' => $caja->id,
                'fecha_venta' => $fechaVenta, // Ya está parseado como Carbon
                'estado' => 'PROCESADA',
                'condicion_pago' => $request->condicion_pago,
                'tipo_pago' => $request->tipo_pago,
                'dias_credito' => $request->condicion_pago === 'CREDITO' ? $request->dias_credito : 0,
                'fecha_vencimiento' => $request->condicion_pago === 'CREDITO' 
                    ? $fechaVenta->copy()->addDays($request->dias_credito)
                    : null,
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'itbis' => $itbisTotal,
                'total' => $total,
                'notas' => $request->notas,
            ]);
            
            // Crear detalles de venta
            foreach ($detallesCalculados as $detalle) {
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $detalle['producto']->id,
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'descuento' => $detalle['descuento_porcentaje'],
                    'descuento_monto' => $detalle['descuento_monto'],
                    'subtotal' => $detalle['subtotal'],
                    'itbis_porcentaje' => $detalle['itbis_porcentaje'],
                    'itbis_monto' => $detalle['itbis_monto'],
                    'total' => $detalle['total_item'],
                ]);
                
                // Actualizar inventario
                $detalle['inventario']->decrementarStock($detalle['cantidad']);
            }
            
            // Actualizar efectivo en caja solo si es contado
            if ($request->condicion_pago === 'CONTADO') {
                $caja->increment('efectivo', $total);
            }
            
            // Actualizar saldo del cliente si es crédito
            if ($request->condicion_pago === 'CREDITO') {
                $cliente = Cliente::find($clienteId);
                if ($cliente) {
                    $cliente->increment('saldo_pendiente', $total);
                }
            }
            
            DB::commit();
            
            // Cargar relaciones para la respuesta
            $venta->load(['cliente', 'detalles.producto']);
            
            return response()->json([
                'success' => true,
                'message' => 'Venta creada exitosamente',
                'numero_factura' => $venta->numero_factura,
                'venta' => $venta,
                'id' => $venta->id
            ]);
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear venta: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display the specified resource.
     */
    public function show(Venta $venta)
    {
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para ver esta venta');
        }
        
        $venta->load([
            'cliente', 
            'vendedor', 
            'sucursal', 
            'detalles.producto',
            'caja'
        ]);
        
        return Inertia::render('Ventas/Show', [
            'venta' => $venta,
        ]);
    }
    
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Venta $venta)
    {
        if ($venta->estado === 'ANULADA') {
            return redirect()->route('ventas.show', $venta)
                ->with('error', 'No se puede editar una venta anulada');
        }
        
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para editar esta venta');
        }
        
        $venta->load(['cliente', 'vendedor', 'detalles.producto']);
        
        return Inertia::render('Ventas/Edit', [
            'venta' => $venta,
            'tiposComprobante' => ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
            'condicionesPago' => ['CONTADO', 'CREDITO'],
            'estados' => ['PENDIENTE', 'PROCESADA'],
        ]);
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Venta $venta)
    {
        if ($venta->estado === 'ANULADA') {
            return back()->with('error', 'No se puede actualizar una venta anulada');
        }
        
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para actualizar esta venta');
        }
        
        $request->validate([
            'tipo_comprobante' => 'required|in:FACTURA,NOTA_CREDITO,NOTA_DEBITO',
            'condicion_pago' => 'required|in:CONTADO,CREDITO',
            'dias_credito' => 'required_if:condicion_pago,CREDITO|integer|min:0',
            'fecha_venta' => 'required|date',
            'estado' => 'required|in:PENDIENTE,PROCESADA',
            'notas' => 'nullable|string|max:500',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Guardar valores antiguos para ajustes
            $condicionPagoAnterior = $venta->condicion_pago;
            $totalAnterior = $venta->total;
            
            // Parsear fecha_venta para datetime
            $fechaVenta = Carbon::parse($request->fecha_venta);
            
            // Actualizar venta
            $venta->update([
                'tipo_comprobante' => $request->tipo_comprobante,
                'condicion_pago' => $request->condicion_pago,
                'dias_credito' => $request->condicion_pago === 'CREDITO' ? $request->dias_credito : 0,
                'fecha_venta' => $fechaVenta,
                'fecha_vencimiento' => $request->condicion_pago === 'CREDITO' 
                    ? $fechaVenta->copy()->addDays($request->dias_credito)
                    : null,
                'estado' => $request->estado,
                'notas' => $request->notas,
            ]);
            
            // Ajustar saldo del cliente si cambió la condición de pago
            if ($condicionPagoAnterior !== $request->condicion_pago && $venta->cliente) {
                if ($condicionPagoAnterior === 'CREDITO' && $request->condicion_pago === 'CONTADO') {
                    // Cambió de crédito a contado: reducir saldo pendiente
                    $venta->cliente->decrement('saldo_pendiente', $totalAnterior);
                } elseif ($condicionPagoAnterior === 'CONTADO' && $request->condicion_pago === 'CREDITO') {
                    // Cambió de contado a crédito: aumentar saldo pendiente
                    $venta->cliente->increment('saldo_pendiente', $totalAnterior);
                }
            }
            
            DB::commit();
            
            return redirect()->route('ventas.show', $venta->id)
                ->with('success', 'Venta actualizada exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar venta: ' . $e->getMessage(), [
                'venta_id' => $venta->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Error al actualizar venta: ' . $e->getMessage());
        }
    }
    
    /**
     * Anular venta
     */
    public function anular(Venta $venta)
    {
        if ($venta->estado === 'ANULADA') {
            return back()->with('error', 'La venta ya está anulada');
        }
        
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para anular esta venta');
        }
        
        DB::beginTransaction();
        
        try {
            $sucursalId = $venta->sucursal_id;
            
            // Restaurar stock de productos
            foreach ($venta->detalles as $detalle) {
                $inventario = InventarioSucursal::where('producto_id', $detalle->producto_id)
                    ->where('sucursal_id', $sucursalId)
                    ->first();
                    
                if ($inventario) {
                    $inventario->increment('stock_disponible', $detalle->cantidad);
                    $inventario->recalcularValorInventario();
                }
            }
            
            // Ajustar caja si fue venta de contado
            if ($venta->condicion_pago === 'CONTADO' && $venta->caja) {
                $venta->caja->decrement('efectivo', $venta->total);
            }
            
            // Ajustar saldo del cliente si fue venta a crédito
            if ($venta->condicion_pago === 'CREDITO' && $venta->cliente) {
                $venta->cliente->decrement('saldo_pendiente', $venta->saldo_pendiente);
            }
            
            // Marcar venta como anulada
            $venta->update([
                'estado' => 'ANULADA',
                'fecha_anulacion' => Carbon::now(),
                'user_anulacion_id' => $user->id,
                'saldo_pendiente' => 0,
            ]);
            
            DB::commit();
            
            return redirect()->route('ventas.show', $venta->id)
                ->with('success', 'Venta anulada exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al anular venta: ' . $e->getMessage(), [
                'venta_id' => $venta->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Error al anular venta: ' . $e->getMessage());
        }
    }
    
    /**
     * Buscar productos para venta
     */
    public function buscarProductos(Request $request)
    {
        $query = $request->get('q');
        $sucursalId = auth()->user()->sucursal_id;
        
        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }
        
        $productos = Producto::where(function($q) use ($query) {
                $q->where('nombre', 'like', "%{$query}%")
                  ->orWhere('codigo', 'like', "%{$query}%")
                  ->orWhere('codigo_barras', 'like', "%{$query}%");
            })
            ->where('activo', true)
            ->with(['inventarios' => function($q) use ($sucursalId) {
                $q->where('sucursal_id', $sucursalId);
            }])
            ->limit(20)
            ->get()
            ->map(function($producto) use ($sucursalId) {
                $inventario = $producto->inventarios->firstWhere('sucursal_id', $sucursalId);
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'codigo' => $producto->codigo,
                    'codigo_barras' => $producto->codigo_barras,
                    'precio_venta' => (float) $producto->precio_venta,
                    'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                    'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
                    'precio_con_itbis' => (float) $producto->precio_venta * (1 + ($producto->itbis_porcentaje / 100)),
                ];
            });
            
        return response()->json($productos);
    }
    
    /**
     * Buscar clientes para venta
     */
    public function buscarClientes(Request $request)
    {
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
            
        return response()->json($clientes);
    }
    
    /**
     * Verificar stock de producto
     */
    public function verificarStock(Producto $producto)
    {
        $sucursalId = auth()->user()->sucursal_id;
        
        $inventario = InventarioSucursal::where('producto_id', $producto->id)
            ->where('sucursal_id', $sucursalId)
            ->first();
            
        return response()->json([
            'stock_disponible' => $inventario ? (float) $inventario->stock_disponible : 0,
            'producto' => [
                'nombre' => $producto->nombre,
                'precio_venta' => (float) $producto->precio_venta,
                'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
            ]
        ]);
    }
    
    /**
     * Imprimir factura
     */
    public function imprimir(Venta $venta)
    {
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para imprimir esta venta');
        }
        
        $venta->load(['cliente', 'vendedor', 'detalles.producto', 'sucursal']);
        
        return Inertia::render('Ventas/Imprimir', [
            'venta' => $venta
        ]);
    }
    
    /**
     * Generar PDF de factura
     */
    public function generarPDF(Venta $venta)
    {
        // Verificar que el usuario tenga acceso a esta venta
        $user = auth()->user();
        if ($venta->sucursal_id !== $user->sucursal_id && !$user->hasRole('admin')) {
            abort(403, 'No tiene permiso para generar PDF de esta venta');
        }
        
        $venta->load(['cliente', 'vendedor', 'sucursal', 'detalles.producto']);
        
        return view('ventas.pdf', compact('venta'));
    }
    
    /**
     * Procesar venta rápida (API)
     */
    public function procesarVentaRapida(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|numeric|min:0.01',
            'fecha_venta' => 'required|date',
        ]);
        
        try {
            $venta = $this->createVentaRapida($request);
            
            return response()->json([
                'success' => true,
                'venta' => $venta,
                'message' => 'Venta procesada exitosamente'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar venta: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Crear venta rápida (método auxiliar)
     */
    protected function createVentaRapida(Request $request)
    {
        DB::beginTransaction();
        
        try {
            \Log::info('=== INICIANDO VENTA RÁPIDA ===');
            
            // 1. Obtener usuario y sucursal actual
            $usuarioId = auth()->id();
            $sucursalId = auth()->user()->sucursal_id ?? 1;
            
            // 2. Verificar caja abierta
            $caja = Caja::where('user_id', $usuarioId)
                ->where('sucursal_id', $sucursalId)
                ->where('estado', 'abierta')
                ->firstOrFail();
                
            \Log::info('Caja encontrada:', ['caja_id' => $caja->id]);
            
            // 3. Verificar cliente
            $clienteId = $request->cliente_id;
            $cliente = Cliente::findOrFail($clienteId);
            
            // 4. Parsear fecha de venta
            $fechaVenta = Carbon::parse($request->fecha_venta);
            $anoVenta = $fechaVenta->year;
            
            // 5. Generar número de factura
            $ultimaFactura = Venta::where('sucursal_id', $sucursalId)
                ->whereYear('fecha_venta', $anoVenta)
                ->max('numero_factura');
                
            if ($ultimaFactura) {
                $numero = intval(substr($ultimaFactura, -6)) + 1;
            } else {
                $numero = 1;
            }
            
            $numeroFactura = $anoVenta . str_pad($numero, 6, '0', STR_PAD_LEFT);
            
            \Log::info('Número de factura:', ['factura' => $numeroFactura, 'fecha_venta' => $fechaVenta]);
            
            // 6. Calcular totales
            $subtotal = 0;
            $itbis = 0;
            $descuentoTotal = 0;
            
            // 7. Verificar stock ANTES de crear la venta
            foreach ($request->productos as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                $cantidad = (float) $item['cantidad'];
                $precio = $producto->precio_venta;
                $descuento = $item['descuento'] ?? 0;
                
                // Verificar stock disponible
                $inventario = InventarioSucursal::where('producto_id', $producto->id)
                    ->where('sucursal_id', $sucursalId)
                    ->firstOrFail();
                    
                \Log::info('Verificando stock:', [
                    'producto' => $producto->nombre,
                    'stock_disponible' => $inventario->stock_disponible,
                    'cantidad_solicitada' => $cantidad
                ]);
                
                if ($inventario->stock_disponible < $cantidad) {
                    throw new \Exception("Stock insuficiente para {$producto->nombre}. Disponible: {$inventario->stock_disponible}");
                }
                
                // Acumular totales
                $subtotalItem = $cantidad * $precio;
                $descuentoItem = $subtotalItem * ($descuento / 100);
                $subtotal += $subtotalItem;
                $descuentoTotal += $descuentoItem;
            }
            
            // Calcular ITBIS (18%)
            $baseImponible = $subtotal - $descuentoTotal;
            $itbis = $baseImponible * 0.18;
            $total = $baseImponible + $itbis;
            
            \Log::info('Totales calculados:', [
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'itbis' => $itbis,
                'total' => $total
            ]);
            
            // 8. Crear registro de venta con datetime
            $venta = Venta::create([
                'numero_factura' => $numeroFactura,
                'cliente_id' => $clienteId,
                'user_id' => $usuarioId,
                'sucursal_id' => $sucursalId,
                'caja_id' => $caja->id,
                'tipo_comprobante' => 'FACTURA',
                'condicion_pago' => 'CONTADO',
                'tipo_pago' => 'EFECTIVO',
                'subtotal' => $subtotal,
                'descuento' => $descuentoTotal,
                'itbis' => $itbis,
                'total' => $total,
                'estado' => 'PROCESADA',
                'fecha_venta' => $fechaVenta, // Usar datetime
            ]);
            
            \Log::info('Venta creada:', ['venta_id' => $venta->id]);
            
            // 9. Procesar cada producto y ACTUALIZAR STOCK
            foreach ($request->productos as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                $cantidad = (float) $item['cantidad'];
                $precio = $producto->precio_venta;
                $descuento = $item['descuento'] ?? 0;
                $itbisPorcentaje = $producto->itbis_porcentaje;
                
                // Obtener inventario
                $inventario = InventarioSucursal::where('producto_id', $producto->id)
                    ->where('sucursal_id', $sucursalId)
                    ->firstOrFail();
                
                \Log::info('Actualizando stock para producto:', [
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'stock_actual_antes' => $inventario->stock_actual
                ]);
                
                // Decrementar el stock
                $inventario->decrementarStock($cantidad);
                
                // Verificar que se actualizó
                $inventario->refresh();
                \Log::info('Stock después de decrementar:', [
                    'stock_actual' => $inventario->stock_actual,
                    'stock_disponible' => $inventario->stock_disponible
                ]);
                
                // Calcular totales para detalle
                $subtotalItem = $cantidad * $precio;
                $descuentoItem = $subtotalItem * ($descuento / 100);
                $subtotalConDescuento = $subtotalItem - $descuentoItem;
                $itbisItem = $subtotalConDescuento * ($itbisPorcentaje / 100);
                $totalItem = $subtotalConDescuento + $itbisItem;
                
                // Crear detalle de venta
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precio,
                    'descuento' => $descuento,
                    'descuento_monto' => $descuentoItem,
                    'subtotal' => $subtotalItem,
                    'itbis_porcentaje' => $itbisPorcentaje,
                    'itbis_monto' => $itbisItem,
                    'total' => $totalItem,
                ]);
            }
            
            // 10. Actualizar caja
            $caja->increment('efectivo', $total);
            $caja->increment('ventas_totales', $total);
            $caja->increment('transacciones');
            
            \Log::info('Caja actualizada:', [
                'efectivo_anterior' => $caja->efectivo - $total,
                'efectivo_actual' => $caja->efectivo
            ]);
            
            // 11. Confirmar transacción
            DB::commit();
            
            \Log::info('=== VENTA RÁPIDA COMPLETADA ===', ['venta_id' => $venta->id]);
            
            return $venta->load('detalles.producto', 'cliente', 'user');
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en venta rápida: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    /**
     * Reporte de ventas diarias
     */
    public function reporteDiario(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $fecha = $request->get('fecha', date('Y-m-d'));
        $fechaCarbon = Carbon::parse($fecha);
        
        $ventas = Venta::with(['cliente', 'detalles.producto'])
            ->where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', $fecha) // Usar whereDate para datetime
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->get();
        
        $totalVentas = $ventas->sum('total');
        $totalProductos = $ventas->sum(function($venta) {
            return $venta->detalles->sum('cantidad');
        });
        
        return Inertia::render('Ventas/ReporteDiario', [
            'ventas' => $ventas,
            'fecha' => $fecha,
            'totalVentas' => $totalVentas,
            'totalProductos' => $totalProductos,
            'cantidadVentas' => $ventas->count(),
        ]);
    }
    
    /**
     * Reporte de ventas mensuales
     */
    public function reporteMensual(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $mes = $request->get('mes', date('m'));
        $ano = $request->get('ano', date('Y'));
        
        $ventas = Venta::with(['cliente', 'vendedor'])
            ->where('sucursal_id', $sucursalId)
            ->whereMonth('fecha_venta', $mes) // Usar whereMonth para datetime
            ->whereYear('fecha_venta', $ano) // Usar whereYear para datetime
            ->where('estado', 'PROCESADA')
            ->orderBy('fecha_venta', 'desc')
            ->get();
        
        $estadisticas = [
            'totalVentas' => $ventas->sum('total'),
            'cantidadVentas' => $ventas->count(),
            'promedioVenta' => $ventas->count() > 0 ? $ventas->sum('total') / $ventas->count() : 0,
            'ventasContado' => $ventas->where('condicion_pago', 'CONTADO')->sum('total'),
            'ventasCredito' => $ventas->where('condicion_pago', 'CREDITO')->sum('total'),
        ];
        
        return Inertia::render('Ventas/ReporteMensual', [
            'ventas' => $ventas,
            'mes' => $mes,
            'ano' => $ano,
            'estadisticas' => $estadisticas,
        ]);
    }
    
    /**
     * Reporte de productos más vendidos
     */
    public function reporteProductos(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $fechaInicio = $request->get('fecha_inicio', date('Y-m-01'));
        $fechaFin = $request->get('fecha_fin', date('Y-m-d'));
        
        $productos = DetalleVenta::select(
                'productos.id',
                'productos.nombre',
                'productos.codigo',
                DB::raw('SUM(detalle_ventas.cantidad) as total_vendido'),
                DB::raw('SUM(detalle_ventas.total) as total_ingresos')
            )
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->join('productos', 'detalle_ventas.producto_id', '=', 'productos.id')
            ->where('ventas.sucursal_id', $sucursalId)
            ->where('ventas.estado', 'PROCESADA')
            ->whereBetween('ventas.fecha_venta', [$fechaInicio, Carbon::parse($fechaFin)->endOfDay()]) // Ajustar para datetime
            ->groupBy('productos.id', 'productos.nombre', 'productos.codigo')
            ->orderBy('total_vendido', 'desc')
            ->limit(20)
            ->get();
        
        return Inertia::render('Ventas/ReporteProductos', [
            'productos' => $productos,
            'fechaInicio' => $fechaInicio,
            'fechaFin' => $fechaFin,
        ]);
    }
    
    /**
     * Reporte general de ventas
     */
    public function reporteVentas(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $fechaInicio = $request->get('fecha_inicio', date('Y-m-01'));
        $fechaFin = $request->get('fecha_fin', date('Y-m-d'));
        
        $ventas = Venta::with(['cliente', 'vendedor'])
            ->where('sucursal_id', $sucursalId)
            ->where('estado', 'PROCESADA')
            ->whereBetween('fecha_venta', [
                Carbon::parse($fechaInicio)->startOfDay(),
                Carbon::parse($fechaFin)->endOfDay()
            ]) // Ajustar para datetime
            ->orderBy('fecha_venta', 'desc')
            ->paginate(20);
        
        $estadisticas = [
            'totalVentas' => $ventas->sum('total'),
            'cantidadVentas' => $ventas->total(),
            'ventasContado' => $ventas->where('condicion_pago', 'CONTADO')->sum('total'),
            'ventasCredito' => $ventas->where('condicion_pago', 'CREDITO')->sum('total'),
        ];
        
        return Inertia::render('Ventas/ReporteGeneral', [
            'ventas' => $ventas,
            'fechaInicio' => $fechaInicio,
            'fechaFin' => $fechaFin,
            'estadisticas' => $estadisticas,
            'filtros' => $request->only(['fecha_inicio', 'fecha_fin']),
        ]);
    }
}