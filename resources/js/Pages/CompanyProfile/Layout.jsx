import React from 'react';
import { Head } from '@inertiajs/react';

export default function Layout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <header className="bg-white shadow sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Configuración del Sistema
                                </h1>
                                <nav className="flex space-x-4">
                                    <a
                                        href="/configuracion/empresa"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Empresa
                                    </a>
                                    <a
                                        href="/configuracion/usuarios"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Usuarios
                                    </a>
                                    <a
                                        href="/configuracion/backup"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Backup
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </header>

                    <main>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
