import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, CreditCard, Building, Shield, Key } from 'lucide-react';

const Edit = ({ user, roles, sucursales }) => {
    // Early return if user is not available
    if (!user) {
        return (
            <AuthenticatedLayout>
                <Head title="Usuario no encontrado" />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Usuario no encontrado
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                El usuario que buscas no existe o no tienes permisos para editarlo.
                            </p>
                            <Link
                                href={route('users.index')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a Usuarios
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        cedula: user.cedula || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        tipo_usuario: user.tipo_usuario || 'vendedor',
        sucursal_id: user.sucursal_id || '',
        roles: user.roles?.map(role => role.id) || [],
        activo: user.activo ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const handleRoleToggle = (roleId) => {
        setData('roles', data.roles.includes(roleId) 
            ? data.roles.filter(id => id !== roleId)
            : [...data.roles, roleId]
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar Usuario: ${user?.name || 'Detalles'}`} />

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('users.show', user.id)}
                            className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar Usuario</h1>
                            <p className="text-gray-600 dark:text-gray-400">Modifique la información del usuario</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Información Personal */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-500" />
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Correo Electrónico *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="usuario@ejemplo.com"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cédula
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.cedula}
                                            onChange={e => setData('cedula', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="000-0000000-0"
                                        />
                                    </div>
                                    {errors.cedula && <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={data.telefono}
                                            onChange={e => setData('telefono', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="809-000-0000"
                                        />
                                    </div>
                                    {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Dirección
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <textarea
                                            value={data.direccion}
                                            onChange={e => setData('direccion', e.target.value)}
                                            rows={2}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Calle Principal #123, Santo Domingo"
                                        />
                                    </div>
                                    {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Información de Acceso */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Key className="w-5 h-5 mr-2 text-green-500" />
                                Información de Acceso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Dejar en blanco para mantener la actual"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Repetir nueva contraseña"
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Deje estos campos en blanco si no desea cambiar la contraseña
                            </p>
                        </div>

                        {/* Configuración */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-purple-500" />
                                Configuración
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Usuario
                                    </label>
                                    <select
                                        value={data.tipo_usuario}
                                        onChange={e => setData('tipo_usuario', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="admin">Administrador</option>
                                        <option value="gerente">Gerente</option>
                                        <option value="vendedor">Vendedor</option>
                                        <option value="cajero">Cajero</option>
                                    </select>
                                    {errors.tipo_usuario && <p className="mt-1 text-sm text-red-600">{errors.tipo_usuario}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sucursal
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            value={data.sucursal_id}
                                            onChange={e => setData('sucursal_id', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Seleccionar sucursal</option>
                                            {sucursales.map(sucursal => (
                                                <option key={sucursal.id} value={sucursal.id}>
                                                    {sucursal.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.sucursal_id && <p className="mt-1 text-sm text-red-600">{errors.sucursal_id}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={data.activo}
                                            onChange={e => setData('activo', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Usuario activo
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Roles */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-orange-500" />
                                Asignar Roles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {roles.map(role => (
                                    <label
                                        key={role.id}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                            data.roles.includes(role.id)
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.roles.includes(role.id)}
                                            onChange={() => handleRoleToggle(role.id)}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {role.name}
                                            </div>
                                            {role.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {role.description}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
                        </div>

                        {/* Botones */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href={route('users.show', user.id)}
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
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit;
