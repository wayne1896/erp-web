<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class PermissionsAndRolesSeeder extends Seeder
{
    public function run(): void
    {
        // Crear permisos
        $permissions = [
            // Usuarios
            ['name' => 'users.index', 'description' => 'Ver lista de usuarios', 'group' => 'users'],
            ['name' => 'users.create', 'description' => 'Crear usuarios', 'group' => 'users'],
            ['name' => 'users.store', 'description' => 'Guardar usuarios', 'group' => 'users'],
            ['name' => 'users.show', 'description' => 'Ver detalles de usuario', 'group' => 'users'],
            ['name' => 'users.edit', 'description' => 'Editar usuarios', 'group' => 'users'],
            ['name' => 'users.update', 'description' => 'Actualizar usuarios', 'group' => 'users'],
            ['name' => 'users.destroy', 'description' => 'Eliminar usuarios', 'group' => 'users'],
            ['name' => 'users.toggle-status', 'description' => 'Activar/desactivar usuarios', 'group' => 'users'],

            // Roles
            ['name' => 'roles.index', 'description' => 'Ver lista de roles', 'group' => 'roles'],
            ['name' => 'roles.create', 'description' => 'Crear roles', 'group' => 'roles'],
            ['name' => 'roles.store', 'description' => 'Guardar roles', 'group' => 'roles'],
            ['name' => 'roles.show', 'description' => 'Ver detalles de rol', 'group' => 'roles'],
            ['name' => 'roles.edit', 'description' => 'Editar roles', 'group' => 'roles'],
            ['name' => 'roles.update', 'description' => 'Actualizar roles', 'group' => 'roles'],
            ['name' => 'roles.destroy', 'description' => 'Eliminar roles', 'group' => 'roles'],
            ['name' => 'roles.statistics', 'description' => 'Ver estadísticas de roles', 'group' => 'roles'],

            // Permisos
            ['name' => 'permissions.index', 'description' => 'Ver lista de permisos', 'group' => 'permissions'],
            ['name' => 'permissions.create', 'description' => 'Crear permisos', 'group' => 'permissions'],
            ['name' => 'permissions.store', 'description' => 'Guardar permisos', 'group' => 'permissions'],
            ['name' => 'permissions.show', 'description' => 'Ver detalles de permiso', 'group' => 'permissions'],
            ['name' => 'permissions.edit', 'description' => 'Editar permisos', 'group' => 'permissions'],
            ['name' => 'permissions.update', 'description' => 'Actualizar permisos', 'group' => 'permissions'],
            ['name' => 'permissions.destroy', 'description' => 'Eliminar permisos', 'group' => 'permissions'],
            ['name' => 'permissions.statistics', 'description' => 'Ver estadísticas de permisos', 'group' => 'permissions'],
            ['name' => 'permissions.sync-roles', 'description' => 'Sincronizar permisos con roles', 'group' => 'permissions'],

            // Productos
            ['name' => 'products.index', 'description' => 'Ver lista de productos', 'group' => 'products'],
            ['name' => 'products.create', 'description' => 'Crear productos', 'group' => 'products'],
            ['name' => 'products.store', 'description' => 'Guardar productos', 'group' => 'products'],
            ['name' => 'products.show', 'description' => 'Ver detalles de producto', 'group' => 'products'],
            ['name' => 'products.edit', 'description' => 'Editar productos', 'group' => 'products'],
            ['name' => 'products.update', 'description' => 'Actualizar productos', 'group' => 'products'],
            ['name' => 'products.destroy', 'description' => 'Eliminar productos', 'group' => 'products'],

            // Ventas
            ['name' => 'sales.index', 'description' => 'Ver lista de ventas', 'group' => 'sales'],
            ['name' => 'sales.create', 'description' => 'Crear ventas', 'group' => 'sales'],
            ['name' => 'sales.store', 'description' => 'Guardar ventas', 'group' => 'sales'],
            ['name' => 'sales.show', 'description' => 'Ver detalles de venta', 'group' => 'sales'],
            ['name' => 'sales.edit', 'description' => 'Editar ventas', 'group' => 'sales'],
            ['name' => 'sales.update', 'description' => 'Actualizar ventas', 'group' => 'sales'],
            ['name' => 'sales.destroy', 'description' => 'Eliminar ventas', 'group' => 'sales'],

            // Caja
            ['name' => 'cash.index', 'description' => 'Ver lista de cajas', 'group' => 'cash'],
            ['name' => 'cash.create', 'description' => 'Crear cajas', 'group' => 'cash'],
            ['name' => 'cash.store', 'description' => 'Guardar cajas', 'group' => 'cash'],
            ['name' => 'cash.show', 'description' => 'Ver detalles de caja', 'group' => 'cash'],
            ['name' => 'cash.edit', 'description' => 'Editar cajas', 'group' => 'cash'],
            ['name' => 'cash.update', 'description' => 'Actualizar cajas', 'group' => 'cash'],
            ['name' => 'cash.destroy', 'description' => 'Eliminar cajas', 'group' => 'cash'],
            ['name' => 'cash.open', 'description' => 'Abrir cajas', 'group' => 'cash'],
            ['name' => 'cash.close', 'description' => 'Cerrar cajas', 'group' => 'cash'],

            // Auditoría
            ['name' => 'audit.index', 'description' => 'Ver lista de auditorías', 'group' => 'audit'],
            ['name' => 'audit.create', 'description' => 'Crear auditorías', 'group' => 'audit'],
            ['name' => 'audit.store', 'description' => 'Guardar auditorías', 'group' => 'audit'],
            ['name' => 'audit.show', 'description' => 'Ver detalles de auditoría', 'group' => 'audit'],
            ['name' => 'audit.edit', 'description' => 'Editar auditorías', 'group' => 'audit'],
            ['name' => 'audit.update', 'description' => 'Actualizar auditorías', 'group' => 'audit'],
            ['name' => 'audit.destroy', 'description' => 'Eliminar auditorías', 'group' => 'audit'],

            // Sistema
            ['name' => 'system.index', 'description' => 'Ver lista de auditorías del sistema', 'group' => 'system'],
            ['name' => 'system.show', 'description' => 'Ver detalles de auditoría del sistema', 'group' => 'system'],

            // Reportes
            ['name' => 'reports.index', 'description' => 'Ver lista de reportes', 'group' => 'reports'],
            ['name' => 'reports.create', 'description' => 'Crear reportes', 'group' => 'reports'],
            ['name' => 'reports.show', 'description' => 'Ver detalles de reporte', 'group' => 'reports'],
            ['name' => 'reports.export', 'description' => 'Exportar reportes', 'group' => 'reports'],

            // Dashboard
            ['name' => 'dashboard.view', 'description' => 'Ver dashboard', 'group' => 'dashboard'],
            ['name' => 'dashboard.statistics', 'description' => 'Ver estadísticas del dashboard', 'group' => 'dashboard'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                [
                    'description' => $permission['description'],
                    'group' => $permission['group'],
                    'guard_name' => 'web'
                ]
            );
        }

        // Crear roles
        $roles = [
            ['name' => 'admin', 'description' => 'Administrador del sistema'],
            ['name' => 'gerente', 'description' => 'Gerente de sucursal'],
            ['name' => 'vendedor', 'description' => 'Vendedor de tienda'],
            ['name' => 'cajero', 'description' => 'Cajero del sistema'],
        ];

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleData['name']],
                ['description' => $roleData['description']]
            );
        }

        // Asignar permisos a roles
        $adminRole = Role::where('name', 'admin')->first();
        $gerenteRole = Role::where('name', 'gerente')->first();
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $cajeroRole = Role::where('name', 'cajero')->first();

        // Admin: Todos los permisos
        $adminRole->givePermissionTo(Permission::all());

        // Gerente: Permisos de gestión excepto usuarios/roles/permisos
        $gerentePermissions = Permission::whereIn('group', ['products', 'sales', 'cash', 'audit', 'system', 'reports', 'dashboard'])->get();
        $gerenteRole->givePermissionTo($gerentePermissions);

        // Vendedor: Permisos de productos y ventas
        $vendedorPermissions = Permission::whereIn('group', ['products', 'sales', 'dashboard'])->get();
        $vendedorRole->givePermissionTo($vendedorPermissions);

        // Cajero: Permisos de ventas y caja básicos
        $cajeroPermissions = Permission::whereIn('group', ['sales', 'cash', 'dashboard'])
            ->whereIn('name', ['sales.index', 'sales.create', 'sales.store', 'sales.show', 'cash.index', 'cash.show', 'dashboard.view'])
            ->get();
        $cajeroRole->givePermissionTo($cajeroPermissions);

        // Asignar rol admin al usuario 1
        $user = User::find(1);
        if ($user) {
            $user->assignRole('admin');
        }

        $this->command->info('Permisos y roles creados exitosamente');
    }
}
