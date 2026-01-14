// resources/js/Pages/Categorias/Show.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Edit, Tag, Percent, Package, 
    DollarSign, BarChart3, Calendar, FileText 
} from 'lucide-react';

export default function Show({ auth, categoria, productos, estadisticas }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Tag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                {categoria.nombre}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Detalles de la categoría</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('categorias.edit', categoria.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                        <Link
                            href={route('categorias.index')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Categoría: ${categoria.nombre}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna izquierda - Información de la categoría */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tarjeta de información principal */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {categoria.nombre}
                                            </h3>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                    categoria.tasa_itbis === 'EXENTO'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {categoria.descripcion_itbis}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                                                    Código: {categoria.codigo}
                                                </span>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full flex items-center">
                                                    <Package className="w-3 h-3 mr-1" />
                                                    {categoria.productos_count} productos
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Categoría desde</p>
                                            <p className="text-lg font-semibold">
                                                {new Date(categoria.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                            Descripción
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {categoria.descripcion || 'No hay descripción disponible.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información de impuestos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-blue-700 mb-2">Configuración ITBIS</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-blue-600">Tasa:</span>
                                                    <span className="font-medium">{categoria.descripcion_itbis}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-blue-600">Porcentaje:</span>
                                                    <span className="font-medium">{categoria.itbis_formateado}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-blue-600">Aplicación:</span>
                                                    <span className="font-medium">
                                                        {categoria.tasa_itbis === 'EXENTO' ? 'Exento' : 'Aplicable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-green-700 mb-2">Información del Sistema</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-green-600">Creada:</span>
                                                    <span className="font-medium">
                                                        {new Date(categoria.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-green-600">Actualizada:</span>
                                                    <span className="font-medium">
                                                        {new Date(categoria.updated_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                                            <Package className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Productos</p>
                                            <p className="text-2xl font-bold">{estadisticas.total_productos || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                            <Package className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Productos Activos</p>
                                            <p className="text-2xl font-bold">{estadisticas.productos_activos || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                            <DollarSign className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Valor Inventario</p>
                                            <p className="text-2xl font-bold">
                                                ${parseFloat(estadisticas.valor_inventario || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos recientes */}
                            {productos && productos.length > 0 && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Productos Recientes</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Código
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Producto
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Precio Venta
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {productos.map((producto) => (
                                                    <tr key={producto.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-blue-600">
                                                                {producto.codigo}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                {producto.nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {producto.descripcion?.substring(0, 50)}...
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">
                                                            ${parseFloat(producto.precio_venta || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                producto.activo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {producto.activo ? 'ACTIVO' : 'INACTIVO'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Acciones y más información */}
                        <div className="space-y-6">
                            {/* Acciones rápidas */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Acciones
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/productos/crear?categoria_id=${categoria.id}`}
                                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Nuevo Producto
                                        </Link>
                                        <Link
                                            href={route('categorias.edit', categoria.id)}
                                            className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Editar Categoría
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (categoria.productos_count > 0) {
                                                    alert('No se puede eliminar porque tiene productos asociados');
                                                    return;
                                                }
                                                if (confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
                                                    router.delete(route('categorias.destroy', categoria.id));
                                                }
                                            }}
                                            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Eliminar Categoría
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de productos */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Resumen de Productos
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Total en categoría</p>
                                            <p className="text-2xl font-bold">{categoria.productos_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Valor promedio</p>
                                            <p className="text-xl font-medium text-green-600">
                                                ${parseFloat(estadisticas.valor_inventario / (estadisticas.total_productos || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información técnica */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Información Técnica
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">ID de Categoría</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {categoria.id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Código interno</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {categoria.codigo}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tasa ITBIS interna</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {categoria.tasa_itbis}
                                            </p>
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