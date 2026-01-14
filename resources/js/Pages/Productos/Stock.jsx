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
    CheckCircle, XCircle
} from 'lucide-react';

export default function Stock({ auth, producto, sucursales, flash }) {
    const [sucursalId, setSucursalId] = useState('');
    const [modo, setModo] = useState('ajuste'); // 'ajuste' o 'transferencia'
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState(flash?.success || flash?.error || '');
    const [tipoMensaje, setTipoMensaje] = useState(
        flash?.success ? 'success' : flash?.error ? 'error' : ''
    );
    const [sucursalDestinoId, setSucursalDestinoId] = useState('');
    
    useEffect(() => {
        if (flash?.success) {
            setMensaje(flash.success);
            setTipoMensaje('success');
        }
        if (flash?.error) {
            setMensaje(flash.error);
            setTipoMensaje('error');
        }
    }, [producto, sucursales, flash]);
    
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
        
        setMensaje('');
        
        // Validaciones
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
        
        // Verificar stock para salidas
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
                } else {
                    setMensaje('Stock ajustado correctamente');
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
                
                if (errors.cantidad) {
                    setMensaje(errors.cantidad);
                } else if (errors.motivo) {
                    setMensaje(errors.motivo);
                }
            }
        });
    };

    const submitTransferencia = (e) => {
        e.preventDefault();
        
        setMensaje('');
        
        // Validaciones
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
        
        // Verificar stock disponible en origen
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
        
        // Usar formTransferencia.post directamente
        formTransferencia.post(route('productos.transferir-stock', producto.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                formTransferencia.reset();
                setMostrarForm(false);
                setModo('ajuste');
                
                if (page.props.flash?.success) {
                    setMensaje(page.props.flash.success);
                    setTipoMensaje('success');
                } else {
                    setMensaje('Transferencia realizada correctamente');
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
                
                // Mostrar errores específicos
                if (errors.cantidad) {
                    setMensaje(errors.cantidad);
                } else if (errors.motivo) {
                    setMensaje(errors.motivo);
                } else if (errors.sucursal_origen_id) {
                    setMensaje(errors.sucursal_origen_id);
                } else if (errors.sucursal_destino_id) {
                    setMensaje(errors.sucursal_destino_id);
                }
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

    const inventarioSeleccionado = sucursalId 
        ? producto?.inventarios?.find(inv => inv.sucursal_id == sucursalId)
        : null;

    const sucursalesDisponiblesParaTransferencia = sucursales?.filter(
        s => s.id !== (modo === 'transferencia' ? formTransferencia.data.sucursal_origen_id : sucursalId)
    );

    if (!producto) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Producto no encontrado" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Producto no encontrado</h2>
                            <Link href={route('productos.index')} className="text-blue-600 hover:text-blue-800 flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a la lista
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
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 leading-tight">
                                Control de Stock
                            </h2>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">
                                    {producto.codigo}
                                </span>
                                {producto.nombre} • {producto.unidad_medida_texto}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('productos.show', producto.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                        </Link>
                        <Link
                            href={route('productos.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:shadow-md transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Stock - ${producto.nombre}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Mensajes */}
                    {mensaje && (
                        <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
                            tipoMensaje === 'success' 
                                ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-green-500 border-green-200' 
                                : 'bg-gradient-to-r from-red-50 to-red-100 border-l-red-500 border-red-200'
                        }`}>
                            <div className="flex items-center">
                                {tipoMensaje === 'success' ? (
                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                )}
                                <div>
                                    <span className={`font-semibold ${tipoMensaje === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                        {mensaje}
                                    </span>
                                    {tipoMensaje === 'success' && (
                                        <p className="text-sm text-green-700 mt-1">
                                            Los cambios se han registrado correctamente en el sistema.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resumen del producto */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-8 p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl mr-4">
                                    <Info className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Resumen del Producto</h3>
                                    <p className="text-gray-600">Información general y estadísticas</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold">
                                ${safeNumber(producto.precio_venta).toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        PRODUCTO
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg truncate">{producto.nombre}</h4>
                                <p className="text-sm text-gray-600 mt-1">{producto.codigo}</p>
                                <div className="mt-3 text-xs text-gray-500">
                                    {producto.categoria?.nombre || 'Sin categoría'}
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        producto.control_stock 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {producto.control_stock ? 'STOCK ACTIVO' : 'SIN CONTROL'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {producto.inventarios?.reduce((sum, inv) => sum + safeNumber(inv.stock_actual), 0) || 0}
                                    <span className="text-sm font-normal text-gray-600 ml-2">{producto.unidad_medida_texto}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Stock total en todas las sucursales</p>
                                {producto.control_stock && (
                                    <div className="mt-3 flex items-center text-xs text-gray-500">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Mínimo: {producto.stock_minimo || 0}
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                        COSTO
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    ${safeNumber(producto.precio_compra).toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Precio de compra</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Venta:</span>
                                    <span className="text-xs font-semibold text-green-600">
                                        ${safeNumber(producto.precio_venta).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-amber-100 p-2 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                        VALOR
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    ${producto.inventarios?.reduce((sum, inv) => sum + safeNumber(inv.valor_inventario), 0).toFixed(2) || '0.00'}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Valor total del inventario</p>
                                <div className="mt-3 flex items-center text-xs text-gray-500">
                                    <ClipboardList className="w-3 h-3 mr-1" />
                                    {producto.inventarios?.length || 0} sucursales
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selector de sucursal */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-8 p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl mr-4">
                                    <Warehouse className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Seleccionar Sucursal</h3>
                                    <p className="text-gray-600">Elija una sucursal para gestionar el stock</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {sucursales?.length || 0} disponibles
                            </div>
                        </div>
                        
                        {sucursales && sucursales.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {sucursales.map((sucursal) => {
                                    const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                    const stockActual = safeNumber(inventario?.stock_actual);
                                    const stockDisponible = safeNumber(inventario?.stock_disponible);
                                    const stockMinimo = safeNumber(producto.stock_minimo);
                                    const tieneStockBajo = producto.control_stock && stockDisponible <= stockMinimo && stockMinimo > 0;
                                    
                                    return (
                                        <button
                                            key={sucursal.id}
                                            type="button"
                                            onClick={() => {
                                                setSucursalId(sucursal.id);
                                                setData('sucursal_id', sucursal.id);
                                                setMostrarForm(true);
                                                setModo('ajuste');
                                                setMensaje('');
                                            }}
                                            className={`p-5 rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 ${
                                                sucursalId == sucursal.id && modo === 'ajuste'
                                                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 shadow-lg shadow-blue-100'
                                                    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-300 hover:shadow-lg hover:border-blue-300'
                                            } ${tieneStockBajo ? 'border-l-4 border-l-red-500' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{sucursal.nombre}</div>
                                                    {sucursal.principal && (
                                                        <span className="inline-block mt-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                                                            SUCURSAL PRINCIPAL
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                                    tieneStockBajo 
                                                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                                                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                                }`}>
                                                    {tieneStockBajo ? 'STOCK BAJO' : 'DISPONIBLE'}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                                                        Stock Actual
                                                    </span>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {stockActual}
                                                        <span className="text-sm font-normal text-gray-600 ml-1">{producto.unidad_medida_texto}</span>
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                                        <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                                                        Disponible
                                                    </span>
                                                    <span className={`text-lg font-bold ${
                                                        tieneStockBajo ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {stockDisponible}
                                                    </span>
                                                </div>
                                                
                                                {inventario?.costo_promedio && (
                                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                                        <span className="text-sm font-medium text-gray-700 flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                                            Costo Promedio
                                                        </span>
                                                        <span className="text-lg font-bold text-purple-600">
                                                            ${safeNumber(inventario.costo_promedio).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Última actualización:</span>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {inventario?.updated_at 
                                                            ? new Date(inventario.updated_at).toLocaleDateString()
                                                            : 'Nunca'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No hay sucursales disponibles</p>
                                <p className="text-gray-400 mt-2">Configure sucursales para gestionar el inventario</p>
                            </div>
                        )}
                    </div>

                    {/* Botones de modo */}
                    {sucursales && sucursales.length > 1 && (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-8 p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl mr-4">
                                        <Truck className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Transferencia entre Sucursales</h3>
                                        <p className="text-gray-600">Mover stock de una sucursal a otra</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModo('ajuste');
                                        setMostrarForm(false);
                                        setMensaje('');
                                    }}
                                    className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                                        modo === 'ajuste'
                                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-lg'
                                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:border-blue-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-lg mr-4 ${
                                            modo === 'ajuste' ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            <RefreshCw className={`w-6 h-6 ${
                                                modo === 'ajuste' ? 'text-blue-600' : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className={`font-bold text-lg ${
                                                modo === 'ajuste' ? 'text-blue-800' : 'text-gray-800'
                                            }`}>
                                                Ajuste de Stock
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Entradas, salidas y ajustes en una sucursal
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModo('transferencia');
                                        setMostrarForm(true);
                                        setMensaje('');
                                    }}
                                    className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                                        modo === 'transferencia'
                                            ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 shadow-lg'
                                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:border-purple-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-lg mr-4 ${
                                            modo === 'transferencia' ? 'bg-purple-100' : 'bg-gray-100'
                                        }`}>
                                            <ArrowRightLeft className={`w-6 h-6 ${
                                                modo === 'transferencia' ? 'text-purple-600' : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className={`font-bold text-lg ${
                                                modo === 'transferencia' ? 'text-purple-800' : 'text-gray-800'
                                            }`}>
                                                Transferir Stock
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Mover stock entre diferentes sucursales
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Panel de control de stock */}
                    {sucursalId && modo === 'ajuste' && (
                        <>
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-8 p-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl mr-4">
                                            <BarChart3 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                Inventario - {inventarioSeleccionado?.sucursal?.nombre || sucursales.find(s => s.id == sucursalId)?.nombre}
                                            </h3>
                                            <p className="text-gray-600">
                                                Gestión de stock para esta sucursal
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setMostrarForm(!mostrarForm)}
                                            className={`inline-flex items-center px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                mostrarForm 
                                                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 hover:shadow-md'
                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {mostrarForm ? (
                                                <>
                                                    <Minus className="w-5 h-5 mr-2" />
                                                    Ocultar Formulario
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Ajustar Stock
                                                </>
                                            )}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSucursalId('');
                                                setMostrarForm(false);
                                                reset();
                                                setMensaje('');
                                            }}
                                            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <ArrowRightLeft className="w-5 h-5 mr-2" />
                                            Cambiar Sucursal
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Tarjetas de estadísticas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-white p-2.5 rounded-lg">
                                                <Package className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <span className="text-xs font-bold bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
                                                ACTUAL
                                            </span>
                                        </div>
                                        <div className="text-4xl font-bold text-blue-800 mb-2">
                                            {inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_actual) : 0}
                                        </div>
                                        <p className="text-sm text-blue-700">Stock físico en almacén</p>
                                    </div>
                                    
                                    <div className={`p-5 rounded-xl border ${
                                        inventarioSeleccionado && producto.control_stock && 
                                        safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo)
                                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                                            : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                                    }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-white p-2.5 rounded-lg">
                                                <TrendingUp className={`w-6 h-6 ${
                                                    inventarioSeleccionado && producto.control_stock && 
                                                    safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`} />
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                inventarioSeleccionado && producto.control_stock && 
                                                safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                    ? 'bg-red-200 text-red-800'
                                                    : 'bg-green-200 text-green-800'
                                            }`}>
                                                DISPONIBLE
                                            </span>
                                        </div>
                                        <div className={`text-4xl font-bold mb-2 ${
                                            inventarioSeleccionado && producto.control_stock && 
                                            safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                ? 'text-red-800'
                                                : 'text-green-800'
                                        }`}>
                                            {inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_disponible) : 0}
                                        </div>
                                        <p className={`text-sm ${
                                            inventarioSeleccionado && producto.control_stock && 
                                            safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                ? 'text-red-700'
                                                : 'text-green-700'
                                        }`}>
                                            {producto.control_stock && `Mínimo requerido: ${producto.stock_minimo || 0}`}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-white p-2.5 rounded-lg">
                                                <ClipboardList className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <span className="text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1 rounded-full">
                                                RESERVADO
                                            </span>
                                        </div>
                                        <div className="text-4xl font-bold text-amber-800 mb-2">
                                            {inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_reservado) : 0}
                                        </div>
                                        <p className="text-sm text-amber-700">En órdenes pendientes</p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-white p-2.5 rounded-lg">
                                                <DollarSign className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <span className="text-xs font-bold bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                                                VALOR
                                            </span>
                                        </div>
                                        <div className="text-4xl font-bold text-purple-800 mb-2">
                                            ${inventarioSeleccionado ? safeNumber(inventarioSeleccionado.valor_inventario).toFixed(2) : '0.00'}
                                        </div>
                                        <p className="text-sm text-purple-700">Valor total del inventario</p>
                                    </div>
                                </div>
                                
                                {/* Alerta de stock bajo */}
                                {producto.control_stock && inventarioSeleccionado && 
                                 safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo) && (
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-5 rounded-xl">
                                        <div className="flex items-start">
                                            <div className="bg-red-100 p-3 rounded-lg mr-4">
                                                <AlertCircle className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-red-800 text-lg">¡Stock bajo!</h4>
                                                <p className="text-red-700 mt-2">
                                                    El stock disponible ({inventarioSeleccionado.stock_disponible}) está por debajo del mínimo establecido ({producto.stock_minimo || 0}).
                                                </p>
                                                {producto.stock_minimo > 0 && (
                                                    <div className="mt-3 bg-white p-3 rounded-lg border border-red-200">
                                                        <p className="text-sm font-semibold text-red-800">
                                                            Se recomienda realizar una entrada de <span className="text-lg">{producto.stock_minimo - safeNumber(inventarioSeleccionado.stock_disponible)}</span> unidades.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Formulario de ajuste */}
                            {mostrarForm && modo === 'ajuste' && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl mr-4">
                                                <RefreshCw className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">Ajuste de Stock</h3>
                                                <p className="text-gray-600">Registrar movimiento de inventario</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full font-semibold ${
                                            data.tipo === 'entrada' 
                                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                                        }`}>
                                            {data.tipo === 'entrada' ? 'ENTRADA DE STOCK' : 'SALIDA DE STOCK'}
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={submitAjuste} className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Tipo de movimiento */}
                                            <div className="bg-white p-6 rounded-xl border border-gray-300">
                                                <label className="block text-lg font-bold text-gray-800 mb-4">
                                                    Tipo de Movimiento
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        { value: 'entrada', label: 'Entrada', icon: Plus, color: 'green' },
                                                        { value: 'salida', label: 'Salida', icon: Minus, color: 'red' }
                                                    ].map((tipo) => {
                                                        const Icon = tipo.icon;
                                                        return (
                                                            <button
                                                                key={tipo.value}
                                                                type="button"
                                                                onClick={() => setData('tipo', tipo.value)}
                                                                className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                                                                    data.tipo === tipo.value
                                                                        ? `bg-gradient-to-br from-${tipo.color}-50 to-${tipo.color}-100 border-${tipo.color}-400 shadow-lg shadow-${tipo.color}-100`
                                                                        : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
                                                                }`}
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`p-3 rounded-lg mb-3 ${
                                                                        data.tipo === tipo.value 
                                                                            ? `bg-${tipo.color}-100` 
                                                                            : 'bg-gray-100'
                                                                    }`}>
                                                                        <Icon className={`w-6 h-6 ${
                                                                            data.tipo === tipo.value 
                                                                                ? `text-${tipo.color}-600` 
                                                                                : 'text-gray-600'
                                                                        }`} />
                                                                    </div>
                                                                    <span className={`font-bold ${
                                                                        data.tipo === tipo.value 
                                                                            ? `text-${tipo.color}-800` 
                                                                            : 'text-gray-700'
                                                                    }`}>
                                                                        {tipo.label}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 mt-1">
                                                                        {tipo.value === 'entrada' ? 'Incrementar stock' : 'Reducir stock'}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Cantidad */}
                                            <div className="bg-white p-6 rounded-xl border border-gray-300">
                                                <label className="block text-lg font-bold text-gray-800 mb-4">
                                                    Cantidad
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={data.cantidad}
                                                        onChange={(e) => setData('cantidad', e.target.value)}
                                                        className="w-full px-5 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                                                        placeholder="0.00"
                                                        required
                                                        disabled={processing}
                                                    />
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-semibold">
                                                            {producto.unidad_medida_texto}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-sm text-gray-600">
                                                    {data.tipo === 'entrada' 
                                                        ? 'Ingrese la cantidad que desea agregar al inventario'
                                                        : 'Ingrese la cantidad que desea retirar del inventario'
                                                    }
                                                </div>
                                            </div>

                                            {/* Costo (solo para entradas) */}
                                            {data.tipo === 'entrada' && (
                                                <div className="bg-white p-6 rounded-xl border border-gray-300">
                                                    <label className="block text-lg font-bold text-gray-800 mb-4">
                                                        Costo Unitario
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <div className="bg-green-100 p-2.5 rounded-lg">
                                                                <DollarSign className="w-5 h-5 text-green-600" />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.costo}
                                                            onChange={(e) => setData('costo', e.target.value)}
                                                            className="w-full pl-16 pr-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                                                            placeholder="0.00"
                                                            disabled={processing}
                                                        />
                                                    </div>
                                                    <div className="mt-4 flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            Actual: ${safeNumber(inventarioSeleccionado?.costo_promedio).toFixed(2)}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            Compra: ${safeNumber(producto.precio_compra).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Motivo */}
                                            <div className="bg-white p-6 rounded-xl border border-gray-300 lg:col-span-2">
                                                <label className="block text-lg font-bold text-gray-800 mb-4">
                                                    Motivo / Descripción
                                                </label>
                                                <textarea
                                                    value={data.motivo}
                                                    onChange={(e) => setData('motivo', e.target.value)}
                                                    rows="3"
                                                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                                                    placeholder="Ej: Compra a proveedor, Ajuste de inventario, Venta, Devolución, Transferencia..."
                                                    required
                                                    disabled={processing}
                                                />
                                                <div className="mt-3 text-sm text-gray-600">
                                                    Describe brevemente el motivo del movimiento
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resumen del ajuste */}
                                        <div className={`p-6 rounded-xl border-2 ${
                                            data.tipo === 'entrada' 
                                                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                                                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'
                                        }`}>
                                            <h4 className="font-bold text-gray-800 text-lg mb-4">Resumen del Ajuste</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                    <div className="text-sm text-gray-600 mb-2">Stock Actual</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_actual) : 0}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                    <div className="text-sm text-gray-600 mb-2">Movimiento</div>
                                                    <div className={`text-2xl font-bold ${data.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {data.tipo === 'entrada' ? '+' : '-'}{safeNumber(data.cantidad)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                    <div className="text-sm text-gray-600 mb-2">Nuevo Stock</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {data.tipo === 'entrada' 
                                                            ? (inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_actual) + safeNumber(data.cantidad) : safeNumber(data.cantidad))
                                                            : (inventarioSeleccionado ? safeNumber(inventarioSeleccionado.stock_actual) - safeNumber(data.cantidad) : 0)
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    reset();
                                                    setMostrarForm(false);
                                                    setMensaje('');
                                                }}
                                                className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400 text-gray-800 rounded-xl hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                                                disabled={processing}
                                            >
                                                <Trash2 className="w-5 h-5 mr-2" />
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing || !data.cantidad || !data.motivo}
                                                className={`inline-flex items-center px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
                                                    data.tipo === 'entrada' 
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        {data.tipo === 'entrada' ? (
                                                            <>
                                                                <Plus className="w-5 h-5 mr-2" />
                                                                Confirmar Entrada
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Minus className="w-5 h-5 mr-2" />
                                                                Confirmar Salida
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}

                    {/* Formulario de transferencia */}
                    {mostrarForm && modo === 'transferencia' && (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl mr-4">
                                        <Truck className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Transferencia entre Sucursales</h3>
                                        <p className="text-gray-600">Mover stock de una sucursal a otra</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                                    TRANSFERENCIA
                                </div>
                            </div>
                            
                            <form onSubmit={submitTransferencia} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Sucursal Origen */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-300">
                                        <label className="block text-lg font-bold text-gray-800 mb-4">
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
                                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                                                            formTransferencia.data.sucursal_origen_id == sucursal.id
                                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 shadow-md'
                                                                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-semibold text-gray-900">{sucursal.nombre}</div>
                                                            {sucursal.principal && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Disponible:</span>
                                                            <span className={`font-bold ${
                                                                stockDisponible > 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {stockDisponible} {producto.unidad_medida_texto}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Flecha de transferencia */}
                                    <div className="flex items-center justify-center">
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-300">
                                            <ArrowRight className="w-8 h-8 text-purple-600" />
                                            <div className="mt-2 text-center text-sm font-semibold text-purple-800">
                                                Transferir a
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sucursal Destino */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-300">
                                        <label className="block text-lg font-bold text-gray-800 mb-4">
                                            Sucursal de Destino
                                        </label>
                                        <div className="space-y-3">
                                            {sucursalesDisponiblesParaTransferencia?.map((sucursal) => {
                                                const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                                const stockActual = safeNumber(inventario?.stock_actual);
                                                
                                                return (
                                                    <button
                                                        key={sucursal.id}
                                                        type="button"
                                                        onClick={() => {
                                                            formTransferencia.setData('sucursal_destino_id', sucursal.id);
                                                        }}
                                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                                                            formTransferencia.data.sucursal_destino_id == sucursal.id
                                                                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400 shadow-md'
                                                                : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-semibold text-gray-900">{sucursal.nombre}</div>
                                                            {sucursal.principal && (
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Stock actual:</span>
                                                            <span className="font-bold text-blue-600">
                                                                {stockActual} {producto.unidad_medida_texto}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Cantidad y motivo */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-xl border border-gray-300">
                                        <label className="block text-lg font-bold text-gray-800 mb-4">
                                            Cantidad a Transferir
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={formTransferencia.data.cantidad}
                                                onChange={(e) => formTransferencia.setData('cantidad', e.target.value)}
                                                className="w-full px-5 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
                                                placeholder="0.00"
                                                required
                                                disabled={processing}
                                            />
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-semibold">
                                                    {producto.unidad_medida_texto}
                                                </span>
                                            </div>
                                        </div>
                                        {formTransferencia.data.sucursal_origen_id && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="text-sm text-blue-800">
                                                    <span className="font-semibold">Disponible en origen: </span>
                                                    {safeNumber(
                                                        producto.inventarios?.find(
                                                            inv => inv.sucursal_id == formTransferencia.data.sucursal_origen_id
                                                        )?.stock_disponible
                                                    )} {producto.unidad_medida_texto}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-300">
                                        <label className="block text-lg font-bold text-gray-800 mb-4">
                                            Motivo de la Transferencia
                                        </label>
                                        <textarea
                                            value={formTransferencia.data.motivo}
                                            onChange={(e) => formTransferencia.setData('motivo', e.target.value)}
                                            rows="3"
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
                                            placeholder="Ej: Reabastecimiento, Traslado de inventario, Reorganización..."
                                            required
                                            disabled={processing}
                                        />
                                        <div className="mt-3 text-sm text-gray-600">
                                            Describe el motivo de la transferencia entre sucursales
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen de la transferencia */}
                                {formTransferencia.data.sucursal_origen_id && formTransferencia.data.sucursal_destino_id && formTransferencia.data.cantidad && (
                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-300">
                                        <h4 className="font-bold text-gray-800 text-lg mb-4">Resumen de la Transferencia</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                <div className="text-sm text-gray-600 mb-2">Sucursal Origen</div>
                                                <div className="font-bold text-gray-900">
                                                    {sucursales?.find(s => s.id == formTransferencia.data.sucursal_origen_id)?.nombre}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Stock después: {
                                                        safeNumber(
                                                            producto.inventarios?.find(
                                                                inv => inv.sucursal_id == formTransferencia.data.sucursal_origen_id
                                                            )?.stock_actual
                                                        ) - safeNumber(formTransferencia.data.cantidad)
                                                    } {producto.unidad_medida_texto}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                <div className="text-sm text-gray-600 mb-2">Cantidad</div>
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {formTransferencia.data.cantidad}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {producto.unidad_medida_texto}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-xl border border-gray-300">
                                                <div className="text-sm text-gray-600 mb-2">Sucursal Destino</div>
                                                <div className="font-bold text-gray-900">
                                                    {sucursales?.find(s => s.id == formTransferencia.data.sucursal_destino_id)?.nombre}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Stock después: {
                                                        safeNumber(
                                                            producto.inventarios?.find(
                                                                inv => inv.sucursal_id == formTransferencia.data.sucursal_destino_id
                                                            )?.stock_actual
                                                        ) + safeNumber(formTransferencia.data.cantidad)
                                                    } {producto.unidad_medida_texto}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            formTransferencia.reset();
                                            setModo('ajuste');
                                            setMostrarForm(false);
                                            setMensaje('');
                                        }}
                                        className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400 text-gray-800 rounded-xl hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                                        disabled={processing}
                                    >
                                        <XCircle className="w-5 h-5 mr-2" />
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !formTransferencia.data.sucursal_origen_id || !formTransferencia.data.sucursal_destino_id || !formTransferencia.data.cantidad || !formTransferencia.data.motivo}
                                        className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
        </AuthenticatedLayout>
    );
}