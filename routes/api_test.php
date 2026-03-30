<?php

/**
 * Rutas temporales para probar API sin autenticación
 * Solo para desarrollo - eliminar en producción
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PedidoController;

// Rutas temporales para pruebas (sin autenticación)
Route::get('/pedidos', function () {
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

Route::get('/pedidos/{id}', function ($id) {
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

Route::post('/pedidos', function () {
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

Route::put('/pedidos/{id}', function ($id) {
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

Route::post('/pedidos/{id}/procesar', function ($id) {
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

Route::delete('/pedidos/{id}', function ($id) {
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
Route::post('/login', function () {
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
