import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard ERP</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Mensaje de bienvenida */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold text-blue-600">¡Sistema ERP Activado! </h1>
                            <p className="mt-2 text-gray-600">Bienvenido al panel de control de tu negocio</p>
                            <div className="mt-4 flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full mr-3">
                                    <span className="text-blue-600 font-bold text-xl">👤</span>
                                </div>
                                <div>
                                    <p className="font-semibold">{auth.user.name}</p>
                                    <p className="text-sm text-gray-500">{auth.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <span className="text-blue-600 font-bold text-xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-700">Ventas Hoy</h3>
                                    <p className="text-2xl font-bold">$0.00</p>
                                    <p className="text-sm text-blue-600">0 transacciones</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <span className="text-green-600 font-bold text-xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700">Clientes</h3>
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-sm text-green-600">Registrados</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                    <span className="text-yellow-600 font-bold text-xl">📦</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-yellow-700">Productos</h3>
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-sm text-yellow-600">En inventario</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                    <span className="text-purple-600 font-bold text-xl">📊</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-700">Estado</h3>
                                    <p className="text-2xl font-bold">Activo</p>
                                    <p className="text-sm text-purple-600">Sistema listo</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="/ventas" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition">
                                <span className="text-blue-600 font-bold text-xl block mb-2">➕</span>
                                <span className="font-medium text-blue-700">Nueva Venta</span>
                            </a>
                            <a href="/clientes" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition">
                                <span className="text-green-600 font-bold text-xl block mb-2">👤</span>
                                <span className="font-medium text-green-700">Agregar Cliente</span>
                            </a>
                            <a href="/productos" className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition">
                                <span className="text-yellow-600 font-bold text-xl block mb-2">📦</span>
                                <span className="font-medium text-yellow-700">Gestión Inventario</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}