import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { 
    Search, Plus, Edit, Trash2, Eye, 
    Tag, Percent, Package, Filter, BarChart3, 
    TrendingUp, TrendingDown, MinusCircle
} from 'lucide-react';

export default function Index({ auth, categorias, filters, stats }) {
    const { flash = {} } = usePage().props;
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        per_page: filters?.per_page || 10,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('categorias.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            per_page: 10,
        });
        router.get(route('categorias.index'));
    };

    const handleDelete = (categoria) => {
        if (categoria.productos_count > 0) {
            alert('No se puede eliminar porque tiene productos asociados');
            return;
        }
        
        if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
            router.delete(route('categorias.destroy', categoria.id));
        }
    };

    // Función para formatear ITBIS
    const formatItbis = (tasa_itbis, itbis_porcentaje) => {
        const descripciones = {
            'ITBIS1': 'ITBIS 18%',
            'ITBIS2': 'ITBIS 16%',
            'ITBIS3': 'ITBIS 0%',
            'EXENTO': 'Exento',
        };
        
        const porcentaje = parseFloat(itbis_porcentaje || 0);
        const descripcion = descripciones[tasa_itbis] || 'ITBIS 18%';
        
        if (tasa_itbis === 'EXENTO') {
            return descripcion;
        }
        
        return `${descripcion} (${porcentaje.toFixed(2)}%)`;
    };

    // Función para obtener color de ITBIS
    const getItbisColor = (tasa_itbis) => {
        switch(tasa_itbis) {
            case 'ITBIS1': return 'bg-red-100 text-red-800';
            case 'ITBIS2': return 'bg-orange-100 text-orange-800';
            case 'ITBIS3': return 'bg-green-100 text-green-800';
            case 'EXENTO': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Verificar datos seguros
    const safeCategorias = categorias || { data: [], links: [], from: 0, to: 0, total: 0 };
    const safeStats = stats || { total: 0, con_productos: 0, itbis_18: 0, itbis_16: 0, itbis_0: 0, exento: 0 };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestión de Categorías
                    </h2>
                    <Link
                        href={route('categorias.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Categoría
                    </Link>
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Mensajes Flash */}
                    {flash.success && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Estadísticas Mejoradas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold">{safeStats.total}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Con Productos</p>
                                    <p className="text-2xl font-bold">{safeStats.con_productos}</p>
                                </div>
                                <Package className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">ITBIS 18%</p>
                                    <p className="text-2xl font-bold">{safeStats.itbis_18}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-red-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">ITBIS 16%</p>
                                    <p className="text-2xl font-bold">{safeStats.itbis_16 || 0}</p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">ITBIS 0%</p>
                                    <p className="text-2xl font-bold">{safeStats.itbis_0 || 0}</p>
                                </div>
                                <MinusCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Exento</p>
                                    <p className="text-2xl font-bold">{safeStats.exento || 0}</p>
                                </div>
                                <Percent className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Buscar por nombre, código o descripción..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex items-center">
                                    <Filter className="w-5 h-5 text-gray-400 mr-2" />
                                    <select
                                        value={data.per_page}
                                        onChange={(e) => setData('per_page', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition duration-200"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de categorías */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ITBIS
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Productos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Creada
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {safeCategorias.data && safeCategorias.data.length > 0 ? (
                                        safeCategorias.data.map((categoria) => (
                                            <tr 
                                                key={categoria.id} 
                                                className="hover:bg-gray-50 transition duration-150"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Tag className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {categoria.nombre || 'Sin nombre'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {categoria.descripcion || 'Sin descripción'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block border border-gray-200">
                                                        {categoria.codigo || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full inline-block w-fit ${getItbisColor(categoria.tasa_itbis)}`}>
                                                            {formatItbis(categoria.tasa_itbis, categoria.itbis_porcentaje)}
                                                        </span>
                                                        <div className="text-xs text-gray-500">
                                                            {categoria.tasa_itbis}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {categoria.productos_count || 0}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                productos
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(categoria.created_at).toLocaleDateString('es-ES')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(categoria.created_at).toLocaleTimeString('es-ES', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('categorias.show', categoria.id)}
                                                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('categorias.edit', categoria.id)}
                                                            className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition duration-200"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(categoria)}
                                                            className={`p-2 rounded-lg transition duration-200 ${
                                                                categoria.productos_count > 0
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            }`}
                                                            title={categoria.productos_count > 0 
                                                                ? 'No se puede eliminar (tiene productos)' 
                                                                : 'Eliminar'
                                                            }
                                                            disabled={categoria.productos_count > 0}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Tag className="w-12 h-12 text-gray-300 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No se encontraron categorías
                                                    </h3>
                                                    <p className="text-gray-500 mb-4">
                                                        {data.search 
                                                            ? `No hay resultados para "${data.search}"`
                                                            : 'Comienza creando tu primera categoría'
                                                        }
                                                    </p>
                                                    {!data.search && (
                                                        <Link
                                                            href={route('categorias.create')}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Crear Primera Categoría
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {safeCategorias.links && safeCategorias.links.length > 0 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">{safeCategorias.from || 0}</span> -{' '}
                                        <span className="font-medium">{safeCategorias.to || 0}</span> de{' '}
                                        <span className="font-medium">{safeCategorias.total || 0}</span> resultados
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {safeCategorias.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`min-w-[40px] px-3 py-2 text-center rounded-md transition duration-200 ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white font-medium'
                                                        : link.url
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
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