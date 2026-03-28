<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Permission::with('roles');

        // Filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('guard_name')) {
            $query->where('guard_name', $request->get('guard_name'));
        }

        if ($request->filled('group')) {
            $query->where('group', 'like', "%{$request->get('group')}%");
        }

        $permissions = $query->orderBy('group')->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $guards = ['web', 'api'];
        $groups = Permission::selectRaw('DISTINCT `group`')->pluck('group')->filter();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
            'guards' => $guards,
            'groups' => $groups,
            'filters' => $request->only(['search', 'guard_name', 'group'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $guards = ['web', 'api'];
        $groups = [
            'users' => 'Gestión de Usuarios',
            'products' => 'Gestión de Productos',
            'sales' => 'Gestión de Ventas',
            'inventory' => 'Gestión de Inventario',
            'reports' => 'Reportes y Estadísticas',
            'system' => 'Configuración del Sistema',
            'auditoria' => 'Auditoría y Logs'
        ];

        return Inertia::render('Permissions/Create', [
            'guards' => $guards,
            'groups' => $groups
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'guard_name' => 'required|string|max:255|in:web,api',
            'group' => 'required|string|max:100',
            'description' => 'nullable|string|max:500'
        ]);

        try {
            Permission::create([
                'name' => $validated['name'],
                'guard_name' => $validated['guard_name'],
                'group' => $validated['group'],
                'description' => $validated['description']
            ]);

            return redirect()
                ->route('permissions.index')
                ->with('success', 'Permiso creado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al crear permiso: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        $permission->load('roles');

        return Inertia::render('Permissions/Show', [
            'permission' => $permission
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        $guards = ['web', 'api'];
        $groups = [
            'users' => 'Gestión de Usuarios',
            'products' => 'Gestión de Productos',
            'sales' => 'Gestión de Ventas',
            'inventory' => 'Gestión de Inventario',
            'reports' => 'Reportes y Estadísticas',
            'system' => 'Configuración del Sistema',
            'auditoria' => 'Auditoría y Logs'
        ];

        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
            'guards' => $guards,
            'groups' => $groups
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'guard_name' => 'required|string|max:255|in:web,api',
            'group' => 'required|string|max:100',
            'description' => 'nullable|string|max:500'
        ]);

        try {
            $permission->update([
                'name' => $validated['name'],
                'guard_name' => $validated['guard_name'],
                'group' => $validated['group'],
                'description' => $validated['description']
            ]);

            return redirect()
                ->route('permissions.index')
                ->with('success', 'Permiso actualizado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al actualizar permiso: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        try {
            // Evitar eliminar permisos del sistema
            if (in_array($permission->name, ['super-admin', 'admin-access'])) {
                return back()->with('error', 'No puedes eliminar permisos del sistema');
            }

            $permission->delete();

            return redirect()
                ->route('permissions.index')
                ->with('success', 'Permiso eliminado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al eliminar permiso: ' . $e->getMessage());
        }
    }

    /**
     * Get permission statistics
     */
    public function statistics()
    {
        $stats = [
            'total_permissions' => Permission::count(),
            'permissions_by_guard' => Permission::selectRaw('guard_name, COUNT(*) as count')
                ->groupBy('guard_name')
                ->get(),
            'permissions_by_group' => Permission::selectRaw('`group`, COUNT(*) as count')
                ->groupBy('group')
                ->orderBy('count', 'desc')
                ->get(),
            'orphaned_permissions' => Permission::whereDoesntHave('roles')->count()
        ];

        return response()->json($stats);
    }

    /**
     * Sync permissions with roles
     */
    public function syncWithRoles(Request $request)
    {
        $validated = $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id'
        ]);

        try {
            $permission = Permission::find($validated['permission_id']);
            $permission->roles()->sync($validated['role_ids']);

            return response()->json([
                'success' => true,
                'message' => 'Permisos sincronizados exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al sincronizar permisos: ' . $e->getMessage()
            ], 500);
        }
    }
}
