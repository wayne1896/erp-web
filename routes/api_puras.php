<?php

/**
 * Rutas temporales para probar API sin autenticación NI MIDDLEWARE
 * Solo para desarrollo - eliminar en producción
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PedidoController;

// Rutas temporales para pruebas (SIN MIDDLEWARE ALGUNO)
Route::get('test-pedidos', function () {
    $controller = new PedidoController();
    
    // Crear un request falso sin usuario para pruebas
    $request = new \Illuminate\Http\Request();
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->index($request);
});

Route::get('test-pedidos/{id}', function ($id) {
    $controller = new PedidoController();
    
    // Crear un request falso sin usuario para pruebas
    $request = new \Illuminate\Http\Request();
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->show($id);
});

Route::post('test-pedidos', function () {
    $controller = new PedidoController();
    
    // Request con datos de prueba
    $requestData = [
        'cliente_id' => 1,
        'fecha_entrega' => '2026-04-23',
        'tipo_pedido' => 'DOMICILIO',
        'prioridad' => 'MEDIA',
        'condicion_pago' => 'CONTADO',
        'notas' => 'Pedido de prueba desde API',
        'direccion_entrega' => [
            'nombre_contacto' => 'Oneyda Tejada',
            'telefono_contacto' => '809-296-6337',
            'direccion' => 'Autopista duarte km 91 detras del restaurante Sagrado Corazon'
        ],
        'items' => [
            [
                'producto_id' => 1,
                'cantidad' => 1,
                'descuento' => 5
            ]
        ]
    ];
    
    $request = new \Illuminate\Http\Request([], $requestData);
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->store($request);
});

Route::put('test-pedidos/{id}', function ($id) {
    $controller = new PedidoController();
    
    $requestData = [
        'fecha_entrega' => '2026-04-25',
        'prioridad' => 'ALTA',
        'notas' => 'Pedido actualizado desde API de pruebas'
    ];
    
    $request = new \Illuminate\Http\Request([], $requestData);
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->update($request, $id);
});

Route::post('test-pedidos/{id}/procesar', function ($id) {
    $controller = new PedidoController();
    
    $requestData = [
        'notas' => 'Pedido procesado desde API de pruebas'
    ];
    
    $request = new \Illuminate\Http\Request([], $requestData);
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->procesar($request, $id);
});

Route::delete('test-pedidos/{id}', function ($id) {
    $controller = new PedidoController();
    
    $request = new \Illuminate\Http\Request();
    $request->setUserResolver(function () {
        // Usuario falso para pruebas
        $user = new \stdClass();
        $user->id = 1;
        return $user;
    });
    
    return $controller->destroy($id);
});

// Ruta para obtener token de prueba
Route::post('test-login', function () {
    // Usuario de prueba
    $user = \App\Models\User::find(1);
    
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Usuario de prueba no encontrado'
        ], 404);
    }
    
    // Crear token manualmente (para pruebas)
    $token = \Illuminate\Support\Facades\Auth::login($user);
    
    return response()->json([
        'success' => true,
        'message' => 'Login exitoso',
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email
        ]
    ]);
});

// ==================== ENDPOINTS PARA CREAR NUEVO PEDIDO ====================

// Obtener clientes disponibles para crear pedido
Route::get('clientes-disponibles', function () {
    try {
        $clientes = \App\Models\Cliente::where('activo', true)
            ->select('id', 'nombre_completo', 'nombre', 'cedula_rnc', 'telefono', 'email', 'direccion', 'sector', 'municipio', 'provincia')
            ->orderBy('nombre_completo')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $clientes->map(function ($cliente) {
                return [
                    'id' => $cliente->id,
                    'nombre' => $cliente->nombre_completo ?: $cliente->nombre ?: 'CONSUMIDOR FINAL',
                    'rnc' => $cliente->cedula_rnc ?: '000-0000000-0',
                    'telefono' => $cliente->telefono ?: '',
                    'email' => $cliente->email ?: '',
                    'direccion' => $cliente->direccion ?: '',
                    'sector' => $cliente->sector ?: '',
                    'municipio' => $cliente->municipio ?: '',
                    'provincia' => $cliente->provincia ?: '',
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener clientes: ' . $e->getMessage()
        ], 500);
    }
});

// Obtener productos disponibles con stock
Route::get('productos-disponibles', function () {
    try {
        $productos = \App\Models\Producto::with(['categoria', 'inventarios'])
            ->where('activo', true)
            ->whereHas('inventarios', function ($query) {
                $query->where('stock_disponible', '>', 0);
            })
            ->select('id', 'nombre', 'codigo', 'descripcion', 'precio_venta', 'categoria_id', 'itbis_porcentaje')
            ->orderBy('nombre')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $productos->map(function ($producto) {
                $stockDisponible = $producto->inventarios->sum('stock_disponible');
                
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'codigo' => $producto->codigo ?: '',
                    'descripcion' => $producto->descripcion ?: '',
                    'precio_venta' => (float) $producto->precio_venta,
                    'stock_disponible' => $stockDisponible,
                    'categoria' => $producto->categoria ? $producto->categoria->nombre : '',
                    'categoria_id' => $producto->categoria_id,
                    'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                    'imagen' => $producto->imagen ?? null,
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener productos: ' . $e->getMessage()
        ], 500);
    }
});

// Crear nuevo pedido completo
Route::post('pedidos-nuevo', function (\Illuminate\Http\Request $request) {
    try {
        // Validación de datos
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'fecha_entrega' => 'required|date|after_or_equal:today',
            'tipo_pedido' => 'required|in:LOCAL,DOMICILIO,RESERVA,PREVENTA',
            'prioridad' => 'required|in:BAJA,MEDIA,ALTA,URGENTE',
            'condicion_pago' => 'required|in:CONTADO,CREDITO,MIXTO',
            'anticipo' => 'nullable|numeric|min:0',
            'notas' => 'nullable|string|max:1000',
            'direccion_entrega' => 'required_if:tipo_pedido,DOMICILIO|array',
            'direccion_entrega.nombre_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:255',
            'direccion_entrega.telefono_contacto' => 'required_if:tipo_pedido,DOMICILIO|string|max:20',
            'direccion_entrega.direccion' => 'required_if:tipo_pedido,DOMICILIO|string|max:500',
            'direccion_entrega.ciudad' => 'nullable|string|max:100',
            'direccion_entrega.provincia' => 'nullable|string|max:100',
            'direccion_entrega.sector' => 'nullable|string|max:100',
            'direccion_entrega.codigo_postal' => 'nullable|string|max:20',
            'direccion_entrega.instrucciones_entrega' => 'nullable|string|max:500',
            'direccion_entrega.latitud' => 'nullable|numeric',
            'direccion_entrega.longitud' => 'nullable|numeric',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.descuento' => 'nullable|integer|min:0|max:100',
        ]);
        
        // Usar el controller existente
        $controller = new PedidoController();
        
        // Crear un request falso con usuario para pruebas
        $newRequest = new \Illuminate\Http\Request([], $validated);
        $newRequest->setUserResolver(function () {
            // Usuario falso para pruebas
            $user = new \stdClass();
            $user->id = 1;
            return $user;
        });
        
        return $controller->store($newRequest);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al crear pedido: ' . $e->getMessage()
        ], 500);
    }
});

// Calcular totales del pedido y validar stock
Route::post('calcular-pedido', function (\Illuminate\Http\Request $request) {
    try {
        // Validación de datos
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.descuento' => 'nullable|integer|min:0|max:100',
        ]);
        
        $subtotal = 0;
        $descuentoTotal = 0;
        $itbisTotal = 0;
        $total = 0;
        $itemsCalculados = [];
        $erroresStock = [];
        
        foreach ($validated['items'] as $index => $item) {
            $producto = \App\Models\Producto::with(['inventarios'])->find($item['producto_id']);
            
            if (!$producto) {
                $erroresStock[] = "Producto ID {$item['producto_id']} no encontrado";
                continue;
            }
            
            // Verificar stock disponible
            $stockDisponible = $producto->inventarios->sum('stock_disponible');
            
            if ($stockDisponible < $item['cantidad']) {
                $erroresStock[] = "Producto '{$producto->nombre}' tiene {$stockDisponible} unidades disponibles, pero se solicitaron {$item['cantidad']}";
                continue;
            }
            
            // Calcular precios
            $precioUnitario = $producto->precio_venta;
            $cantidad = $item['cantidad'];
            $descuentoPorcentaje = $item['descuento'] ?? 0;
            
            $subtotalItem = $precioUnitario * $cantidad;
            $descuentoMonto = $subtotalItem * ($descuentoPorcentaje / 100);
            $subtotalConDescuento = $subtotalItem - $descuentoMonto;
            $itbisMonto = $subtotalConDescuento * ($producto->itbis_porcentaje / 100);
            $totalItem = $subtotalConDescuento + $itbisMonto;
            
            // Acumular totales
            $subtotal += $subtotalItem;
            $descuentoTotal += $descuentoMonto;
            $itbisTotal += $itbisMonto;
            $total += $totalItem;
            
            // Agregar item calculado
            $itemsCalculados[] = [
                'producto_id' => $producto->id,
                'producto_nombre' => $producto->nombre,
                'producto_codigo' => $producto->codigo,
                'categoria' => $producto->categoria ? $producto->categoria->nombre : '',
                'cantidad' => $cantidad,
                'precio_unitario' => (float) $precioUnitario,
                'descuento_porcentaje' => (float) $descuentoPorcentaje,
                'descuento_monto' => (float) $descuentoMonto,
                'subtotal' => (float) $subtotalConDescuento,
                'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
                'itbis_monto' => (float) $itbisMonto,
                'total' => (float) $totalItem,
                'stock_disponible' => $stockDisponible,
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'items' => $itemsCalculados,
                'resumen' => [
                    'subtotal' => (float) $subtotal,
                    'descuento_total' => (float) $descuentoTotal,
                    'itbis_total' => (float) $itbisTotal,
                    'total' => (float) $total,
                    'cantidad_productos' => count($itemsCalculados),
                ],
                'errores_stock' => $erroresStock,
                'puede_procesar' => empty($erroresStock)
            ]
        ]);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al calcular pedido: ' . $e->getMessage()
        ], 500);
    }
});
