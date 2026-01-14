import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, FileText, User, Calendar, Clock, CreditCard,
    Package, DollarSign, Trash2, AlertCircle, Save, X
} from 'lucide-react';

export default function VentasEdit({ venta, tiposComprobante, condicionesPago, estados }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        tipo_comprobante: venta.tipo_comprobante,
        condicion_pago: venta.condicion_pago,
        dias_credito: venta.dias_credito || 0,
        fecha_venta: new Date(venta.fecha_venta).toISOString().split('T')[0],
        estado: venta.estado,
        notas: venta.notas || '',
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'PROCESADA':
                return 'bg-green-100 text-green-800';
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'ANULADA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('ventas.update', venta.id));
    };

    const handleAnular = () => {
        if (confirm('¿Está seguro de anular esta venta? Esta acción no se puede deshacer.')) {
            router.post(route('ventas.anular', venta.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 leading-tight">
                                Editar Venta #{venta.numero_factura}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(venta.fecha_venta)}
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                                    {venta.estado}
                                </span>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center text-sm text-gray-600">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {formatCurrency(venta.total)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('ventas.show', venta.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Editar Venta ${venta.numero_factura}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Información de la venta */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Información de la Venta</h3>
                                            <p className="text-sm text-gray-600">Datos básicos de la transacción</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Cliente */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-blue-600" />
                                            Cliente
                                        </label>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-lg mr-4">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">
                                                        {venta.cliente?.nombre_completo}
                                                    </h4>
                                                    <div className="flex items-center mt-1 space-x-3">
                                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                            {venta.cliente?.cedula}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {venta.cliente?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Productos vendidos */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-blue-600" />
                                            Productos Vendidos
                                        </label>
                                        <div className="overflow-hidden rounded-xl border border-gray-200">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {venta.detalles?.map((detalle, index) => (
                                                            <tr key={index} className="border-b border-gray-100 last:border-b-0">
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center">
                                                                        <div className="bg-gradient-to-r from-green-100 to-green-200 p-1.5 rounded-lg mr-3">
                                                                            <Package className="w-4 h-4 text-green-600" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-800">
                                                                                {detalle.producto?.nombre}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                Código: {detalle.producto?.codigo}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <p className="text-gray-800">{detalle.cantidad}</p>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <p className="text-gray-800">{formatCurrency(detalle.precio_unitario)}</p>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <p className="font-bold text-gray-800">{formatCurrency(detalle.total)}</p>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50">
                                                        <tr>
                                                            <td colSpan="3" className="py-3 px-4 text-right font-bold">
                                                                Total:
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <p className="text-xl font-bold text-blue-700">
                                                                    {formatCurrency(venta.total)}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos editables */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Tipo de comprobante */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Tipo de Comprobante
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                value={data.tipo_comprobante}
                                                onChange={(e) => setData('tipo_comprobante', e.target.value)}
                                            >
                                                {tiposComprobante.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo.replace('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.tipo_comprobante && (
                                                <p className="text-red-600 text-sm mt-1">{errors.tipo_comprobante}</p>
                                            )}
                                        </div>

                                        {/* Fecha de venta */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                                Fecha de Venta
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                    value={data.fecha_venta}
                                                    onChange={(e) => setData('fecha_venta', e.target.value)}
                                                    required
                                                />
                                                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                            </div>
                                            {errors.fecha_venta && (
                                                <p className="text-red-600 text-sm mt-1">{errors.fecha_venta}</p>
                                            )}
                                        </div>

                                        {/* Condición de pago */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                                                Condición de Pago
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                value={data.condicion_pago}
                                                onChange={(e) => {
                                                    setData('condicion_pago', e.target.value);
                                                    if (e.target.value === 'CONTADO') {
                                                        setData('dias_credito', 0);
                                                    }
                                                }}
                                            >
                                                {condicionesPago.map((condicion) => (
                                                    <option key={condicion} value={condicion}>
                                                        {condicion}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.condicion_pago && (
                                                <p className="text-red-600 text-sm mt-1">{errors.condicion_pago}</p>
                                            )}
                                        </div>

                                        {/* Días de crédito (si aplica) */}
                                        {data.condicion_pago === 'CREDITO' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                                    Días de Crédito
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-4 py-3 pl-11 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                        value={data.dias_credito}
                                                        onChange={(e) => setData('dias_credito', e.target.value)}
                                                        required
                                                    />
                                                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-blue-400" />
                                                </div>
                                                {errors.dias_credito && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.dias_credito}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Estado */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Estado
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                value={data.estado}
                                                onChange={(e) => setData('estado', e.target.value)}
                                            >
                                                {estados.map((estado) => (
                                                    <option key={estado} value={estado}>
                                                        {estado}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.estado && (
                                                <p className="text-red-600 text-sm mt-1">{errors.estado}</p>
                                            )}
                                        </div>

                                        {/* Notas */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Notas (Opcional)
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                                rows="3"
                                                value={data.notas}
                                                onChange={(e) => setData('notas', e.target.value)}
                                                placeholder="Observaciones adicionales..."
                                            />
                                            {errors.notas && (
                                                <p className="text-red-600 text-sm mt-1">{errors.notas}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                            <FileText className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Acciones</h3>
                                            <p className="text-sm text-gray-600">Gestionar esta venta</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Mensaje de advertencia */}
                                        {venta.estado === 'ANULADA' && (
                                            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-r-xl">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-bold text-red-800">Venta Anulada</h4>
                                                        <p className="text-sm text-red-700 mt-1">
                                                            Esta venta ha sido anulada. No se pueden realizar modificaciones.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botones de acción */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <button
                                                type="submit"
                                                disabled={processing || venta.estado === 'ANULADA'}
                                                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5 mr-3" />
                                                        Guardar Cambios
                                                    </>
                                                )}
                                            </button>

                                            <Link
                                                href={route('ventas.show', venta.id)}
                                                className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                            >
                                                <X className="w-5 h-5 mr-3" />
                                                Cancelar
                                            </Link>

                                            {venta.estado !== 'ANULADA' && (
                                                <button
                                                    type="button"
                                                    onClick={handleAnular}
                                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition"
                                                >
                                                    <Trash2 className="w-5 h-5 mr-3" />
                                                    Anular Venta
                                                </button>
                                            )}
                                        </div>

                                        {/* Advertencia sobre anulación */}
                                        {venta.estado !== 'ANULADA' && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-amber-800 text-sm">Advertencia</h4>
                                                        <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
                                                            <li>La anulación de una venta revertirá el stock de productos</li>
                                                            <li>Esta acción no se puede deshacer</li>
                                                            <li>Se registrará el motivo de anulación en las notas</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}