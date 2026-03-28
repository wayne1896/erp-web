import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, Shield, Settings, Key, Plus, X } from 'lucide-react';

const Create = ({ permissions }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        guard: 'web',
        permissions: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => reset(),
        });
    };

    const handlePermissionToggle = (permissionId) => {
        setData('permissions', data.permissions.includes(permissionId) 
            ? data.permissions.filter(id => id !== permissionId)
            : [...data.permissions, permissionId]
        );
    };

    const toggleAllPermissions = (group) => {
        const groupPermissions = permissions
            .filter(p => p.group === group)
            .map(p => p.id);
        
        const allSelected = groupPermissions.every(id => data.permissions.includes(id));
        
        if (allSelected) {
            // Deselect all in group
            setData('permissions', data.permissions.filter(id => !groupPermissions.includes(id)));
        } else {
            // Select all in group
            setData('permissions', [...new Set([...data.permissions, ...groupPermissions])]);
        }
    };

    const toggleAllPermissionsInAllGroups = () => {
        const allPermissionIds = permissions.map(p => p.id);
        const allSelected = allPermissionIds.every(id => data.permissions.includes(id));
        
        if (allSelected) {
            setData('permissions', []);
        } else {
            setData('permissions', allPermissionIds);
        }
    };

    const groupedPermissions = permissions.reduce((groups, permission) => {
        if (!groups[permission.group]) {
            groups[permission.group] = [];
        }
        groups[permission.group].push(permission);
        return groups;
    }, {});

    return (
        <AuthenticatedLayout>
            <Head title="Crear Rol" />

            <div className="max-w-4xl mx-auto p-6">
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crear Nuevo Rol</h1>
                            <p className="text-gray-600 dark:text-gray-400">Complete el formulario para registrar un nuevo rol</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Información Básica */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                                Información del Rol
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre del Rol *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: administrador"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Guard
                                    </label>
                                    <select
                                        value={data.guard}
                                        onChange={e => setData('guard', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="web">Web</option>
                                        <option value="api">API</option>
                                    </select>
                                    {errors.guard && <p className="mt-1 text-sm text-red-600">{errors.guard}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Describe las responsabilidades de este rol..."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Permisos */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Key className="w-5 h-5 mr-2 text-green-500" />
                                Asignar Permisos
                            </h3>
                            
                            {/* Select All/Deselect All */}
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={toggleAllPermissionsInAllGroups}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {permissions.every(p => data.permissions.includes(p.id)) ? (
                                                <>
                                                    <X className="w-4 h-4 mr-2" />
                                                    Deseleccionar Todos
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Seleccionar Todos
                                                </>
                                            )}
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {data.permissions.length} de {permissions.length} permisos seleccionados
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Permission Groups */}
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
                                    <div key={group} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                                {group}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllPermissions(group)}
                                                className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                {groupPermissions.every(p => data.permissions.includes(p.id)) ? 'Deseleccionar grupo' : 'Seleccionar grupo'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groupPermissions.map(permission => (
                                                <label
                                                    key={permission.id}
                                                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                                                        data.permissions.includes(permission.id)
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.permissions.includes(permission.id)}
                                                        onChange={() => handlePermissionToggle(permission.id)}
                                                        className="mr-3 mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {permission.name}
                                                        </div>
                                                        {permission.description && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {permission.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.permissions && <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>}
                        </div>

                        {/* Botones */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href={route('roles.index')}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Guardando...' : 'Guardar Rol'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;
