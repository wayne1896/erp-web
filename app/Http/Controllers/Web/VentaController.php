<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller; // <-- CORREGIDO: Sin \Web\
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
            $query->whereDate('fecha_venta', '>=', $request->fecha_inicio);
        }
        
        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->whereDate('fecha_venta', '<=', $request->fecha_fin);
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
    // En el método create():
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
            // NO enviar tiposPago desde el backend, manejarlos en el frontend
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tipo_comprobante' => 'required|in:FACTURA,NOTA_CREDITO,NOTA_DEBITO',
            'cliente_id' => 'required|exists:clientes,id',
            'condicion_pago' => 'required|in:CONTADO,CREDITO',
            'dias_credito' => 'required_if:condicion_pago,CREDITO|integer|min:0',
            'fecha_venta' => 'required|date',
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
            return back()->with('error', 'No hay caja abierta');
        }
        
        // Verificar límite de crédito del cliente si es venta a crédito
        if ($request->condicion_pago === 'CREDITO') {
            $cliente = Cliente::find($request->cliente_id);
            if ($cliente && $cliente->limite_credito > 0) {
                $ventasCreditoPendientes = Venta::where('cliente_id', $cliente->id)
                    ->where('condicion_pago', 'CREDITO')
                    ->where('estado', 'PROCESADA')
                    ->where('saldo_pendiente', '>', 0)
                    ->sum('saldo_pendiente');
                    
                $saldoTotal = $ventasCreditoPendientes + ($request->total_estimado ?? 0);
                
                if ($saldoTotal > $cliente->limite_credito) {
                    return back()->with('error', 'El cliente ha excedido su límite de crédito. Límite: ' . number_format($cliente->limite_credito, 2) . ', Saldo pendiente: ' . number_format($ventasCreditoPendientes, 2));
                }
            }
        }
        
        DB::beginTransaction();
        
        try {
            // Generar número de factura
            $ultimaFactura = Venta::where('sucursal_id', $sucursalId)
                ->whereYear('fecha_venta', date('Y'))
                ->max('numero_factura');
                
            $numeroFactura = $ultimaFactura ? intval(substr($ultimaFactura, -6)) + 1 : 1;
            $numeroFactura = date('Y') . str_pad($numeroFactura, 6, '0', STR_PAD_LEFT);
            
            // Calcular totales preliminares
            $subtotal = 0;
            $descuentoProductos = 0;
            $itbisTotal = 0;
            $descuentoGlobalMonto = 0;
            
            // Primero calcular todos los montos y verificar stock
            $detallesCalculados = [];
            $productosConStockInsuficiente = [];
            
            foreach ($request->productos as $productoData) {
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
            
            // Verificar si hay productos con stock insuficiente
            if (!empty($productosConStockInsuficiente)) {
                $mensajeError = "Stock insuficiente para los siguientes productos:\n";
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
            
            // Crear venta
            $venta = Venta::create([
                'numero_factura' => $numeroFactura,
                'ncf' => 'B01' . str_pad(rand(1, 999999999), 11, '0', STR_PAD_LEFT),
                'tipo_comprobante' => $request->tipo_comprobante,
                'cliente_id' => $request->cliente_id,
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'caja_id' => $caja->id, // <-- Agregar esto
                'fecha_venta' => $request->fecha_venta,
                'estado' => 'PROCESADA',
                'condicion_pago' => $request->condicion_pago,
                'tipo_pago' => $request->condicion_pago === 'CONTADO' ? 'EFECTIVO' : 'CREDITO', // <-- Agregar esto
                'dias_credito' => $request->condicion_pago === 'CREDITO' ? $request->dias_credito : 0,
                'fecha_vencimiento' => $request->condicion_pago === 'CREDITO' 
                    ? Carbon::parse($request->fecha_venta)->addDays($request->dias_credito)
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
                $detalle['inventario']->decrement('stock_disponible', $detalle['cantidad']);
                $detalle['inventario']->recalcularValorInventario();
            }
            
            // Actualizar efectivo en caja solo si es contado
            if ($request->condicion_pago === 'CONTADO') {
                $caja->increment('efectivo', $total);
            }
            
            // Actualizar saldo del cliente si es crédito
            if ($request->condicion_pago === 'CREDITO' && $venta->cliente) {
                $venta->cliente->increment('saldo_pendiente', $total);
            }
            
            DB::commit();
            
            return redirect()->route('ventas.show', $venta->id)
                ->with('success', 'Venta registrada exitosamente. Factura #' . $venta->numero_factura);
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al registrar venta: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Error al registrar venta: ' . $e->getMessage())
                ->withInput();
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
            'caja',
            'userAnulacion'
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
            
            // Actualizar venta
            $venta->update([
                'tipo_comprobante' => $request->tipo_comprobante,
                'condicion_pago' => $request->condicion_pago,
                'dias_credito' => $request->condicion_pago === 'CREDITO' ? $request->dias_credito : 0,
                'fecha_venta' => $request->fecha_venta,
                'fecha_vencimiento' => $request->condicion_pago === 'CREDITO' 
                    ? Carbon::parse($request->fecha_venta)->addDays($request->dias_credito)
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
    private function createVentaRapida(Request $request)
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
            throw new \Exception('No hay caja abierta');
        }
        
        DB::beginTransaction();
        
        try {
            // Generar número de factura
            $ultimaFactura = Venta::where('sucursal_id', $sucursalId)
                ->whereYear('fecha_venta', date('Y'))
                ->max('numero_factura');
                
            $numeroFactura = $this->generarNumeroFactura($ultimaFactura);
            
            // Crear venta
            $venta = Venta::create([
                'numero_factura' => $numeroFactura,
                'ncf' => 'B01' . str_pad(rand(1, 999999999), 11, '0', STR_PAD_LEFT),
                'tipo_comprobante' => 'FACTURA',
                'cliente_id' => $request->cliente_id,
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'fecha_venta' => Carbon::now(),
                'estado' => 'PENDIENTE',
                'condicion_pago' => 'CONTADO',
                'dias_credito' => 0,
                'subtotal' => 0,
                'descuento' => 0,
                'itbis' => 0,
                'total' => 0,
                'caja_id' => $caja->id,
            ]);
            
            $subtotal = 0;
            $itbisTotal = 0;
            
            // Crear detalles de venta
            foreach ($request->productos as $productoData) {
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
                    throw new \Exception("Stock insuficiente para {$producto->nombre}. Disponible: {$inventario->stock_disponible}, Solicitado: {$productoData['cantidad']}");
                }
                
                // Usar precio de venta del producto
                $precioUnitario = $producto->precio_venta;
                $subtotalItem = $productoData['cantidad'] * $precioUnitario;
                $itbisItem = $subtotalItem * ($producto->itbis_porcentaje / 100);
                $totalItem = $subtotalItem + $itbisItem;
                
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $productoData['cantidad'],
                    'precio_unitario' => $precioUnitario,
                    'descuento' => 0,
                    'subtotal' => $subtotalItem,
                    'itbis_porcentaje' => $producto->itbis_porcentaje,
                    'itbis_monto' => $itbisItem,
                    'total' => $totalItem,
                ]);
                
                $subtotal += $subtotalItem;
                $itbisTotal += $itbisItem;
                
                // Actualizar inventario
                $inventario->decrement('stock_disponible', $productoData['cantidad']);
                $inventario->recalcularValorInventario();
            }
            
            // Actualizar totales de la venta
            $venta->update([
                'subtotal' => $subtotal,
                'itbis' => $itbisTotal,
                'total' => $subtotal + $itbisTotal,
                'estado' => 'PROCESADA',
            ]);
            
            // Actualizar efectivo en caja
            $caja->increment('efectivo', $venta->total);
            
            DB::commit();
            
            return $venta;
                
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Generar número de factura
     */
    private function generarNumeroFactura($ultimaFactura)
    {
        $anoActual = date('Y');
        
        if ($ultimaFactura) {
            $numero = intval(substr($ultimaFactura, -6)) + 1;
        } else {
            $numero = 1;
        }
        
        return $anoActual . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Reporte de ventas diarias
     */
    public function reporteDiario(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $fecha = $request->get('fecha', date('Y-m-d'));
        
        $ventas = Venta::with(['cliente', 'detalles.producto'])
            ->where('sucursal_id', $sucursalId)
            ->whereDate('fecha_venta', $fecha)
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
            ->whereMonth('fecha_venta', $mes)
            ->whereYear('fecha_venta', $ano)
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
            ->whereBetween('ventas.fecha_venta', [$fechaInicio, $fechaFin])
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
            ->whereBetween('fecha_venta', [$fechaInicio, $fechaFin])
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