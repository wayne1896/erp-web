import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Search, Plus, Edit, Trash2, Eye, 
    Package, Tag, DollarSign, Warehouse,
    Info, BarChart, Filter, RefreshCw,
    AlertCircle, Percent, ShoppingCart,
    Truck, Layers, Hash, Barcode
} from 'lucide-react';

export default function Index({ auth, productos, filters, categorias, stats }) {
    const { flash = {} } = usePage().props;
    
    // Usando useForm para manejar los filtros como en el ejemplo de clientes
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        categoria_id: filters?.categoria_id || '',
        per_page: filters?.per_page || 10,
    });

    const safeProductos = productos || { data: [], from: 1, to: 0, total: 0, links: [] };
    const safeStats = stats || { total: 0, activos: 0, stock_bajo: 0, exento_itbis: 0 };
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestión de Productos
                    </h2>
                    <Link
                        href={route('productos.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Producto
                    </Link>
                </div>
            }
        >
            <Head title="Productos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Mensajes flash */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                            {flash.success}
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Productos</p>
                                    <p className="text-2xl font-bold">{safeStats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <Package className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Activos</p>
                                    <p className="text-2xl font-bold">{safeStats.activos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Stock Bajo</p>
                                    <p className="text-2xl font-bold">{safeStats.stock_bajo}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                    <Percent className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Exentos ITBIS</p>
                                    <p className="text-2xl font-bold">{safeStats.exento_itbis}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Buscar por código, nombre, código de barras..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <select
                                    value={data.categoria_id}
                                    onChange={(e) => setData('categoria_id', e.target.value)}
                                    className="w-full pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todas las categorías</option>
                                    {safeCategorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <select
                                    value={data.per_page}
                                    onChange={(e) => setData('per_page', e.target.value)}
                                    className="w-full pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="10">10 por página</option>
                                    <option value="25">25 por página</option>
                                    <option value="50">50 por página</option>
                                    <option value="100">100 por página</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Buscar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg flex items-center"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Limpiar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de productos */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Hash className="w-4 h-4 mr-2" />
                                                Código
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 mr-2" />
                                                Producto
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Tag className="w-4 h-4 mr-2" />
                                                Categoría
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                Precios
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Warehouse className="w-4 h-4 mr-2" />
                                                Stock
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Info className="w-4 h-4 mr-2" />
                                                Estado
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <BarChart className="w-4 h-4 mr-2" />
                                                Acciones
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
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
                                                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {producto.codigo || 'N/A'}
                                                                </div>
                                                                {producto.codigo_barras && (
                                                                    <div className="text-sm text-gray-500 flex items-center">
                                                                        <Barcode className="w-3 h-3 mr-1" />
                                                                        {producto.codigo_barras}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {producto.nombre || 'Sin nombre'}
                                                        </div>
                                                        {producto.descripcion && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {producto.descripcion}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                                                <Tag className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div className="text-sm text-gray-900">
                                                                {producto.categoria?.nombre || 'Sin categoría'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <div className="text-sm text-gray-900 flex items-center">
                                                                <ShoppingCart className="w-3 h-3 mr-2 text-gray-400" />
                                                                Compra: ${parseFloat(producto.precio_compra || 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-sm font-medium text-green-600 flex items-center">
                                                                <DollarSign className="w-3 h-3 mr-2" />
                                                                Venta: ${parseFloat(producto.precio_venta || 0).toFixed(2)}
                                                            </div>
                                                            {producto.precio_mayor && (
                                                                <div className="text-sm text-blue-600 flex items-center">
                                                                    <Truck className="w-3 h-3 mr-2" />
                                                                    Mayor: ${parseFloat(producto.precio_mayor).toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <div className="text-sm text-gray-900">
                                                                {producto.unidad_medida || 'Unidad'}
                                                            </div>
                                                            <div className={`text-sm font-medium flex items-center ${
                                                                tieneStockBajo ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                                <Layers className={`w-3 h-3 mr-2 ${tieneStockBajo ? 'text-red-500' : 'text-green-500'}`} />
                                                                Stock: {stockSucursal}
                                                            </div>
                                                            {producto.control_stock && (
                                                                <div className="text-xs text-gray-500 flex items-center">
                                                                    <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
                                                                    Mín: {producto.stock_minimo || 0}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-2">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                producto.activo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {producto.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            <div className="text-sm">
                                                                {producto.exento_itbis ? (
                                                                    <span className="text-blue-600 flex items-center">
                                                                        <Percent className="w-3 h-3 mr-1" />
                                                                        Exento ITBIS
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-600 flex items-center">
                                                                        <Percent className="w-3 h-3 mr-1" />
                                                                        ITBIS {producto.itbis_porcentaje || 0}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                        <Link
    href={route('productos.stock', producto.id)}
    className="text-indigo-600 hover:text-indigo-900 transition-colors"
    title="Gestionar stock"
>
    <Warehouse className="w-4 h-4" />
</Link>
                                                            <Link
                                                                href={route('productos.show', producto.id)}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('productos.edit', producto.id)}
                                                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(producto)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
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
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Package className="w-12 h-12 text-gray-400 mb-3" />
                                                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Intenta con otros filtros de búsqueda
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {safeProductos.data && safeProductos.data.length > 0 && safeProductos.links && (
                            <div className="bg-white px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{safeProductos.from}</span> a{' '}
                                        <span className="font-medium">{safeProductos.to}</span> de{' '}
                                        <span className="font-medium">{safeProductos.total}</span> resultados
                                    </div>
                                    <div className="flex space-x-2">
                                        {safeProductos.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}