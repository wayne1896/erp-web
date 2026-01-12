import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ categorias, proveedores, tasas_itbis, unidades_medida }) {
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        categoria_id: '',
        proveedor_id: '',
        precio_compra: '',
        precio_venta: '',
        precio_mayor: '',
        tasa_itbis: 'ITBIS1',
        itbis_porcentaje: 18,
        exento_itbis: false,
        stock_minimo: 0,
        stock_maximo: '',
        control_stock: true,
        unidad_medida: 'UNIDAD',
        activo: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('productos.store'));
    };

    const handleItbisChange = (value) => {
        setData('tasa_itbis', value);
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Crear Producto
                    </h2>
                    <Link
                        href={route('productos.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Volver
                    </Link>
                </div>
            }
        >
            <Head title="Crear Producto" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Código *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.codigo}
                                            onChange={(e) => setData('codigo', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.codigo && (
                                            <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Código de Barras
                                        </label>
                                        <input
                                            type="text"
                                            value={data.codigo_barras}
                                            onChange={(e) => setData('codigo_barras', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Categoría *
                                        </label>
                                        <select
                                            value={data.categoria_id}
                                            onChange={(e) => setData('categoria_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar categoría</option>
                                            {categorias.map((categoria) => (
                                                <option key={categoria.id} value={categoria.id}>
                                                    {categoria.nombre} ({categoria.codigo})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoria_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Proveedor
                                        </label>
                                        <select
                                            value={data.proveedor_id}
                                            onChange={(e) => setData('proveedor_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Sin proveedor</option>
                                            {proveedores.map((proveedor) => (
                                                <option key={proveedor.id} value={proveedor.id}>
                                                    {proveedor.nombre} ({proveedor.codigo})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Precios y Stock */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Precios y Stock</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Precio Compra *
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.precio_compra}
                                                    onChange={(e) => setData('precio_compra', e.target.value)}
                                                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            {errors.precio_compra && (
                                                <p className="mt-1 text-sm text-red-600">{errors.precio_compra}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Precio Venta *
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.precio_venta}
                                                    onChange={(e) => setData('precio_venta', e.target.value)}
                                                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            {errors.precio_venta && (
                                                <p className="mt-1 text-sm text-red-600">{errors.precio_venta}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Precio al por Mayor
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.precio_mayor}
                                                onChange={(e) => setData('precio_mayor', e.target.value)}
                                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tasa ITBIS *
                                        </label>
                                        <select
                                            value={data.tasa_itbis}
                                            onChange={(e) => handleItbisChange(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {tasas_itbis.map((tasa) => (
                                                <option key={tasa.value} value={tasa.value}>
                                                    {tasa.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {!data.exento_itbis && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Porcentaje ITBIS *
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={data.itbis_porcentaje}
                                                    onChange={(e) => setData('itbis_porcentaje', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Unidad de Medida *
                                        </label>
                                        <select
                                            value={data.unidad_medida}
                                            onChange={(e) => setData('unidad_medida', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {unidades_medida.map((unidad) => (
                                                <option key={unidad.value} value={unidad.value}>
                                                    {unidad.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Stock Mínimo
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.stock_minimo}
                                                onChange={(e) => setData('stock_minimo', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Stock Máximo
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.stock_maximo}
                                                onChange={(e) => setData('stock_maximo', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="control_stock"
                                                checked={data.control_stock}
                                                onChange={(e) => setData('control_stock', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            <label htmlFor="control_stock" className="ml-2 block text-sm text-gray-900">
                                                Controlar Stock
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="activo"
                                                checked={data.activo}
                                                onChange={(e) => setData('activo', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                                Producto Activo
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <Link
                                    href={route('productos.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}