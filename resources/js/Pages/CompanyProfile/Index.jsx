import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ profile }) {
    const header = (
        <div className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Configuración del Sistema
                        </h1>
                        <nav className="flex space-x-4">
                            <Link
                                href={route('company-profile.index')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Empresa
                            </Link>
                            <Link
                                href={route('configuracion.usuarios')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Usuarios
                            </Link>
                            <Link
                                href={route('configuracion.backup')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Backup
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header={header}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Message */}
                    {window.flash?.success && (
                        <div className="mb-4 p-4 border border-green-200 rounded-md bg-green-50 dark:bg-green-900 dark:border-green-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293a1 1 0 00-1.414 0L2.586 9.172a1 1 0 00-1.414 1.414L7.293 13.414a1 1 0 001.414 1.414L10 11.586l2.293 2.293a1 1 0 001.414 1.414L12.414 13.414a1 1 0 001.414-1.414L10 11.586z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        {window.flash.success}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Información de la Empresa
                                </h3>
                                {!profile ? (
                                    <Link
                                        href={route('company-profile.edit')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4h-4v4zm2-3V4a2 2 0 00-2-2H6a2 2 0 00-2 2v3h4z" />
                                        </svg>
                                        Configurar Perfil
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('company-profile.edit')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 0L21 12l-4.232 4.232M6.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 0L3 12l4.232 4.232M6.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 0L3 12l4.232 4.232" />
                                        </svg>
                                        Editar Perfil
                                    </Link>
                                )}
                            </div>

                            {profile ? (
                                <>
                                    {/* Company Logo and Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="flex items-center space-x-6">
                                                {profile.logo_url ? (
                                                    <div className="relative group">
                                                        <img
                                                            className="h-24 w-24 rounded-xl object-cover shadow-lg border-4 border-white dark:border-gray-700 transition-transform group-hover:scale-105"
                                                            src={profile.logo_url}
                                                            alt={profile.company_name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyOCIgeT0iMjgiPgo8cGF0aCBkPSJNMjAgNEMxMS4xNjMgNCA0IDExLjE2MyA0IDIwQzQgMjguODM3IDExLjE2MyAzNiAyMCAzNkMyOC44MzcgMzYgMzYgMjguODM3IDM2IDIwQzM2IDExLjE2MyAyOC44MzcgNCAyMCA0Wk0yMCA4QzEzLjM3MyA4IDggMTMuMzczIDggMjBDOCAyNi42MjcgMTMuMzczIDMyIDIwIDMyQzI2LjYyNyAzMiAzMiAyNi42MjcgMzIgMjBDMzIgMTMuMzczIDI2LjYyNyA4IDIwIDhaTTIwIDEyQzE1LjU4OSAxMiAxMiAxNS41ODkgMTIgMjBDMTIgMjQuNDExIDE1LjU4OSAyOCAyMCAyOEMyNC40MTEgMjggMjggMjQuNDExIDI4IDIwQzI4IDE1LjU4OSAyNC40MTEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4=';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700">
                                                        <span className="text-white text-2xl font-bold">
                                                            {profile.company_name?.charAt(0) || 'E'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                        {profile.display_name}
                                                    </h4>
                                                    <p className="text-base text-gray-600 dark:text-gray-400">
                                                        {profile.industry}
                                                    </p>
                                                    {profile.logo_url && (
                                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Logo configurado
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                    Activo
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Información Básica</h4>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre Comercial:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{profile.company_name}</dd>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Razón Social:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{profile.legal_name || 'No especificado'}</dd>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">RNC:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">{profile.rnc}</dd>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo Contribuyente:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{profile.taxpayer_type}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Información de Contacto</h4>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{profile.phone}</dd>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{profile.email}</dd>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Website:</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                                                        {profile.website ? (
                                                            <a
                                                                href={profile.website}
                                                                target="_blank"
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                {profile.website}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">No especificado</span>
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Address and Branch */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Dirección</h4>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{profile.address}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Sucursal</h4>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{profile.branch_name || 'Matriz'}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {profile.description && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Descripción</h4>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{profile.description}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay perfil configurado</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Para comenzar, configura el perfil de tu empresa.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('company-profile.edit')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0h6" />
                                            </svg>
                                            Configurar Perfil
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
