<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Sucursal;
use App\Models\DireccionEntrega; 
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PedidoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $sucursalId = $user->sucursal_id;
        
        // Inicializar query base
        $query = Pedido::query();
        
        // Aplicar filtro de sucursal si el usuario tiene sucursal asignada
        if ($sucursalId) {
            $query->where('sucursal_id', $sucursalId);
        }
        
        // Cargar relaciones con select específico para evitar problemas
        $query->with([
            'cliente:id,nombre_completo,cedula_rnc',
            'usuario:id,name',
            'sucursal:id,nombre'
        ]);
        
        // Filtros
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->prioridad);
        }
        
        if ($request->filled('tipo_pedido')) {
            $query->where('tipo_pedido', $request->tipo_pedido);
        }
        
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('fecha_pedido', '>=', $request->fecha_inicio);
        }
        
        if ($request->filled('fecha_fin')) {
            $query->whereDate('fecha_pedido', '<=', $request->fecha_fin);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_pedido', 'like', "%{$search}%")
                  ->orWhereHas('cliente', function($q2) use ($search) {
                      $q2->where('nombre_completo', 'like', "%{$search}%")
                         ->orWhere('cedula_rnc', 'like', "%{$search}%");
                  });
            });
        }
        
        // Ordenar por fecha de creación descendente
        $query->orderBy('created_at', 'desc');
        
        // Paginar resultados
        $pedidos = $query->paginate(20)->withQueryString();
        
        return Inertia::render('Pedidos/Index', [
            'pedidos' => $pedidos,
            'filtros' => $request->only(['search', 'estado', 'prioridad', 'tipo_pedido', 'fecha_inicio', 'fecha_fin']),
            'estados' => $this->getEstados(),
            'prioridades' => $this->getPrioridades(),
            'tiposPedido' => $this->getTiposPedido()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $sucursalId = $user->sucursal_id;
        
        // Verificar si el usuario tiene sucursal asignada
        if (!$sucursalId) {
            return redirect()->route('pedidos.index')
                ->with('error', 'No tiene una sucursal asignada. Contacte al administrador.');
        }
        
        // Obtener clientes activos
        $clientes = Cliente::where('activo', true)
            ->orderBy('nombre_completo')
            ->get(['id', 'nombre_completo', 'cedula_rnc', 'telefono', 'direccion', 'limite_credito']);
        
        // Calcular saldo pendiente para cada cliente
        $clientes = $clientes->map(function($cliente) {
            $cliente->saldo_pendiente = $this->calcularSaldoCliente($cliente->id);
            return $cliente;
        });
        
        // Obtener productos activos con inventario
        $productos = Producto::with(['inventarios' => function($q) use ($sucursalId) {
            $q->where('sucursal_id', $sucursalId)
              ->select(['id', 'producto_id', 'sucursal_id', 'stock_disponible', 'stock_actual']);
        }])
        ->where('activo', true)
        ->orderBy('nombre')
        ->get(['id', 'nombre', 'codigo', 'descripcion', 'precio_venta', 'control_stock', 'stock_minimo']);
        
        // Agregar stock disponible a cada producto
        $productos = $productos->map(function($producto) {
            $inventario = $producto->inventarios->first();
            $producto->stock_disponible = $inventario ? $inventario->stock_disponible : 0;
            return $producto;
        });
        
        // Obtener información de la sucursal
        $sucursal = Sucursal::find($sucursalId);
        \Log::info('Datos para crear pedido:', [
            'clientes' => $clientes->count(),
            'productos' => $productos->count(),
            'sucursal' => $sucursal ? $sucursal->nombre : 'No encontrada',
            'usuario' => $user->name,
            'sucursal_id' => $sucursalId
        ]);
        return Inertia::render('Pedidos/Create', [
            'clientes' => $clientes,
            'productos' => $productos,
            'sucursal' => $sucursal,
            'numero_pedido' => $this->generarNumeroPedido(),
            'estados' => $this->getEstados(),
            'prioridades' => $this->getPrioridades(),
            'tipos_pedido' => $this->getTiposPedido(),
            'condiciones_pago' => $this->getCondicionesPago()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $sucursalId = $user->sucursal_id;
        
        if (!$sucursalId) {
            return back()->with('error', 'No tiene una sucursal asignada');
        }
        
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'fecha_entrega' => 'required|date|after_or_equal:today',
            'condicion_pago' => 'required|in:CONTADO,CREDITO,MIXTO',
            'anticipo' => 'numeric|min:0',
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_id' => 'required|exists:productos,id',
            'detalles.*.cantidad_solicitada' => 'required|numeric|min:0.01',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.descuento' => 'numeric|min:0|max:100',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Verificar stock disponible
            foreach ($request->detalles as $detalle) {
                $producto = Producto::with(['inventarios' => function($q) use ($sucursalId) {
                    $q->where('sucursal_id', $sucursalId);
                }])->find($detalle['producto_id']);
                
                if ($producto && $producto->control_stock) {
                    $inventario = $producto->inventarios->first();
                    if (!$inventario || $inventario->stock_disponible < $detalle['cantidad_solicitada']) {
                        return back()->with('error', "Producto '{$producto->nombre}' no tiene suficiente stock. Disponible: " . ($inventario ? $inventario->stock_disponible : 0));
                    }
                }
            }
            
            // Calcular totales
            $subtotal = 0;
            $itbis = 0;
            $total = 0;
            
            foreach ($request->detalles as $detalle) {
                $precio = $detalle['precio_unitario'];
                $cantidad = $detalle['cantidad_solicitada'];
                $descuento = $detalle['descuento'] ?? 0;
                
                $subtotalItem = $precio * $cantidad;
                $descuentoMonto = ($subtotalItem * $descuento) / 100;
                $subtotalConDescuento = $subtotalItem - $descuentoMonto;
                $itbisMonto = $subtotalConDescuento * 0.18;
                $totalItem = $subtotalConDescuento + $itbisMonto;
                
                $subtotal += $subtotalConDescuento;
                $itbis += $itbisMonto;
                $total += $totalItem;
            }
            
            // Verificar límite de crédito si es a crédito
            if (in_array($request->condicion_pago, ['CREDITO', 'MIXTO'])) {
                $cliente = Cliente::find($request->cliente_id);
                $saldoPendiente = $this->calcularSaldoCliente($cliente->id);
                $limiteCredito = $cliente->limite_credito ?? 0;
                
                if (($saldoPendiente + $total) > $limiteCredito && $limiteCredito > 0) {
                    return back()->with('error', "El cliente excede su límite de crédito. Saldo actual: " . number_format($saldoPendiente, 2) . ", Límite: " . number_format($limiteCredito, 2));
                }
            }
            
            // Crear pedido
            $pedido = Pedido::create([
                'numero_pedido' => $this->generarNumeroPedido(),
                'cliente_id' => $request->cliente_id,
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'vendedor_id' => $user->id,
                'fecha_pedido' => now(),
                'fecha_entrega' => $request->fecha_entrega,
                'estado' => 'PENDIENTE',
                'condicion_pago' => $request->condicion_pago,
                'anticipo' => $request->anticipo ?? 0,
                'prioridad' => $request->prioridad ?? 'MEDIA',
                'tipo_pedido' => $request->tipo_pedido ?? 'LOCAL',
                'notas' => $request->notas ?? '',
                'subtotal' => $subtotal,
                'itbis' => $itbis,
                'total' => $total,
                'saldo_pendiente' => $total - ($request->anticipo ?? 0),
            ]);
            
            // Crear detalles del pedido
            foreach ($request->detalles as $detalle) {
                $precio = $detalle['precio_unitario'];
                $cantidad = $detalle['cantidad_solicitada'];
                $descuento = $detalle['descuento'] ?? 0;
                
                $subtotalItem = $precio * $cantidad;
                $descuentoMonto = ($subtotalItem * $descuento) / 100;
                $subtotalConDescuento = $subtotalItem - $descuentoMonto;
                $itbisMonto = $subtotalConDescuento * 0.18;
                $totalItem = $subtotalConDescuento + $itbisMonto;
                
                $detallePedido = $pedido->detalles()->create([
                    'producto_id' => $detalle['producto_id'],
                    'cantidad_solicitada' => $cantidad,
                    'precio_unitario' => $precio,
                    'descuento' => $descuento,
                    'descuento_monto' => $descuentoMonto,
                    'subtotal' => $subtotalConDescuento,
                    'itbis_porcentaje' => 18.00,
                    'itbis_monto' => $itbisMonto,
                    'total' => $totalItem,
                    'precio_original' => $precio,
                ]);
                
                // Marcar como reservado si el producto controla stock
                $producto = Producto::find($detalle['producto_id']);
                if ($producto && $producto->control_stock) {
                    $inventario = $producto->inventarios()
                        ->where('sucursal_id', $sucursalId)
                        ->first();
                        
                    if ($inventario) {
                        $detallePedido->update([
                            'reservado_stock' => true,
                            'inventario_sucursal_id' => $inventario->id,
                        ]);
                        
                        // Reservar stock (disminuir disponible, aumentar reservado)
                        $inventario->decrement('stock_disponible', $cantidad);
                        $inventario->increment('stock_reservado', $cantidad);
                    }
                }
            }
            
            // Crear dirección de entrega si es necesario
            if ($request->tipo_pedido === 'DOMICILIO' && isset($request->direccion_entrega)) {
                $pedido->direccionEntrega()->create([
                    'nombre_contacto' => $request->direccion_entrega['nombre_contacto'] ?? '',
                    'telefono_contacto' => $request->direccion_entrega['telefono_contacto'] ?? '',
                    'direccion' => $request->direccion_entrega['direccion'] ?? '',
                    'ciudad' => $request->direccion_entrega['ciudad'] ?? '',
                    'provincia' => $request->direccion_entrega['provincia'] ?? '',
                    'sector' => $request->direccion_entrega['sector'] ?? '',
                    'codigo_postal' => $request->direccion_entrega['codigo_postal'] ?? '',
                    'instrucciones_entrega' => $request->direccion_entrega['instrucciones_entrega'] ?? '',
                ]);
            }
            
            DB::commit();
            
            return redirect()->route('pedidos.index')
                ->with('success', 'Pedido creado exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear pedido: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return back()->with('error', 'Error al crear pedido: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedido $pedido)
    {
        $user = Auth::user();
        
        // Verificar que el pedido pertenezca a la sucursal del usuario
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para ver este pedido');
        }
        
        // Cargar relaciones con cuidado para evitar problemas
        $pedido->load([
            'cliente:id,nombre_completo,cedula_rnc,telefono,email,direccion',
            'usuario:id,name,email',
            'sucursal:id,nombre,direccion',
            'detalles' => function($query) {
                $query->with(['producto:id,nombre,codigo,precio_venta']);
            },
            'direccionEntrega',
        ]);
        
        // Intentar cargar log si existe la relación
        if (method_exists($pedido, 'log')) {
            $pedido->load(['log' => function($query) {
                $query->with(['user:id,name'])->latest();
            }]);
        }
        
        return Inertia::render('Pedidos/Show', [
            'pedido' => $pedido,
            'canEdit' => $pedido->estado === 'PENDIENTE',
            'canDelete' => $pedido->estado === 'PENDIENTE'
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pedido $pedido)
    {
        $user = Auth::user();
        
        // Verificar permisos
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para editar este pedido');
        }
        
        if ($pedido->estado !== 'PENDIENTE') {
            return redirect()->route('pedidos.show', $pedido)
                ->with('error', 'Solo se pueden editar pedidos pendientes');
        }
        
        // Cargar datos del pedido
        $pedido->load([
            'cliente:id,nombre_completo,cedula_rnc',
            'detalles' => function($query) {
                $query->with(['producto:id,nombre,codigo,precio_venta,control_stock']);
            },
            'direccionEntrega'
        ]);
        
        // Obtener clientes
        $clientes = Cliente::where('activo', true)
            ->orderBy('nombre_completo')
            ->get(['id', 'nombre_completo', 'cedula_rnc', 'telefono', 'direccion', 'limite_credito']);
        
        // Calcular saldo pendiente para cada cliente
        $clientes = $clientes->map(function($cliente) {
            $cliente->saldo_pendiente = $this->calcularSaldoCliente($cliente->id);
            return $cliente;
        });
        
        // Obtener productos
        $productos = Producto::with(['inventarios' => function($q) use ($pedido) {
            $q->where('sucursal_id', $pedido->sucursal_id)
              ->select(['id', 'producto_id', 'sucursal_id', 'stock_disponible', 'stock_actual']);
        }])
        ->where('activo', true)
        ->orderBy('nombre')
        ->get(['id', 'nombre', 'codigo', 'descripcion', 'precio_venta', 'control_stock', 'stock_minimo']);
        
        // Agregar stock disponible a cada producto
        $productos = $productos->map(function($producto) {
            $inventario = $producto->inventarios->first();
            $producto->stock_disponible = $inventario ? $inventario->stock_disponible : 0;
            return $producto;
        });
        
        return Inertia::render('Pedidos/Edit', [
            'pedido' => $pedido,
            'clientes' => $clientes,
            'productos' => $productos,
            'estados' => $this->getEstados(),
            'prioridades' => $this->getPrioridades(),
            'tipos_pedido' => $this->getTiposPedido(),
            'condiciones_pago' => $this->getCondicionesPago(),
            'canEdit' => true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pedido $pedido)
    {
        $user = Auth::user();
        
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para editar este pedido');
        }
        
        if ($pedido->estado !== 'PENDIENTE') {
            return back()->with('error', 'Solo se pueden editar pedidos pendientes');
        }
        
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'fecha_entrega' => 'required|date|after_or_equal:today',
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_id' => 'required|exists:productos,id',
            'detalles.*.cantidad_solicitada' => 'required|numeric|min:0.01',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.descuento' => 'numeric|min:0|max:100',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Validar stock antes de actualizar
            foreach ($request->detalles as $detalle) {
                $producto = Producto::with(['inventarios' => function($q) use ($pedido) {
                    $q->where('sucursal_id', $pedido->sucursal_id);
                }])->find($detalle['producto_id']);
                
                if ($producto && $producto->control_stock) {
                    $inventario = $producto->inventarios->first();
                    if (!$inventario || $inventario->stock_disponible < $detalle['cantidad_solicitada']) {
                        return back()->with('error', "Producto '{$producto->nombre}' no tiene suficiente stock. Disponible: " . ($inventario ? $inventario->stock_disponible : 0));
                    }
                }
            }
            
            // Liberar stock reservado anterior
            foreach ($pedido->detalles()->where('reservado_stock', true)->get() as $detalleAnterior) {
                if ($detalleAnterior->inventario_sucursal_id) {
                    $inventario = $detalleAnterior->inventario;
                    if ($inventario) {
                        $inventario->increment('stock_disponible', $detalleAnterior->cantidad_solicitada);
                        $inventario->decrement('stock_reservado', $detalleAnterior->cantidad_solicitada);
                    }
                }
            }
            
            // Calcular nuevos totales
            $subtotal = 0;
            $itbis = 0;
            $total = 0;
            
            foreach ($request->detalles as $detalle) {
                $precio = $detalle['precio_unitario'];
                $cantidad = $detalle['cantidad_solicitada'];
                $descuento = $detalle['descuento'] ?? 0;
                
                $subtotalItem = $precio * $cantidad;
                $descuentoMonto = ($subtotalItem * $descuento) / 100;
                $subtotalConDescuento = $subtotalItem - $descuentoMonto;
                $itbisMonto = $subtotalConDescuento * 0.18;
                $totalItem = $subtotalConDescuento + $itbisMonto;
                
                $subtotal += $subtotalConDescuento;
                $itbis += $itbisMonto;
                $total += $totalItem;
            }
            
            // Verificar límite de crédito si es a crédito
            if (in_array($pedido->condicion_pago, ['CREDITO', 'MIXTO'])) {
                $cliente = Cliente::find($request->cliente_id);
                $saldoPendiente = $this->calcularSaldoCliente($cliente->id);
                $limiteCredito = $cliente->limite_credito ?? 0;
                
                if (($saldoPendiente + $total) > $limiteCredito && $limiteCredito > 0) {
                    return back()->with('error', "El cliente excede su límite de crédito. Saldo actual: " . number_format($saldoPendiente, 2) . ", Límite: " . number_format($limiteCredito, 2));
                }
            }
            
            // Actualizar datos básicos
            $pedido->update([
                'cliente_id' => $request->cliente_id,
                'fecha_entrega' => $request->fecha_entrega,
                'prioridad' => $request->prioridad ?? $pedido->prioridad,
                'tipo_pedido' => $request->tipo_pedido ?? $pedido->tipo_pedido,
                'condicion_pago' => $request->condicion_pago ?? $pedido->condicion_pago,
                'anticipo' => $request->anticipo ?? $pedido->anticipo,
                'notas' => $request->notas ?? $pedido->notas,
                'subtotal' => $subtotal,
                'itbis' => $itbis,
                'total' => $total,
                'saldo_pendiente' => $total - ($request->anticipo ?? $pedido->anticipo),
            ]);
            
            // Eliminar detalles anteriores y crear nuevos
            $pedido->detalles()->delete();
            
            foreach ($request->detalles as $detalle) {
                $precio = $detalle['precio_unitario'];
                $cantidad = $detalle['cantidad_solicitada'];
                $descuento = $detalle['descuento'] ?? 0;
                
                $subtotalItem = $precio * $cantidad;
                $descuentoMonto = ($subtotalItem * $descuento) / 100;
                $subtotalConDescuento = $subtotalItem - $descuentoMonto;
                $itbisMonto = $subtotalConDescuento * 0.18;
                $totalItem = $subtotalConDescuento + $itbisMonto;
                
                $detallePedido = $pedido->detalles()->create([
                    'producto_id' => $detalle['producto_id'],
                    'cantidad_solicitada' => $cantidad,
                    'precio_unitario' => $precio,
                    'descuento' => $descuento,
                    'descuento_monto' => $descuentoMonto,
                    'subtotal' => $subtotalConDescuento,
                    'itbis_porcentaje' => 18.00,
                    'itbis_monto' => $itbisMonto,
                    'total' => $totalItem,
                ]);
                
                // Reservar stock si es necesario
                $producto = Producto::find($detalle['producto_id']);
                if ($producto && $producto->control_stock) {
                    $inventario = $producto->inventarios()
                        ->where('sucursal_id', $pedido->sucursal_id)
                        ->first();
                        
                    if ($inventario) {
                        $detallePedido->update([
                            'reservado_stock' => true,
                            'inventario_sucursal_id' => $inventario->id,
                        ]);
                        
                        // Reservar stock
                        $inventario->decrement('stock_disponible', $cantidad);
                        $inventario->increment('stock_reservado', $cantidad);
                    }
                }
            }
            
            // Actualizar dirección de entrega si es necesario
            if ($request->tipo_pedido === 'DOMICILIO' && isset($request->direccion_entrega)) {
                if ($pedido->direccionEntrega) {
                    $pedido->direccionEntrega()->update([
                        'nombre_contacto' => $request->direccion_entrega['nombre_contacto'] ?? '',
                        'telefono_contacto' => $request->direccion_entrega['telefono_contacto'] ?? '',
                        'direccion' => $request->direccion_entrega['direccion'] ?? '',
                        'ciudad' => $request->direccion_entrega['ciudad'] ?? '',
                        'provincia' => $request->direccion_entrega['provincia'] ?? '',
                        'sector' => $request->direccion_entrega['sector'] ?? '',
                        'codigo_postal' => $request->direccion_entrega['codigo_postal'] ?? '',
                        'instrucciones_entrega' => $request->direccion_entrega['instrucciones_entrega'] ?? '',
                    ]);
                } else {
                    $pedido->direccionEntrega()->create([
                        'nombre_contacto' => $request->direccion_entrega['nombre_contacto'] ?? '',
                        'telefono_contacto' => $request->direccion_entrega['telefono_contacto'] ?? '',
                        'direccion' => $request->direccion_entrega['direccion'] ?? '',
                        'ciudad' => $request->direccion_entrega['ciudad'] ?? '',
                        'provincia' => $request->direccion_entrega['provincia'] ?? '',
                        'sector' => $request->direccion_entrega['sector'] ?? '',
                        'codigo_postal' => $request->direccion_entrega['codigo_postal'] ?? '',
                        'instrucciones_entrega' => $request->direccion_entrega['instrucciones_entrega'] ?? '',
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('pedidos.show', $pedido)
                ->with('success', 'Pedido actualizado exitosamente');
                
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al actualizar pedido: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return back()->with('error', 'Error al actualizar pedido: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pedido $pedido)
    {
        $user = Auth::user();
        
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para eliminar este pedido');
        }
        
        if ($pedido->estado !== 'PENDIENTE') {
            return back()->with('error', 'Solo se pueden eliminar pedidos pendientes');
        }
        
        try {
            // Liberar stock reservado
            foreach ($pedido->detalles()->where('reservado_stock', true)->get() as $detalle) {
                if ($detalle->inventario_sucursal_id) {
                    $inventario = $detalle->inventario;
                    if ($inventario) {
                        $inventario->increment('stock_disponible', $detalle->cantidad_solicitada);
                        $inventario->decrement('stock_reservado', $detalle->cantidad_solicitada);
                    }
                }
            }
            
            $pedido->delete();
            
            return redirect()->route('pedidos.index')
                ->with('success', 'Pedido eliminado exitosamente');
                
        } catch (\Exception $e) {
            \Log::error('Error al eliminar pedido: ' . $e->getMessage());
            return back()->with('error', 'Error al eliminar pedido: ' . $e->getMessage());
        }
    }

    /**
     * Procesar un pedido (preparar para entrega)
     */
    public function procesar(Pedido $pedido)
    {
        $user = Auth::user();
        
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para procesar este pedido');
        }
        
        if ($pedido->estado !== 'PENDIENTE') {
            return back()->with('error', 'Solo se pueden procesar pedidos pendientes');
        }
        
        try {
            DB::beginTransaction();
            
            $pedido->update([
                'estado' => 'PROCESADO',
                'fecha_procesado' => now(),
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Pedido procesado exitosamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al procesar pedido: ' . $e->getMessage());
            return back()->with('error', 'Error al procesar pedido: ' . $e->getMessage());
        }
    }

    /**
     * Marcar pedido como entregado
     */
    public function entregar(Pedido $pedido)
    {
        $user = Auth::user();
        
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para entregar este pedido');
        }
        
        if ($pedido->estado !== 'PROCESADO') {
            return back()->with('error', 'Solo se pueden entregar pedidos procesados');
        }
        
        try {
            DB::beginTransaction();
            
            $pedido->update([
                'estado' => 'ENTREGADO',
                'fecha_entregado' => now(),
            ]);
            
            // Actualizar cantidad entregada en detalles
            foreach ($pedido->detalles as $detalle) {
                $detalle->update([
                    'cantidad_entregada' => $detalle->cantidad_solicitada,
                ]);
            }
            
            DB::commit();
            
            return back()->with('success', 'Pedido marcado como entregado');
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al entregar pedido: ' . $e->getMessage());
            return back()->with('error', 'Error al entregar pedido: ' . $e->getMessage());
        }
    }

    /**
     * Cancelar pedido
     */
    public function cancelar(Request $request, Pedido $pedido)
    {
        $user = Auth::user();
        
        if ($user->sucursal_id && $pedido->sucursal_id !== $user->sucursal_id) {
            abort(403, 'No tiene permiso para cancelar este pedido');
        }
        
        if (!in_array($pedido->estado, ['PENDIENTE', 'PROCESADO'])) {
            return back()->with('error', 'No se puede cancelar un pedido en este estado');
        }
        
        $request->validate([
            'motivo' => 'required|string|min:5',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Liberar stock reservado
            foreach ($pedido->detalles()->where('reservado_stock', true)->get() as $detalle) {
                if ($detalle->inventario_sucursal_id) {
                    $inventario = $detalle->inventario;
                    if ($inventario) {
                        $inventario->increment('stock_disponible', $detalle->cantidad_solicitada);
                        $inventario->decrement('stock_reservado', $detalle->cantidad_solicitada);
                    }
                }
            }
            
            $pedido->update([
                'estado' => 'CANCELADO',
                'fecha_cancelado' => now(),
                'motivo_cancelacion' => $request->motivo,
                'cancelado_por' => $user->id,
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Pedido cancelado exitosamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al cancelar pedido: ' . $e->getMessage());
            return back()->with('error', 'Error al cancelar pedido: ' . $e->getMessage());
        }
    }

    /**
     * Generar número de pedido único
     */
    private function generarNumeroPedido()
    {
        $year = date('y');
        $month = date('m');
        $day = date('d');
        
        $ultimoPedido = Pedido::whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->latest()
            ->first();
            
        $secuencia = $ultimoPedido 
            ? intval(substr($ultimoPedido->numero_pedido, -4)) + 1
            : 1;
            
        return sprintf('PED%s%s%s%04d', $year, $month, $day, $secuencia);
    }

    /**
     * Métodos auxiliares para obtener arrays de opciones
     */
    private function getEstados()
    {
        return [
            ['PENDIENTE', 'Pendiente'],
            ['PROCESADO', 'Procesado'], 
            ['ENTREGADO', 'Entregado'],
            ['CANCELADO', 'Cancelado']
        ];
    }

    private function getPrioridades()
    {
        return [
            ['BAJA', 'Baja'],
            ['MEDIA', 'Media'],
            ['ALTA', 'Alta'],
            ['URGENTE', 'Urgente']
        ];
    }

    private function getTiposPedido()
    {
        return [
            ['LOCAL', 'Local'],
            ['DOMICILIO', 'Domicilio'],
            ['RESERVA', 'Reserva'],
            ['PREVENTA', 'Preventa']
        ];
    }

    private function getCondicionesPago()
    {
        return [
            ['CONTADO', 'Contado'],
            ['CREDITO', 'Crédito'],
            ['MIXTO', 'Mixto']
        ];
    }

    /**
     * Calcular saldo pendiente de un cliente
     */
    private function calcularSaldoCliente($clienteId)
    {
        // Implementa la lógica para calcular el saldo pendiente del cliente
        // Esto es un ejemplo, ajusta según tu estructura de base de datos
        try {
            $cliente = Cliente::find($clienteId);
            return $cliente->saldo_pendiente ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
}