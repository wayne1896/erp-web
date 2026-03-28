<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['sucursal', 'roles']);

        // Filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cedula', 'like', "%{$search}%");
            });
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->get('activo') === '1');
        }

        if ($request->filled('sucursal_id')) {
            $query->where('sucursal_id', $request->get('sucursal_id'));
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->get('role'));
            });
        }

        $usuarios = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sucursales = Sucursal::orderBy('nombre')->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Users/Index', [
            'usuarios' => $usuarios,
            'sucursales' => $sucursales,
            'roles' => $roles,
            'filters' => $request->only(['search', 'activo', 'sucursal_id', 'role'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $sucursales = Sucursal::orderBy('nombre')->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Users/Create', [
            'sucursales' => $sucursales,
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'cedula' => 'required|string|max:20|unique:users',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'tipo_usuario' => 'required|in:admin,vendedor,cajero,gerente',
            'sucursal_id' => 'required|exists:sucursales,id',
            'activo' => 'boolean',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        try {
            $usuario = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cedula' => $validated['cedula'],
                'telefono' => $validated['telefono'],
                'direccion' => $validated['direccion'],
                'password' => Hash::make($validated['password']),
                'tipo_usuario' => $validated['tipo_usuario'],
                'sucursal_id' => $validated['sucursal_id'],
                'activo' => $validated['activo'] ?? true
            ]);

            // Asignar roles
            $usuario->syncRoles($validated['roles']);

            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario creado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al crear usuario: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['sucursal', 'roles', 'permissions']);

        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $sucursales = Sucursal::orderBy('nombre')->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'sucursales' => $sucursales,
            'roles' => $roles
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'cedula' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users')->ignore($user->id)
            ],
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
            'tipo_usuario' => 'required|in:admin,vendedor,cajero,gerente',
            'sucursal_id' => 'required|exists:sucursales,id',
            'activo' => 'boolean',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        try {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cedula' => $validated['cedula'],
                'telefono' => $validated['telefono'],
                'direccion' => $validated['direccion'],
                'tipo_usuario' => $validated['tipo_usuario'],
                'sucursal_id' => $validated['sucursal_id'],
                'activo' => $validated['activo'] ?? true
            ];

            // Solo actualizar contraseña si se proporciona
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Actualizar roles
            $user->syncRoles($validated['roles']);

            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario actualizado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al actualizar usuario: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            // Evitar eliminar al usuario autenticado actual
            if ($user->id === auth()->id()) {
                return back()->with('error', 'No puedes eliminar tu propio usuario');
            }

            $user->delete();

            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario eliminado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al eliminar usuario: ' . $e->getMessage());
        }
    }

    /**
     * Toggle user status
     */
    public function toggleStatus(User $user)
    {
        try {
            // Evitar desactivar al usuario autenticado actual
            if ($user->id === auth()->id()) {
                return back()->with('error', 'No puedes cambiar tu propio estado');
            }

            $user->update(['activo' => !$user->activo]);

            $status = $user->activo ? 'activado' : 'desactivado';
            
            return redirect()
                ->route('users.index')
                ->with('success', "Usuario {$status} exitosamente");

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al cambiar estado: ' . $e->getMessage());
        }
    }
}
