import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Shield, Users, Settings, Calendar, Edit, Trash2, Key } from 'lucide-react';

const Show = ({ role }) => {
    // Early return if role is not available
    if (!role) {
        return (
            <AuthenticatedLayout>
                <Head title="Rol no encontrado" />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Rol no encontrado
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                El rol que buscas no existe o no tienes permisos para verlo.
                            </p>
                            <Link
                                href={route('roles.index')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a Roles
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Rol: ${role.name}`} />

            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('roles.index')}
                            className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalles del Rol</h1>
                            <p className="text-gray-600 dark:text-gray-400">Información completa del rol</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('roles.edit', role.id)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card Información del Rol */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                                Información del Rol
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre del Rol</label>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{role.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Guard</label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                            {role.guard}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {role.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Activo
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Permisos */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Key className="w-5 h-5 mr-2 text-purple-500" />
                                Permisos Asignados
                            </h2>
                            
                            {role.permissions && role.permissions.length > 0 ? (
                                <div className="space-y-4">
                                    {role.permissions.reduce((groups, permission) => {
                                        const group = permission.group || 'Otros';
                                        if (!groups[group]) groups[group] = [];
                                        groups[group].push(permission);
                                        return groups;
                                    }, {})}
                                    
                                    {Object.entries(role.permissions.reduce((groups, permission) => {
                                        const group = permission.group || 'Otros';
                                        if (!groups[group]) groups[group] = [];
                                        groups[group].push(permission);
                                        return groups;
                                    }, {})).map(([group, groupPermissions]) => (
                                        <div key={group} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                                                {group}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {groupPermissions.map(permission => (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {permission.name}
                                                            </div>
                                                            {permission.description && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {permission.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Este rol no tiene permisos asignados</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Card Estadísticas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Estadísticas</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID del Rol</label>
                                    <p className="text-gray-900 dark:text-gray-100">#{role.id}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios con este rol</label>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {role.users_count || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Permisos</label>
                                    <div className="flex items-center">
                                        <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {role.permissions_count || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Información de Sistema */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                                Información de Sistema
                            </h2>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {new Date(role.created_at).toLocaleDateString('es-DO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Actualización</label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {new Date(role.updated_at).toLocaleDateString('es-DO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Acciones Rápidas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Acciones Rápidas</h2>
                            
                            <div className="space-y-3">
                                <Link
                                    href={route('roles.edit', role.id)}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Rol
                                </Link>
                                
                                {role.name !== 'admin' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.')) {
                                                router.delete(route('roles.destroy', role.id));
                                            }
                                        }}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar Rol
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Show;
