import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, DollarSign, Percent, Tag, 
    Edit, Trash2, ArrowLeft, BarChart3,
    Truck, Calendar, Barcode, CheckCircle, XCircle,
    Layers, TrendingUp, Warehouse, FileText,
    AlertTriangle, Download, Share2, Copy,
    Eye, EyeOff, MoreVertical, ShoppingCart,
    RefreshCw, Clock, Grid, List
} from 'lucide-react';

export default function Show({ auth, producto, movimientos = [], sucursales = [], sucursal_actual }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStats, setShowStats] = useState(true);

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar este producto?\n\nEsta acción no se puede deshacer.')) {
            router.delete(route('productos.destroy', producto.id), {
                onSuccess: () => {
                    router.visit(route('productos.index'));
                }
            });
        }
    };

    // Función segura para formatear números
    const formatNumber = (value, decimals = 2) => {
        try {
            const num = parseFloat(value);
            if (isNaN(num)) return '0.00';
            return num.toFixed(decimals);
        } catch (error) {
            return '0.00';
        }
    };

    // Función segura para obtener un número
    const safeNumber = (value, defaultValue = 0) => {
        try {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        } catch (error) {
            return defaultValue;
        }
    };

    // Calcular estadísticas
    const calcularEstadisticas = () => {
        try {
            const precioCompra = safeNumber(producto?.precio_compra);
            const precioVenta = safeNumber(producto?.precio_venta);
            const margenGanancia = precioCompra > 0 
                ? ((precioVenta - precioCompra) / precioCompra) * 100 
                : 0;
            
            let itbisPorcentaje = 18;
            if (producto?.tasa_itbis === 'ITBIS1') itbisPorcentaje = 18;
            if (producto?.tasa_itbis === 'ITBIS2') itbisPorcentaje = 16;
            if (producto?.tasa_itbis === 'ITBIS3' || producto?.tasa_itbis === 'EXENTO') itbisPorcentaje = 0;
            
            const precioConItbis = producto?.exento_itbis 
                ? precioVenta 
                : precioVenta * (1 + (itbisPorcentaje / 100));
            
            const inventarioActual = Array.isArray(producto?.inventarios) 
                ? producto.inventarios.find(inv => inv.sucursal_id === sucursal_actual?.id)
                : null;
            
            const valorInventario = safeNumber(inventarioActual?.valor_inventario);
            const stockActual = safeNumber(inventarioActual?.stock_disponible);

            return {
                margen_ganancia: margenGanancia,
                precio_con_itbis: precioConItbis,
                valor_inventario: valorInventario,
                stock_actual: stockActual,
                stock_minimo_alcanzado: stockActual <= safeNumber(producto?.stock_minimo),
                ganancia_unitaria: precioVenta - precioCompra,
                rotacion_dias: 30, // Valor por defecto
            };
        } catch (error) {
            return {
                margen_ganancia: 0,
                precio_con_itbis: 0,
                valor_inventario: 0,
                stock_actual: 0,
                stock_minimo_alcanzado: false,
                ganancia_unitaria: 0,
                rotacion_dias: 0,
            };
        }
    };

    const estadisticas = calcularEstadisticas();

    // Funciones auxiliares
    const getDescripcionItbis = () => {
        if (!producto?.tasa_itbis) return 'ITBIS 18%';
        const descripciones = {
            'ITBIS1': 'ITBIS General (18%)',
            'ITBIS2': 'ITBIS Reducido (16%)',
            'ITBIS3': 'ITBIS Mínimo (0%)',
            'EXENTO': 'Exento de ITBIS'
        };
        return descripciones[producto.tasa_itbis] || 'ITBIS 18%';
    };

    const getUnidadMedidaTexto = () => {
        if (!producto?.unidad_medida) return 'Unidad';
        const unidades = {
            'UNIDAD': 'Unidad',
            'KILO': 'Kilogramo',
            'LITRO': 'Litro',
            'METRO': 'Metro',
            'CAJA': 'Caja',
            'PAQUETE': 'Paquete',
            'SACO': 'Saco'
        };
        return unidades[producto.unidad_medida] || producto.unidad_medida;
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('es-DO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(dateString));
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    if (!producto) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Producto no encontrado" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
                                <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Producto no encontrado
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                El producto que intentas ver no existe o ha sido eliminado.
                            </p>
                            <Link 
                                href={route('productos.index')}
                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al listado
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-xl shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                {producto.nombre}
                            </h1>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {producto.codigo}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: #{producto.id}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    producto.activo 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
                                        : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300'
                                }`}>
                                    {producto.activo ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {producto.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('productos.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${producto.nombre} - Detalles del Producto`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Pestañas de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'overview'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Resumen
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('inventory')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'inventory'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Warehouse className="w-4 h-4 mr-2" />
                                        Inventario
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('movements')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'movements'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Movimientos
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'settings'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Configuración
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="mb-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={route('productos.edit', producto.id)}
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Producto
                                </Link>
                                <Link
                                    href={route('productos.stock', producto.id)}
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Tag className="w-4 h-4 mr-2" />
                                    Gestionar Stock
                                </Link>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    {showStats ? (
                                        <EyeOff className="w-4 h-4 mr-2" />
                                    ) : (
                                        <Eye className="w-4 h-4 mr-2" />
                                    )}
                                    {showStats ? 'Ocultar' : 'Mostrar'} Estadísticas
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    {showStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Stock Actual</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {formatNumber(estadisticas.stock_actual)}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            {estadisticas.stock_minimo_alcanzado ? (
                                                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                            )}
                                            <span className={`text-sm ${
                                                estadisticas.stock_minimo_alcanzado ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {estadisticas.stock_minimo_alcanzado ? 'Por debajo del mínimo' : 'Stock normal'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Margen de Ganancia</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {formatNumber(estadisticas.margen_ganancia)}%
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                            {formatCurrency(estadisticas.ganancia_unitaria)} por unidad
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Valor Inventario</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {formatCurrency(estadisticas.valor_inventario)}
                                        </p>
                                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                                            Stock × Costo promedio
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Precio con ITBIS</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {formatCurrency(estadisticas.precio_con_itbis)}
                                        </p>
                                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                                            {getDescripcionItbis()}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contenido de las pestañas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6">
                            {/* Resumen */}
                            <div className={`space-y-6 ${activeTab !== 'overview' ? 'hidden' : ''}`}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Información básica */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Información Básica
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Descripción
                                                    </label>
                                                    <p className="text-gray-900 dark:text-gray-200">
                                                        {producto.descripcion || 'Sin descripción'}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Categoría
                                                        </label>
                                                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 font-medium">
                                                            <Layers className="w-4 h-4 mr-2" />
                                                            {producto.categoria?.nombre || 'Sin categoría'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Unidad de Medida
                                                        </label>
                                                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 font-medium">
                                                            {getUnidadMedidaTexto()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Código de Barras
                                                    </label>
                                                    <div className="flex items-center space-x-2">
                                                        <Barcode className="w-5 h-5 text-gray-400" />
                                                        <span className="font-mono text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded">
                                                            {producto.codigo_barras || 'No asignado'}
                                                        </span>
                                                        {producto.codigo_barras && (
                                                            <button className="text-blue-600 hover:text-blue-800">
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Precios */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                                <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Precios y Ganancia
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Compra</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                        {formatCurrency(producto.precio_compra)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Costo unitario</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                                    <p className="text-sm text-green-600 dark:text-green-400">Venta</p>
                                                    <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-1">
                                                        {formatCurrency(producto.precio_venta)}
                                                    </p>
                                                    <p className="text-xs text-green-500 mt-1">Público general</p>
                                                </div>
                                                {producto.precio_mayor && (
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-sm text-blue-600 dark:text-blue-400">Mayorista</p>
                                                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                                                            {formatCurrency(producto.precio_mayor)}
                                                        </p>
                                                        <p className="text-xs text-blue-500 mt-1">Venta por volumen</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Panel lateral */}
                                    <div className="space-y-6">
                                        {/* Impuestos */}
                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                                <Percent className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                                                Impuestos
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasa ITBIS</span>
                                                    <span className="font-medium">{getDescripcionItbis()}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        producto.exento_itbis 
                                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
                                                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300'
                                                    }`}>
                                                        {producto.exento_itbis ? 'Exento' : 'Aplica ITBIS'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg">
                                                    <span className="text-sm text-green-600 dark:text-green-400">Precio con ITBIS</span>
                                                    <span className="font-bold text-green-700 dark:text-green-300">
                                                        {formatCurrency(estadisticas.precio_con_itbis)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información técnica */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                                <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                                Información Técnica
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Creado</span>
                                                    <span className="text-sm font-medium">{formatDate(producto.created_at)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Actualizado</span>
                                                    <span className="text-sm font-medium">{formatDate(producto.updated_at)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Control Stock</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        producto.control_stock 
                                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
                                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300'
                                                    }`}>
                                                        {producto.control_stock ? 'Activado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inventario */}
                            <div className={`space-y-6 ${activeTab !== 'inventory' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                        <Warehouse className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Inventario por Sucursal
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {Array.isArray(producto.inventarios) ? producto.inventarios.length : 0} sucursales
                                    </span>
                                </div>

                                {Array.isArray(producto.inventarios) && producto.inventarios.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {producto.inventarios.map((inventario, index) => (
                                            <div key={inventario.id || index} 
                                                 className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/10 dark:to-gray-800/10 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                                            {inventario.sucursal?.nombre || 'Sucursal'}
                                                        </h4>
                                                        {sucursal_actual?.id === inventario.sucursal_id && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300 mt-1">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Actual
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                                                        <Truck className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Stock Actual</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {formatNumber(inventario.stock_actual)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Disponible</p>
                                                        <p className={`text-lg font-bold ${
                                                            safeNumber(inventario.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}>
                                                            {formatNumber(inventario.stock_disponible)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Costo Promedio</p>
                                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(inventario.costo_promedio)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                            {formatCurrency(inventario.valor_inventario)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No hay inventarios registrados
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Este producto no tiene inventarios registrados en ninguna sucursal.
                                        </p>
                                        <Link
                                            href={route('productos.stock', producto.id)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                        >
                                            <Tag className="w-4 h-4 mr-2" />
                                            Gestionar Stock
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Movimientos */}
                            <div className={`space-y-6 ${activeTab !== 'movements' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                        <RefreshCw className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Historial de Movimientos
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {Array.isArray(movimientos) ? movimientos.length : 0} movimientos
                                    </span>
                                </div>

                                {Array.isArray(movimientos) && movimientos.length > 0 ? (
                                    <div className="space-y-4">
                                        {movimientos.slice(0, 10).map((movimiento, index) => (
                                            <div key={movimiento.id || index} 
                                                 className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10 p-4 rounded-r-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-3">
                                                                {movimiento.tipo === 'entrada' ? (
                                                                    <span className="text-sm font-bold">+</span>
                                                                ) : (
                                                                    <span className="text-sm font-bold">-</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                    {movimiento.motivo || 'Movimiento'}
                                                                </h4>
                                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {formatDate(movimiento.created_at)}
                                                                    <span className="mx-2">•</span>
                                                                    <Truck className="w-3 h-3 mr-1" />
                                                                    {movimiento.sucursal?.nombre || 'Sucursal'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {movimiento.descripcion && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                {movimiento.descripcion}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-xl font-bold ${
                                                            movimiento.tipo === 'entrada' 
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                        }`}>
                                                            {movimiento.tipo === 'entrada' ? '+' : '-'}{formatNumber(movimiento.cantidad)}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            De {formatNumber(movimiento.cantidad_anterior)} a {formatNumber(movimiento.cantidad_nueva)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Por: {movimiento.usuario?.name || 'Sistema'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No hay movimientos registrados
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Este producto aún no tiene movimientos de stock.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Configuración */}
                            <div className={`space-y-6 ${activeTab !== 'settings' ? 'hidden' : ''}`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Configuración de stock */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Tag className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Configuración de Stock
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Control de Stock
                                                    </span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Seguimiento de inventario
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    producto.control_stock 
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
                                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300'
                                                }`}>
                                                    {producto.control_stock ? (
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                    )}
                                                    {producto.control_stock ? 'Activado' : 'Desactivado'}
                                                </span>
                                            </div>
                                            
                                            {producto.control_stock && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-4">
                                                        <p className="text-sm text-blue-600 dark:text-blue-400">Stock Mínimo</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                            {formatNumber(producto.stock_minimo)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4">
                                                        <p className="text-sm text-green-600 dark:text-green-400">Stock Inicial</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                            {formatNumber(producto.stock_inicial)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Configuración de precios */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Configuración de Precios
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Precio de Compra</span>
                                                <span className="font-medium">{formatCurrency(producto.precio_compra)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Precio de Venta</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(producto.precio_venta)}
                                                </span>
                                            </div>
                                            {producto.precio_mayor && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Precio Mayorista</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(producto.precio_mayor)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">Ganancia Unitaria</span>
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrency(estadisticas.ganancia_unitaria)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuración de impuestos */}
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                                            Configuración de Impuestos
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Tasa ITBIS</span>
                                                <span className="font-medium">{getDescripcionItbis()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Exento</span>
                                                <span className={`font-medium ${
                                                    producto.exento_itbis ? 'text-green-600' : 'text-gray-600'
                                                }`}>
                                                    {producto.exento_itbis ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Porcentaje ITBIS</span>
                                                <span className="font-medium">{formatNumber(producto.itbis_porcentaje)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado del producto */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Estado del Producto
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Activo</span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    producto.activo 
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
                                                        : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300'
                                                }`}>
                                                    {producto.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Creado</span>
                                                <span className="text-sm">{formatDate(producto.created_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Última actualización</span>
                                                <span className="text-sm">{formatDate(producto.updated_at)}</span>
                                            </div>
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