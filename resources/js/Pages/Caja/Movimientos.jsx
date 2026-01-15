import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, DollarSign, History, Filter, Download,
    Search, Calendar, Clock, User, Receipt, CreditCard,
    TrendingUp, TrendingDown, Eye, RefreshCw, MoreVertical,
    PlusCircle, MinusCircle, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

export default function CajaMovimientos({ auth, caja, movimientos, sucursal }) {
    const [filters, setFilters] = useState({
        tipo: '',
        fecha_desde: '',
        fecha_hasta: '',
        search: ''
    });
    const [filteredMovimientos, setFilteredMovimientos] = useState(movimientos);

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'RD$ 0.00';
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTipoBadge = (tipo) => {
        const tipos = {
            'APERTURA': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: TrendingUp },
            'CIERRE': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: TrendingDown },
            'INGRESO': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: PlusCircle },
            'EGRESO': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: MinusCircle },
            'VENTA': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', icon: Receipt },
            'COMPRA': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', icon: CreditCard },
        };

        return tipos[tipo] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: History };
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filters) => {
        let filtered = [...movimientos];

        // Filtrar por tipo
        if (filters.tipo) {
            filtered = filtered.filter(m => m.tipo === filters.tipo);
        }

        // Filtrar por fecha
        if (filters.fecha_desde) {
            const desde = new Date(filters.fecha_desde);
            filtered = filtered.filter(m => new Date(m.created_at) >= desde);
        }

        if (filters.fecha_hasta) {
            const hasta = new Date(filters.fecha_hasta);
            hasta.setHours(23, 59, 59, 999);
            filtered = filtered.filter(m => new Date(m.created_at) <= hasta);
        }

        // Filtrar por búsqueda
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(m => 
                m.descripcion?.toLowerCase().includes(searchTerm) ||
                m.referencia?.toLowerCase().includes(searchTerm) ||
                m.usuario?.name?.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredMovimientos(filtered);
    };

    const resetFilters = () => {
        setFilters({
            tipo: '',
            fecha_desde: '',
            fecha_hasta: '',
            search: ''
        });
        setFilteredMovimientos(movimientos);
    };

    const exportToCSV = () => {
        const headers = ['Fecha', 'Hora', 'Tipo', 'Descripción', 'Monto', 'Usuario', 'Referencia'];
        const csvData = filteredMovimientos.map(m => [
            formatDate(m.created_at),
            formatTime(m.created_at),
            m.tipo,
            m.descripcion || '',
            formatCurrency(m.monto),
            m.usuario?.name || '',
            m.referencia || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `movimientos_caja_${caja.id}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calcular resumen
    const calcularResumen = () => {
        const resumen = {
            total_ingresos: 0,
            total_egresos: 0,
            saldo_actual: caja?.efectivo || 0,
            movimientos_count: filteredMovimientos.length
        };

        filteredMovimientos.forEach(mov => {
            if (['APERTURA', 'INGRESO', 'VENTA'].includes(mov.tipo)) {
                resumen.total_ingresos += parseFloat(mov.monto) || 0;
            } else if (['CIERRE', 'EGRESO', 'COMPRA'].includes(mov.tipo)) {
                resumen.total_egresos += parseFloat(mov.monto) || 0;
            }
        });

        resumen.balance = resumen.total_ingresos - resumen.total_egresos;
        return resumen;
    };

    const resumen = calcularResumen();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-xl shadow-lg">
                            <History className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Movimientos de Caja
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Caja #{caja.id} • {sucursal?.nombre || 'Sucursal'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={route('caja.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a Cajas
                        </Link>
                        <Link
                            href={route('caja.edit', caja.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Movimientos - Caja ${caja.id}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Información de la caja */}
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center mr-3">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Efectivo Actual</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(caja.efectivo)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center mr-3">
                                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Fecha Apertura</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatDate(caja.fecha_apertura)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center mr-3">
                                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Usuario</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {caja.usuario?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                        caja.estado === 'abierta' 
                                            ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30'
                                            : 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
                                    }`}>
                                        {caja.estado === 'abierta' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                                        <p className={`text-lg font-semibold ${
                                            caja.estado === 'abierta' 
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {caja.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros y acciones */}
                    <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Filtros de Movimientos
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredMovimientos.length} de {movimientos.length} movimientos encontrados
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Limpiar
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar CSV
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Búsqueda */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Buscar
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Descripción, usuario..."
                                    />
                                </div>
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={filters.tipo}
                                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="APERTURA">Apertura</option>
                                    <option value="CIERRE">Cierre</option>
                                    <option value="INGRESO">Ingreso</option>
                                    <option value="EGRESO">Egreso</option>
                                    <option value="VENTA">Venta</option>
                                    <option value="COMPRA">Compra</option>
                                </select>
                            </div>

                            {/* Fecha desde */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Desde
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={filters.fecha_desde}
                                        onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Fecha hasta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hasta
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={filters.fecha_hasta}
                                        onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de movimientos */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-800 dark:text-green-300">Total Ingresos</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                                        {formatCurrency(resumen.total_ingresos)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-800 dark:text-red-300">Total Egresos</p>
                                    <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                                        {formatCurrency(resumen.total_egresos)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">Balance</p>
                                    <p className={`text-2xl font-bold ${
                                        resumen.balance >= 0 
                                            ? 'text-blue-900 dark:text-blue-200'
                                            : 'text-red-900 dark:text-red-200'
                                    }`}>
                                        {formatCurrency(resumen.balance)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-800 dark:text-purple-300">Movimientos</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                        {resumen.movimientos_count}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de movimientos */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Historial de Movimientos
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Registro completo de todas las transacciones
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {filteredMovimientos.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                                Fecha
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
                                        {filteredMovimientos.map((movimiento) => {
                                            const tipoInfo = getTipoBadge(movimiento.tipo);
                                            const Icon = tipoInfo.icon;
                                            const isIngreso = ['APERTURA', 'INGRESO', 'VENTA'].includes(movimiento.tipo);
                                            
                                            return (
                                                <tr 
                                                    key={movimiento.id} 
                                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {formatDate(movimiento.created_at)}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatTime(movimiento.created_at)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center">
                                                            <div className={`w-8 h-8 ${tipoInfo.color} rounded-lg flex items-center justify-center mr-2`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {movimiento.tipo}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-4">
                                                        <div className="max-w-xs">
                                                            <p className="text-gray-900 dark:text-white truncate">
                                                                {movimiento.descripcion || 'Sin descripción'}
                                                            </p>
                                                            {movimiento.motivo && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {movimiento.motivo}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center font-semibold ${
                                                            isIngreso 
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {isIngreso ? '+' : '-'}
                                                            {formatCurrency(movimiento.monto)}
                                                        </span>
                                                    </td>
                                                    
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mr-2">
                                                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <span className="text-gray-900 dark:text-white">
                                                                {movimiento.usuario?.name || 'Sistema'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="py-4 px-4">
                                                        {movimiento.referencia ? (
                                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                                {movimiento.referencia}
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
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        No se encontraron movimientos
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                        {Object.values(filters).some(f => f) 
                                            ? 'No hay movimientos que coincidan con los filtros aplicados.' 
                                            : 'No hay movimientos registrados para esta caja.'
                                        }
                                    </p>
                                    {Object.values(filters).some(f => f) && (
                                        <button
                                            onClick={resetFilters}
                                            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer de la tabla */}
                        {filteredMovimientos.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Mostrando {filteredMovimientos.length} de {movimientos.length} movimientos
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Ingresos</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Egresos</span>
                                        </div>
                                        <button
                                            onClick={exportToCSV}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Exportar todo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nota informativa */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/10 rounded-xl border border-amber-200 dark:border-amber-700">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                                    Nota importante
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Los movimientos de caja se registran automáticamente al realizar transacciones. 
                                    Este historial es de solo lectura y no puede ser modificado directamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}