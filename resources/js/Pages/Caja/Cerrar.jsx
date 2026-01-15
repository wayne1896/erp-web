// resources/js/Pages/Caja/Cerrar.jsx
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, DollarSign, AlertCircle, Clock,
    Calculator, CheckCircle, History, Lock, Receipt,
    Package, CreditCard, RefreshCw, FileText, Users,
    BarChart3, CreditCard as CardIcon, Wallet, Banknote,
    ChevronDown, ChevronUp, Filter, TrendingUp, TrendingDown,
    PlusCircle, MinusCircle, Calendar as CalendarIcon
} from 'lucide-react';

// FUNCIONES HELPER - DEBEN ESTAR PRIMERO Y FUERA DEL COMPONENTE
const obtenerNombreTipoPago = (tipo) => {
    const nombres = {
        'EFECTIVO': 'Efectivo',
        'TARJETA_DEBITO': 'Tarjeta Débito',
        'TARJETA_CREDITO': 'Tarjeta Crédito',
        'TRANSFERENCIA': 'Transferencia',
        'CHEQUE': 'Cheque',
        'SIN_DEFINIR': 'Sin Definir'
    };
    return nombres[tipo] || tipo;
};

const obtenerIconoTipoPago = (tipo) => {
    const iconos = {
        'EFECTIVO': DollarSign,
        'TARJETA_DEBITO': CreditCard,
        'TARJETA_CREDITO': CardIcon,
        'TRANSFERENCIA': Banknote,
        'CHEQUE': FileText,
        'SIN_DEFINIR': AlertCircle
    };
    return iconos[tipo] || DollarSign;
};

const obtenerColorTipoPago = (tipo) => {
    const colores = {
        'EFECTIVO': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
        'TARJETA_DEBITO': 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
        'TARJETA_CREDITO': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
        'TRANSFERENCIA': 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
        'CHEQUE': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
        'SIN_DEFINIR': 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    };
    return colores[tipo] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
};

const obtenerNombreTipoMovimiento = (tipo) => {
    const nombres = {
        'APERTURA': 'Apertura de Caja',
        'CIERRE': 'Cierre de Caja',
        'INGRESO': 'Ingreso Manual',
        'EGRESO': 'Egreso Manual',
        'VENTA': 'Venta',
        'COMPRA': 'Compra',
        'SIN_DEFINIR': 'Sin Definir'
    };
    return nombres[tipo] || tipo;
};

const obtenerIconoTipoMovimiento = (tipo) => {
    const iconos = {
        'APERTURA': PlusCircle,
        'CIERRE': MinusCircle,
        'INGRESO': TrendingUp,
        'EGRESO': TrendingDown,
        'VENTA': Receipt,
        'COMPRA': Package,
        'SIN_DEFINIR': AlertCircle
    };
    return iconos[tipo] || History;
};

const obtenerColorTipoMovimiento = (tipo) => {
    const colores = {
        'APERTURA': 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
        'CIERRE': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
        'INGRESO': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
        'EGRESO': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
        'VENTA': 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
        'COMPRA': 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
        'SIN_DEFINIR': 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    };
    return colores[tipo] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
};

// COMPONENTE PRINCIPAL
export default function CajaCerrar({ caja, sucursal, resumen, movimientos, ventas }) {
    const [expandedVentas, setExpandedVentas] = useState(false);
    const [detalleVentas, setDetalleVentas] = useState(false);
    const [detalleMovimientos, setDetalleMovimientos] = useState(false);
    const [filtroTipoPago, setFiltroTipoPago] = useState('TODOS');

    // Formateadores - estas sí pueden estar dentro del componente
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

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '—';
        return new Date(dateTime).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calcular movimientos por tipo - DEBE IR ANTES QUE ventasPorTipo
    const movimientosPorTipo = useMemo(() => {
        const tipos = {};
        let ingresos = 0;
        let egresos = 0;

        movimientos?.forEach(mov => {
            const tipo = mov.tipo || 'SIN_DEFINIR';
            const monto = parseFloat(mov.monto) || 0;
            
            if (!tipos[tipo]) {
                tipos[tipo] = {
                    nombre: obtenerNombreTipoMovimiento(tipo),
                    total: 0,
                    cantidad: 0,
                    movimientos: [],
                    esIngreso: ['APERTURA', 'INGRESO', 'VENTA'].includes(tipo)
                };
            }
            
            tipos[tipo].total += monto;
            tipos[tipo].cantidad += 1;
            tipos[tipo].movimientos.push(mov);
            
            if (['APERTURA', 'INGRESO', 'VENTA'].includes(tipo)) {
                ingresos += monto;
            } else if (['CIERRE', 'EGRESO', 'COMPRA'].includes(tipo)) {
                egresos += monto;
            }
        });

        return {
            tipos: Object.entries(tipos)
                .map(([key, value]) => ({
                    key,
                    ...value
                }))
                .sort((a, b) => b.total - a.total),
            totalIngresos: ingresos,
            totalEgresos: egresos,
            totalMovimientos: movimientos?.length || 0
        };
    }, [movimientos]);

    // Calcular resumen de ventas por tipo de pago
    const ventasPorTipo = useMemo(() => {
        const tipos = {};
        let totalGeneral = 0;
        let cantidadTotal = 0;

        ventas?.forEach(venta => {
            const tipo = venta.tipo_pago || 'SIN_DEFINIR';
            const monto = parseFloat(venta.total) || 0;
            
            if (!tipos[tipo]) {
                tipos[tipo] = {
                    nombre: obtenerNombreTipoPago(tipo),
                    total: 0,
                    cantidad: 0,
                    ventas: [],
                    icono: obtenerIconoTipoPago(tipo),
                    color: obtenerColorTipoPago(tipo)
                };
            }
            
            tipos[tipo].total += monto;
            tipos[tipo].cantidad += 1;
            tipos[tipo].ventas.push(venta);
            
            totalGeneral += monto;
            cantidadTotal += 1;
        });

        // Convertir a array y ordenar por monto descendente
        return {
            tipos: Object.entries(tipos)
                .map(([key, value]) => ({
                    key,
                    ...value
                }))
                .sort((a, b) => b.total - a.total),
            totalGeneral,
            cantidadTotal
        };
    }, [ventas]);

    // Filtrar ventas por tipo de pago
    const ventasFiltradas = useMemo(() => {
        if (filtroTipoPago === 'TODOS') return ventas || [];
        return (ventas || []).filter(v => v.tipo_pago === filtroTipoPago);
    }, [ventas, filtroTipoPago]);

    // Calcular totales por método de pago
    const calcularTotalesPagos = useMemo(() => {
        const totales = {
            EFECTIVO: 0,
            TARJETA_DEBITO: 0,
            TARJETA_CREDITO: 0,
            TRANSFERENCIA: 0,
            CHEQUE: 0,
            SIN_DEFINIR: 0
        };

        ventas?.forEach(venta => {
            const tipo = venta.tipo_pago || 'SIN_DEFINIR';
            const monto = parseFloat(venta.total) || 0;
            totales[tipo] = (totales[tipo] || 0) + monto;
        });

        return totales;
    }, [ventas]);

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
    const totalesPagos = calcularTotalesPagos;

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Resumen actual de la caja */}
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Resumen Financiero
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Monto Inicial</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.monto_inicial || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Total Ventas</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.total_ventas || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Ingresos</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.total_ingresos || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Egresos</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.total_egresos || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Flujo Neto</p>
                                <p className={`font-bold text-lg ${
                                    (resumen?.total_ingresos || 0) - (resumen?.total_egresos || 0) >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {formatCurrency((resumen?.total_ingresos || 0) - (resumen?.total_egresos || 0))}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Efectivo Esperado</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {formatCurrency(resumen?.efectivo_teorico || 0)}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-blue-800 rounded-lg p-4 shadow">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Movimientos</p>
                                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                                    {movimientosPorTipo.totalMovimientos}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Nueva sección: Detalle de todos los movimientos */}
                    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                            Detalle de Todos los Movimientos
                                        </h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {movimientosPorTipo.totalMovimientos} movimientos registrados
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDetalleMovimientos(!detalleMovimientos)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                    {detalleMovimientos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {detalleMovimientos && (
                            <div className="p-6">
                                {/* Resumen de movimientos por tipo */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    {movimientosPorTipo.tipos.map(({ key, nombre, total, cantidad, esIngreso }) => {
                                        const Icon = obtenerIconoTipoMovimiento(key);
                                        const color = obtenerColorTipoMovimiento(key);
                                        
                                        return (
                                            <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`p-2 rounded-lg ${color}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                                            {nombre}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        esIngreso
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {cantidad} movimientos
                                                    </span>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <p className={`text-2xl font-bold ${
                                                        esIngreso
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {esIngreso ? '+' : '-'}{formatCurrency(total)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tabla detallada de movimientos */}
                                <div className="mt-6">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                        <History className="w-4 h-4 mr-2" />
                                        Lista Completa de Movimientos
                                    </h4>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-700">
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Fecha/Hora
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Tipo
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Descripción
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Monto
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Usuario
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                        Referencia
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {movimientos?.map((mov) => {
                                                    const Icon = obtenerIconoTipoMovimiento(mov.tipo);
                                                    const color = obtenerColorTipoMovimiento(mov.tipo).split(' ')[0];
                                                    const esIngreso = ['APERTURA', 'INGRESO', 'VENTA'].includes(mov.tipo);
                                                    
                                                    return (
                                                        <tr key={mov.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                            <td className="py-3 px-4">
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatDateTime(mov.created_at)}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Icon className={`w-4 h-4 ${color}`} />
                                                                    <span className="text-sm font-medium">
                                                                        {obtenerNombreTipoMovimiento(mov.tipo)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {mov.descripcion || 'Sin descripción'}
                                                                </span>
                                                                {mov.motivo && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        Motivo: {mov.motivo}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`font-bold ${
                                                                    esIngreso
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                    {esIngreso ? '+' : '-'}
                                                                    {formatCurrency(mov.monto)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {mov.usuario?.name || 'Sistema'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {mov.referencia ? (
                                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                                        {mov.referencia}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                                                        Sin referencia
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totales al final */}
                                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ingresos</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(movimientosPorTipo.totalIngresos)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Egresos</p>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(movimientosPorTipo.totalEgresos)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance Neto</p>
                                            <p className={`text-2xl font-bold ${
                                                (movimientosPorTipo.totalIngresos - movimientosPorTipo.totalEgresos) >= 0
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {formatCurrency(movimientosPorTipo.totalIngresos - movimientosPorTipo.totalEgresos)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detalle de ventas por tipo de pago (existente) */}
                    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                                            Análisis de Ventas por Tipo de Pago
                                        </h3>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                            {ventasPorTipo.cantidadTotal} ventas registradas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setExpandedVentas(!expandedVentas)}
                                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                                >
                                    {expandedVentas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {expandedVentas && (
                            <div className="p-6">
                                {/* Filtros de tipo de pago */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Filtrar por tipo de pago:
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {filtroTipoPago === 'TODOS' ? 'Todos los tipos' : obtenerNombreTipoPago(filtroTipoPago)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setFiltroTipoPago('TODOS')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                                filtroTipoPago === 'TODOS'
                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            Todos
                                        </button>
                                        {ventasPorTipo.tipos.map(({ key, nombre, color }) => (
                                            <button
                                                key={key}
                                                onClick={() => setFiltroTipoPago(key)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${
                                                    filtroTipoPago === key
                                                        ? `${color.split(' ')[0]} ${color.split(' ')[1]} border ${color.split(' ')[0].replace('text', 'border')}`
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <span>{nombre}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen de ventas por tipo */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {ventasPorTipo.tipos.slice(0, 6).map(({ key, nombre, total, cantidad, icono: Icon, color }) => (
                                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-2 rounded-lg ${color}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {nombre}
                                                    </span>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                                    {cantidad} ventas
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(total)}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {((total / ventasPorTipo.totalGeneral) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                                <div 
                                                    className="bg-blue-500 h-1.5 rounded-full" 
                                                    style={{ width: `${(total / ventasPorTipo.totalGeneral) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Detalle de ventas individuales */}
                                {detalleVentas && (
                                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                            <Receipt className="w-4 h-4 mr-2" />
                                            Detalle de Ventas ({ventasFiltradas.length})
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                            Fecha
                                                        </th>
                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                            N° Factura
                                                        </th>
                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                            Cliente
                                                        </th>
                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                            Tipo Pago
                                                        </th>
                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                            Monto
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ventasFiltradas.map((venta, index) => {
                                                        const Icon = obtenerIconoTipoPago(venta.tipo_pago);
                                                        const color = obtenerColorTipoPago(venta.tipo_pago).split(' ')[0];
                                                        return (
                                                            <tr key={venta.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                <td className="py-3 px-3">
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatDate(venta.created_at)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {venta.numero_factura || `V-${venta.id}`}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="text-gray-700 dark:text-gray-300">
                                                                        {venta.cliente?.nombre || 'Consumidor Final'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Icon className={`w-4 h-4 ${color}`} />
                                                                        <span className="text-sm">
                                                                            {obtenerNombreTipoPago(venta.tipo_pago)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                                        {formatCurrency(venta.total || 0)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Botón para ver más detalles */}
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => setDetalleVentas(!detalleVentas)}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-2"
                                    >
                                        {detalleVentas ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                <span>Ocultar detalle de ventas</span>
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                <span>Ver detalle de ventas</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario de cierre */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Conteo Final</h3>
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
                                                        Verifica que coincida con el desglose por tipo de pago mostrado arriba.
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

                                        {/* Desglose de efectivo */}
                                        <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                                <Wallet className="w-5 h-5 mr-2" />
                                                Desglose de Efectivo en Ventas
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Total ventas en efectivo:</span>
                                                    <span className="font-bold text-green-600 dark:text-green-400">
                                                        {formatCurrency(totalesPagos.EFECTIVO)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Total tarjetas (débito/crédito):</span>
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(totalesPagos.TARJETA_DEBITO + totalesPagos.TARJETA_CREDITO)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Otros métodos de pago:</span>
                                                    <span className="font-bold text-purple-600 dark:text-purple-400">
                                                        {formatCurrency(totalesPagos.TRANSFERENCIA + totalesPagos.CHEQUE + totalesPagos.SIN_DEFINIR)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Total ventas:</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(ventasPorTipo.totalGeneral)}
                                                        </span>
                                                    </div>
                                                </div>
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
                                                placeholder="Ej: Diferencias encontradas, situaciones especiales, observaciones sobre pagos con tarjeta, etc."
                                                value={data.observaciones}
                                                onChange={(e) => setData('observaciones', e.target.value)}
                                            />
                                            {errors.observaciones && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.observaciones}</p>
                                            )}
                                        </div>

                                        {/* Resumen final */}
                                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
                                            <h4 className="font-bold text-red-800 dark:text-red-200 mb-3">Resumen Final de Cierre</h4>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white/50 dark:bg-red-800/30 rounded-lg p-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-red-700 dark:text-red-300">Total esperado:</span>
                                                            <span className="font-bold text-red-900 dark:text-red-100">
                                                                {formatCurrency(calcularTotalEsperado())}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-red-600 dark:text-red-400">
                                                            Incluye: monto inicial + ventas efectivo + otros ingresos - egresos
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/50 dark:bg-red-800/30 rounded-lg p-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-red-700 dark:text-red-300">Total real contado:</span>
                                                            <span className="font-bold text-red-900 dark:text-red-100">
                                                                {formatCurrency(parseFloat(data.efectivo_final) || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-red-600 dark:text-red-400">
                                                            Efectivo físico en caja
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="border-t border-red-200 dark:border-red-700 pt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-medium text-red-700 dark:text-red-300">Diferencia total:</span>
                                                        <span className={`text-2xl font-bold flex items-center ${difTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {difTotal >= 0 ? (
                                                                <TrendingUp className="w-5 h-5 mr-2" />
                                                            ) : (
                                                                <TrendingDown className="w-5 h-5 mr-2" />
                                                            )}
                                                            {formatCurrency(difTotal)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                        {difTotal >= 0 ? 'Sobrante en caja' : 'Faltante en caja'}
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
                                        Últimos Movimientos
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

                            {/* Resumen de ventas por tipo */}
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 border border-emerald-200 dark:border-emerald-700 rounded-xl p-5">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Ventas por Tipo de Pago
                                </h4>
                                <div className="space-y-3">
                                    {ventasPorTipo.tipos.map(({ key, nombre, total, cantidad, icono: Icon, color }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className={`p-1.5 rounded-md ${color}`}>
                                                    <Icon className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm text-emerald-700 dark:text-emerald-300">
                                                    {nombre}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-emerald-900 dark:text-emerald-100">
                                                    {formatCurrency(total)}
                                                </div>
                                                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                                    {cantidad} ventas
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-emerald-800 dark:text-emerald-200">Total General:</span>
                                            <div className="text-right">
                                                <div className="font-bold text-emerald-900 dark:text-emerald-100">
                                                    {formatCurrency(ventasPorTipo.totalGeneral)}
                                                </div>
                                                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                                    {ventasPorTipo.cantidadTotal} ventas
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información de la caja */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
                                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Información de Caja
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-300">ID Caja:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            #{caja?.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-300">Usuario:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            {caja?.usuario?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-300">Fecha apertura:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            {formatDate(caja?.fecha_apertura)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-300">Hora apertura:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-100">
                                            {formatTime(caja?.fecha_apertura)}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 dark:text-blue-300">Estado actual:</span>
                                            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded">
                                                ABIERTA
                                            </span>
                                        </div>
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