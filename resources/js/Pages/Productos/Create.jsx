import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    Package, 
    Tag, 
    Percent, 
    DollarSign, 
    AlertCircle,
    BarChart3,
    Warehouse,
    Layers,
    TrendingUp,
    Shield,
    CheckCircle,
    XCircle,
    Info,
    Building
} from 'lucide-react';

export default function Create({ 
    auth, 
    categorias = [], 
    tasas_itbis = [], 
    unidades_medida = [], 
    sucursales = [] 
}) {
    // Ordenar sucursales: principal primero, luego por nombre
    const sucursalesOrdenadas = [...sucursales].sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        return a.nombre.localeCompare(b.nombre);
    });

    // Encontrar sucursal principal
    const sucursalPrincipal = sucursalesOrdenadas.find(s => s.principal);
    
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        codigo: '',
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        categoria_id: categorias[0]?.id || '',
        unidad_medida: unidades_medida[0] || 'UNIDAD',
        precio_compra: 0,
        precio_venta: 0,
        precio_mayor: '',
        itbis_porcentaje: 18,
        exento_itbis: false,
        tasa_itbis: 'ITBIS1',
        control_stock: true,
        stock_minimo: 0,
        stock_inicial: 0,
        costo_inicial: 0,
        // Seleccionar sucursal principal por defecto si existe
        sucursal_id: sucursalPrincipal?.id || sucursalesOrdenadas[0]?.id || '',
        activo: true,
    });

    const [activeTab, setActiveTab] = useState('basico');

    const defaultTasasItbis = [
        { value: 'ITBIS1', label: 'ITBIS General (18%)' },
        { value: 'ITBIS2', label: 'ITBIS Reducido (16%)' },
        { value: 'ITBIS3', label: 'ITBIS Mínimo (0%)' },
        { value: 'EXENTO', label: 'Exento de ITBIS' }
    ];

    const safeTasasItbis = Array.isArray(tasas_itbis) && tasas_itbis.length > 0 
        ? tasas_itbis 
        : defaultTasasItbis;

    const safeUnidadesMedida = Array.isArray(unidades_medida) && unidades_medida.length > 0
        ? unidades_medida
        : ['UNIDAD', 'KILO', 'LITRO', 'METRO', 'CAJA', 'PAQUETE', 'SACO'];

    // Auto-seleccionar sucursal principal cuando se activa control de stock
    useEffect(() => {
        if (data.control_stock && !data.sucursal_id && sucursalPrincipal) {
            setData('sucursal_id', sucursalPrincipal.id);
        }
    }, [data.control_stock, sucursalPrincipal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const processedData = {
            ...data,
            precio_compra: parseFloat(data.precio_compra) || 0,
            precio_venta: parseFloat(data.precio_venta) || 0,
            precio_mayor: data.precio_mayor ? parseFloat(data.precio_mayor) : null,
            itbis_porcentaje: parseFloat(data.itbis_porcentaje) || 0,
            stock_minimo: parseFloat(data.stock_minimo) || 0,
            stock_inicial: data.control_stock ? (parseFloat(data.stock_inicial) || 0) : 0,
            costo_inicial: data.control_stock ? (parseFloat(data.costo_inicial) || parseFloat(data.precio_compra) || 0) : 0,
            control_stock: Boolean(data.control_stock),
            exento_itbis: Boolean(data.exento_itbis),
            activo: Boolean(data.activo),
        };

        post(route('productos.store'), {
            data: processedData,
            preserveScroll: true,
            onError: () => {
                window.scrollTo(0, 0);
                setActiveTab('basico');
            },
        });
    };

    const handleTasaItbisChange = (value) => {
        setData('tasa_itbis', value);
        clearErrors('tasa_itbis');
        clearErrors('itbis_porcentaje');
        clearErrors('exento_itbis');
        
        const tasa = safeTasasItbis.find(t => t.value === value);
        if (tasa) {
            const porcentaje = tasa.value === 'ITBIS1' ? 18 : 
                             tasa.value === 'ITBIS2' ? 16 : 0;
            setData('itbis_porcentaje', porcentaje);
            setData('exento_itbis', tasa.value === 'EXENTO');
        }
    };

    // Calcular margen
    const calcularMargen = () => {
        if (data.precio_compra > 0 && data.precio_venta > 0) {
            return ((data.precio_venta - data.precio_compra) / data.precio_compra) * 100;
        }
        return 0;
    };

    useEffect(() => {
        if (parseFloat(data.precio_venta) < parseFloat(data.precio_compra) && data.precio_compra > 0) {
            setData('precio_venta', parseFloat(data.precio_compra) * 1.3);
        }
    }, [data.precio_compra]);

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value);
    };

    if (!auth?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Error de autenticación
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        No se pudo cargar la información del usuario
                    </p>
                    <Link 
                        href={route('login')}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Ir al login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3.5 rounded-xl shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Nuevo Producto
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Agregue un nuevo producto al inventario
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href={route('productos.index')}
                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </Link>
                </div>
            }
        >
            <Head title="Nuevo Producto" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Pestañas de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basico')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'basico'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-2" />
                                        Información Básica
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('precios')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'precios'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Precios
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('impuestos')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'impuestos'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Percent className="w-4 h-4 mr-2" />
                                        Impuestos
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('inventario')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'inventario'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Warehouse className="w-4 h-4 mr-2" />
                                        Inventario
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Alertas de error */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                        Errores en el formulario
                                    </h3>
                                    <ul className="mt-1 text-sm text-red-700 dark:text-red-400 space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field} className="flex items-start">
                                                <span className="mr-1">•</span>
                                                <span>{message}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {categorias.length === 0 && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                        Categorías requeridas
                                    </h3>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                        Es necesario crear categorías antes de agregar productos.
                                    </p>
                                    <Link
                                        href={route('categorias.create')}
                                        className="mt-2 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                        Crear categoría →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Indicador de progreso */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {['basico', 'precios', 'impuestos', 'inventario'].map((tab, index) => (
                                            <React.Fragment key={tab}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    activeTab === tab 
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    {tab === 'basico' && <Package className="w-4 h-4" />}
                                                    {tab === 'precios' && <DollarSign className="w-4 h-4" />}
                                                    {tab === 'impuestos' && <Percent className="w-4 h-4" />}
                                                    {tab === 'inventario' && <Warehouse className="w-4 h-4" />}
                                                </div>
                                                {index < 3 && (
                                                    <div className={`w-8 h-0.5 ${
                                                        ['basico', 'precios', 'impuestos'].includes(activeTab) && index < ['basico', 'precios', 'impuestos'].indexOf(activeTab) + 1
                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                    }`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Paso {['basico', 'precios', 'impuestos', 'inventario'].indexOf(activeTab) + 1} de 4
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Información Básica */}
                                <div className={`space-y-6 ${activeTab !== 'basico' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Información Básica del Producto
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Campos obligatorios *
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Código del Producto *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400 font-medium">PROD-</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.codigo}
                                                    onChange={(e) => {
                                                        setData('codigo', e.target.value);
                                                        clearErrors('codigo');
                                                    }}
                                                    className="pl-16 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="001"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.codigo && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.codigo}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Código de Barras
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo_barras}
                                                onChange={(e) => {
                                                    setData('codigo_barras', e.target.value);
                                                    clearErrors('codigo_barras');
                                                }}
                                                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="123456789012"
                                                disabled={processing}
                                            />
                                            {errors.codigo_barras && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.codigo_barras}
                                                </div>
                                            )}
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nombre del Producto *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Package className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.nombre}
                                                    onChange={(e) => {
                                                        setData('nombre', e.target.value);
                                                        clearErrors('nombre');
                                                    }}
                                                    className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Ej: Laptop HP Pavilion 15"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.nombre && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.nombre}
                                                </div>
                                            )}
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={data.descripcion}
                                                onChange={(e) => {
                                                    setData('descripcion', e.target.value);
                                                    clearErrors('descripcion');
                                                }}
                                                rows="3"
                                                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Descripción detallada del producto, especificaciones técnicas, características..."
                                                disabled={processing}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Categoría *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Layers className="text-gray-400" />
                                                </div>
                                                <select
                                                    value={data.categoria_id}
                                                    onChange={(e) => {
                                                        setData('categoria_id', e.target.value);
                                                        clearErrors('categoria_id');
                                                    }}
                                                    className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                    disabled={processing || categorias.length === 0}
                                                >
                                                    <option value="">Seleccionar categoría...</option>
                                                    {categorias.map((categoria) => (
                                                        <option key={categoria.id} value={categoria.id}>
                                                            {categoria.nombre} {categoria.codigo ? `(${categoria.codigo})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.categoria_id && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.categoria_id}
                                                </div>
                                            )}
                                            {categorias.length === 0 && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                    No hay categorías disponibles
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Unidad de Medida *
                                            </label>
                                            <select
                                                value={data.unidad_medida}
                                                onChange={(e) => {
                                                    setData('unidad_medida', e.target.value);
                                                    clearErrors('unidad_medida');
                                                }}
                                                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                required
                                                disabled={processing}
                                            >
                                                {safeUnidadesMedida.map((unidad) => (
                                                    <option key={unidad} value={unidad}>
                                                        {unidad}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Precios */}
                                <div className={`space-y-6 ${activeTab !== 'precios' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Configuración de Precios
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Valores en DOP
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Precio de Compra *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">RD$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.precio_compra}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        setData('precio_compra', value);
                                                        clearErrors('precio_compra');
                                                    }}
                                                    className="pl-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="0.00"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.precio_compra && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.precio_compra}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Costo unitario de adquisición
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Precio de Venta *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">RD$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.precio_venta}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        setData('precio_venta', value);
                                                        clearErrors('precio_venta');
                                                    }}
                                                    className="pl-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="0.00"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.precio_venta && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.precio_venta}
                                                </div>
                                            )}
                                            <div className="mt-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Margen:</span>
                                                    <span className={`font-medium ${
                                                        calcularMargen() > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {calcularMargen().toFixed(2)}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Ganancia:</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(data.precio_venta - data.precio_compra)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Precio Mayorista
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">RD$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.precio_mayor}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? parseFloat(e.target.value) : '';
                                                        setData('precio_mayor', value);
                                                        clearErrors('precio_mayor');
                                                    }}
                                                    className="pl-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="0.00"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Para ventas por volumen
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center">
                                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                            <h4 className="font-medium text-blue-800 dark:text-blue-300">
                                                Resumen de Margen
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Compra</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(data.precio_compra)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Venta</p>
                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(data.precio_venta)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Utilidad</p>
                                                <p className={`font-semibold ${
                                                    (data.precio_venta - data.precio_compra) >= 0 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {formatCurrency(data.precio_venta - data.precio_compra)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Impuestos */}
                                <div className={`space-y-6 ${activeTab !== 'impuestos' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Configuración de Impuestos
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Específico para República Dominicana
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tasa ITBIS *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {safeTasasItbis.map((tasa) => (
                                                    <button
                                                        key={tasa.value}
                                                        type="button"
                                                        onClick={() => handleTasaItbisChange(tasa.value)}
                                                        className={`px-4 py-3 rounded-lg border transition-all flex flex-col items-center ${
                                                            data.tasa_itbis === tasa.value
                                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300'
                                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                        }`}
                                                    >
                                                        <span className="font-medium">{tasa.label.split(' ')[0]}</span>
                                                        <span className="text-xs opacity-75 mt-1">{tasa.label.split('(')[1]?.replace(')', '') || '0%'}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.tasa_itbis && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.tasa_itbis}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Porcentaje ITBIS *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">%</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={data.itbis_porcentaje}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        setData('itbis_porcentaje', value);
                                                        clearErrors('itbis_porcentaje');
                                                    }}
                                                    className="pr-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                    disabled={processing || data.exento_itbis}
                                                />
                                            </div>
                                            {errors.itbis_porcentaje && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.itbis_porcentaje}
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                {data.exento_itbis ? (
                                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300">
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        <span className="text-sm font-medium">Exento de ITBIS</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300">
                                                        <Shield className="w-4 h-4 mr-1" />
                                                        <span className="text-sm font-medium">Sujeto a ITBIS</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/10 dark:to-gray-800/10 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-2">
                                            Cálculo de Impuestos
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Precio sin ITBIS:</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(data.precio_venta / (1 + data.itbis_porcentaje / 100))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">ITBIS a aplicar:</p>
                                                <p className="font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(data.precio_venta * (data.itbis_porcentaje / 100))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inventario */}
                                <div className={`space-y-6 ${activeTab !== 'inventario' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Warehouse className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Control de Inventario
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Configuración de stock
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                            <div className="flex items-center">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        id="control_stock"
                                                        checked={data.control_stock}
                                                        onChange={(e) => {
                                                            setData('control_stock', e.target.checked);
                                                            clearErrors('control_stock');
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div className="ml-3">
                                                    <label htmlFor="control_stock" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Controlar Stock de este Producto
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Habilitar el seguimiento de inventario y niveles de stock
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {data.control_stock && (
                                            <>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Stock Mínimo
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={data.stock_minimo}
                                                            onChange={(e) => {
                                                                const value = parseFloat(e.target.value) || 0;
                                                                setData('stock_minimo', value);
                                                                clearErrors('stock_minimo');
                                                            }}
                                                            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            disabled={processing}
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            Alerta cuando el stock sea menor
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Stock Inicial *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={data.stock_inicial}
                                                            onChange={(e) => {
                                                                const value = parseFloat(e.target.value) || 0;
                                                                setData('stock_inicial', value);
                                                                clearErrors('stock_inicial');
                                                            }}
                                                            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            required={data.control_stock}
                                                            disabled={processing}
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            Cantidad inicial en inventario
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Costo Inicial (Unitario)
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-400">RD$</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                value={data.costo_inicial}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value) || 0;
                                                                    setData('costo_inicial', value);
                                                                    clearErrors('costo_inicial');
                                                                }}
                                                                className="pl-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                                disabled={processing}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            Costo unitario inicial
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Sucursal para Stock *
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Building className="text-gray-400" />
                                                        </div>
                                                        <select
                                                            value={data.sucursal_id}
                                                            onChange={(e) => {
                                                                setData('sucursal_id', e.target.value);
                                                                clearErrors('sucursal_id');
                                                            }}
                                                            className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                                errors.sucursal_id 
                                                                    ? 'border-red-500 dark:border-red-500' 
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                            } ${sucursalesOrdenadas.length === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                                            required={data.control_stock}
                                                            disabled={processing || sucursalesOrdenadas.length === 0}
                                                        >
                                                            <option value="">Seleccionar sucursal...</option>
                                                            {sucursalesOrdenadas.map((sucursal) => (
                                                                <option 
                                                                    key={sucursal.id} 
                                                                    value={sucursal.id}
                                                                    className={sucursal.principal ? 'font-semibold' : ''}
                                                                >
                                                                    {sucursal.principal && '🏠 '}
                                                                    {sucursal.nombre}
                                                                    {sucursal.principal && ' (Principal)'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    
                                                    {/* Información sobre la selección */}
                                                    {data.sucursal_id && (
                                                        <div className="mt-2 flex items-start text-xs text-gray-600 dark:text-gray-400">
                                                            <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                                            <span>
                                                                El stock inicial se registrará en esta sucursal. 
                                                                Puedes transferir stock a otras sucursales después.
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {errors.sucursal_id && (
                                                        <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            {errors.sucursal_id}
                                                        </div>
                                                    )}
                                                    
                                                    {sucursalesOrdenadas.length === 0 && (
                                                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                ⚠️ No hay sucursales disponibles. Debes crear al menos una sucursal antes de agregar productos con control de stock.
                                                            </p>
                                                            <Link
                                                                href={route('configuracion.sucursales')}
                                                                className="mt-1 inline-block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                            >
                                                                Ir a crear sucursal →
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-green-100 dark:border-green-800">
                                                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
                                                        <BarChart3 className="w-5 h-5 mr-2" />
                                                        Resumen de Inventario Inicial
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div className="text-center">
                                                            <p className="text-gray-600 dark:text-gray-400">Stock Inicial</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {data.stock_inicial} {data.unidad_medida}
                                                            </p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-gray-600 dark:text-gray-400">Costo Unitario</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {formatCurrency(data.costo_inicial)}
                                                            </p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-gray-600 dark:text-gray-400">Valor Total</p>
                                                            <p className="font-semibold text-green-600 dark:text-green-400">
                                                                {formatCurrency(data.stock_inicial * data.costo_inicial)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                            <div className="flex items-center">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        id="activo"
                                                        checked={data.activo}
                                                        onChange={(e) => {
                                                            setData('activo', e.target.checked);
                                                            clearErrors('activo');
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div className="ml-3">
                                                    <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Producto Activo
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        El producto estará disponible para ventas y transacciones
                                                    </p>
                                                </div>
                                                <div className="ml-auto">
                                                    {data.activo ? (
                                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            <span className="text-sm font-medium">Activo</span>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300">
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            <span className="text-sm font-medium">Inactivo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navegación entre pestañas */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {activeTab !== 'basico' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'inventario' ? 'impuestos' :
                                                activeTab === 'impuestos' ? 'precios' : 'basico'
                                            )}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior
                                        </button>
                                    )}
                                    
                                    {activeTab !== 'inventario' ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'basico' ? 'precios' :
                                                activeTab === 'precios' ? 'impuestos' : 'inventario'
                                            )}
                                            className="ml-auto inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Siguiente
                                            <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
                                        </button>
                                    ) : (
                                        <div className="ml-auto space-x-3">
                                            <Link
                                                href={route('productos.index')}
                                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing || categorias.length === 0 || (data.control_stock && sucursalesOrdenadas.length === 0)}
                                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Creando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Crear Producto
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}