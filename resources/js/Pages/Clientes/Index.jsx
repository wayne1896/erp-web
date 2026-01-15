import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Search, Plus, Edit, Trash2, Eye, 
    UserCheck, UserX, DollarSign, Users,
    Filter, Download, RefreshCw, ChevronRight,
    Calendar, CreditCard, Mail, Phone,
    TrendingUp, BarChart3, ShieldCheck,
    Building2, UserCircle, FileText
} from 'lucide-react';

export default function Index({ auth, clientes, filters, stats }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        per_page: filters.per_page || 10,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('clientes.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            per_page: 10,
        });
        router.get(route('clientes.index'));
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    // Formatear RNC
    const formatRNC = (rnc) => {
        if (!rnc || rnc.length !== 9) return rnc || '';
        return `${rnc.substring(0, 1)}-${rnc.substring(1, 3)}-${rnc.substring(3, 8)}-${rnc.substring(8, 9)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3.5 rounded-xl shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Gestión de Clientes
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Administra los clientes de tu empresa
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('clientes.create')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Cliente
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Clientes" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Total Clientes</p>
                                    <p className="text-3xl font-bold text-white">{stats.total || 0}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Gestión centralizada
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Clientes Activos</p>
                                    <p className="text-3xl font-bold text-white">{stats.activos || 0}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <UserCheck className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    {((stats.activos / stats.total) * 100 || 0).toFixed(1)}% activos
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Con Crédito</p>
                                    <p className="text-3xl font-bold text-white">{stats.con_credito || 0}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <BarChart3 className="w-3 h-3 mr-1" />
                                    Límite de crédito activo
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/90 mb-1">Ventas 30 días</p>
                                    <p className="text-3xl font-bold text-white">{stats.ventas_30dias || 0}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-white/80">
                                <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Transacciones recientes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de herramientas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 w-full lg:w-auto">
                                    <form onSubmit={handleSearch} className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={data.search}
                                                onChange={(e) => setData('search', e.target.value)}
                                                placeholder="Buscar cliente por nombre, RNC, cédula o email..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Buscar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Limpiar
                                        </button>
                                    </form>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <select
                                            value={data.per_page}
                                            onChange={(e) => {
                                                setData('per_page', e.target.value);
                                                get(route('clientes.index', { per_page: e.target.value }), {
                                                    preserveState: true,
                                                });
                                            }}
                                            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="10">10 por página</option>
                                            <option value="25">25 por página</option>
                                            <option value="50">50 por página</option>
                                            <option value="100">100 por página</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 -rotate-90 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => {}}
                                        className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de clientes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    Listado de Clientes
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {clientes.from}-{clientes.to} de {clientes.total} clientes
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Documento
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Crédito
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {clientes.data.length > 0 ? (
                                        clientes.data.map((cliente) => (
                                            <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                                            cliente.tipo_cliente === 'NATURAL'
                                                                ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
                                                                : 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
                                                        }`}>
                                                            {cliente.tipo_cliente === 'NATURAL' ? (
                                                                <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            ) : (
                                                                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {cliente.nombre_completo}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                    {cliente.codigo}
                                                                </span>
                                                                <span className="ml-2">
                                                                    {cliente.tipo_cliente === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {cliente.cedula_rnc?.length === 9 ? formatRNC(cliente.cedula_rnc) : cliente.cedula_rnc}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        {cliente.cedula_rnc?.length === 9 ? 'RNC' : 
                                                         cliente.cedula_rnc?.length === 11 ? 'Cédula' : 'Documento'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {cliente.email && (
                                                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                                <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                                                {cliente.email}
                                                            </div>
                                                        )}
                                                        {cliente.telefono && (
                                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                                {cliente.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(cliente.limite_credito)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {cliente.dias_credito > 0 ? (
                                                            <span className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {cliente.dias_credito} días
                                                            </span>
                                                        ) : 'Al contado'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        cliente.activo
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                    }`}>
                                                        {cliente.activo ? (
                                                            <>
                                                                <UserCheck className="w-3 h-3 mr-1" />
                                                                Activo
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserX className="w-3 h-3 mr-1" />
                                                                Inactivo
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('clientes.show', cliente.id)}
                                                            className="inline-flex items-center p-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('clientes.edit', cliente.id)}
                                                            className="inline-flex items-center p-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-200"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('¿Estás seguro de eliminar este cliente?')) {
                                                                    router.delete(route('clientes.destroy', cliente.id));
                                                                }
                                                            }}
                                                            className="inline-flex items-center p-1.5 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 rounded-lg hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-200"
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
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="max-w-sm mx-auto">
                                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                        No se encontraron clientes
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                        {data.search ? 'Intenta con otros términos de búsqueda.' : 'Comienza agregando tu primer cliente.'}
                                                    </p>
                                                    {!data.search && (
                                                        <Link
                                                            href={route('clientes.create')}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Agregar primer cliente
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
                        {clientes.links && clientes.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando <span className="font-medium">{clientes.from}</span> a{' '}
                                        <span className="font-medium">{clientes.to}</span> de{' '}
                                        <span className="font-medium">{clientes.total}</span> resultados
                                    </div>
                                    <nav className="flex space-x-1">
                                        {clientes.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}