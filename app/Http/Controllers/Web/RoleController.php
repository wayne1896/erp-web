<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Role::with('permissions');

        // Filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('guard_name')) {
            $query->where('guard_name', $request->get('guard_name'));
        }

        $roles = $query->withCount(['users', 'permissions'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $guards = ['web', 'api'];

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'guards' => $guards,
            'filters' => $request->only(['search', 'guard_name'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::orderBy('name')->get();
        $guards = ['web', 'api'];

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
            'guards' => $guards
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'guard_name' => 'required|string|max:255|in:web,api',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        try {
            $role = Role::create([
                'name' => $validated['name'],
                'guard_name' => $validated['guard_name']
            ]);

            // Asignar permisos
            if (!empty($validated['permissions'])) {
                $role->syncPermissions($validated['permissions']);
            }

            return redirect()
                ->route('roles.index')
                ->with('success', 'Rol creado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al crear rol: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load(['permissions', 'users']);

        return Inertia::render('Roles/Show', [
            'role' => $role
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('name')->get();
        $guards = ['web', 'api'];

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'guards' => $guards
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'guard_name' => 'required|string|max:255|in:web,api',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        try {
            $role->update([
                'name' => $validated['name'],
                'guard_name' => $validated['guard_name']
            ]);

            // Actualizar permisos
            $role->syncPermissions($validated['permissions'] ?? []);

            return redirect()
                ->route('roles.index')
                ->with('success', 'Rol actualizado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al actualizar rol: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        try {
            // Evitar eliminar roles del sistema
            if (in_array($role->name, ['Super Admin', 'Admin'])) {
                return back()->with('error', 'No puedes eliminar roles del sistema');
            }

            $role->delete();

            return redirect()
                ->route('roles.index')
                ->with('success', 'Rol eliminado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al eliminar rol: ' . $e->getMessage());
        }
    }

    /**
     * Get role statistics
     */
    public function statistics()
    {
        $stats = [
            'total_roles' => Role::count(),
            'total_permissions' => Permission::count(),
            'roles_by_guard' => Role::selectRaw('guard_name, COUNT(*) as count')
                ->groupBy('guard_name')
                ->get(),
            'most_used_roles' => Role::withCount('users')
                ->orderBy('users_count', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json($stats);
    }
}
