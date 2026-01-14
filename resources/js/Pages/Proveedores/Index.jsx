// resources/js/Pages/Proveedores/Index.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Search, Plus, Edit, Trash2, Eye, 
    Building, Globe, Phone, Mail, CreditCard, Truck
} from 'lucide-react';

export default function Index({ auth, proveedores, filters, stats }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: filters.per_page || 10,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('proveedores.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            per_page: 10,
        });
        router.get(route('proveedores.index'));
    };

    const formatRNC = (rnc) => {
        if (!rnc || rnc.length !== 9) return rnc;
        return `${rnc.substring(0, 1)}-${rnc.substring(1, 3)}-${rnc.substring(3, 8)}-${rnc.substring(8, 9)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Gestión de Proveedores
                    </h2>
                    <Link
                        href={route('proveedores.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Proveedor
                    </Link>
                </div>
            }
        >
            <Head title="Proveedores" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                                    <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Proveedores</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                                    <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Proveedores Activos</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mr-4">
                                    <Building className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Proveedores Locales</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.locales}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                                    <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Proveedores Internacionales</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.internacionales}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Buscar por nombre, código, RNC o email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Buscar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de proveedores */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Crédito
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {proveedores.data.length > 0 ? (
                                        proveedores.data.map((proveedor) => (
                                            <tr key={proveedor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                                            proveedor.tipo_proveedor === 'LOCAL' 
                                                                ? 'bg-blue-100 dark:bg-blue-900' 
                                                                : 'bg-purple-100 dark:bg-purple-900'
                                                        }`}>
                                                            {proveedor.tipo_proveedor === 'LOCAL' ? (
                                                                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            ) : (
                                                                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {proveedor.nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {proveedor.codigo} • {proveedor.tipo_proveedor === 'LOCAL' ? 'Local' : 'Internacional'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {proveedor.rnc ? formatRNC(proveedor.rnc) : 'Sin RNC'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        {proveedor.telefono}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {proveedor.email || 'Sin email'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        ${parseFloat(proveedor.limite_credito).toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {proveedor.dias_credito} días
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            proveedor.activo 
                                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                        }`}>
                                                            {proveedor.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {proveedor.productos_count} productos
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('proveedores.show', proveedor.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('proveedores.edit', proveedor.id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (proveedor.productos_count > 0) {
                                                                    alert('No se puede eliminar porque tiene productos asociados');
                                                                    return;
                                                                }
                                                                if (confirm('¿Estás seguro de eliminar este proveedor?')) {
                                                                    router.delete(route('proveedores.destroy', proveedor.id));
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron proveedores
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {proveedores.links && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando <span className="font-medium">{proveedores.from}</span> a{' '}
                                        <span className="font-medium">{proveedores.to}</span> de{' '}
                                        <span className="font-medium">{proveedores.total}</span> resultados
                                    </div>
                                    <div className="flex space-x-2">
                                        {proveedores.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-3 py-1 rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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