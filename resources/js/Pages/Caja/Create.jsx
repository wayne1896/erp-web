import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, DollarSign, AlertCircle, Clock,
    Calculator, CheckCircle, History
} from 'lucide-react';

export default function CajaCreate({ sucursal, ultimaCaja }) {
    const { data, setData, post, processing, errors } = useForm({
        monto_inicial: ultimaCaja?.monto_inicial || '0.00',
        observaciones: '',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return '—';
        return new Date(dateTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('caja.store'));
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
                                Abrir Caja
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {sucursal?.nombre} • Iniciar jornada de trabajo
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Abrir Caja" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Información de la última caja */}
                    {ultimaCaja && (
                        <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                            <div className="flex items-start">
                                <History className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Última caja registrada</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Monto inicial:</p>
                                            <p className="font-bold text-blue-900 dark:text-blue-100">
                                                {formatCurrency(ultimaCaja.monto_inicial)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Fecha apertura:</p>
                                            <p className="font-bold text-blue-900 dark:text-blue-100">
                                                {new Date(ultimaCaja.fecha_apertura).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Hora apertura:</p>
                                            <p className="font-bold text-blue-900 dark:text-blue-100">
                                                {formatTime(ultimaCaja.fecha_apertura)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Configuración de apertura</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ingresa el monto inicial para abrir caja</p>
                                </div>
                                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                {/* Alerta importante */}
                                <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-amber-800 dark:text-amber-200">¡Atención!</h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                Verifica cuidadosamente el monto inicial. Una vez abierta la caja, 
                                                no podrás modificarla hasta el cierre de la misma.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Campo para monto inicial */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Monto Inicial
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400">RD$</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className={`block w-full pl-12 pr-12 py-3 text-lg border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                errors.monto_inicial 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                            placeholder="0.00"
                                            value={data.monto_inicial}
                                            onChange={(e) => setData('monto_inicial', e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <Calculator className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    </div>
                                    {errors.monto_inicial && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.monto_inicial}</p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Este será el efectivo con el que iniciarás la caja
                                    </p>
                                </div>

                                {/* Campo para observaciones */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Observaciones (Opcional)
                                    </label>
                                    <textarea
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        rows="3"
                                        placeholder="Ej: Turno matutino, entregado por supervisor, etc."
                                        value={data.observaciones}
                                        onChange={(e) => setData('observaciones', e.target.value)}
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Información adicional sobre la apertura de caja
                                    </p>
                                </div>

                                {/* Resumen */}
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-6">
                                    <h4 className="font-bold text-green-800 dark:text-green-200 mb-3">Resumen</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700 dark:text-green-300">Monto inicial:</span>
                                            <span className="font-bold text-green-900 dark:text-green-100">
                                                {formatCurrency(parseFloat(data.monto_inicial) || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700 dark:text-green-300">Efectivo inicial:</span>
                                            <span className="font-bold text-green-900 dark:text-green-100">
                                                {formatCurrency(parseFloat(data.monto_inicial) || 0)}
                                            </span>
                                        </div>
                                        <div className="border-t border-green-200 dark:border-green-700 pt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-green-700 dark:text-green-300">Total en caja:</span>
                                                <span className="text-xl font-bold text-green-900 dark:text-green-100">
                                                    {formatCurrency(parseFloat(data.monto_inicial) || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Link
                                        href={route('caja.index')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full sm:w-auto justify-center"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 w-full sm:w-auto justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Abrir Caja
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Recomendaciones</h4>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Contar el efectivo físicamente antes de abrir</li>
                                <li>• Anotar billetes y monedas por denominación</li>
                                <li>• Verificar que no haya billetes falsos</li>
                                <li>• Comprobar con un testigo si es posible</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Procedimiento</h4>
                            <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                                <li>• Registra ventas solo con caja abierta</li>
                                <li>• Registra ingresos/egresos de la caja</li>
                                <li>• Cierra caja al finalizar el turno</li>
                                <li>• Imprime reporte de cierre</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}