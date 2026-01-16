import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Package,
    ShoppingCart, BarChart3, AlertCircle, Clock, CheckCircle,
    Calendar, CreditCard, Truck, RefreshCw, MoreVertical,
    ArrowRight, Eye, Plus, Download, Filter, Activity,
    Target, Zap, ChevronRight, Globe, Shield, Database
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    metrics = {}, 
    recentSales = [], 
    topProducts = [], 
    alerts = [], 
    charts = {}, 
    performance = {},
    user 
}) {
    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'RD$ 0.00';
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };
    
    const formatNumber = (number) => {
        if (number === undefined || number === null) return '0';
        return new Intl.NumberFormat('es-DO').format(number);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGreeting = () => {
        const hour = time.getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Tabs de navegación
    const tabs = [
        { id: 'overview', name: 'Resumen', icon: BarChart3 },
        { id: 'sales', name: 'Ventas', icon: DollarSign },
        { id: 'inventory', name: 'Inventario', icon: Package },
        { id: 'customers', name: 'Clientes', icon: Users },
        { id: 'analytics', name: 'Analíticas', icon: Activity },
    ];

    // Componente para métricas
    const MetricCard = ({ title, value, change, icon: Icon, color, subtext, prefix = '', suffix = '' }) => {
        const isPositive = change >= 0;
        
        return (
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${color.bg} transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className={`w-6 h-6 ${color.icon}`} />
                        </div>
                        {change !== undefined && (
                            <div className={`flex items-center px-3 py-1 rounded-full ${isPositive ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                                {isPositive ? (
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPositive ? '+' : ''}{change}%
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {prefix}{value}{suffix}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{title}</p>
                    
                    {subtext && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{subtext}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{user?.name?.split(' ')[0] || 'Usuario'}</span>
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {time.toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })} • {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sistema activo</span>
                        </div>
                        
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {user?.name || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Usuario'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-800">
                                <span className="font-bold text-white text-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alertas del sistema */}
                    {alerts.length > 0 && (
                        <div className="mb-8">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 p-1">
                                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-amber-200 dark:border-amber-700/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mr-3">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                                    Atención requerida
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {alerts.length === 1 ? 'Hay 1 alerta pendiente' : `Hay ${alerts.length} alertas pendientes`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-sm">
                                            {alerts.length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {alerts.slice(0, 3).map((alert, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-3 ${
                                                        alert.type === 'danger' ? 'bg-red-500' :
                                                        alert.type === 'warning' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`}></div>
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                        {alert.message}
                                                    </span>
                                                </div>
                                                {alert.action && (
                                                    <Link
                                                        href={alert.actionUrl}
                                                        className="text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg hover:shadow transition hover:-translate-y-0.5"
                                                    >
                                                        {alert.action}
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navegación por pestañas */}
                    <div className="mb-8">
                        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl max-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                            isActive
                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-500' : ''}`} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Métricas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <MetricCard
                            title="Ventas Hoy"
                            value={formatCurrency(metrics.ventas?.hoy?.total || 0)}
                            change={metrics.ventas?.hoy?.variacion || 0}
                            icon={DollarSign}
                            color={{
                                bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30',
                                icon: 'text-emerald-600 dark:text-emerald-400'
                            }}
                            prefix=""
                            suffix=""
                            subtext={`${metrics.ventas?.hoy?.count || 0} transacciones • Tkt: ${formatCurrency(metrics.ventas?.hoy?.ticket_promedio || 0)}`}
                        />
                        
                        <MetricCard
                            title="Clientes Activos"
                            value={formatNumber(metrics.clientes?.total || 0)}
                            change={15}
                            icon={Users}
                            color={{
                                bg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
                                icon: 'text-blue-600 dark:text-blue-400'
                            }}
                            prefix=""
                            suffix=""
                            subtext={`+${metrics.clientes?.nuevos_hoy || 0} hoy • ${metrics.clientes?.nuevos_semana || 0} esta semana`}
                        />
                        
                        <MetricCard
                            title="Ticket Promedio"
                            value={formatCurrency(performance?.ticket_promedio || 0)}
                            change={8}
                            icon={CreditCard}
                            color={{
                                bg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
                                icon: 'text-purple-600 dark:text-purple-400'
                            }}
                            prefix=""
                            suffix=""
                            subtext="Promedio por transacción"
                        />
                        
                        <MetricCard
                            title="Estado Caja"
                            value={formatCurrency(metrics.caja?.monto_actual || 0)}
                            change={metrics.caja?.abierta ? 0 : -100}
                            icon={ShoppingCart}
                            color={{
                                bg: metrics.caja?.abierta 
                                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30'
                                    : 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
                                icon: metrics.caja?.abierta 
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                            }}
                            prefix=""
                            suffix=""
                            subtext={metrics.caja?.abierta 
                                ? `Abierta desde ${metrics.caja?.fecha_apertura || 'Hoy'}`
                                : 'Caja cerrada • Inicial: ' + formatCurrency(metrics.caja?.monto_inicial || 0)
                            }
                        />
                    </div>

                    {/* Sección principal: Ventas e inventario */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Ventas semanales */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Desempeño de Ventas</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Últimos 7 días</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {charts.ventas_por_dia?.map((day, index) => (
                                            <div key={index} className="group">
                                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                                                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{day.dia}</h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{day.fecha}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                                            {formatCurrency(day.total)}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {day.ventas} ventas • {formatCurrency(day.ticket_promedio)} avg
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 px-4">
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((day.total / (charts.ventas_por_dia.reduce((max, d) => Math.max(max, d.total), 0) || 1)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Semana actual</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(metrics.ventas?.semana?.total || 0)}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mes actual</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(metrics.ventas?.mes?.total || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rendimiento y meta */}
                        <div className="space-y-6">
                            {/* Meta diaria */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Meta Diaria</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Progreso del día</p>
                                </div>
                                
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {performance.meta_diaria?.porcentaje?.toFixed(1) || 0}%
                                        </span>
                                    </div>
                                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(performance.meta_diaria?.porcentaje || 0, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-3 text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {formatCurrency(performance.meta_diaria?.progreso || 0)}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {formatCurrency(performance.meta_diaria?.objetivo || 0)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl">
                                        <div className="flex items-center">
                                            <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Conversión</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {performance.conversion_cliente || 0}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-4 rounded-xl">
                                        <div className="flex items-center">
                                            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Inventario</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {metrics.inventario?.productos_bajo_stock > 0 ? 
                                                        metrics.inventario.productos_bajo_stock : 'OK'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/ventas/crear"
                                        className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                <Plus className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-medium text-white">Nueva Venta</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                                    </Link>
                                    
                                    <Link
                                        href="/caja/abrir"
                                        className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                                <DollarSign className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-medium text-white">
                                                {metrics.caja?.abierta ? 'Ver Caja' : 'Abrir Caja'}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                                    </Link>
                                    
                                    <Link
                                        href="/productos"
                                        className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                                <Package className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-medium text-white">Gestión Inventario</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección inferior: Ventas recientes y productos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Ventas recientes */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ventas Recientes</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Últimas transacciones</p>
                                    </div>
                                    <Link
                                        href="/ventas"
                                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                                    >
                                        Ver todas
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {recentSales.length > 0 ? (
                                        recentSales.slice(0, 4).map((sale) => (
                                            <div key={sale.id} className="group">
                                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                            sale.condicion_pago === 'CONTADO' 
                                                                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30'
                                                                : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
                                                        }`}>
                                                            <ShoppingCart className={`w-6 h-6 ${
                                                                sale.condicion_pago === 'CONTADO' 
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-blue-600 dark:text-blue-400'
                                                            }`} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                #{sale.numero_factura || 'N/A'}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                                                                {sale.cliente_nombre || 'Cliente general'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(sale.total)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatTime(sale.fecha_venta)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 mb-2">No hay ventas recientes</p>
                                            <Link
                                                href="/ventas/crear"
                                                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Realizar primera venta
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Productos más vendidos */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Productos Destacados</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Top productos del mes</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
                                            {topProducts.length} productos
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {topProducts.length > 0 ? (
                                        topProducts.slice(0, 4).map((product, index) => (
                                            <div key={product.id} className="group">
                                                <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300">
                                                    <div className="flex-shrink-0 relative">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                                                            <span className="font-bold text-white">
                                                                #{index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                            <Package className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {product.nombre}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {product.codigo || 'Sin código'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 dark:text-gray-100">
                                                            {formatNumber(product.total_vendido)} uds
                                                        </div>
                                                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                            {formatCurrency(product.total_ingresos)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No hay datos de productos vendidos</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estado del sistema */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Estado del Sistema</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Monitoreo y rendimiento</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Operativo</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                                        <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Base de Datos</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Conectada</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                                        <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">API</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Online</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl">
                                <div className="flex items-center">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
                                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Seguridad</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Protegido</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">ERP Business Suite</span> • 
                                    Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                    <Link href="/ayuda" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Soporte
                                    </Link>
                                    <Link href="/reportes" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                                        Generar Reporte
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}