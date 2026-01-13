import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Package, DollarSign, Percent, Tag } from 'lucide-react';

export default function Edit({ auth, producto, categorias = [], tasas_itbis = [], unidades_medida = [] }) {
    // Valores por defecto seguros
    const safeCategorias = Array.isArray(categorias) ? categorias : [];
    const defaultTasasItbis = [
        { value: 'ITBIS1', label: 'ITBIS General (18%)' },
        { value: 'ITBIS2', label: 'ITBIS Reducido (16%)' },
        { value: 'ITBIS3', label: 'ITBIS Mínimo (0%)' },
        { value: 'EXENTO', label: 'Exento de ITBIS (0%)' }
    ];
    const safeTasasItbis = Array.isArray(tasas_itbis) && tasas_itbis.length > 0 ? tasas_itbis : defaultTasasItbis;
    const defaultUnidadesMedida = ['UNIDAD', 'KILO', 'LITRO', 'METRO', 'CAJA', 'PAQUETE', 'SACO'];
    const safeUnidadesMedida = Array.isArray(unidades_medida) && unidades_medida.length > 0 ? unidades_medida : defaultUnidadesMedida;

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        codigo: producto?.codigo || '',
        codigo_barras: producto?.codigo_barras || '',
        nombre: producto?.nombre || '',
        descripcion: producto?.descripcion || '',
        categoria_id: producto?.categoria_id || '',
        unidad_medida: producto?.unidad_medida || 'UNIDAD',
        precio_compra: producto?.precio_compra || 0,
        precio_venta: producto?.precio_venta || 0,
        precio_mayor: producto?.precio_mayor || '',
        itbis_porcentaje: producto?.itbis_porcentaje || 18,
        exento_itbis: Boolean(producto?.exento_itbis),
        tasa_itbis: producto?.tasa_itbis || 'ITBIS1',
        control_stock: Boolean(producto?.control_stock),
        stock_minimo: producto?.stock_minimo || 0,
        activo: Boolean(producto?.activo),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Enviando datos para actualizar:', data);
        
        // Procesar datos antes de enviar
        const processedData = {
            ...data,
            precio_compra: parseFloat(data.precio_compra) || 0,
            precio_venta: parseFloat(data.precio_venta) || 0,
            precio_mayor: data.precio_mayor ? parseFloat(data.precio_mayor) : null,
            itbis_porcentaje: parseFloat(data.itbis_porcentaje) || 0,
            stock_minimo: parseFloat(data.stock_minimo) || 0,
        };

        put(route('productos.update', producto.id), {
            data: processedData,
            preserveScroll: true,
            onError: (errors) => {
                console.log('Errores de validación:', errors);
                window.scrollTo(0, 0);
            },
        });
    };

    const handleItbisChange = (value) => {
        setData('tasa_itbis', value);
        clearErrors('tasa_itbis');
        clearErrors('itbis_porcentaje');
        clearErrors('exento_itbis');
        
        if (value === 'EXENTO') {
            setData('exento_itbis', true);
            setData('itbis_porcentaje', 0);
        } else {
            setData('exento_itbis', false);
            if (value === 'ITBIS1') setData('itbis_porcentaje', 18);
            if (value === 'ITBIS2') setData('itbis_porcentaje', 16);
            if (value === 'ITBIS3') setData('itbis_porcentaje', 0);
        }
    };

    // Verificar si el producto existe
    if (!producto) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Producto no encontrado" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Producto no encontrado</h2>
                            <Link href={route('productos.index')} className="text-blue-600 hover:text-blue-800">
                                ← Volver a la lista de productos
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
                                Editar Producto
                            </h2>
                            <p className="text-sm text-gray-600">{producto.nombre}</p>
                        </div>
                    </div>
                    <Link
                        href={route('productos.show', producto.id)}
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Editar ${producto.nombre}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Alertas de error */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-sm font-medium text-red-800">
                                    Hay errores en el formulario
                                </h3>
                            </div>
                            <ul className="mt-2 text-sm text-red-700 space-y-1">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>• {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-8">
                                {/* Información Básica */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-gray-400" />
                                        Información Básica
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={(e) => {
                                                    setData('codigo', e.target.value);
                                                    clearErrors('codigo');
                                                }}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.codigo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing}
                                            />
                                            {errors.codigo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código de Barras
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo_barras}
                                                onChange={(e) => {
                                                    setData('codigo_barras', e.target.value);
                                                    clearErrors('codigo_barras');
                                                }}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.codigo_barras ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                disabled={processing}
                                            />
                                            {errors.codigo_barras && (
                                                <p className="mt-1 text-sm text-red-600">{errors.codigo_barras}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => {
                                                    setData('nombre', e.target.value);
                                                    clearErrors('nombre');
                                                }}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing}
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={data.descripcion}
                                                onChange={(e) => {
                                                    setData('descripcion', e.target.value);
                                                    clearErrors('descripcion');
                                                }}
                                                rows="3"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={processing}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                value={data.categoria_id}
                                                onChange={(e) => {
                                                    setData('categoria_id', e.target.value);
                                                    clearErrors('categoria_id');
                                                }}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.categoria_id ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing || safeCategorias.length === 0}
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {safeCategorias.map((categoria) => (
                                                    <option key={categoria.id} value={categoria.id}>
                                                        {categoria.nombre} {categoria.codigo ? `(${categoria.codigo})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.categoria_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unidad de Medida *
                                            </label>
                                            <select
                                                value={data.unidad_medida}
                                                onChange={(e) => {
                                                    setData('unidad_medida', e.target.value);
                                                    clearErrors('unidad_medida');
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                                        Precios
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio Compra *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">$</span>
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
                                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.precio_compra ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.precio_compra && (
                                                <p className="mt-1 text-sm text-red-600">{errors.precio_compra}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio Venta *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">$</span>
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
                                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.precio_venta ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.precio_venta && (
                                                <p className="mt-1 text-sm text-red-600">{errors.precio_venta}</p>
                                            )}
                                            {data.precio_venta > 0 && data.precio_compra > 0 && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Margen: {(((data.precio_venta - data.precio_compra) / data.precio_compra) * 100).toFixed(2)}%
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio Mayorista
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">$</span>
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
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={processing}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Impuestos */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Percent className="w-5 h-5 mr-2 text-gray-400" />
                                        Impuestos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tasa ITBIS *
                                            </label>
                                            <select
                                                value={data.tasa_itbis}
                                                onChange={(e) => handleItbisChange(e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.tasa_itbis ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing}
                                            >
                                                {safeTasasItbis.map((tasa) => (
                                                    <option key={tasa.value} value={tasa.value}>
                                                        {tasa.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.tasa_itbis && (
                                                <p className="mt-1 text-sm text-red-600">{errors.tasa_itbis}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Porcentaje ITBIS *
                                            </label>
                                            <div className="relative">
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
                                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.itbis_porcentaje ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                    disabled={processing || data.exento_itbis}
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">%</span>
                                                </div>
                                            </div>
                                            {errors.itbis_porcentaje && (
                                                <p className="mt-1 text-sm text-red-600">{errors.itbis_porcentaje}</p>
                                            )}
                                            {data.exento_itbis && (
                                                <p className="mt-1 text-sm text-green-600">✓ Producto exento de ITBIS</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Control de Stock */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Tag className="w-5 h-5 mr-2 text-gray-400" />
                                        Control de Stock
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="control_stock"
                                                    checked={data.control_stock}
                                                    onChange={(e) => {
                                                        setData('control_stock', e.target.checked);
                                                        clearErrors('control_stock');
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    disabled={processing}
                                                />
                                                <label htmlFor="control_stock" className="ml-2 text-sm font-medium text-gray-700">
                                                    Controlar Stock
                                                </label>
                                            </div>
                                            
                                            {data.control_stock && (
                                                <div className="w-48">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Stock Mínimo
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.stock_minimo}
                                                        onChange={(e) => {
                                                            const value = parseFloat(e.target.value) || 0;
                                                            setData('stock_minimo', value);
                                                            clearErrors('stock_minimo');
                                                        }}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        disabled={processing}
                                                    />
                                                    {errors.stock_minimo && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.stock_minimo}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Estado y Acciones */}
                                <div className="border-t border-gray-200 pt-8">
                                    <div className="flex items-center mb-6">
                                        <input
                                            type="checkbox"
                                            id="activo"
                                            checked={data.activo}
                                            onChange={(e) => {
                                                setData('activo', e.target.checked);
                                                clearErrors('activo');
                                            }}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled={processing}
                                        />
                                        <label htmlFor="activo" className="ml-2 text-sm font-medium text-gray-900">
                                            Producto Activo
                                        </label>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            <p>Los campos marcados con * son obligatorios</p>
                                        </div>
                                        
                                        <div className="flex space-x-3">
                                            <Link
                                                href={route('productos.show', producto.id)}
                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Actualizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Actualizar Producto
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}