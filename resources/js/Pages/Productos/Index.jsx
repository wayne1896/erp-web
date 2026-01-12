import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ productos, filters, categorias, stats }) {
    // CORRECCIÓN 1: Valor por defecto para flash
    const { flash = {} } = usePage().props;
    
    // CORRECCIÓN 2: Valores por defecto para estados
    const [search, setSearch] = useState(filters?.search || '');
    const [categoriaId, setCategoriaId] = useState(filters?.categoria_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    // CORRECCIÓN 3: Valores por defecto para props
    const safeProductos = productos || { data: [], from: 1, to: 0, total: 0, links: [] };
    const safeStats = stats || { total: 0, activos: 0, stock_bajo: 0, exento_itbis: 0 };
    const safeCategorias = Array.isArray(categorias) ? categorias : [];
    const safeFilters = filters || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('productos.index'), {
            search,
            categoria_id: categoriaId,
            per_page: perPage,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategoriaId('');
        setPerPage(10);
        router.get(route('productos.index'), {}, { preserveState: true });
    };

    const handleDelete = (producto) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(route('productos.destroy', producto.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Productos
                    </h2>
                    <Link
                        href={route('productos.create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Nuevo Producto
                    </Link>
                </div>
            }
        >
            <Head title="Productos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* CORRECCIÓN 4: Verificación segura de flash */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}

                    {/* Estadísticas CON verificaciones */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <div className="text-sm text-gray-500">Total Productos</div>
                            <div className="text-2xl font-bold">{safeStats.total}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <div className="text-sm text-gray-500">Activos</div>
                            <div className="text-2xl font-bold text-green-600">{safeStats.activos}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <div className="text-sm text-gray-500">Stock Bajo</div>
                            <div className="text-2xl font-bold text-yellow-600">{safeStats.stock_bajo}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <div className="text-sm text-gray-500">Exentos ITBIS</div>
                            <div className="text-2xl font-bold text-blue-600">{safeStats.exento_itbis}</div>
                        </div>
                    </div>

                    {/* Filtros CON verificaciones */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Buscar
                                        </label>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Código, nombre, código de barras..."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Categoría
                                        </label>
                                        <select
                                            value={categoriaId}
                                            onChange={(e) => setCategoriaId(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {safeCategorias.map((categoria) => (
                                                <option key={categoria.id} value={categoria.id}>
                                                    {categoria.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Items por página
                                        </label>
                                        <select
                                            value={perPage}
                                            onChange={(e) => setPerPage(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tabla de productos CON verificaciones */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precios
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {safeProductos.data && safeProductos.data.length > 0 ? (
                                        safeProductos.data.map((producto) => {
                                            // Determinar si tiene stock bajo (usando lógica temporal)
                                            const tieneStockBajo = producto.control_stock && 
                                                                  producto.inventarios && 
                                                                  producto.inventarios[0] && 
                                                                  producto.inventarios[0].stock_disponible <= (producto.stock_minimo || 0);
                                            
                                            // Obtener stock de la sucursal actual
                                            const stockSucursal = producto.inventarios && producto.inventarios[0] 
                                                ? producto.inventarios[0].stock_disponible 
                                                : 0;

                                            return (
                                                <tr key={producto.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {producto.codigo || 'N/A'}
                                                        </div>
                                                        {producto.codigo_barras && (
                                                            <div className="text-sm text-gray-500">
                                                                {producto.codigo_barras}
                                                            </div>
                                                        )}
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
                                                        <div className="text-sm text-gray-900">
                                                            {producto.categoria?.nombre || 'Sin categoría'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm">
                                                            <div className="text-gray-900">
                                                                Compra: ${parseFloat(producto.precio_compra || 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-green-600 font-medium">
                                                                Venta: ${parseFloat(producto.precio_venta || 0).toFixed(2)}
                                                            </div>
                                                            {producto.precio_mayor && (
                                                                <div className="text-blue-600">
                                                                    Mayor: ${parseFloat(producto.precio_mayor).toFixed(2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {/* CORRECCIÓN: No usar accessors de Laravel en frontend */}
                                                        <div className="text-sm text-gray-900">
                                                            {producto.unidad_medida || 'Unidad'}
                                                        </div>
                                                        <div className={`text-sm font-medium ${
                                                            tieneStockBajo ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                            Stock: {stockSucursal}
                                                        </div>
                                                        {producto.control_stock && (
                                                            <div className="text-xs text-gray-500">
                                                                Mín: {producto.stock_minimo || 0}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            producto.activo
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {producto.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                        {/* CORRECCIÓN: No usar accessors de Laravel */}
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {producto.exento_itbis ? 'Exento' : `ITBIS ${producto.itbis_porcentaje || 0}%`}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('productos.show', producto.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Ver
                                                            </Link>
                                                            <Link
                                                                href={route('productos.edit', producto.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(producto)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <p className="text-gray-500">No se encontraron productos.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación CON verificaciones */}
                        {safeProductos.data && safeProductos.data.length > 0 && safeProductos.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Mostrando{' '}
                                        <span className="font-medium">{safeProductos.from}</span> a{' '}
                                        <span className="font-medium">{safeProductos.to}</span> de{' '}
                                        <span className="font-medium">{safeProductos.total}</span> resultados
                                    </div>
                                    <div className="flex space-x-2">
                                        {safeProductos.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-500 text-white'
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