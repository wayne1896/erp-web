import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { 
    Search, Plus, Edit, Trash2, Eye, Calendar,
    Tag, Percent, Package, Filter, BarChart3, 
    TrendingUp, TrendingDown, MinusCircle,
    Download, RefreshCw, ChevronRight, Grid3x3,
    Layers, CheckCircle, XCircle, AlertTriangle,
    Database, Activity, FileText, Shield,
    BarChart, TrendingUp as TrendingUpIcon,
    Hash
} from 'lucide-react';

export default function Index({ auth, categorias, filters, stats }) {
    const { flash = {} } = usePage().props;
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        per_page: filters?.per_page || 10,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('categorias.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            per_page: 10,
        });
        router.get(route('categorias.index'));
    };

    const handleDelete = (categoria) => {
        if (categoria.productos_count > 0) {
            alert('No se puede eliminar porque tiene productos asociados');
            return;
        }
        
        if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
            router.delete(route('categorias.destroy', categoria.id));
        }
    };

    // Función para formatear ITBIS
    const formatItbis = (tasa_itbis, itbis_porcentaje) => {
        const descripciones = {
            'ITBIS1': 'ITBIS 18%',
            'ITBIS2': 'ITBIS 16%',
            'ITBIS3': 'ITBIS 0%',
            'EXENTO': 'Exento',
        };
        
        const porcentaje = parseFloat(itbis_porcentaje || 0);
        const descripcion = descripciones[tasa_itbis] || 'ITBIS 18%';
        
        if (tasa_itbis === 'EXENTO') {
            return descripcion;
        }
        
        return `${descripcion} (${porcentaje.toFixed(2)}%)`;
    };

    // Función para obtener color de ITBIS
    const getItbisColor = (tasa_itbis) => {
        switch(tasa_itbis) {
            case 'ITBIS1': return 'from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300';
            case 'ITBIS2': return 'from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-300';
            case 'ITBIS3': return 'from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300';
            case 'EXENTO': return 'from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300';
            default: return 'from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300';
        }
    };

    // Verificar datos seguros
    const safeCategorias = categorias || { data: [], links: [], from: 0, to: 0, total: 0 };
    const safeStats = stats || { 
        total: 0, 
        con_productos: 0, 
        itbis_18: 0, 
        itbis_16: 0, 
        itbis_0: 0, 
        exento: 0,
        total_productos: 0
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3.5 rounded-xl shadow-lg">
                            <Tag className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Categorías
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Organiza tus productos por categorías
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('categorias.create')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Categoría
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mensajes Flash */}
                    {flash.success && (
                        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {flash.error}
                        </div>
                    )}

                    {/* Estadísticas Mejoradas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Total Categorías</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.total}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Grid3x3 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <Database className="w-3 h-3 mr-1" />
                                    En el sistema
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Con Productos</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.con_productos}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <BarChart3 className="w-3 h-3 mr-1" />
                                    {((safeStats.con_productos / safeStats.total) * 100 || 0).toFixed(1)}% utilizadas
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Total Productos</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.total_productos || 0}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Layers className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <TrendingUpIcon className="w-3 h-3 mr-1" />
                                    Productos categorizados
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">ITBIS 18%</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.itbis_18}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Percent className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <BarChart className="w-3 h-3 mr-1" />
                                    Mayoría aplicada
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de herramientas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 w-full lg:w-auto">
                                    <form onSubmit={handleSearch} className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={data.search}
                                                onChange={(e) => setData('search', e.target.value)}
                                                placeholder="Buscar categoría por nombre, código o descripción..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Buscar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Limpiar
                                        </button>
                                    </form>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <select
                                            value={data.per_page}
                                            onChange={(e) => {
                                                setData('per_page', e.target.value);
                                                get(route('categorias.index', { per_page: e.target.value }), {
                                                    preserveState: true,
                                                });
                                            }}
                                            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="10">10 por página</option>
                                            <option value="25">25 por página</option>
                                            <option value="50">50 por página</option>
                                            <option value="100">100 por página</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 -rotate-90 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => {}}
                                        className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de categorías */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    Listado de Categorías
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {safeCategorias.from}-{safeCategorias.to} de {safeCategorias.total} categorías
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ITBIS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Productos
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Creada
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {safeCategorias.data && safeCategorias.data.length > 0 ? (
                                        safeCategorias.data.map((categoria) => (
                                            <tr 
                                                key={categoria.id} 
                                                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/30`}>
                                                            <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {categoria.nombre || 'Sin nombre'}
                                                            </div>
                                                            {categoria.descripcion && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                    {categoria.descripcion}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 px-3 py-2 rounded-lg">
                                                            <div className="font-mono text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                                                <Hash className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                                                                {categoria.codigo || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full inline-block w-fit bg-gradient-to-r ${getItbisColor(categoria.tasa_itbis)}`}>
                                                            {formatItbis(categoria.tasa_itbis, categoria.itbis_porcentaje)}
                                                        </span>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            {categoria.tasa_itbis}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`p-3 rounded-lg mr-3 ${
                                                            categoria.productos_count > 0
                                                                ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30'
                                                        }`}>
                                                            <Package className={`w-4 h-4 ${
                                                                categoria.productos_count > 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-gray-400 dark:text-gray-500'
                                                            }`} />
                                                        </div>
                                                        <div>
                                                            <div className={`text-lg font-bold ${
                                                                categoria.productos_count > 0
                                                                    ? 'text-gray-900 dark:text-white'
                                                                    : 'text-gray-400 dark:text-gray-500'
                                                            }`}>
                                                                {categoria.productos_count || 0}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                productos
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {new Date(categoria.created_at).toLocaleDateString('es-ES')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(categoria.created_at).toLocaleTimeString('es-ES', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('categorias.show', categoria.id)}
                                                            className="inline-flex items-center p-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('categorias.edit', categoria.id)}
                                                            className="inline-flex items-center p-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-200"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(categoria)}
                                                            className={`inline-flex items-center p-1.5 rounded-lg transition-all duration-200 ${
                                                                categoria.productos_count > 0
                                                                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/30 dark:hover:to-red-700/30'
                                                            }`}
                                                            title={categoria.productos_count > 0 
                                                                ? 'No se puede eliminar (tiene productos)' 
                                                                : 'Eliminar'
                                                            }
                                                            disabled={categoria.productos_count > 0}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="max-w-sm mx-auto">
                                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Tag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                        No se encontraron categorías
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                        {data.search 
                                                            ? 'Intenta con otros términos de búsqueda.' 
                                                            : 'Comienza creando tu primera categoría.'
                                                        }
                                                    </p>
                                                    {!data.search && (
                                                        <Link
                                                            href={route('categorias.create')}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Crear primera categoría
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {safeCategorias.links && safeCategorias.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando <span className="font-medium">{safeCategorias.from}</span> a{' '}
                                        <span className="font-medium">{safeCategorias.to}</span> de{' '}
                                        <span className="font-medium">{safeCategorias.total}</span> resultados
                                    </div>
                                    <nav className="flex space-x-1">
                                        {safeCategorias.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}