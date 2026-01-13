import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Package, ArrowLeft, Plus, Minus, RefreshCw,
    Warehouse, TrendingUp, TrendingDown, AlertCircle,
    DollarSign, Eye, Trash2
} from 'lucide-react';

export default function Stock({ auth, producto, sucursales }) {
    const [sucursalId, setSucursalId] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');
    
    // Debug inicial
    useEffect(() => {
        console.log('Producto recibido:', producto);
        console.log('Sucursales recibidas:', sucursales);
        console.log('Inventarios del producto:', producto?.inventarios);
    }, [producto, sucursales]);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        sucursal_id: '',
        cantidad: '',
        tipo: 'entrada',
        costo: producto?.precio_compra || 0,
        motivo: '',
    });

    const submit = (e) => {
        e.preventDefault();
        console.log('Enviando datos:', data);
        console.log('Producto ID:', producto.id);
        
        setMensaje('');
        
        // Validaciones adicionales
        if (!data.sucursal_id) {
            setMensaje('Debe seleccionar una sucursal');
            setTipoMensaje('error');
            return;
        }
        
        if (data.tipo === 'salida') {
            const inventario = producto.inventarios?.find(inv => inv.sucursal_id == data.sucursal_id);
            if (inventario && parseFloat(data.cantidad) > parseFloat(inventario.stock_disponible || 0)) {
                setMensaje(`Stock insuficiente. Disponible: ${inventario.stock_disponible}`);
                setTipoMensaje('error');
                return;
            }
        }
        
        post(route('productos.ajustar-stock', producto.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setMostrarForm(false);
                setMensaje('Stock ajustado correctamente');
                setTipoMensaje('success');
                
                // Recargar la página después de 2 segundos
                setTimeout(() => {
                    router.reload({ only: ['producto'] });
                }, 1500);
            },
            onError: (errors) => {
                console.log('Errores del servidor:', errors);
                setMensaje('Error al ajustar el stock. Verifique los datos.');
                setTipoMensaje('error');
            },
            onFinish: () => {
                console.log('Finalizado el envío');
            }
        });
    };

    // Función segura para parsear números
    const safeNumber = (value, defaultValue = 0) => {
        try {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        } catch (error) {
            return defaultValue;
        }
    };

    const inventarioSeleccionado = sucursalId 
        ? producto?.inventarios?.find(inv => inv.sucursal_id == sucursalId)
        : null;

    // Si no hay producto, mostrar mensaje
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
                                Volver a la lista de productos
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
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Control de Stock - {producto.nombre || 'Producto'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                Código: {producto.codigo || 'N/A'} | Unidad: {producto.unidad_medida || 'UNIDAD'}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('productos.show', producto.id)}
                            className="text-gray-600 hover:text-gray-900 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Producto
                        </Link>
                        <Link
                            href={route('productos.index')}
                            className="text-gray-600 hover:text-gray-900 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Stock - ${producto.nombre || 'Producto'}`} />

            <div className="py-8">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {/* Mensajes de éxito/error */}
                    {mensaje && (
                        <div className={`mb-6 p-4 rounded-lg ${tipoMensaje === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-center">
                                {tipoMensaje === 'success' ? (
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                )}
                                <span className={`font-medium ${tipoMensaje === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                    {mensaje}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Resumen del producto */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">Producto</div>
                                <div className="text-lg font-bold text-gray-900 truncate">{producto.nombre}</div>
                                <div className="text-sm text-gray-600">{producto.codigo}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-sm text-green-600 font-medium">Categoría</div>
                                <div className="text-lg font-bold text-gray-900">{producto.categoria?.nombre || 'Sin categoría'}</div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <div className="text-sm text-yellow-600 font-medium">Control Stock</div>
                                <div className={`text-lg font-bold ${producto.control_stock ? 'text-green-600' : 'text-red-600'}`}>
                                    {producto.control_stock ? 'ACTIVADO' : 'DESACTIVADO'}
                                </div>
                                {producto.control_stock && (
                                    <div className="text-sm text-gray-600">Mínimo: {producto.stock_minimo || 0}</div>
                                )}
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Precio Compra</div>
                                <div className="text-lg font-bold text-gray-900">${safeNumber(producto.precio_compra).toFixed(2)}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 font-medium">Stock Total</div>
                                <div className="text-lg font-bold text-gray-900">
                                    {producto.inventarios?.reduce((sum, inv) => sum + safeNumber(inv.stock_actual), 0) || 0}
                                </div>
                                <div className="text-sm text-gray-600">{producto.unidad_medida}</div>
                            </div>
                        </div>
                    </div>

                    {/* Selector de sucursal */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Warehouse className="w-5 h-5 mr-2 text-gray-400" />
                            Seleccione una sucursal para gestionar stock
                        </h3>
                        
                        {sucursales && sucursales.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sucursales.map((sucursal) => {
                                    const inventario = producto.inventarios?.find(inv => inv.sucursal_id == sucursal.id);
                                    const stockActual = safeNumber(inventario?.stock_actual);
                                    const stockDisponible = safeNumber(inventario?.stock_disponible);
                                    const stockMinimo = safeNumber(producto.stock_minimo);
                                    const tieneStockBajo = producto.control_stock && stockDisponible <= stockMinimo;
                                    
                                    return (
                                        <button
                                            key={sucursal.id}
                                            type="button"
                                            onClick={() => {
                                                console.log('Sucursal clickeada:', sucursal.id);
                                                setSucursalId(sucursal.id);
                                                setData('sucursal_id', sucursal.id);
                                                setMostrarForm(true);
                                            }}
                                            className={`p-4 border rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                                                sucursalId == sucursal.id
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            } ${tieneStockBajo ? 'border-red-300 bg-red-50' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{sucursal.nombre}</div>
                                                    {sucursal.principal && (
                                                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Principal
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full ${
                                                    tieneStockBajo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {tieneStockBajo ? 'BAJO' : 'NORMAL'}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Stock Actual:</span>
                                                    <span className="font-medium">{stockActual}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Disponible:</span>
                                                    <span className={`font-medium ${tieneStockBajo ? 'text-red-600' : 'text-green-600'}`}>
                                                        {stockDisponible}
                                                    </span>
                                                </div>
                                                {inventario?.costo_promedio && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Costo Prom:</span>
                                                        <span className="font-medium">${safeNumber(inventario.costo_promedio).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No hay sucursales disponibles</p>
                                <Link 
                                    href={route('sucursales.index')} 
                                    className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Crear sucursal
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Panel de control de stock */}
                    {sucursalId && (
                        <>
                            {/* Información de inventario seleccionado */}
                            <div className="bg-white rounded-lg shadow mb-6 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-gray-400" />
                                            Inventario - {inventarioSeleccionado?.sucursal?.nombre || 'Sucursal'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Última actualización: {inventarioSeleccionado?.updated_at ? 
                                                new Date(inventarioSeleccionado.updated_at).toLocaleString() : 
                                                'Nunca'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setMostrarForm(!mostrarForm)}
                                            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                                                mostrarForm 
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {mostrarForm ? (
                                                <>
                                                    <Minus className="w-4 h-4 mr-2" />
                                                    Ocultar
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
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
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Cambiar
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Tarjetas de estadísticas */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                        <div className="text-sm text-blue-700 font-medium mb-1">Stock Actual</div>
                                        <div className="text-3xl font-bold text-blue-800">
                                            {safeNumber(inventarioSeleccionado?.stock_actual)}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">Unidades físicas</div>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg border ${
                                        safeNumber(inventarioSeleccionado?.stock_disponible) <= safeNumber(producto.stock_minimo)
                                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                                            : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                    }`}>
                                        <div className="text-sm font-medium mb-1">Stock Disponible</div>
                                        <div className={`text-3xl font-bold ${
                                            safeNumber(inventarioSeleccionado?.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                ? 'text-red-800'
                                                : 'text-green-800'
                                        }`}>
                                            {safeNumber(inventarioSeleccionado?.stock_disponible)}
                                        </div>
                                        <div className="text-xs mt-1">
                                            {producto.control_stock && `Mínimo: ${producto.stock_minimo || 0}`}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                                        <div className="text-sm text-yellow-700 font-medium mb-1">Stock Reservado</div>
                                        <div className="text-3xl font-bold text-yellow-800">
                                            {safeNumber(inventarioSeleccionado?.stock_reservado)}
                                        </div>
                                        <div className="text-xs text-yellow-600 mt-1">En transacciones</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                        <div className="text-sm text-purple-700 font-medium mb-1">Valor Inventario</div>
                                        <div className="text-3xl font-bold text-purple-800">
                                            ${safeNumber(inventarioSeleccionado?.valor_inventario).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-purple-600 mt-1">Valor total</div>
                                    </div>
                                </div>
                                
                                {/* Alertas */}
                                {producto.control_stock && inventarioSeleccionado && 
                                 safeNumber(inventarioSeleccionado.stock_disponible) <= safeNumber(producto.stock_minimo) && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                                            <div>
                                                <p className="font-medium text-red-800">¡Stock bajo!</p>
                                                <p className="text-sm text-red-700 mt-1">
                                                    El stock disponible ({inventarioSeleccionado.stock_disponible}) está por debajo del mínimo ({producto.stock_minimo || 0}).
                                                    {producto.stock_minimo > 0 && (
                                                        <span className="block mt-1">
                                                            Se recomienda realizar una entrada de {producto.stock_minimo - safeNumber(inventarioSeleccionado.stock_disponible)} unidades.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Formulario de ajuste */}
                            {mostrarForm && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                        <RefreshCw className="w-5 h-5 inline mr-2 text-gray-400" />
                                        Ajuste de Stock
                                    </h4>
                                    
                                    <form onSubmit={submit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tipo de Movimiento *
                                                </label>
                                                <div className="flex space-x-2">
                                                    {['entrada', 'salida', 'ajuste'].map((tipo) => (
                                                        <button
                                                            key={tipo}
                                                            type="button"
                                                            onClick={() => setData('tipo', tipo)}
                                                            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                                                                data.tipo === tipo
                                                                    ? tipo === 'entrada' 
                                                                        ? 'bg-green-100 border-green-500 text-green-700' 
                                                                        : tipo === 'salida'
                                                                        ? 'bg-red-100 border-red-500 text-red-700'
                                                                        : 'bg-blue-100 border-blue-500 text-blue-700'
                                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-center">
                                                                {tipo === 'entrada' && <Plus className="w-4 h-4 mr-2" />}
                                                                {tipo === 'salida' && <Minus className="w-4 h-4 mr-2" />}
                                                                {tipo === 'ajuste' && <RefreshCw className="w-4 h-4 mr-2" />}
                                                                <span className="capitalize">{tipo}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.tipo && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cantidad *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={data.cantidad}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setData('cantidad', value);
                                                        // Validar stock disponible para salidas
                                                        if (data.tipo === 'salida' && value) {
                                                            const disponible = safeNumber(inventarioSeleccionado?.stock_disponible);
                                                            const cantidad = safeNumber(value);
                                                            if (cantidad > disponible) {
                                                                setMensaje(`Stock insuficiente. Disponible: ${disponible}`);
                                                                setTipoMensaje('error');
                                                            } else {
                                                                setMensaje('');
                                                            }
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                                                        errors.cantidad ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="0.00"
                                                    required
                                                    disabled={processing}
                                                />
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Unidad: {producto.unidad_medida || 'UNIDAD'}
                                                </div>
                                                {errors.cantidad && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                                                )}
                                            </div>

                                            {data.tipo === 'entrada' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Costo Unitario
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <DollarSign className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.costo}
                                                            onChange={(e) => setData('costo', e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder={safeNumber(inventarioSeleccionado?.costo_promedio || producto.precio_compra).toFixed(2)}
                                                            disabled={processing}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                                        <span>Actual: ${safeNumber(inventarioSeleccionado?.costo_promedio).toFixed(2)}</span>
                                                        <span>Compra: ${safeNumber(producto.precio_compra).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Motivo / Descripción *
                                                </label>
                                                <textarea
                                                    value={data.motivo}
                                                    onChange={(e) => setData('motivo', e.target.value)}
                                                    rows="2"
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.motivo ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Ej: Compra a proveedor, Ajuste de inventario, Venta, Devolución, Transferencia..."
                                                    required
                                                    disabled={processing}
                                                />
                                                {errors.motivo && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Resumen */}
                                        <div className={`p-4 rounded-lg border ${
                                            data.tipo === 'entrada' ? 'bg-green-50 border-green-200' :
                                            data.tipo === 'salida' ? 'bg-red-50 border-red-200' :
                                            'bg-blue-50 border-blue-200'
                                        }`}>
                                            <div className="flex items-center mb-2">
                                                {data.tipo === 'entrada' ? (
                                                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                                                ) : data.tipo === 'salida' ? (
                                                    <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                                                ) : (
                                                    <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
                                                )}
                                                <span className="font-semibold">
                                                    {data.tipo === 'entrada' ? 'INCREMENTAR STOCK' : 
                                                     data.tipo === 'salida' ? 'REDUCIR STOCK' : 
                                                     'AJUSTAR STOCK'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-gray-600">Stock Actual</div>
                                                    <div className="text-lg font-bold">{safeNumber(inventarioSeleccionado?.stock_actual)}</div>
                                                </div>
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-gray-600">Ajuste</div>
                                                    <div className={`text-lg font-bold ${data.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {data.tipo === 'entrada' ? '+' : '-'}{safeNumber(data.cantidad)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded border">
                                                    <div className="text-gray-600">Nuevo Stock</div>
                                                    <div className="text-lg font-bold">
                                                        {data.tipo === 'entrada' ? 
                                                            safeNumber(inventarioSeleccionado?.stock_actual) + safeNumber(data.cantidad) :
                                                        data.tipo === 'salida' ? 
                                                            safeNumber(inventarioSeleccionado?.stock_actual) - safeNumber(data.cantidad) :
                                                            safeNumber(data.cantidad)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    reset();
                                                    setMostrarForm(false);
                                                    setMensaje('');
                                                }}
                                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing || !data.cantidad || !data.motivo}
                                                className={`px-6 py-3 text-white rounded-lg flex items-center transition-colors ${
                                                    data.tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' :
                                                    data.tipo === 'salida' ? 'bg-red-600 hover:bg-red-700' :
                                                    'bg-blue-600 hover:bg-blue-700'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                                            <Plus className="w-5 h-5 mr-2" />
                                                        ) : data.tipo === 'salida' ? (
                                                            <Minus className="w-5 h-5 mr-2" />
                                                        ) : (
                                                            <RefreshCw className="w-5 h-5 mr-2" />
                                                        )}
                                                        Confirmar Ajuste
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}