import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ producto, estadisticas }) {
    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(route('productos.destroy', producto.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Producto: {producto.nombre}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('productos.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Producto: ${producto.nombre}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Encabezado con acciones */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{producto.nombre}</h3>
                                    <p className="text-sm text-gray-500">Código: {producto.codigo}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('productos.edit', producto.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-blue-600">Margen de Ganancia</div>
                                    <div className="text-2xl font-bold">
                                        {estadisticas.margen_ganancia?.toFixed(2) || '0.00'}%
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-sm text-green-600">Precio Venta con ITBIS</div>
                                    <div className="text-2xl font-bold">
                                        ${estadisticas.precio_con_itbis?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-sm text-purple-600">Valor Inventario</div>
                                    <div className="text-2xl font-bold">
                                        ${estadisticas.valor_inventario?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                            </div>

                            {/* Información en tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button className="border-b-2 border-blue-500 text-blue-600 px-1 py-4 text-sm font-medium">
                                        Información General
                                    </button>
                                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">
                                        Inventario por Sucursal
                                    </button>
                                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">
                                        Movimientos
                                    </button>
                                </nav>
                            </div>

                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Columna izquierda */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {producto.descripcion || 'Sin descripción'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Categoría</h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {producto.categoria?.nombre || 'Sin categoría'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Proveedor</h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {producto.proveedor?.nombre || 'Sin proveedor'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Unidad de Medida</h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {producto.unidad_medida_texto}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Configuración de Stock</h4>
                                            <div className="mt-2 grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Stock Mínimo</div>
                                                    <div className="text-sm font-medium">{producto.stock_minimo || '0'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Stock Máximo</div>
                                                    <div className="text-sm font-medium">{producto.stock_maximo || '∞'}</div>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    producto.control_stock 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {producto.control_stock ? 'Control de Stock Activado' : 'Sin control de stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna derecha */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Precios</h4>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Precio Compra:</span>
                                                    <span className="text-sm font-medium">
                                                        ${parseFloat(producto.precio_compra).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Precio Venta:</span>
                                                    <span className="text-sm font-medium text-green-600">
                                                        ${parseFloat(producto.precio_venta).toFixed(2)}
                                                    </span>
                                                </div>
                                                {producto.precio_mayor && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Precio al por Mayor:</span>
                                                        <span className="text-sm font-medium text-blue-600">
                                                            ${parseFloat(producto.precio_mayor).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Impuestos (ITBIS)</h4>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Tasa ITBIS:</span>
                                                    <span className="text-sm font-medium">{producto.descripcion_itbis}</span>
                                                </div>
                                                {!producto.exento_itbis && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Porcentaje:</span>
                                                        <span className="text-sm font-medium">{producto.itbis_porcentaje}%</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Estado:</span>
                                                    <span className={`text-sm font-medium ${
                                                        producto.exento_itbis ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {producto.exento_itbis ? 'Exento' : 'Aplica ITBIS'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Estado del Producto</h4>
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    producto.activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {producto.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Información Técnica</h4>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Código de Barras:</span>
                                                    <span className="font-medium">{producto.codigo_barras || 'No asignado'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Creado:</span>
                                                    <span className="font-medium">
                                                        {new Date(producto.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Última actualización:</span>
                                                    <span className="font-medium">
                                                        {new Date(producto.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nota para multi-sucursal */}
                                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">Sistema Multi-Sucursal</h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>
                                                    Este producto puede tener diferentes niveles de stock en cada sucursal.
                                                    Utiliza la pestaña "Inventario por Sucursal" para gestionar el stock específico.
                                                </p>
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