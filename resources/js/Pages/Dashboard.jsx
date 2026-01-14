import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Package,
    ShoppingCart, BarChart3, AlertCircle, Clock, CheckCircle,
    Calendar, CreditCard, Truck, RefreshCw, MoreVertical,
    ArrowRight, Eye, Plus, Download, Filter
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    metrics, 
    recentSales, 
    topProducts, 
    alerts, 
    charts, 
    performance,
    user 
}) {
    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };
    
    const formatNumber = (number) => {
        return new Intl.NumberFormat('es-DO').format(number);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                                Panel de Control
                            </h2>
                            <p className="text-sm text-gray-600">
                                {time.toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 px-4 py-2 rounded-xl">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="font-semibold text-blue-700">
                                    {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center space-x-3 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                        >
                            <div className="text-right">
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                <span className="font-bold text-blue-600 text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alertas importantes */}
                    {alerts.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                                    Alertas del Sistema
                                </h3>
                                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                    {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl border-l-4 ${
                                            alert.type === 'danger'
                                                ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-red-500 border-red-200'
                                                : alert.type === 'warning'
                                                ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-amber-500 border-amber-200'
                                                : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-blue-500 border-blue-200'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="text-2xl mr-3">{alert.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800">{alert.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-gray-500">
                                                        {alert.timestamp}
                                                    </span>
                                                    {alert.action && (
                                                        <Link
                                                            href={alert.actionUrl}
                                                            className="text-xs font-semibold px-3 py-1 rounded-lg bg-white border hover:shadow-sm transition"
                                                        >
                                                            {alert.action}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Métricas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Ventas Hoy */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex items-center">
                                    {metrics.ventas.hoy.variacion >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`text-sm font-semibold ${
                                        metrics.ventas.hoy.variacion >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {metrics.ventas.hoy.variacion >= 0 ? '+' : ''}{metrics.ventas.hoy.variacion}%
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                {formatCurrency(metrics.ventas.hoy.total)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Ventas del día</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{metrics.ventas.hoy.count} transacciones</span>
                                <span>Tkt: {formatCurrency(metrics.ventas.hoy.ticket_promedio)}</span>
                            </div>
                        </div>

                        {/* Clientes */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    +{metrics.clientes.nuevos_hoy} hoy
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                {formatNumber(metrics.clientes.total)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Clientes registrados</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{metrics.clientes.nuevos_semana} esta semana</span>
                                <span>Activos</span>
                            </div>
                        </div>

                        {/* Inventario */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                                {metrics.inventario.productos_bajo_stock > 0 ? (
                                    <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                        {metrics.inventario.productos_bajo_stock} bajo stock
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Stock OK
                                    </span>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                {formatNumber(metrics.inventario.total_productos)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Productos activos</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Valor: {formatCurrency(metrics.inventario.valor_total_inventario)}</span>
                                <Link href="/productos" className="text-purple-600 hover:text-purple-800">
                                    <Eye className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Estado Caja */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${
                                    metrics.caja.abierta 
                                        ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                                        : 'bg-gradient-to-br from-amber-100 to-amber-200'
                                }`}>
                                    <ShoppingCart className={`w-6 h-6 ${
                                        metrics.caja.abierta ? 'text-emerald-600' : 'text-amber-600'
                                    }`} />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    metrics.caja.abierta 
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {metrics.caja.abierta ? 'Abierta' : 'Cerrada'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                {formatCurrency(metrics.caja.monto_actual)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Efectivo en caja</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Inicial: {formatCurrency(metrics.caja.monto_inicial)}</span>
                                {metrics.caja.abierta ? (
                                    <span className="text-emerald-600">● Abierta {metrics.caja.fecha_apertura}</span>
                                ) : (
                                    <Link href="/caja/abrir" className="text-amber-600 hover:text-amber-800 flex items-center">
                                        <Plus className="w-3 h-3 mr-1" />
                                        Abrir caja
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segunda fila: Ventas semanales y meta */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Ventas semanales */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Ventas semanales</h3>
                                    <p className="text-sm text-gray-600">Desempeño últimos 7 días</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-gray-600">Ventas</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-gray-600">Ticket promedio</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Día</th>
                                            <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Ventas</th>
                                            <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                                            <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Ticket</th>
                                            <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Tendencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {charts.ventas_por_dia?.map((day, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3">
                                                    <div className="font-medium text-gray-800">{day.dia}</div>
                                                    <div className="text-xs text-gray-500">{day.fecha}</div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-semibold">{day.ventas}</div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-bold text-gray-800">{formatCurrency(day.total)}</div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="text-sm text-gray-700">{formatCurrency(day.ticket_promedio)}</div>
                                                </td>
                                                <td className="py-3">
                                                    {day.total > 0 ? (
                                                        <div className="flex items-center text-green-600">
                                                            <TrendingUp className="w-4 h-4 mr-1" />
                                                            <span className="text-xs font-semibold">+</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-gray-400">
                                                            <span className="text-xs">—</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-gray-600">Total semana:</span>
                                        <span className="ml-2 font-bold text-lg text-gray-800">
                                            {formatCurrency(metrics.ventas.semana.total)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Total mes:</span>
                                        <span className="ml-2 font-bold text-lg text-gray-800">
                                            {formatCurrency(metrics.ventas.mes.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meta diaria y rendimiento */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Meta diaria</h3>
                                <p className="text-sm text-gray-600">Progreso del día</p>
                            </div>
                            
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Progreso</span>
                                    <span className="text-sm font-bold text-blue-600">
                                        {performance.meta_diaria?.porcentaje?.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(performance.meta_diaria?.porcentaje || 0, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-3 text-sm text-gray-600">
                                    <span>{formatCurrency(performance.meta_diaria?.progreso || 0)}</span>
                                    <span>{formatCurrency(performance.meta_diaria?.objetivo || 0)}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800">Ticket promedio</p>
                                            <p className="text-2xl font-bold text-blue-900">
                                                {formatCurrency(performance.ticket_promedio)}
                                            </p>
                                        </div>
                                        <CreditCard className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-green-800">Conversión</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {performance.conversion_cliente}%
                                            </p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Acciones rápidas</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/ventas/crear"
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl text-center hover:shadow-lg transition-all hover:-translate-y-0.5"
                                    >
                                        <Plus className="w-5 h-5 mx-auto mb-2" />
                                        <span className="text-sm font-semibold">Nueva Venta</span>
                                    </Link>
                                    <Link
                                        href="/productos"
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl text-center hover:shadow-lg transition-all hover:-translate-y-0.5"
                                    >
                                        <Package className="w-5 h-5 mx-auto mb-2" />
                                        <span className="text-sm font-semibold">Inventario</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tercera fila: Ventas recientes y productos más vendidos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Ventas recientes */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Ventas recientes</h3>
                                    <p className="text-sm text-gray-600">Últimas transacciones</p>
                                </div>
                                <Link
                                    href="/ventas"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    Ver todas
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                            
                            <div className="space-y-4">
                                {recentSales.length > 0 ? (
                                    recentSales.map((sale) => (
                                        <div key={sale.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">Venta #{sale.numero_factura}</h4>
                                                    <p className="text-sm text-gray-600">{sale.cliente_nombre}</p>
                                                </div>
                                                <span className="font-bold text-lg text-gray-800">
                                                    {formatCurrency(sale.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">{sale.fecha_venta}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        sale.condicion_pago === 'CONTADO' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {sale.condicion_pago}
                                                    </span>
                                                </div>
                                                <span className="text-gray-600">
                                                    {sale.items_count} {sale.items_count === 1 ? 'producto' : 'productos'}
                                                </span>
                                            </div>
                                            {sale.items?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="text-xs text-gray-600">Productos:</div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {sale.items.map((item, idx) => (
                                                            <span key={idx} className="bg-white border border-gray-300 px-2 py-1 rounded text-xs">
                                                                {item.producto} ({item.cantidad})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay ventas recientes</p>
                                        <Link
                                            href="/ventas/crear"
                                            className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            Realizar primera venta
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Productos más vendidos */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Productos más vendidos</h3>
                                    <p className="text-sm text-gray-600">Este mes</p>
                                </div>
                                <Link
                                    href="/productos"
                                    className="text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center"
                                >
                                    <Filter className="w-4 h-4 mr-1" />
                                    Filtrar
                                </Link>
                            </div>
                            
                            <div className="space-y-4">
                                {topProducts.length > 0 ? (
                                    topProducts.map((product, index) => (
                                        <div key={product.id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm transition">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4">
                                                <span className="font-bold text-purple-700">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 truncate">{product.nombre}</h4>
                                                <p className="text-sm text-gray-600">Código: {product.codigo}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-800">
                                                    {formatNumber(product.total_vendido)} uds
                                                </div>
                                                <div className="text-sm text-purple-600 font-semibold">
                                                    {formatCurrency(product.total_ingresos)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay datos de ventas este mes</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen sucursal</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl">
                                        <p className="text-xs text-blue-800 font-semibold">Sucursal</p>
                                        <p className="font-bold text-blue-900 truncate">{metrics.sucursal.nombre}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl">
                                        <p className="text-xs text-green-800 font-semibold">Estado</p>
                                        <p className="font-bold text-green-900">
                                            {metrics.sucursal.activa ? 'Activa' : 'Inactiva'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del sistema */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Sistema ERP</h3>
                                <p className="text-sm text-gray-600">Información y estado del sistema</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <RefreshCw className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Estado</p>
                                        <p className="text-lg font-bold text-green-700">Operativo</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Uptime</p>
                                        <p className="text-lg font-bold text-blue-700">99.8%</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                        <Truck className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Sincronización</p>
                                        <p className="text-lg font-bold text-purple-700">Activa</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-amber-100 p-2 rounded-lg mr-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Alertas</p>
                                        <p className="text-lg font-bold text-amber-700">{alerts.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Última actualización: {new Date().toLocaleTimeString('es-ES')}
                                </div>
                                <Link
                                    href="/ayuda"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    ¿Necesitas ayuda?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}