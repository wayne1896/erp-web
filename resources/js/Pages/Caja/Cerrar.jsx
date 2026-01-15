import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, DollarSign, AlertCircle, Clock,
    Calculator, CheckCircle, History, Lock, Receipt,
    Package, CreditCard, RefreshCw, FileText, Users
} from 'lucide-react';

export default function CajaCerrar({ caja, sucursal, resumen, movimientos, ventas }) {
    // Definir formatTime aquí
    const formatTime = (dateTime) => {
        if (!dateTime) return '—';
        return new Date(dateTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'RD$ 0.00';
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return '—';
        return new Date(dateTime).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const { data, setData, put, processing, errors } = useForm({
        efectivo_final: resumen?.efectivo_actual || caja?.efectivo || '0.00',
        observaciones: caja?.observaciones || '',
    });

    const calcularTotalEsperado = () => {
        return resumen?.efectivo_teorico || 0;
    };

    const calcularDiferencia = () => {
        const efectivoFinal = parseFloat(data.efectivo_final) || 0;
        const esperado = calcularTotalEsperado();
        return efectivoFinal - esperado;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('caja.update', caja.id), {
            onSuccess: () => {
                router.visit(route('caja.index'));
            }
        });
    };

    const difTotal = calcularDiferencia();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                Cerrar Caja
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {sucursal?.nombre} • Finalizar jornada de trabajo
                            </p>
                        </div>
                    </div>
                    <div className="text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Abierta desde: {formatTime(caja?.fecha_apertura)}
                    </div>
                </div>
            }
        >
            <Head title="Cerrar Caja" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Resumen actual de la caja */}
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-4">Resumen de la caja</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Monto inicial</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.monto_inicial || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Total ventas</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.total_ventas || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Ingresos - Egresos</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency((resumen?.total_ingresos || 0) - (resumen?.total_egresos || 0))}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Efectivo esperado</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.efectivo_teorico || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario de cierre */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Conteo final</h3>
                                            <p className="text-sm text-red-600 dark:text-red-400">Ingresa el efectivo contado físicamente</p>
                                        </div>
                                        <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="p-6">
                                        {/* Alerta importante */}
                                        <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                                            <div className="flex items-start">
                                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
                                                <div>
                                                    <h4 className="font-bold text-amber-800 dark:text-amber-200">¡Verificación crítica!</h4>
                                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                        Cuenta físicamente todo el efectivo antes de cerrar la caja.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Efectivo final */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Efectivo final contado
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 dark:text-gray-400">RD$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className={`block w-full pl-12 pr-12 py-3 text-lg border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                                                        errors.efectivo_final 
                                                            ? 'border-red-300 dark:border-red-600' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="0.00"
                                                    value={data.efectivo_final}
                                                    onChange={(e) => setData('efectivo_final', e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </div>
                                            {errors.efectivo_final && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.efectivo_final}</p>
                                            )}
                                            <div className="mt-2 flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Esperado: {formatCurrency(calcularTotalEsperado())}</span>
                                                <span className={`font-bold ${difTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    Diferencia: {formatCurrency(difTotal)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Campo para observaciones */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Observaciones (Opcional)
                                            </label>
                                            <textarea
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                rows="3"
                                                placeholder="Ej: Diferencias encontradas, situaciones especiales, etc."
                                                value={data.observaciones}
                                                onChange={(e) => setData('observaciones', e.target.value)}
                                            />
                                            {errors.observaciones && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.observaciones}</p>
                                            )}
                                        </div>

                                        {/* Resumen final */}
                                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
                                            <h4 className="font-bold text-red-800 dark:text-red-200 mb-3">Resumen final de cierre</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-red-700 dark:text-red-300">Total esperado:</span>
                                                    <span className="font-bold text-red-900 dark:text-red-100">
                                                        {formatCurrency(calcularTotalEsperado())}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-red-700 dark:text-red-300">Total real contado:</span>
                                                    <span className="font-bold text-red-900 dark:text-red-100">
                                                        {formatCurrency(parseFloat(data.efectivo_final) || 0)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-red-200 dark:border-red-700 pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-red-700 dark:text-red-300">Diferencia total:</span>
                                                        <span className={`text-xl font-bold ${difTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {formatCurrency(difTotal)}
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
                                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 w-full sm:w-auto justify-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-5 h-5 mr-2" />
                                                        Cerrar Caja
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Panel lateral */}
                        <div className="space-y-6">
                            {/* Últimos movimientos */}
                            {movimientos && movimientos.length > 0 && (
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                        <History className="w-5 h-5 mr-2" />
                                        Últimos movimientos
                                    </h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {movimientos.slice(0, 5).map((movimiento) => (
                                            <div key={movimiento.id} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                                            {movimiento.descripcion}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatTime(movimiento.created_at)}
                                                        </p>
                                                    </div>
                                                    <span className={`font-bold ${
                                                        movimiento.tipo === 'INGRESO' || movimiento.tipo === 'APERTURA'
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {movimiento.tipo === 'INGRESO' || movimiento.tipo === 'APERTURA' ? '+' : '-'}
                                                        {formatCurrency(movimiento.monto)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resumen de ventas */}
                            {ventas && ventas.length > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 rounded-xl p-5">
                                    <h4 className="font-bold text-green-800 dark:text-green-200 mb-4 flex items-center">
                                        <Receipt className="w-5 h-5 mr-2" />
                                        Resumen de ventas
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-green-700 dark:text-green-300">Total ventas:</span>
                                            <span className="font-bold text-green-900 dark:text-green-100">
                                                {ventas.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-700 dark:text-green-300">Monto total:</span>
                                            <span className="font-bold text-green-900 dark:text-green-100">
                                                {formatCurrency(ventas.reduce((sum, venta) => sum + (venta.total || 0), 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información de la caja */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
                                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Información de caja
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-700 dark:text-blue-300">ID Caja:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            #{caja?.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700 dark:text-blue-300">Usuario:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            {caja?.usuario?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700 dark:text-blue-300">Fecha apertura:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            {formatDate(caja?.fecha_apertura)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}