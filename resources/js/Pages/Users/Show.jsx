import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Building, Shield, Calendar, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const Show = ({ user }) => {
    const { roles, sucursal } = user || {};
    
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
                                El usuario que buscas no existe o no tienes permisos para verlo.
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
    const getStatusBadge = (activo) => {
        return activo 
            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <ToggleRight className="w-3 h-3 mr-1" />
                Activo
              </span>
            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <ToggleLeft className="w-3 h-3 mr-1" />
                Inactivo
              </span>;
    };

    const getTipoUsuarioBadge = (tipo) => {
        const tipos = {
            admin: { label: 'Administrador', color: 'purple' },
            gerente: { label: 'Gerente', color: 'blue' },
            vendedor: { label: 'Vendedor', color: 'green' },
            cajero: { label: 'Cajero', color: 'orange' }
        };
        
        const config = tipos[tipo] || { label: tipo, color: 'gray' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
                {config.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Usuario: ${user?.name || 'Detalles'}`} />

            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('users.index')}
                            className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalles del Usuario</h1>
                            <p className="text-gray-600 dark:text-gray-400">Información completa del usuario</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('users.edit', user.id)}
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
                        {/* Card Información Personal */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-500" />
                                Información Personal
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</label>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo Electrónico</label>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cédula</label>
                                        <div className="flex items-center">
                                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900 dark:text-gray-100">{user.cedula || 'No especificada'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900 dark:text-gray-100">{user.telefono || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</label>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                            <p className="text-gray-900 dark:text-gray-100">{user.direccion || 'No especificada'}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sucursal</label>
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900 dark:text-gray-100">
                                                {sucursal ? sucursal.nombre : 'No asignada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Roles */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-purple-500" />
                                Roles Asignados
                            </h2>
                            
                            {roles && roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {roles.map(role => (
                                        <span
                                            key={role.id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Este usuario no tiene roles asignados</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Card Estado */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Estado</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado Actual</label>
                                    <div className="mt-2">
                                        {getStatusBadge(user.activo)}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Usuario</label>
                                    <div className="mt-2">
                                        {getTipoUsuarioBadge(user.tipo_usuario)}
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
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID de Usuario</label>
                                    <p className="text-gray-900 dark:text-gray-100">#{user.id}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {new Date(user.created_at).toLocaleDateString('es-DO', {
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
                                        {new Date(user.updated_at).toLocaleDateString('es-DO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verificado</label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {user.email_verified_at ? 'Sí' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Acciones Rápidas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Acciones Rápidas</h2>
                            
                            <div className="space-y-3">
                                <Link
                                    href={route('users.edit', user.id)}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Usuario
                                </Link>
                                
                                <button
                                    onClick={() => {
                                        if (confirm(`¿Está seguro de que desea ${user.activo ? 'desactivar' : 'activar'} este usuario?`)) {
                                            router.post(route('users.toggle-status', user.id));
                                        }
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                    {user.activo ? (
                                        <>
                                            <ToggleLeft className="w-4 h-4 mr-2" />
                                            Desactivar
                                        </>
                                    ) : (
                                        <>
                                            <ToggleRight className="w-4 h-4 mr-2" />
                                            Activar
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
                                            router.delete(route('users.destroy', user.id));
                                        }
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Show;
