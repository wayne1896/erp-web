import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    UserPlus,
    ToggleLeft,
    ToggleRight,
    Users,
    Shield,
    Building
} from 'lucide-react';

export default function UsersIndex({ usuarios, sucursales, roles, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                Gestión de Usuarios
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Administra todos los usuarios del sistema
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href={route('users.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Link>
                </div>
            }
        >
            <Head title="Usuarios" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o cédula..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                    <option value="">Todas las sucursales</option>
                                    {sucursales.map(sucursal => (
                                        <option key={sucursal.id} value={sucursal.id}>
                                            {sucursal.nombre}
                                        </option>
                                    ))}
                                </select>
                                <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                    <option value="">Todos los roles</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                    <option value="">Todos los estados</option>
                                    <option value="1">Activos</option>
                                    <option value="0">Inactivos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de usuarios */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Usuario</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Sucursal</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rol</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Estado</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {usuarios.data.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                            {usuario.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {usuario.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {usuario.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {usuario.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <Building className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {usuario.sucursal?.nombre || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <Shield className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {usuario.roles?.map(role => role.name).join(', ') || 'Sin rol'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    usuario.activo 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={route('users.show', usuario.id)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    </Link>
                                                    <Link
                                                        href={route('users.edit', usuario.id)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                        title="Editar usuario"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.name}?`)) {
                                                                window.location.href = route('users.destroy', usuario.id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`¿Estás seguro de ${usuario.activo ? 'desactivar' : 'activar'} al usuario ${usuario.name}?`)) {
                                                                window.location.href = route('users.toggle-status', usuario.id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                        title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                    >
                                                        {usuario.activo ? (
                                                            <ToggleRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                        ) : (
                                                            <ToggleLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    {usuarios.links && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Mostrando {usuarios.data?.length || 0} de {usuarios.total || 0} resultados
                                </div>
                                <div className="flex space-x-2">
                                    {usuarios.links?.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
