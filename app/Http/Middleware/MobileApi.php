<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MobileApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar que el usuario esté autenticado
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        $user = $request->user();

        // Verificar que el usuario esté activo
        if (!$user->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo',
            ], 403);
        }

        // Verificar que el usuario tenga permisos para usar la app móvil
        $tiposPermitidos = ['admin', 'vendedor', 'gerente', 'almacen'];
        if (!in_array($user->tipo_usuario, $tiposPermitidos)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para acceder a la app móvil',
            ], 403);
        }

        // Agregar información del usuario a la request para uso en controladores
        $request->merge([
            'user_id' => $user->id,
            'sucursal_id' => $user->sucursal_id,
            'tipo_usuario' => $user->tipo_usuario,
        ]);

        return $next($request);
    }
}