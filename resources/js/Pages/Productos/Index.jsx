import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { 
    Search, Plus, Edit, Trash2, Eye, 
    Package, Tag, DollarSign, Warehouse,
    Info, BarChart3, Filter, RefreshCw,
    AlertCircle, Percent, ShoppingCart,
    Truck, Layers, Hash, Barcode,
    TrendingUp, ChevronRight, Download,
    Database, Activity, BarChart, FileText,
    CheckCircle, XCircle, AlertTriangle,
    Calendar, Users, Grid3x3, Scale
} from 'lucide-react';

export default function Index({ auth, productos, filters, categorias, stats }) {
    const { flash = {} } = usePage().props;
    
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        categoria_id: filters?.categoria_id || '',
        per_page: filters?.per_page || 10,
    });

    const safeProductos = productos || { data: [], from: 1, to: 0, total: 0, links: [] };
    const safeStats = stats || { 
        total: 0, 
        activos: 0, 
        stock_bajo: 0, 
        exento_itbis: 0,
        valor_inventario: 0,
        compras_30dias: 0 
    };
    const safeCategorias = Array.isArray(categorias) ? categorias : [];

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('productos.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            categoria_id: '',
            per_page: 10,
        });
        router.get(route('productos.index'));
    };

    const handleDelete = (producto) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(route('productos.destroy', producto.id));
        }
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-emerald-600 to-green-500 p-3.5 rounded-xl shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Productos
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Administra el inventario de productos
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('productos.create')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Producto
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
            <Head title="Productos" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mensajes flash */}
                    {flash?.success && (
                        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Total Productos</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.total}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <Database className="w-3 h-3 mr-1" />
                                    En inventario
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Productos Activos</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.activos}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {((safeStats.activos / safeStats.total) * 100 || 0).toFixed(1)}% activos
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Stock Bajo</p>
                                    <p className="text-3xl font-bold text-white">{safeStats.stock_bajo}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Necesita reposición
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Valor Inventario</p>
                                    <p className="text-3xl font-bold text-white">
                                        {formatCurrency(safeStats.valor_inventario)}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <BarChart className="w-3 h-3 mr-1" />
                                    Valor total
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
                                                placeholder="Buscar producto por código, nombre o descripción..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                                            />
                                        </div>
                                        
                                        <div className="w-48">
                                            <select
                                                value={data.categoria_id}
                                                onChange={(e) => setData('categoria_id', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
                                            >
                                                <option value="">Todas las categorías</option>
                                                {safeCategorias.map((categoria) => (
                                                    <option key={categoria.id} value={categoria.id}>
                                                        {categoria.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 -rotate-90 text-gray-400 w-4 h-4 pointer-events-none" />
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
                                                get(route('productos.index', { per_page: e.target.value }), {
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

                    {/* Tabla de productos */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    Listado de Productos
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {safeProductos.from}-{safeProductos.to} de {safeProductos.total} productos
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Precios
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {safeProductos.data && safeProductos.data.length > 0 ? (
                                        safeProductos.data.map((producto) => {
                                            const tieneStockBajo = producto.control_stock && 
                                                                  producto.inventarios && 
                                                                  producto.inventarios[0] && 
                                                                  producto.inventarios[0].stock_disponible <= (producto.stock_minimo || 0);
                                            
                                            const stockSucursal = producto.inventarios && producto.inventarios[0] 
                                                ? producto.inventarios[0].stock_disponible 
                                                : 0;

                                            return (
                                                <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                                                                tieneStockBajo
                                                                    ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
                                                                    : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
                                                            }`}>
                                                                <Package className={`w-6 h-6 ${
                                                                    tieneStockBajo
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-blue-600 dark:text-blue-400'
                                                                }`} />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {producto.nombre || 'Sin nombre'}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                        {producto.codigo || 'N/A'}
                                                                    </span>
                                                                    {producto.codigo_barras && (
                                                                        <span className="ml-2 flex items-center text-xs">
                                                                            <Barcode className="w-3 h-3 mr-1" />
                                                                            {producto.codigo_barras}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {producto.descripcion && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-1">
                                                                        {producto.descripcion}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-2 rounded-lg mr-3">
                                                                <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {producto.categoria?.nombre || 'Sin categoría'}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                                    <Scale className="w-3 h-3 mr-1" />
                                                                    {producto.unidad_medida || 'Unidad'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                                                    <ShoppingCart className="w-3 h-3 mr-2" />
                                                                    Compra
                                                                </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {formatCurrency(producto.precio_compra)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                                                    <DollarSign className="w-3 h-3 mr-2" />
                                                                    Venta
                                                                </span>
                                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(producto.precio_venta)}
                                                                </span>
                                                            </div>
                                                            {producto.precio_mayor && (
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                                                        <Truck className="w-3 h-3 mr-2" />
                                                                        Mayor
                                                                    </span>
                                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                        {formatCurrency(producto.precio_mayor)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <div className={`text-sm font-bold flex items-center ${
                                                                tieneStockBajo
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                                <Layers className={`w-4 h-4 mr-2 ${
                                                                    tieneStockBajo
                                                                        ? 'text-red-500 dark:text-red-400'
                                                                        : 'text-green-500 dark:text-green-400'
                                                                }`} />
                                                                {stockSucursal}
                                                            </div>
                                                            {producto.control_stock && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="flex items-center">
                                                                            <AlertCircle className="w-3 h-3 mr-1 text-yellow-500 dark:text-yellow-400" />
                                                                            Mínimo
                                                                        </span>
                                                                        <span>{producto.stock_minimo || 0}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                producto.activo
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                            }`}>
                                                                {producto.activo ? (
                                                                    <>
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Activo
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="w-3 h-3 mr-1" />
                                                                        Inactivo
                                                                    </>
                                                                )}
                                                            </span>
                                                            <div className="text-xs">
                                                                {producto.exento_itbis ? (
                                                                    <span className="text-blue-600 dark:text-blue-400 flex items-center">
                                                                        <Percent className="w-3 h-3 mr-1" />
                                                                        Exento ITBIS
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                                                        <Percent className="w-3 h-3 mr-1" />
                                                                        ITBIS {producto.itbis_porcentaje || 0}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={route('productos.stock', producto.id)}
                                                                className="inline-flex items-center p-1.5 bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:from-indigo-200 hover:to-indigo-300 dark:hover:from-indigo-800/30 dark:hover:to-indigo-700/30 transition-all duration-200"
                                                                title="Gestionar stock"
                                                            >
                                                                <Warehouse className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('productos.show', producto.id)}
                                                                className="inline-flex items-center p-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('productos.edit', producto.id)}
                                                                className="inline-flex items-center p-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-200"
                                                                title="Editar"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(producto)}
                                                                className="inline-flex items-center p-1.5 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 rounded-lg hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-200"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="max-w-sm mx-auto">
                                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                        No se encontraron productos
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                        {data.search || data.categoria_id 
                                                            ? 'Intenta con otros filtros de búsqueda.' 
                                                            : 'Comienza agregando tu primer producto.'}
                                                    </p>
                                                    {!data.search && !data.categoria_id && (
                                                        <Link
                                                            href={route('productos.create')}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Agregar primer producto
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
                        {safeProductos.data && safeProductos.data.length > 0 && safeProductos.links && safeProductos.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando <span className="font-medium">{safeProductos.from}</span> a{' '}
                                        <span className="font-medium">{safeProductos.to}</span> de{' '}
                                        <span className="font-medium">{safeProductos.total}</span> resultados
                                    </div>
                                    <nav className="flex space-x-1">
                                        {safeProductos.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-md'
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