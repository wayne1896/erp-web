import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Edit, Tag, Percent, Package, 
    DollarSign, BarChart3, Calendar, FileText,
    Trash2, Plus, Eye, TrendingUp, BarChart,
    Layers, CheckCircle, AlertTriangle, Database,
    Activity, Shield, Grid3x3, Hash, Clock,
    Users, ShoppingBag, TrendingUp as TrendingUpIcon,
    PieChart, Target, Zap, Info
} from 'lucide-react';

export default function Show({ auth, categoria, productos, estadisticas }) {
    // Función para formatear ITBIS
    const getItbisBadgeColor = (tasa_itbis) => {
        switch(tasa_itbis) {
            case 'ITBIS1': return 'from-red-500 to-red-600 text-white';
            case 'ITBIS2': return 'from-orange-500 to-amber-600 text-white';
            case 'ITBIS3': return 'from-green-500 to-emerald-600 text-white';
            case 'EXENTO': return 'from-blue-500 to-blue-600 text-white';
            default: return 'from-gray-500 to-gray-600 text-white';
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
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3.5 rounded-xl shadow-lg">
                            <Tag className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                {categoria.nombre}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Detalles completos de la categoría
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('categorias.edit', categoria.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Categoría
                        </Link>
                        <Link
                            href={route('categorias.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Categoría: ${categoria.nombre}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado de la categoría */}
                    <div className="mb-6 bg-gradient-to-r from-indigo-800 to-purple-900 dark:from-indigo-900 dark:to-purple-900 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <h3 className="text-2xl font-bold text-white truncate">
                                            {categoria.nombre}
                                        </h3>
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getItbisBadgeColor(categoria.tasa_itbis)}`}>
                                            {categoria.tasa_itbis === 'ITBIS1' ? 'ITBIS 18%' : 
                                             categoria.tasa_itbis === 'ITBIS2' ? 'ITBIS 16%' : 
                                             categoria.tasa_itbis === 'ITBIS3' ? 'ITBIS 0%' : 
                                             'Exento de ITBIS'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center text-indigo-200">
                                            <Package className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm font-medium">{categoria.productos_count || 0} productos</span>
                                                <span className="text-xs text-indigo-300 block">
                                                    Total en categoría
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-indigo-200">
                                            <Percent className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm font-medium">ITBIS {categoria.itbis_porcentaje || 0}%</span>
                                                <span className="text-xs text-indigo-300 block">
                                                    Tasa aplicable
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-indigo-200">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {new Date(categoria.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-indigo-300 block">
                                                    Registrada
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black/30 rounded-lg p-4 min-w-[250px]">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <Hash className="w-5 h-5 text-indigo-300 mr-2" />
                                            <p className="text-sm text-indigo-300">Código Identificador</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white mb-2">
                                            {categoria.codigo}
                                        </p>
                                        <div className="flex items-center justify-center text-sm text-indigo-300">
                                            <Database className="w-4 h-4 mr-1" />
                                            <span>Identificador único</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna izquierda - Información principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tarjeta de información general */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Grid3x3 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Información de la Categoría
                                        </h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Última actualización: {new Date(categoria.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                            Descripción
                                        </h4>
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {categoria.descripcion || 'No hay descripción disponible para esta categoría.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información detallada */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                                                <Percent className="w-4 h-4 mr-2" />
                                                Configuración de Impuestos
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasa aplicada:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {categoria.tasa_itbis === 'ITBIS1' ? 'ITBIS General (18%)' :
                                                         categoria.tasa_itbis === 'ITBIS2' ? 'ITBIS Reducido (16%)' :
                                                         categoria.tasa_itbis === 'ITBIS3' ? 'ITBIS Mínimo (0%)' :
                                                         'Exento de ITBIS'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Porcentaje:</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {categoria.itbis_porcentaje || 0}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        categoria.tasa_itbis === 'EXENTO'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                    }`}>
                                                        {categoria.tasa_itbis === 'EXENTO' ? 'Exento' : 'Aplicable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Información del Sistema
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Registrada:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(categoria.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hora:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(categoria.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Actualizada:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(categoria.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas en tarjetas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Total Productos</p>
                                            <p className="text-3xl font-bold text-white">{estadisticas?.total_productos || 0}</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <Layers className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-white/80">
                                        <span className="flex items-center">
                                            <TrendingUpIcon className="w-3 h-3 mr-1" />
                                            En esta categoría
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Productos Activos</p>
                                            <p className="text-3xl font-bold text-white">{estadisticas?.productos_activos || 0}</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-white/80">
                                        <span className="flex items-center">
                                            <PieChart className="w-3 h-3 mr-1" />
                                            {((estadisticas?.productos_activos / estadisticas?.total_productos) * 100 || 0).toFixed(1)}% activos
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Valor Inventario</p>
                                            <p className="text-3xl font-bold text-white">
                                                {formatCurrency(estadisticas?.valor_inventario || 0)}
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

                            {/* Tabla de productos */}
                            {productos && productos.length > 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                                Productos de la Categoría
                                            </h3>
                                            <Link
                                                href={`/productos/crear?categoria_id=${categoria.id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Nuevo Producto
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-900/30">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Producto
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Precio
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Stock
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {productos.slice(0, 5).map((producto) => (
                                                    <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                                                                    producto.activo
                                                                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30'
                                                                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30'
                                                                }`}>
                                                                    <Package className={`w-5 h-5 ${
                                                                        producto.activo
                                                                            ? 'text-green-600 dark:text-green-400'
                                                                            : 'text-gray-400 dark:text-gray-500'
                                                                    }`} />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {producto.nombre}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                            {producto.codigo}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                {formatCurrency(producto.precio_venta)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Precio de venta
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`text-sm font-medium ${
                                                                (producto.stock_actual || 0) <= (producto.stock_minimo || 0)
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                                {producto.stock_actual || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                producto.activo
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                            }`}>
                                                                {producto.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Link
                                                                    href={route('productos.show', producto.id)}
                                                                    className="inline-flex items-center p-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200"
                                                                    title="Ver detalles"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {productos.length > 5 && (
                                            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                                <Link
                                                    href={route('productos.index', { categoria_id: categoria.id })}
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                >
                                                    Ver todos los productos ({productos.length})
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                                    <div className="max-w-sm mx-auto">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Sin productos
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Esta categoría aún no tiene productos registrados.
                                        </p>
                                        <Link
                                            href={`/productos/crear?categoria_id=${categoria.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Agregar primer producto
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Acciones e información adicional */}
                        <div className="space-y-6">
                            {/* Acciones rápidas */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                                        Acciones Rápidas
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/productos/crear?categoria_id=${categoria.id}`}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Nuevo Producto
                                        </Link>
                                        <Link
                                            href={route('categorias.edit', categoria.id)}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Edit className="w-4 h-4 inline mr-2" />
                                            Editar Categoría
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (categoria.productos_count > 0) {
                                                    alert('No se puede eliminar porque tiene productos asociados');
                                                    return;
                                                }
                                                if (confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
                                                    router.delete(route('categorias.destroy', categoria.id));
                                                }
                                            }}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Trash2 className="w-4 h-4 inline mr-2" />
                                            Eliminar Categoría
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Información técnica */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Database className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                        Información Técnica
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID de la Categoría</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {categoria.id}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Código interno</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {categoria.codigo}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasa ITBIS interna</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {categoria.tasa_itbis}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Porcentaje ITBIS</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {categoria.itbis_porcentaje}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Info className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                                    </div>
                                    <div className="ml-3">
                                        <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            Sobre esta categoría
                                        </h5>
                                        <div className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                                            <p>Esta categoría se aplica automáticamente a todos los productos que le pertenecen, incluyendo la tasa de ITBIS configurada.</p>
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
