<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\Caja;
use App\Models\InventarioSucursal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class VentaController extends Controller
{
   /**
     * Mostrar listado de ventas
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $query = Venta::with(['cliente', 'vendedor']) // CAMBIADO: 'usuario' por 'vendedor'
            ->where('sucursal_id', $sucursalId)
            ->orderBy('fecha_venta', 'desc');
            
        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->whereDate('fecha_venta', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->whereDate('fecha_venta', '<=', $request->fecha_hasta);
        }
        
        if ($request->has('cliente_id') && $request->cliente_id) {
            $query->where('cliente_id', $request->cliente_id);
        }
        
        $ventas = $query->paginate(20);
        
        return Inertia::render('Ventas/Index', [
            'ventas' => $ventas,
            'filtros' => $request->only(['estado', 'fecha_desde', 'fecha_hasta', 'cliente_id']),
            'estados' => ['PENDIENTE', 'PROCESADA', 'ANULADA'],
        ]);
    }
    
    /**
 * Formulario para crear venta
 */
public function create()
{
    $user = auth()->user();
    $sucursalId = $user->sucursal_id;
    
    // Verificar si hay caja abierta
    $cajaAbierta = Caja::where('sucursal_id', $sucursalId)
        ->where('user_id', $user->id)
        ->where('estado', 'abierta')
        ->whereNull('fecha_cierre')
        ->first();
        
    if (!$cajaAbierta) {
        return redirect()->route('caja.index')
            ->with('error', 'Debes abrir caja para registrar ventas');
    }
    
    // Crear cliente por defecto si no existe
    $clienteDefault = Cliente::where('cedula_rnc', '00000000000')->first(); // Sin guiones
    
    if (!$clienteDefault) {
        try {
            // Obtener el último código de cliente
            $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
            $numero = $ultimoCliente ? intval(preg_replace('/[^0-9]/', '', $ultimoCliente->codigo)) + 1 : 1;
            $codigo = 'CLI' . str_pad($numero, 5, '0', STR_PAD_LEFT);
            
            $clienteDefault = Cliente::create([
                'codigo' => $codigo,
                'tipo_cliente' => 'NATURAL',
                'nombre_completo' => 'CONSUMIDOR FINAL',
                'cedula_rnc' => '00000000000', // Sin guiones, 11 dígitos
                'email' => null,
                'telefono' => '0000000000',
                'telefono_alternativo' => null,
                'direccion' => 'No especificada',
                'provincia' => 'Distrito Nacional',
                'municipio' => 'Santo Domingo',
                'sector' => 'Centro',
                'tipo_contribuyente' => 'CONSUMIDOR_FINAL',
                'activo' => true,
                'limite_credito' => 0,
                'dias_credito' => 0,
                'descuento' => 0,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error creando cliente por defecto: ' . $e->getMessage());
            // Si falla, usar un cliente existente o crear uno alternativo
            $clienteDefault = Cliente::first();
        }
    }
    
    if (!$clienteDefault) {
        return redirect()->route('caja.index')
            ->with('error', 'No se pudo configurar el cliente por defecto');
    }
    
    return Inertia::render('Ventas/Create', [
        'caja' => $cajaAbierta,
        'clienteDefault' => [
            'id' => $clienteDefault->id,
            'codigo' => $clienteDefault->codigo,
            'tipo' => $clienteDefault->tipo_cliente === 'NATURAL' ? 'FISICA' : 'JURIDICA',
            'tipo_cliente' => $clienteDefault->tipo_cliente,
            'cedula' => $clienteDefault->cedula_rnc,
            'cedula_rnc' => $clienteDefault->cedula_rnc,
            'nombre_completo' => $clienteDefault->nombre_completo,
            'email' => $clienteDefault->email,
            'telefono' => $clienteDefault->telefono,
            'direccion' => $clienteDefault->direccion,
        ],
        'tiposComprobante' => ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
        'condicionesPago' => ['CONTADO', 'CREDITO'],
    ]);
}
   /**
 * Guardar nueva venta
 */
public function store(Request $request)
{
    $request->validate([
        'cliente_id' => 'required|exists:clientes,id',
        'tipo_comprobante' => 'required|in:FACTURA,NOTA_CREDITO,NOTA_DEBITO',
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
        
        // Primero calcular todos los montos
        $detallesCalculados = [];
        
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
        
        // Calcular descuento global sobre el subtotal después de descuentos por producto
        $subtotalDespuesDescuentosProductos = $subtotal - $descuentoProductos;
        $descuentoGlobalPorcentaje = floatval($request->descuento_global);
        $descuentoGlobalMonto = $subtotalDespuesDescuentosProductos * ($descuentoGlobalPorcentaje / 100);
        
        $total = ($subtotal - $descuentoProductos - $descuentoGlobalMonto) + $itbisTotal;
        $descuentoTotal = $descuentoProductos + $descuentoGlobalMonto;
        
        // Crear venta con los totales calculados
        $venta = Venta::create([
            'numero_factura' => $numeroFactura,
            'ncf' => 'B01' . str_pad(rand(1, 999999999), 11, '0', STR_PAD_LEFT),
            'tipo_comprobante' => $request->tipo_comprobante,
            'cliente_id' => $request->cliente_id,
            'sucursal_id' => $sucursalId,
            'user_id' => $user->id,
            'fecha_venta' => $request->fecha_venta,
            'estado' => 'PROCESADA', // Procesar directamente
            'condicion_pago' => $request->condicion_pago,
            'dias_credito' => $request->condicion_pago === 'CREDITO' ? $request->dias_credito : 0,
            'fecha_vencimiento' => $request->condicion_pago === 'CREDITO' 
                ? Carbon::parse($request->fecha_venta)->addDays($request->dias_credito)
                : null,
            'subtotal' => $subtotal,
            'descuento' => $descuentoTotal,
            'itbis' => $itbisTotal,
            'total' => $total,
            'notas' => $request->notas,
            'caja_id' => $caja->id,
        ]);
        
        // Crear detalles de venta y actualizar inventario
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
            
            // Actualizar inventario usando el método decrementarStock
            $detalle['inventario']->decrementarStock($detalle['cantidad']);
        }
        
        // Actualizar efectivo en caja
        $caja->increment('efectivo', $total);
        
        DB::commit();
        
        return redirect()->route('ventas.show', $venta->id)
            ->with('success', 'Venta registrada exitosamente');
            
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error al registrar venta: ' . $e->getMessage(), [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return back()->with('error', 'Error al registrar venta: ' . $e->getMessage());
    }
}
    
      /**
     * Mostrar detalle de venta
     */
    public function show(Venta $venta)
{
    // Cargar relaciones - IMPORTANTE: usar 'vendedor' no 'usuario'
    $venta->load(['cliente', 'vendedor', 'sucursal', 'detalles.producto']);
    
    return Inertia::render('Ventas/Show', [
        'venta' => $venta,
    ]);
    }
    
    /**
     * Mostrar formulario para editar venta
     */
    public function edit(Venta $venta)
    {
        if ($venta->estado === 'ANULADA') {
            return redirect()->route('ventas.show', $venta)
                ->with('error', 'No se puede editar una venta anulada');
        }
        
        // CAMBIADO: 'usuario' por 'vendedor'
        $venta->load(['cliente', 'vendedor', 'detalles.producto']);
        
        return Inertia::render('Ventas/Edit', [
            'venta' => $venta,
            'tiposComprobante' => ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
            'condicionesPago' => ['CONTADO', 'CREDITO'],
            'estados' => ['PENDIENTE', 'PROCESADA'],
        ]);
    }
    
    /**
     * Actualizar venta
     */
    public function update(Request $request, Venta $venta)
    {
        if ($venta->estado === 'ANULADA') {
            return back()->with('error', 'No se puede actualizar una venta anulada');
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
            
            DB::commit();
            
            return redirect()->route('ventas.show', $venta->id)
                ->with('success', 'Venta actualizada exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
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
        
        DB::beginTransaction();
        
        try {
            $user = auth()->user();
            $sucursalId = $user->sucursal_id;
            
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
            
            // Marcar venta como anulada
            $venta->update([
                'estado' => 'ANULADA',
                'fecha_anulacion' => Carbon::now(),
                'user_anulacion_id' => $user->id,
            ]);
            
            DB::commit();
            
            return redirect()->route('ventas.show', $venta->id)
                ->with('success', 'Venta anulada exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
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
        
        Log::info('Buscando productos para venta', [
            'query' => $query,
            'sucursal_id' => $sucursalId,
            'user_id' => auth()->id()
        ]);
        
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
     * API: Buscar clientes para venta rápida
     */
    public function buscarClientes(Request $request)
    {
        Log::info('Buscando clientes desde VentaController', [
            'query' => $request->get('q'),
            'modo' => $request->get('modo', 'nombre')
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

        Log::info('Clientes encontrados desde VentaController', ['count' => $clientes->count()]);
            
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
        $venta->load(['cliente', 'usuario', 'sucursal', 'detalles.producto']);
        
        return Inertia::render('Ventas/Imprimir', [
            'venta' => $venta,
        ]);
    }
    
    /**
     * Generar PDF de factura
     */
    public function generarPDF(Venta $venta)
    {
        // Aquí puedes implementar la generación de PDF con DomPDF o similar
        // Por ahora retornamos la vista para imprimir
        $venta->load(['cliente', 'usuario', 'sucursal', 'detalles.producto']);
        
        return view('ventas.pdf', compact('venta'));
    }
    
    /**
     * Procesar venta rápida (API para ventas rápidas)
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
            // Similar al método store pero simplificado para API
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
                
                // Verificar stock
                $inventario = InventarioSucursal::where('producto_id', $producto->id)
                    ->where('sucursal_id', $sucursalId)
                    ->first();
                    
                if (!$inventario || $inventario->stock_disponible < $productoData['cantidad']) {
                    throw new \Exception("Stock insuficiente para {$producto->nombre}");
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
        
        $ventas = Venta::with(['cliente', 'vendedor']) // CAMBIADO: 'usuario' por 'vendedor'
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
        
        $ventas = Venta::with(['cliente', 'vendedor']) // CAMBIADO: 'usuario' por 'vendedor'
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