import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, FileText, User, Calendar, Clock, CreditCard,
    Package, DollarSign, Trash2, AlertCircle, Save, X,
    Edit2, CheckCircle, AlertTriangle, Receipt, Shield,
    RefreshCw, Eye, Printer, Download, Copy, Hash,
    MapPin, Phone, Info // <-- IMPORTAR ICONOS FALTANTES
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
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(num);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            weekday: 'short'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'PROCESADA':
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 'PENDIENTE':
                return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
            case 'ANULADA':
                return 'bg-gradient-to-r from-rose-500 to-rose-600 text-white';
            case 'FACTURADA':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'PROCESADA':
                return CheckCircle;
            case 'PENDIENTE':
                return Clock;
            case 'ANULADA':
                return AlertCircle;
            case 'FACTURADA':
                return FileText;
            default:
                return AlertCircle;
        }
    };

    const getCondicionPagoColor = (condicion) => {
        return condicion === 'CONTADO' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
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

    const copiarNumeroFactura = () => {
        navigator.clipboard.writeText(venta.numero_factura);
        // Podrías agregar un toast de confirmación aquí
    };

    const calcularFechaVencimiento = () => {
        if (venta.condicion_pago === 'CREDITO' && venta.dias_credito > 0) {
            const fecha = new Date(venta.created_at);
            fecha.setDate(fecha.getDate() + venta.dias_credito);
            return formatDate(fecha);
        }
        return 'No aplica';
    };

    const EstadoIcon = getEstadoIcon(venta.estado);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-800 p-3 rounded-xl shadow-lg ring-2 ring-blue-200/50 dark:ring-blue-700/30">
                            <Edit2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-100 leading-tight">
                                Editar Venta
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <Hash className="w-4 h-4 mr-1" />
                                    <span className="font-medium">{venta.numero_factura}</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDateTime(venta.created_at)}
                                </div>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(venta.estado)}`}>
                                    <EstadoIcon className="w-3 h-3 inline mr-1" />
                                    {venta.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 px-4 py-2 rounded-xl shadow-md">
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-white mr-2" />
                                <span className="font-bold text-white text-lg">
                                    {formatCurrency(venta.total)}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('ventas.show', venta.id)}
                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Información de resumen */}
                    <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {venta.cliente?.nombre_completo || 'Consumidor Final'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {venta.cliente?.cedula || '000-0000000-0'}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Condición de Pago</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCondicionPagoColor(venta.condicion_pago)}`}>
                                    {venta.condicion_pago}
                                </span>
                                {venta.condicion_pago === 'CREDITO' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Vence: {calcularFechaVencimiento()}
                                    </p>
                                )}
                            </div>
                            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Productos</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {venta.detalles?.length || 0} productos
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Subtotal: {formatCurrency(venta.subtotal)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ITBIS</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {formatCurrency(venta.itbis)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Descuento: {formatCurrency(venta.descuento)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Panel izquierdo - Datos editables */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Información editable de la venta */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-2 rounded-lg mr-3">
                                                    <Edit2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Editar Información</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Modifica los datos de la venta</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Grid de campos editables */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tipo de comprobante */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <Receipt className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                    Tipo de Comprobante
                                                </label>
                                                <select
                                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                                    value={data.tipo_comprobante}
                                                    onChange={(e) => setData('tipo_comprobante', e.target.value)}
                                                >
                                                    {tiposComprobante.map((tipo) => (
                                                        <option key={tipo} value={tipo} className="py-2">
                                                            {tipo.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.tipo_comprobante && (
                                                    <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.tipo_comprobante}</p>
                                                )}
                                            </div>

                                            {/* Fecha de venta */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                    Fecha de Venta
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                                        value={data.fecha_venta}
                                                        onChange={(e) => setData('fecha_venta', e.target.value)}
                                                        required
                                                    />
                                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                {errors.fecha_venta && (
                                                    <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.fecha_venta}</p>
                                                )}
                                            </div>

                                            {/* Condición de pago */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <CreditCard className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                    Condición de Pago
                                                </label>
                                                <select
                                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
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
                                                    <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.condicion_pago}</p>
                                                )}
                                            </div>

                                            {/* Días de crédito (si aplica) */}
                                            {data.condicion_pago === 'CREDITO' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                        <Clock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                        Días de Crédito
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700 border-2 border-amber-200 dark:border-amber-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200"
                                                            value={data.dias_credito}
                                                            onChange={(e) => setData('dias_credito', e.target.value)}
                                                            required
                                                        />
                                                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-amber-400 dark:text-amber-500" />
                                                    </div>
                                                    {errors.dias_credito && (
                                                        <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.dias_credito}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Estado */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                    Estado
                                                </label>
                                                <select
                                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
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
                                                    <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.estado}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notas */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                Notas (Opcional)
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                                rows="4"
                                                value={data.notas}
                                                onChange={(e) => setData('notas', e.target.value)}
                                                placeholder="Observaciones adicionales sobre la venta..."
                                            />
                                            {errors.notas && (
                                                <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">{errors.notas}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de productos */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 p-2 rounded-lg mr-3">
                                                    <Package className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Productos Vendidos</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {venta.detalles?.length || 0} productos en esta venta
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(venta.total)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Precio Unit.</th>
                                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Descuento</th>
                                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {venta.detalles?.map((detalle, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center">
                                                                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-2 rounded-lg mr-4">
                                                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                            {detalle.producto?.nombre}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Código: {detalle.producto?.codigo || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                    {detalle.cantidad}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {formatCurrency(detalle.precio_unitario)}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="text-rose-600 dark:text-rose-400 font-medium">
                                                                    {formatCurrency(detalle.descuento_monto || 0)}
                                                                </span>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    ({detalle.descuento || 0}%)
                                                                </p>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                                                    {formatCurrency(detalle.total)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                                    <tr>
                                                        <td colSpan="3" className="py-4 px-6 text-right">
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal:</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                                {formatCurrency(venta.subtotal)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3" className="py-4 px-6 text-right">
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Descuento:</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                                                                -{formatCurrency(venta.descuento)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3" className="py-4 px-6 text-right">
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium">ITBIS:</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                                +{formatCurrency(venta.itbis)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-t border-gray-300 dark:border-gray-600">
                                                        <td colSpan="3" className="py-4 px-6 text-right">
                                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Total:</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                                                {formatCurrency(venta.total)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel derecho - Acciones e información */}
                            <div className="space-y-6">
                                {/* Información del cliente */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-2 rounded-lg mr-3">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Cliente</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Información del comprador</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 rounded-xl mr-4">
                                                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                                                        {venta.cliente?.nombre_completo || 'Consumidor Final'}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                                            {venta.cliente?.tipo_cliente || 'FISICA'}
                                                        </span>
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs font-medium">
                                                            {venta.cliente?.cedula || '000-0000000-0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {venta.cliente && (
                                                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                                                    {venta.cliente.email && (
                                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                            <span className="truncate">{venta.cliente.email}</span>
                                                        </div>
                                                    )}
                                                    {venta.cliente.telefono && (
                                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                            <span>{venta.cliente.telefono}</span>
                                                        </div>
                                                    )}
                                                    {venta.cliente.direccion && (
                                                        <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                                                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{venta.cliente.direccion}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones de la venta */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-800 p-2 rounded-lg mr-3">
                                                <Shield className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Acciones</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar esta venta</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {/* Botones principales */}
                                            <div className="space-y-3">
                                                <button
                                                    type="submit"
                                                    disabled={processing || venta.estado === 'ANULADA'}
                                                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
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
                                                    className="w-full inline-flex items-center justify-center px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                                >
                                                    <X className="w-5 h-5 mr-3" />
                                                    Cancelar
                                                </Link>

                                                {venta.estado !== 'ANULADA' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAnular}
                                                        className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl transition-all duration-200"
                                                    >
                                                        <Trash2 className="w-5 h-5 mr-3" />
                                                        Anular Venta
                                                    </button>
                                                )}
                                            </div>

                                            {/* Botones adicionales */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link
                                                    href={route('ventas.imprimir', venta.id)}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200"
                                                >
                                                    <Printer className="w-4 h-4 mr-2" />
                                                    Imprimir
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={copiarNumeroFactura}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg transition-all duration-200"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copiar N°
                                                </button>
                                            </div>

                                            {/* Advertencias */}
                                            {venta.estado === 'ANULADA' ? (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border border-rose-200 dark:border-rose-700/50 rounded-xl">
                                                    <div className="flex items-start">
                                                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">Venta Anulada</h4>
                                                            <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                                                                Esta venta ha sido anulada y no se puede modificar.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                                                    <div className="flex items-start">
                                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Advertencia</h4>
                                                            <ul className="text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                                                                <li className="flex items-start">
                                                                    <span className="inline-block w-1 h-1 rounded-full bg-amber-500 mt-1.5 mr-2"></span>
                                                                    La anulación revertirá el stock de productos
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="inline-block w-1 h-1 rounded-full bg-amber-500 mt=1.5 mr-2"></span>
                                                                    Esta acción no se puede deshacer
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-800 p-2 rounded-lg mr-3">
                                                <Info className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Información</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Detalles adicionales</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Creada por:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {venta.vendedor?.name || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Fecha creación:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatDateTime(venta.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Última actualización:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatDateTime(venta.updated_at)}
                                                </span>
                                            </div>
                                            {venta.estado === 'ANULADA' && venta.user_anulacion && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Anulada por:</span>
                                                    <span className="font-medium text-rose-600 dark:text-rose-400">
                                                        {venta.user_anulacion?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
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