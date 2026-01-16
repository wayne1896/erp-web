import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    Calendar, 
    FileText, 
    User, 
    DollarSign, 
    Eye, 
    Edit, 
    Trash2,
    Filter,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

export default function VentasIndex({ ventas, filtros, estados, condicionesPago }) {
    const { url } = usePage();
    const [search, setSearch] = useState(filtros?.search || '');
    const [statusFilter, setStatusFilter] = useState(filtros?.estado || '');
    const [condicionFilter, setCondicionFilter] = useState(filtros?.condicion_pago || '');
    const [fechaInicio, setFechaInicio] = useState(filtros?.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(filtros?.fecha_fin || '');
    const [exporting, setExporting] = useState(false);

    // Formateadores
    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filtros
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('ventas.index'), {
            search,
            estado: statusFilter,
            condicion_pago: condicionFilter,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setCondicionFilter('');
        setFechaInicio('');
        setFechaFin('');
        router.get(route('ventas.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Estado badge
    const getStatusBadge = (estado) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        
        switch(estado?.toUpperCase()) {
            case 'PROCESADA':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            case 'PENDIENTE':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            case 'ANULADA':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>
                        {estado || 'N/A'}
                    </span>
                );
        }
    };

    // Calcular estadísticas
    const calcularEstadisticas = () => {
        if (!ventas?.data || ventas.data.length === 0) {
            return { 
                total: 0, 
                promedio: 0, 
                procesadas: 0,
                pendientes: 0,
                anuladas: 0,
                totalVentas: 0,
                contado: 0,
                credito: 0
            };
        }
        
        const ventasValidas = ventas.data.filter(v => v && v.total != null);
        
        const totalVentas = ventasValidas.reduce((sum, venta) => {
            const total = parseFloat(venta.total) || 0;
            return sum + total;
        }, 0);
        
        const procesadas = ventas.data.filter(v => 
            v.estado?.toUpperCase() === 'PROCESADA'
        ).length;
        
        const pendientes = ventas.data.filter(v => 
            v.estado?.toUpperCase() === 'PENDIENTE'
        ).length;
        
        const anuladas = ventas.data.filter(v => 
            v.estado?.toUpperCase() === 'ANULADA'
        ).length;
        
        const contado = ventas.data.filter(v => 
            v.condicion_pago === 'CONTADO'
        ).length;
        
        const credito = ventas.data.filter(v => 
            v.condicion_pago === 'CREDITO'
        ).length;
        
        const promedio = ventasValidas.length > 0 ? totalVentas / ventasValidas.length : 0;
        
        return {
            total: totalVentas,
            promedio: promedio,
            procesadas: procesadas,
            pendientes: pendientes,
            anuladas: anuladas,
            totalVentas: ventas.data.length,
            contado: contado,
            credito: credito
        };
    };

    const estadisticas = calcularEstadisticas();

    // Función para exportar a CSV
    const handleExport = async () => {
        try {
            setExporting(true);
            
            if (!ventas?.data || ventas.data.length === 0) {
                alert('No hay datos para exportar.');
                setExporting(false);
                return;
            }
            
            const csvData = ventas.data.map(venta => ({
                'Factura': venta.numero_factura || '',
                'NCF': venta.ncf || '',
                'Cliente': venta.cliente?.nombre_completo || 'Cliente no disponible',
                'Cédula': venta.cliente?.cedula_rnc || '',
                'Fecha': formatDateTime(venta.fecha_venta),
                'Estado': venta.estado || 'PENDIENTE',
                'Condición Pago': venta.condicion_pago || '',
                'Subtotal': formatCurrency(venta.subtotal || 0),
                'Descuento': formatCurrency(venta.descuento || 0),
                'ITBIS': formatCurrency(venta.itbis || 0),
                'Total': formatCurrency(venta.total || 0),
                'Vendedor': venta.vendedor?.name || 'N/A'
            }));
            
            const headers = Object.keys(csvData[0]);
            const csvRows = [
                headers.join(','),
                ...csvData.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        const escaped = ('' + value).replace(/"/g, '""');
                        return escaped.includes(',') ? `"${escaped}"` : escaped;
                    }).join(',')
                )
            ];
            
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `ventas-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                setExporting(false);
            }, 1000);
            
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar los datos. Por favor, intente nuevamente.');
            setExporting(false);
        }
    };

    // Función para ir a la página
    const goToPage = (page) => {
        if (page >= 1 && page <= ventas.last_page) {
            router.get(route('ventas.index'), {
                page,
                search,
                estado: statusFilter,
                condicion_pago: condicionFilter,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            }, {
                preserveState: true,
                replace: true
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3.5 rounded-xl shadow-lg">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Ventas
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Administra y monitorea todas tus transacciones comerciales
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting || !ventas?.data || ventas.data.length === 0}
                            className={`inline-flex items-center px-4 py-2.5 border rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                                exporting || !ventas?.data || ventas.data.length === 0
                                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {exporting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar CSV
                                </>
                            )}
                        </button>
                        <Link
                            href={route('ventas.create')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Venta
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Gestión de Ventas" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Ventas Totales</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(estadisticas.total)}
                                        </p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-200" />
                                </div>
                                <div className="mt-3 text-xs text-blue-200">
                                    <span>{estadisticas.totalVentas} ventas</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium mb-1">Procesadas</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.procesadas}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-3 text-xs text-green-200">
                                    <span>{Math.round((estadisticas.procesadas / estadisticas.totalVentas) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-medium mb-1">Pendientes</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.pendientes}
                                        </p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-yellow-200" />
                                </div>
                                <div className="mt-3 text-xs text-yellow-200">
                                    <span>{Math.round((estadisticas.pendientes / estadisticas.totalVentas) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm font-medium mb-1">Anuladas</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.anuladas}
                                        </p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-200" />
                                </div>
                                <div className="mt-3 text-xs text-red-200">
                                    <span>{Math.round((estadisticas.anuladas / estadisticas.totalVentas) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium mb-1">Crédito/Contado</p>
                                        <p className="text-lg font-bold text-white">
                                            {estadisticas.credito}/{estadisticas.contado}
                                        </p>
                                    </div>
                                    <Clock className="w-8 h-8 text-purple-200" />
                                </div>
                                <div className="mt-3 text-xs text-purple-200">
                                    <span>Ratio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                <Filter className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                Filtros de Búsqueda
                            </h3>
                            {(search || statusFilter || condicionFilter || fechaInicio || fechaFin) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Buscar
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cliente, factura o NCF"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados?.map((estado) => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Condición Pago
                                </label>
                                <select
                                    value={condicionFilter}
                                    onChange={(e) => setCondicionFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Todas</option>
                                    {condicionesPago?.map((condicion) => (
                                        <option key={condicion} value={condicion}>{condicion}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rango de Fechas
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        placeholder="Desde"
                                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        placeholder="Hasta"
                                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-4 flex justify-end space-x-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Aplicar Filtros
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de ventas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Ventas Registradas
                                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({ventas?.total || 0} ventas totales)
                                </span>
                            </h3>
                            
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Mostrando página {ventas?.current_page || 1} de {ventas?.last_page || 1}
                                </span>
                            </div>
                        </div>

                        {ventas?.data?.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Factura
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Cliente
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {ventas.data.map((venta) => (
                                                <tr 
                                                    key={venta.id} 
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center mr-3">
                                                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    #{venta.numero_factura}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    NCF: {venta.ncf || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mr-3">
                                                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {venta.cliente?.nombre_completo || 'Cliente no disponible'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {venta.cliente?.cedula_rnc || 'Sin cédula'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center text-sm">
                                                            <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-gray-900 dark:text-white">
                                                                    {formatDate(venta.fecha_venta)}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatDateTime(venta.fecha_venta).split(',')[1]}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(venta.estado)}
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {venta.condicion_pago}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(venta.total)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Sub: {formatCurrency(venta.subtotal || 0)}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={route('ventas.show', venta.id)}
                                                                className="inline-flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('ventas.edit', venta.id)}
                                                                className="inline-flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    if (venta.estado === 'ANULADA') {
                                                                        alert('No se puede eliminar una venta anulada');
                                                                        return;
                                                                    }
                                                                    if (confirm('¿Está seguro de eliminar esta venta?')) {
                                                                        router.delete(route('ventas.destroy', venta.id));
                                                                    }
                                                                }}
                                                                className="inline-flex items-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                                disabled={venta.estado === 'ANULADA'}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {ventas.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Mostrando <span className="font-medium">{ventas.from}</span> a <span className="font-medium">{ventas.to}</span> de <span className="font-medium">{ventas.total}</span> resultados
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => goToPage(1)}
                                                    disabled={ventas.current_page === 1}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Primera página"
                                                >
                                                    <ChevronsLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => goToPage(ventas.current_page - 1)}
                                                    disabled={ventas.current_page === 1}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Página anterior"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(Math.min(5, ventas.last_page))].map((_, i) => {
                                                        let pageNum;
                                                        if (ventas.last_page <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (ventas.current_page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (ventas.current_page >= ventas.last_page - 2) {
                                                            pageNum = ventas.last_page - 4 + i;
                                                        } else {
                                                            pageNum = ventas.current_page - 2 + i;
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => goToPage(pageNum)}
                                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                                    ventas.current_page === pageNum
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <button
                                                    onClick={() => goToPage(ventas.current_page + 1)}
                                                    disabled={ventas.current_page === ventas.last_page}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Página siguiente"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => goToPage(ventas.last_page)}
                                                    disabled={ventas.current_page === ventas.last_page}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Última página"
                                                >
                                                    <ChevronsRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No hay ventas registradas
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Comienza registrando tu primera venta para gestionar todas tus transacciones comerciales.
                                </p>
                                <Link
                                    href={route('ventas.create')}
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primera venta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}