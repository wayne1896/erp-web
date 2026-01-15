import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Plus, Lock, Unlock, ShoppingCart, ListOrdered,
    Eye, Clock, DollarSign, Users, AlertCircle
} from 'lucide-react';

export default function CajaIndex({ cajaActual, cajasHoy, sucursal }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const formatTime = (dateTime) => {
        if (!dateTime) return '—';
        return new Date(dateTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                Gestión de Caja
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {sucursal?.nombre} • {formatDate(new Date())}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Gestión de Caja" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Estado actual de caja */}
                    {cajaActual ? (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Caja Abierta</h2>
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 w-32">Monto inicial:</span>
                                            <span className="font-bold text-green-700 dark:text-green-300">
                                                {formatCurrency(cajaActual.monto_inicial)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 w-32">Efectivo actual:</span>
                                            <span className="font-bold text-green-700 dark:text-green-300">
                                                {formatCurrency(cajaActual.efectivo)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 w-32">Abierta desde:</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                {formatTime(cajaActual.fecha_apertura)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('ventas.create')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Venta
                                    </Link>
                                    <Link
                                        href={route('caja.edit', cajaActual.id)}  
                                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Cerrar Caja
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border border-amber-200 dark:border-amber-700 rounded-xl p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">Caja Cerrada</h2>
                                    <p className="text-amber-700 dark:text-amber-300">Debes abrir caja para registrar ventas</p>
                                </div>
                                <Link
                                    href={route('caja.create')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Abrir Caja
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Acciones rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Link
                            href={route('caja.create')}
                            className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 p-4 rounded-xl hover:shadow-md transition"
                        >
                            <div className="flex items-center">
                                <div className="bg-green-100 dark:bg-green-800 p-3 rounded-lg mr-4">
                                    <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-800 dark:text-green-200">Abrir Caja</h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">Iniciar jornada de trabajo</p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link
                            href={route('ventas.create')}
                            className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 p-4 rounded-xl hover:shadow-md transition"
                        >
                            <div className="flex items-center">
                                <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-lg mr-4">
                                    <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-800 dark:text-blue-200">Nueva Venta</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Registrar venta a cliente</p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link
                            href={route('ventas.index')}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border border-purple-200 dark:border-purple-700 p-4 rounded-xl hover:shadow-md transition"
                        >
                            <div className="flex items-center">
                                <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-lg mr-4">
                                    <ListOrdered className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-800 dark:text-purple-200">Historial</h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">Ver todas las ventas</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    
                    {/* Cajas del día */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Cajas del día</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registro de cajas abiertas hoy</p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Usuario</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Estado</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Monto Inicial</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Efectivo</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Apertura</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cierre</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cajasHoy.length > 0 ? (
                                        cajasHoy.map((caja) => (
                                            <tr key={caja.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{caja.usuario?.name || 'Usuario'}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        caja.estado === 'abierta' 
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                                            : caja.estado === 'cerrada' 
                                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                    }`}>
                                                        {caja.estado}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                        {formatCurrency(caja.monto_inicial)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                        {formatCurrency(caja.efectivo)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                        {formatTime(caja.fecha_apertura)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {caja.fecha_cierre ? (
                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                            {formatTime(caja.fecha_cierre)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">—</div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('caja.movimientos', caja.id)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                            title="Ver movimientos"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                No hay cajas registradas hoy
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}