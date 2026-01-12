<?php
// app/Http/Controllers/Api/Mobile/AuthController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Sucursal;

class AuthController extends Controller
{
    /**
     * Login para app móvil
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);
        
        // Buscar usuario activo
        $user = User::where('email', $request->email)
            ->where('activo', true)
            ->first();
        
        // Verificar credenciales
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }
        
        // Verificar que el usuario sea vendedor o administrador
        if (!in_array($user->tipo_usuario, ['admin', 'vendedor', 'gerente'])) {
            return response()->json([
                'message' => 'No tienes permisos para acceder a la app móvil.'
            ], 403);
        }
        
        // Crear token de acceso
        $token = $user->createToken($request->device_name)->plainTextToken;
        
        // Obtener información de la sucursal
        $sucursal = $user->sucursal;
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tipo_usuario' => $user->tipo_usuario,
                'cedula' => $user->cedula_formateada,
                'telefono' => $user->telefono,
            ],
            'sucursal' => $sucursal ? [
                'id' => $sucursal->id,
                'nombre' => $sucursal->nombre,
                'direccion' => $sucursal->direccion,
                'telefono' => $sucursal->telefono,
            ] : null,
            'token' => $token,
            'configuracion' => [
                'moneda' => 'DOP',
                'simbolo_moneda' => 'RD$',
                'itbis_porcentaje' => 18.00,
                'pais' => 'DO',
                'zona_horaria' => 'America/Santo_Domingo',
            ]
        ]);
    }
    
    /**
     * Obtener información del usuario autenticado
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $sucursal = $user->sucursal;
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tipo_usuario' => $user->tipo_usuario,
                'cedula' => $user->cedula_formateada,
                'telefono' => $user->telefono,
            ],
            'sucursal' => $sucursal ? [
                'id' => $sucursal->id,
                'nombre' => $sucursal->nombre,
                'direccion' => $sucursal->direccion,
                'telefono' => $sucursal->telefono,
            ] : null,
        ]);
    }
    
    /**
     * Logout - Revocar token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.'
        ]);
    }
}