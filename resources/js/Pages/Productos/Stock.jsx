import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Package, ArrowLeft, Plus, Minus, RefreshCw,
    Warehouse, TrendingUp, TrendingDown, AlertCircle,
    DollarSign, Eye, Trash2, BarChart3, Info,
    ArrowRightLeft, ClipboardList, ShoppingCart,
    Truck, MoveHorizontal, ArrowRight, ArrowLeftRight,
    CheckCircle, XCircle, Box, Layers,
    Download, Upload, FileText, Clock,
    AlertTriangle, Percent, Target
} from 'lucide-react';

export default function Stock({ auth, producto, sucursales, flash }) {
    const [sucursalId, setSucursalId] = useState('');
    const [modo, setModo] = useState('ajuste');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState(flash?.success || flash?.error || '');
    const [tipoMensaje, setTipoMensaje] = useState(
        flash?.success ? 'success' : flash?.error ? 'error' : ''
    );
    const [activeTab, setActiveTab] = useState('movimientos');

    useEffect(() => {
        if (flash?.success) {
            setMensaje(flash.success);
            setTipoMensaje('success');
        }
        if (flash?.error) {
            setMensaje(flash.error);
            setTipoMensaje('error');
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm({
        sucursal_id: '',
        cantidad: '',
        tipo: 'entrada',
        costo: producto?.precio_compra || 0,
        motivo: '',
    });

    const formTransferencia = useForm({
        sucursal_origen_id: '',
        sucursal_destino_id: '',
        cantidad: '',
        motivo: '',
    });

    const submitAjuste = (e) => {
        e.preventDefault();
        
        if (!data.sucursal_id) {
            setMensaje('Debe seleccionar una sucursal');
            setTipoMensaje('error');
            return;
        }
        
        if (!data.cantidad || parseFloat(data.cantidad) <= 0) {
            setMensaje('La cantidad debe ser mayor que 0');
            setTipoMensaje('error');
            return;
        }
        
        if (!data.motivo.trim()) {
            setMensaje('Debe especificar un motivo');
            setTipoMensaje('error');
            return;
        }
        
        if (data.tipo === 'salida') {
            const inventario = producto.inventarios?.find(inv => inv.sucursal_id == data.sucursal_id);
            const disponible = parseFloat(inventario?.stock_disponible || 0);
            const cantidad = parseFloat(data.cantidad);
            
            if (cantidad > disponible) {
                setMensaje(`Stock insuficiente. Disponible: ${disponible}`);
                setTipoMensaje('error');
                return;
            }
        }
        
        post(route('productos.ajustar-stock', producto.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                setMostrarForm(false);
                
                if (page.props.flash?.success) {
                    setMensaje(page.props.flash.success);
                    setTipoMensaje('success');
                }
                
                setTimeout(() => {
                    router.reload({ 
                        only: ['producto', 'flash'],
                        preserveScroll: true 
                    });
                }, 1500);
            },
            onError: (errors) => {
                setMensaje('Error al ajustar el stock');
                setTipoMensaje('error');
            }
        });
    };

    const submitTransferencia = (e) => {
        e.preventDefault();
        
        if (!formTransferencia.data.sucursal_origen_id) {
            setMensaje('Debe seleccionar sucursal de origen');
            setTipoMensaje('error');
            return;
        }
        
        if (!formTransferencia.data.sucursal_destino_id) {
            setMensaje('Debe seleccionar sucursal de destino');
            setTipoMensaje('error');
            return;
        }
        
        if (formTransferencia.data.sucursal_origen_id === formTransferencia.data.sucursal_destino_id) {
            setMensaje('Las sucursales de origen y destino deben ser diferentes');
            setTipoMensaje('error');
            return;
        }
        
        if (!formTransferencia.data.cantidad || parseFloat(formTransferencia.data.cantidad) <= 0) {
            setMensaje('La cantidad debe ser mayor que 0');
            setTipoMensaje('error');
            return;
        }
        
        if (!formTransferencia.data.motivo.trim()) {
            setMensaje('Debe especificar un motivo');
            setTipoMensaje('error');
            return;
        }
        
        const inventarioOrigen = producto.inventarios?.find(
            inv => inv.sucursal_id == formTransferencia.data.sucursal_origen_id
        );
        const disponible = parseFloat(inventarioOrigen?.stock_disponible || 0);
        const cantidad = parseFloat(formTransferencia.data.cantidad);
        
        if (cantidad > disponible) {
            setMensaje(`Stock insuficiente en sucursal de origen. Disponible: ${disponible}`);
            setTipoMensaje('error');
            return;
        }
        
        formTransferencia.post(route('productos.transferir-stock', producto.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                formTransferencia.reset();
                setMostrarForm(false);
                setModo('ajuste');
                
                if (page.props.flash?.success) {
                    setMensaje(page.props.flash.success);
                    setTipoMensaje('success');
                }
                
                setTimeout(() => {
                    router.reload({ 
                        only: ['producto', 'flash'],
                        preserveScroll: true 
                    });
                }, 1500);
            },
            onError: (errors) => {
                setMensaje('Error al realizar la transferencia');
                setTipoMensaje('error');
            }
        });
    };

    const safeNumber = (value, defaultValue = 0) => {
        if (value === null || value === undefined || value === '') return defaultValue;
        try {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        } catch {
            return defaultValue;
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const inventarioSeleccionado = sucursalId 
        ? producto?.inventarios?.find(inv => inv.sucursal_id == sucursalId)
        : null;

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
                                El producto que intentas gestionar no existe o ha sido eliminado.
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
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-3.5 rounded-xl shadow-lg">
                            <Warehouse className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Stock
                            </h1>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {producto.codigo}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {producto.nombre}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('productos.show', producto.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                        </Link>
                        <Link
                            href={route('productos.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${producto.nombre} - Gestión de Stock`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mensajes */}
                    {mensaje && (
                        <div className={`mb-6 p-4 rounded-xl border-l-4 ${
                            tipoMensaje === 'success' 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-green-500'
                                : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-red-500'
                        }`}>
                            <div className="flex items-center">
                                {tipoMensaje === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                                )}
                                <div>
                                    <p className={`font-medium ${
                                        tipoMensaje === 'success' 
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-red-800 dark:text-red-300'
                                    }`}>
                                        {mensaje}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pestañas de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'overview'
                                            ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Resumen
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('movimientos')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'movimientos'
                                            ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
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
                                    onClick={() => setActiveTab('transferencias')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'transferencias'
                                            ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Truck className="w-4 h-4 mr-2" />
                                        Transferencias
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Contenido de las pestañas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6">
                            {/* Resumen */}
                            <div className={`space-y-6 ${activeTab !== 'overview' ? 'hidden' : ''}`}>
                                {/* Información del producto */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
                                                <Package className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {producto.nombre}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {producto.categoria?.nombre || 'Sin categoría'} • {producto.unidad_medida}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Precio Venta</p>
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(producto.precio_venta)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Estadísticas generales */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Total</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {producto.inventarios?.reduce((sum, inv) => sum + safeNumber(inv.stock_actual), 0) || 0}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                En todas las sucursales
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Inventario</p>
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {formatCurrency(producto.inventarios?.reduce((sum, inv) => sum + safeNumber(inv.valor_inventario), 0) || 0)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Valor total
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sucursales</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {producto.inventarios?.length || 0}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Con inventario
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Mínimo</p>
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {producto.stock_minimo || 0}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Nivel de alerta
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inventario por sucursal */}
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Warehouse className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                        Inventario por Sucursal
                                    </h3>
                                    
                                    {sucursales && sucursales.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sucursales.map((sucursal) => {
                                                const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                                const stockActual = safeNumber(inventario?.stock_actual);
                                                const stockDisponible = safeNumber(inventario?.stock_disponible);
                                                const stockMinimo = safeNumber(producto.stock_minimo);
                                                const tieneStockBajo = producto.control_stock && stockDisponible <= stockMinimo && stockMinimo > 0;
                                                
                                                return (
                                                    <div key={sucursal.id} 
                                                         className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border rounded-xl p-4 ${
                                                            tieneStockBajo 
                                                                ? 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/10'
                                                                : 'border-gray-200 dark:border-gray-700'
                                                         }`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center">
                                                                <div className={`p-2 rounded-lg mr-3 ${
                                                                    tieneStockBajo 
                                                                        ? 'bg-red-100 dark:bg-red-900/30'
                                                                        : 'bg-green-100 dark:bg-green-900/30'
                                                                }`}>
                                                                    <Warehouse className={`w-5 h-5 ${
                                                                        tieneStockBajo 
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : 'text-green-600 dark:text-green-400'
                                                                    }`} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                                        {sucursal.nombre}
                                                                    </h4>
                                                                    {sucursal.principal && (
                                                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                            Principal
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {tieneStockBajo && (
                                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                            )}
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">Actual</p>
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    {stockActual}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">Disponible</p>
                                                                <p className={`font-bold ${
                                                                    tieneStockBajo 
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-green-600 dark:text-green-400'
                                                                }`}>
                                                                    {stockDisponible}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">Costo</p>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {formatCurrency(inventario?.costo_promedio)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">Valor</p>
                                                                <p className="font-medium text-purple-600 dark:text-purple-400">
                                                                    {formatCurrency(inventario?.valor_inventario)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSucursalId(sucursal.id);
                                                                setData('sucursal_id', sucursal.id);
                                                                setMostrarForm(true);
                                                                setModo('ajuste');
                                                                setActiveTab('movimientos');
                                                            }}
                                                            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm"
                                                        >
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Gestionar Stock
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                No hay sucursales disponibles
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Configure sucursales para gestionar el inventario.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Movimientos */}
                            <div className={`space-y-6 ${activeTab !== 'movimientos' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <RefreshCw className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Ajustes de Stock
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Gestión de entradas y salidas de inventario
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        {sucursales && sucursales.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setModo('transferencia');
                                                    setMostrarForm(true);
                                                    setActiveTab('transferencias');
                                                }}
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                                            >
                                                <Truck className="w-4 h-4 mr-2" />
                                                Transferir
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Selección de sucursal */}
                                {!sucursalId && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-4">
                                            Seleccione una sucursal para comenzar
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sucursales?.map((sucursal) => {
                                                const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                                const stockDisponible = safeNumber(inventario?.stock_disponible);
                                                
                                                return (
                                                    <button
                                                        key={sucursal.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSucursalId(sucursal.id);
                                                            setData('sucursal_id', sucursal.id);
                                                            setMostrarForm(true);
                                                        }}
                                                        className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {sucursal.nombre}
                                                            </div>
                                                            {sucursal.principal && (
                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            Disponible: <span className="font-medium text-green-600 dark:text-green-400">
                                                                {stockDisponible} {producto.unidad_medida}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Formulario de ajuste */}
                                {sucursalId && !mostrarForm && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
                                                    <Warehouse className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                        {sucursales?.find(s => s.id == sucursalId)?.nombre}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Stock actual: {safeNumber(inventarioSeleccionado?.stock_actual)} {producto.unidad_medida}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setMostrarForm(true)}
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Nuevo Ajuste
                                            </button>
                                        </div>

                                        {/* Estadísticas de la sucursal */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Disponible</p>
                                                <p className={`text-xl font-bold ${
                                                    safeNumber(inventarioSeleccionado?.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {safeNumber(inventarioSeleccionado?.stock_disponible)}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costo Promedio</p>
                                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                    {formatCurrency(inventarioSeleccionado?.costo_promedio)}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Inventario</p>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(inventarioSeleccionado?.valor_inventario)}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Mínimo</p>
                                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                    {producto.stock_minimo || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Formulario de ajuste activo */}
                                {mostrarForm && modo === 'ajuste' && (
                                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {data.tipo === 'entrada' ? 'Entrada de Stock' : 'Salida de Stock'}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {sucursales?.find(s => s.id == sucursalId)?.nombre}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        reset();
                                                        setMostrarForm(false);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>

                                        <form onSubmit={submitAjuste} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Tipo de movimiento */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Tipo de Movimiento
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('tipo', 'entrada')}
                                                            className={`p-4 rounded-lg border transition-all ${
                                                                data.tipo === 'entrada'
                                                                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300'
                                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Plus className="w-6 h-6 mb-2" />
                                                                <span className="font-medium">Entrada</span>
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('tipo', 'salida')}
                                                            className={`p-4 rounded-lg border transition-all ${
                                                                data.tipo === 'salida'
                                                                    ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300'
                                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Minus className="w-6 h-6 mb-2" />
                                                                <span className="font-medium">Salida</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Cantidad */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Cantidad ({producto.unidad_medida})
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            {data.tipo === 'entrada' ? (
                                                                <Plus className="text-gray-400" />
                                                            ) : (
                                                                <Minus className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={data.cantidad}
                                                            onChange={(e) => setData('cantidad', e.target.value)}
                                                            className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="0.00"
                                                            required
                                                            disabled={processing}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Costo (solo para entradas) */}
                                                {data.tipo === 'entrada' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Costo Unitario
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <DollarSign className="text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={data.costo}
                                                                onChange={(e) => setData('costo', e.target.value)}
                                                                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                                placeholder="0.00"
                                                                disabled={processing}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Motivo */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Motivo
                                                </label>
                                                <textarea
                                                    value={data.motivo}
                                                    onChange={(e) => setData('motivo', e.target.value)}
                                                    rows="3"
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Descripción del movimiento..."
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>

                                            {/* Resumen */}
                                            {data.cantidad && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
                                                        Resumen del Ajuste
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Stock Actual</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {safeNumber(inventarioSeleccionado?.stock_actual)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Movimiento</p>
                                                            <p className={`font-semibold ${
                                                                data.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {data.tipo === 'entrada' ? '+' : '-'}{data.cantidad}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Nuevo Stock</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {data.tipo === 'entrada'
                                                                    ? safeNumber(inventarioSeleccionado?.stock_actual) + safeNumber(data.cantidad)
                                                                    : safeNumber(inventarioSeleccionado?.stock_actual) - safeNumber(data.cantidad)
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Botón de submit */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className={`inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 ${
                                                        data.tipo === 'entrada'
                                                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                                                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Procesando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            {data.tipo === 'entrada' ? (
                                                                <Plus className="w-5 h-5 mr-2" />
                                                            ) : (
                                                                <Minus className="w-5 h-5 mr-2" />
                                                            )}
                                                            {data.tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* Transferencias */}
                            <div className={`space-y-6 ${activeTab !== 'transferencias' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Truck className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                            Transferencias entre Sucursales
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Mueva stock de una sucursal a otra
                                        </p>
                                    </div>
                                    
                                    {!mostrarForm && (
                                        <button
                                            type="button"
                                            onClick={() => setMostrarForm(true)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            Nueva Transferencia
                                        </button>
                                    )}
                                </div>

                                {/* Formulario de transferencia */}
                                {mostrarForm && (
                                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    Nueva Transferencia
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Seleccione las sucursales de origen y destino
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    formTransferencia.reset();
                                                    setMostrarForm(false);
                                                }}
                                                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                            >
                                                Cancelar
                                            </button>
                                        </div>

                                        <form onSubmit={submitTransferencia} className="space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Sucursal Origen */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                        Sucursal de Origen
                                                    </label>
                                                    <div className="space-y-3">
                                                        {sucursales?.map((sucursal) => {
                                                            const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                                            const stockDisponible = safeNumber(inventario?.stock_disponible);
                                                            
                                                            return (
                                                                <button
                                                                    key={sucursal.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        formTransferencia.setData('sucursal_origen_id', sucursal.id);
                                                                    }}
                                                                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                                                                        formTransferencia.data.sucursal_origen_id == sucursal.id
                                                                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                                                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                                            {sucursal.nombre}
                                                                        </div>
                                                                        {sucursal.principal && (
                                                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                                                                Principal
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Disponible: <span className="font-medium text-green-600 dark:text-green-400">
                                                                            {stockDisponible} {producto.unidad_medida}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Flecha */}
                                                <div className="flex items-center justify-center">
                                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                                                        <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                </div>

                                                {/* Sucursal Destino */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                        Sucursal de Destino
                                                    </label>
                                                    <div className="space-y-3">
                                                        {sucursales
                                                            ?.filter(s => s.id !== formTransferencia.data.sucursal_origen_id)
                                                            .map((sucursal) => {
                                                                const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                                                const stockActual = safeNumber(inventario?.stock_actual);
                                                                
                                                                return (
                                                                    <button
                                                                        key={sucursal.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            formTransferencia.setData('sucursal_destino_id', sucursal.id);
                                                                        }}
                                                                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                                                                            formTransferencia.data.sucursal_destino_id == sucursal.id
                                                                                ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                                                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                                {sucursal.nombre}
                                                                            </div>
                                                                            {sucursal.principal && (
                                                                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                                                                    Principal
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            Stock actual: <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                                {stockActual} {producto.unidad_medida}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cantidad y motivo */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Cantidad a Transferir
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={formTransferencia.data.cantidad}
                                                            onChange={(e) => formTransferencia.setData('cantidad', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="0.00"
                                                            required
                                                            disabled={processing}
                                                        />
                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                            <span className="text-sm text-gray-500">
                                                                {producto.unidad_medida}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {formTransferencia.data.sucursal_origen_id && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                            Disponible: {
                                                                safeNumber(
                                                                    producto.inventarios?.find(
                                                                        inv => inv.sucursal_id == formTransferencia.data.sucursal_origen_id
                                                                    )?.stock_disponible
                                                                )
                                                            } {producto.unidad_medida}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Motivo
                                                    </label>
                                                    <textarea
                                                        value={formTransferencia.data.motivo}
                                                        onChange={(e) => formTransferencia.setData('motivo', e.target.value)}
                                                        rows="2"
                                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Motivo de la transferencia..."
                                                        required
                                                        disabled={processing}
                                                    />
                                                </div>
                                            </div>

                                            {/* Resumen */}
                                            {formTransferencia.data.sucursal_origen_id && formTransferencia.data.sucursal_destino_id && formTransferencia.data.cantidad && (
                                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                                    <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-3">
                                                        Resumen de la Transferencia
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Origen</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {sucursales?.find(s => s.id == formTransferencia.data.sucursal_origen_id)?.nombre}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Cantidad</p>
                                                            <p className="font-semibold text-purple-600 dark:text-purple-400">
                                                                {formTransferencia.data.cantidad}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Destino</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {sucursales?.find(s => s.id == formTransferencia.data.sucursal_destino_id)?.nombre}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Botón de submit */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Procesando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Truck className="w-5 h-5 mr-2" />
                                                            Confirmar Transferencia
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}