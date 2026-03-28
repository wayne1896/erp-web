import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Eye, 
    AlertTriangle, 
    CheckCircle, 
    XCircle, 
    Clock,
    FileText,
    Download,
    RefreshCw
} from 'lucide-react';

export default function AuditoriaIndex({ auditorias, filters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadge = (estado) => {
        const styles = {
            'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'en_proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'completada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'con_discrepancias': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'rechazada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
                {estado?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getResultBadge = (resultado) => {
        const icons = {
            'ok': <CheckCircle className="w-4 h-4 text-green-600" />,
            'advertencia': <AlertTriangle className="w-4 h-4 text-yellow-600" />,
            'error': <XCircle className="w-4 h-4 text-red-600" />,
            'fraude': <AlertTriangle className="w-4 h-4 text-purple-600" />
        };

        return icons[resultado] || <Clock className="w-4 h-4 text-gray-600" />;
    };

    const getGravedadColor = (gravedad) => {
        const colors = {
            'baja': 'text-green-600',
            'media': 'text-yellow-600',
            'alta': 'text-orange-600',
            'critica': 'text-red-600'
        };

        return colors[gravedad] || 'text-gray-600';
    };

    const filteredAuditorias = auditorias?.data?.filter(auditoria => 
        auditoria.caja?.id?.toString().includes(searchTerm) ||
        auditoria.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.tipo_auditoria?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Auditoría de Cajas
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Control y validación financiera
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('auditoria.create')}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Nueva Auditoría
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Auditoría de Cajas" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filtros y búsqueda */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por caja, usuario o tipo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </button>
                        </div>

                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todos los estados</option>
                                        <option value="completada">Completada</option>
                                        <option value="con_discrepancias">Con discrepancias</option>
                                        <option value="pendiente">Pendiente</option>
                                    </select>
                                    
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todos los resultados</option>
                                        <option value="ok">OK</option>
                                        <option value="advertencia">Advertencia</option>
                                        <option value="error">Error</option>
                                        <option value="fraude">Fraude</option>
                                    </select>
                                    
                                    <input
                                        type="date"
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                                    />
                                    
                                    <input
                                        type="date"
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 dark:text-green-400">Completadas</p>
                                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                        {auditorias?.data?.filter(a => a.estado === 'completada').length || 0}
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">Con Discrepancias</p>
                                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                                        {auditorias?.data?.filter(a => a.estado === 'con_discrepancias').length || 0}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 dark:text-red-400">Críticas</p>
                                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                                        {auditorias?.data?.filter(a => a.resultado === 'fraude').length || 0}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                        {auditorias?.data?.length || 0}
                                    </p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Tabla de auditorías */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Caja</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tipo</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Usuario</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fecha</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Diferencia</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Estado</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Resultado</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAuditorias.length > 0 ? (
                                        filteredAuditorias.map((auditoria) => (
                                            <tr key={auditoria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        #{auditoria.caja?.id}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {auditoria.caja?.sucursal?.nombre}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                                                        {auditoria.tipo_auditoria}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {auditoria.usuario?.name}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                        {formatDate(auditoria.fecha_auditoria)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className={`font-medium ${auditoria.diferencia_total < 0 ? 'text-red-600' : auditoria.diferencia_total > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                        {formatCurrency(auditoria.diferencia_total)}
                                                    </div>
                                                    {auditoria.diferencia_total !== 0 && (
                                                        <div className={`text-xs ${getGravedadColor(auditoria.gravedad)}`}>
                                                            {auditoria.gravedad}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getEstadoBadge(auditoria.estado)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getResultBadge(auditoria.resultado)}
                                                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                                                            {auditoria.resultado}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('auditoria.show', auditoria.id)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron auditorías
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    {auditorias?.links && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Mostrando {auditorias.data?.length || 0} de {auditorias.total || 0} resultados
                                </div>
                                <div className="flex space-x-2">
                                    {auditorias.links?.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                link.active
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
