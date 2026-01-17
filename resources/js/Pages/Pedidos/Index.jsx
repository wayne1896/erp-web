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
    ChevronsRight,
    Package,
    Truck,
    Layers,
    BarChart3,
    RefreshCw,
    PackageCheck,
    AlertTriangle,
    CheckSquare,
    XSquare,
    MoreVertical,
    Printer,
    FileEdit
} from 'lucide-react';

export default function PedidosIndex({ pedidos, filtros, estados, prioridades, tiposPedido }) {
    const { url } = usePage();
    const [search, setSearch] = useState(filtros?.search || '');
    const [statusFilter, setStatusFilter] = useState(filtros?.estado || '');
    const [prioridadFilter, setPrioridadFilter] = useState(filtros?.prioridad || '');
    const [tipoFilter, setTipoFilter] = useState(filtros?.tipo_pedido || '');
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
        router.get(route('pedidos.index'), {
            search,
            estado: statusFilter,
            prioridad: prioridadFilter,
            tipo_pedido: tipoFilter,
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
        setPrioridadFilter('');
        setTipoFilter('');
        setFechaInicio('');
        setFechaFin('');
        router.get(route('pedidos.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Estado badge
    const getStatusBadge = (estado) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        
        switch(estado?.toUpperCase()) {
            case 'PROCESADO':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>
                        <Package className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            case 'ENTREGADO':
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
            case 'CANCELADO':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            case 'FACTURADO':
                return (
                    <span className={`${baseClasses} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`}>
                        <FileText className="w-3 h-3 mr-1" />
                        {estado}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        {estado || 'N/A'}
                    </span>
                );
        }
    };

    // Prioridad badge
    const getPriorityBadge = (prioridad) => {
        const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
        
        switch(prioridad?.toUpperCase()) {
            case 'URGENTE':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'ALTA':
                return (
                    <span className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'MEDIA':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>
                        <Layers className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'BAJA':
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        <Layers className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        {prioridad || 'MEDIA'}
                    </span>
                );
        }
    };

    // Calcular estadísticas
    const calcularEstadisticas = () => {
        if (!pedidos?.data || pedidos.data.length === 0) {
            return { 
                total: 0, 
                promedio: 0, 
                pendientes: 0,
                procesados: 0,
                entregados: 0,
                cancelados: 0,
                facturados: 0,
                totalPedidos: 0,
                urgentes: 0,
                anticipoTotal: 0
            };
        }
        
        const pedidosValidos = pedidos.data.filter(p => p && p.total != null);
        
        const totalPedidos = pedidosValidos.reduce((sum, pedido) => {
            const total = parseFloat(pedido.total) || 0;
            return sum + total;
        }, 0);
        
        const pendientes = pedidos.data.filter(p => 
            p.estado?.toUpperCase() === 'PENDIENTE'
        ).length;
        
        const procesados = pedidos.data.filter(p => 
            p.estado?.toUpperCase() === 'PROCESADO'
        ).length;
        
        const entregados = pedidos.data.filter(p => 
            p.estado?.toUpperCase() === 'ENTREGADO'
        ).length;
        
        const cancelados = pedidos.data.filter(p => 
            p.estado?.toUpperCase() === 'CANCELADO'
        ).length;
        
        const facturados = pedidos.data.filter(p => 
            p.estado?.toUpperCase() === 'FACTURADO'
        ).length;
        
        const urgentes = pedidos.data.filter(p => 
            p.prioridad?.toUpperCase() === 'URGENTE'
        ).length;
        
        const anticipoTotal = pedidosValidos.reduce((sum, pedido) => {
            const anticipo = parseFloat(pedido.anticipo) || 0;
            return sum + anticipo;
        }, 0);
        
        const promedio = pedidosValidos.length > 0 ? totalPedidos / pedidosValidos.length : 0;
        
        return {
            total: totalPedidos,
            promedio: promedio,
            pendientes: pendientes,
            procesados: procesados,
            entregados: entregados,
            cancelados: cancelados,
            facturados: facturados,
            totalPedidos: pedidos.data.length,
            urgentes: urgentes,
            anticipoTotal: anticipoTotal
        };
    };

    const estadisticas = calcularEstadisticas();

    // Función para exportar a CSV
    const handleExport = async () => {
        try {
            setExporting(true);
            
            if (!pedidos?.data || pedidos.data.length === 0) {
                alert('No hay datos para exportar.');
                setExporting(false);
                return;
            }
            
            const csvData = pedidos.data.map(pedido => ({
                'Pedido': pedido.numero_pedido || '',
                'Cliente': pedido.cliente?.nombre_completo || 'Cliente no disponible',
                'Fecha Pedido': formatDateTime(pedido.fecha_pedido),
                'Fecha Entrega': formatDateTime(pedido.fecha_entrega),
                'Estado': pedido.estado || 'PENDIENTE',
                'Prioridad': pedido.prioridad || 'MEDIA',
                'Tipo': pedido.tipo_pedido || 'LOCAL',
                'Condición Pago': pedido.condicion_pago || '',
                'Anticipo': formatCurrency(pedido.anticipo || 0),
                'Saldo Pendiente': formatCurrency(pedido.saldo_pendiente || 0),
                'Total': formatCurrency(pedido.total || 0),
                'Vendedor': pedido.vendedor?.name || 'N/A'
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
            link.setAttribute('download', `pedidos-${new Date().toISOString().split('T')[0]}.csv`);
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
        if (page >= 1 && page <= pedidos.last_page) {
            router.get(route('pedidos.index'), {
                page,
                search,
                estado: statusFilter,
                prioridad: prioridadFilter,
                tipo_pedido: tipoFilter,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            }, {
                preserveState: true,
                replace: true
            });
        }
    };

    // Acciones rápidas
    const handleAccionRapida = (accion, pedido) => {
        switch(accion) {
            case 'procesar':
                if (confirm('¿Procesar este pedido?')) {
                    router.post(route('pedidos.procesar', pedido.id));
                }
                break;
            case 'entregar':
                if (confirm('¿Marcar como entregado?')) {
                    router.post(route('pedidos.entregar', pedido.id));
                }
                break;
            case 'cancelar':
                const motivo = prompt('Ingrese el motivo de cancelación:');
                if (motivo) {
                    router.post(route('pedidos.cancelar', pedido.id), { motivo });
                }
                break;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3.5 rounded-xl shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Pedidos
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Administra y sigue el estado de todos los pedidos del sistema
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting || !pedidos?.data || pedidos.data.length === 0}
                            className={`inline-flex items-center px-4 py-2.5 border rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                                exporting || !pedidos?.data || pedidos.data.length === 0
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
                            href={route('pedidos.create')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Pedido
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Gestión de Pedidos" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium mb-1">Pedidos Totales</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(estadisticas.total)}
                                        </p>
                                    </div>
                                    <Package className="w-8 h-8 text-purple-200" />
                                </div>
                                <div className="mt-3 text-xs text-purple-200">
                                    <span>{estadisticas.totalPedidos} pedidos</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-600 to-amber-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-medium mb-1">Pendientes</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.pendientes}
                                        </p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-200" />
                                </div>
                                <div className="mt-3 text-xs text-yellow-200">
                                    <span>{Math.round((estadisticas.pendientes / estadisticas.totalPedidos) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Procesados</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.procesados}
                                        </p>
                                    </div>
                                    <PackageCheck className="w-8 h-8 text-blue-200" />
                                </div>
                                <div className="mt-3 text-xs text-blue-200">
                                    <span>{Math.round((estadisticas.procesados / estadisticas.totalPedidos) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium mb-1">Entregados</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.entregados}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-3 text-xs text-green-200">
                                    <span>{Math.round((estadisticas.entregados / estadisticas.totalPedidos) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium mb-1">Facturados</p>
                                        <p className="text-xl font-bold text-white">
                                            {estadisticas.facturados}
                                        </p>
                                    </div>
                                    <FileText className="w-8 h-8 text-indigo-200" />
                                </div>
                                <div className="mt-3 text-xs text-indigo-200">
                                    <span>{Math.round((estadisticas.facturados / estadisticas.totalPedidos) * 100) || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resto del código permanece igual... */}
                    {/* Filtros */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                <Filter className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                Filtros de Búsqueda
                            </h3>
                            {(search || statusFilter || prioridadFilter || tipoFilter || fechaInicio || fechaFin) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
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
                                        placeholder="# Pedido, cliente..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados?.map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    value={prioridadFilter}
                                    onChange={(e) => setPrioridadFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    <option value="">Todas</option>
                                    {prioridades?.map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo Pedido
                                </label>
                                <select
                                    value={tipoFilter}
                                    onChange={(e) => setTipoFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    <option value="">Todos</option>
                                    {tiposPedido?.map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rango de Fechas
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        placeholder="Desde"
                                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        placeholder="Hasta"
                                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-4 flex justify-end space-x-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Aplicar Filtros
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de pedidos */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Pedidos Registrados
                                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({pedidos?.total || 0} pedidos totales)
                                </span>
                            </h3>
                            
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Mostrando página {pedidos?.current_page || 1} de {pedidos?.last_page || 1}
                                </span>
                            </div>
                        </div>

                        {pedidos?.data?.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Pedido
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Cliente
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Fechas
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Estado / Prioridad
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Montos
                                                </th>
                                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {pedidos.data.map((pedido) => (
                                                <tr 
                                                    key={pedido.id} 
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center mr-3">
                                                                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    {pedido.numero_pedido}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Tipo: {pedido.tipo_pedido || 'LOCAL'}
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
                                                                    {pedido.cliente?.nombre_completo || 'Cliente no disponible'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {pedido.cliente?.cedula_rnc || 'Sin cédula'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center text-sm">
                                                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-gray-900 dark:text-white">
                                                                        {formatDate(pedido.fecha_pedido)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Pedido
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center text-sm">
                                                                <Truck className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <div>
                                                                    <p className={`${new Date(pedido.fecha_entrega) < new Date() && pedido.estado !== 'ENTREGADO' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                                                                        {formatDate(pedido.fecha_entrega)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Entrega
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-2">
                                                            <div>
                                                                {getStatusBadge(pedido.estado)}
                                                            </div>
                                                            <div>
                                                                {getPriorityBadge(pedido.prioridad)}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {pedido.condicion_pago}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(pedido.total)}
                                                            </p>
                                                            {pedido.anticipo > 0 && (
                                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                                    Anticipo: {formatCurrency(pedido.anticipo)}
                                                                </p>
                                                            )}
                                                            {pedido.saldo_pendiente > 0 && (
                                                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                                                    Saldo: {formatCurrency(pedido.saldo_pendiente)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={route('pedidos.show', pedido.id)}
                                                                className="inline-flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            
                                                            {pedido.estado === 'PENDIENTE' && (
                                                                <>
                                                                    <Link
                                                                        href={route('pedidos.edit', pedido.id)}
                                                                        className="inline-flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
                                                                        title="Editar"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleAccionRapida('procesar', pedido)}
                                                                        className="inline-flex items-center p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                                                        title="Procesar"
                                                                    >
                                                                        <PackageCheck className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {pedido.estado === 'PROCESADO' && (
                                                                <button
                                                                    onClick={() => handleAccionRapida('entregar', pedido)}
                                                                    className="inline-flex items-center p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                                                    title="Marcar como entregado"
                                                                >
                                                                    <CheckSquare className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            
                                                            {(pedido.estado === 'PENDIENTE' || pedido.estado === 'PROCESADO') && (
                                                                <button
                                                                    onClick={() => handleAccionRapida('cancelar', pedido)}
                                                                    className="inline-flex items-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                                    title="Cancelar"
                                                                >
                                                                    <XSquare className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {pedidos.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Mostrando <span className="font-medium">{pedidos.from}</span> a <span className="font-medium">{pedidos.to}</span> de <span className="font-medium">{pedidos.total}</span> resultados
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => goToPage(1)}
                                                    disabled={pedidos.current_page === 1}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Primera página"
                                                >
                                                    <ChevronsLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => goToPage(pedidos.current_page - 1)}
                                                    disabled={pedidos.current_page === 1}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Página anterior"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(Math.min(5, pedidos.last_page))].map((_, i) => {
                                                        let pageNum;
                                                        if (pedidos.last_page <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (pedidos.current_page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (pedidos.current_page >= pedidos.last_page - 2) {
                                                            pageNum = pedidos.last_page - 4 + i;
                                                        } else {
                                                            pageNum = pedidos.current_page - 2 + i;
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => goToPage(pageNum)}
                                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                                    pedidos.current_page === pageNum
                                                                        ? 'bg-purple-600 text-white'
                                                                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <button
                                                    onClick={() => goToPage(pedidos.current_page + 1)}
                                                    disabled={pedidos.current_page === pedidos.last_page}
                                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Página siguiente"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => goToPage(pedidos.last_page)}
                                                    disabled={pedidos.current_page === pedidos.last_page}
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
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-10 h-10 text-purple-400 dark:text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No hay pedidos registrados
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Comienza registrando tu primer pedido para gestionar todas las solicitudes de tus clientes.
                                </p>
                                <Link
                                    href={route('pedidos.create')}
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primer pedido
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}