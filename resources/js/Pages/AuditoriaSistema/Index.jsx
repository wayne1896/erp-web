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
    RefreshCw,
    Monitor,
    Activity,
    Calendar,
    User,
    Globe,
    Trash2,
    Settings,
    ShoppingCart,
    Package,
    DollarSign,
    Plus,
    Edit,
    LogIn,
    LogOut
} from 'lucide-react';

export default function AuditoriaSistemaIndex({ 
    actividades, 
    estadisticas, 
    usuarios, 
    modulos, 
    acciones, 
    niveles, 
    resultados,
    filters 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNivelBadge = (nivel) => {
        const styles = {
            'info': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'warning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'critical': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'debug': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[nivel] || 'bg-gray-100 text-gray-800'}`}>
                {nivel?.toUpperCase()}
            </span>
        );
    };

    const getResultBadge = (resultado) => {
        const icons = {
            'success': <CheckCircle className="w-4 h-4 text-green-600" />,
            'error': <XCircle className="w-4 h-4 text-red-600" />,
            'warning': <AlertTriangle className="w-4 h-4 text-yellow-600" />
        };

        return icons[resultado] || <Clock className="w-4 h-4 text-gray-600" />;
    };

    const getModuloIcon = (modulo) => {
        const icons = {
            'ventas': <ShoppingCart className="w-4 h-4" />,
            'pedidos': <FileText className="w-4 h-4" />,
            'productos': <Package className="w-4 h-4" />,
            'clientes': <User className="w-4 h-4" />,
            'caja': <DollarSign className="w-4 h-4" />,
            'auditoria': <Activity className="w-4 h-4" />,
            'sistema': <Monitor className="w-4 h-4" />,
            'configuracion': <Settings className="w-4 h-4" />
        };

        return icons[modulo] || <Globe className="w-4 h-4" />;
    };

    const getAccionIcon = (accion) => {
        const icons = {
            'crear': <Plus className="w-4 h-4" />,
            'actualizar': <Edit className="w-4 h-4" />,
            'eliminar': <Trash2 className="w-4 h-4" />,
            'ver': <Eye className="w-4 h-4" />,
            'login': <LogIn className="w-4 h-4" />,
            'logout': <LogOut className="w-4 h-4" />,
            'error': <AlertTriangle className="w-4 h-4" />
        };

        return icons[accion] || <Activity className="w-4 h-4" />;
    };

    const filteredActividades = actividades?.data?.filter(actividad => 
        actividad.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actividad.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actividad.controlador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actividad.modulo?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <Monitor className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                Auditoría del Sistema
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Registro completo de actividades del sistema
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('auditoria-sistema.dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Auditoría del Sistema" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Actividades</p>
                                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                        {estadisticas.total_actividades || 0}
                                    </p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 dark:text-green-400">Usuarios Activos</p>
                                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                        {estadisticas.actividades_unicas || 0}
                                    </p>
                                </div>
                                <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 dark:text-red-400">Errores</p>
                                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                                        {estadisticas.errores || 0}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Críticos</p>
                                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                        {estadisticas.errores_criticos || 0}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por usuario, descripción, controlador..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todos los usuarios</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>{usuario.name}</option>
                                        ))}
                                    </select>
                                    
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todos los módulos</option>
                                        {modulos.map(modulo => (
                                            <option key={modulo} value={modulo}>{modulo}</option>
                                        ))}
                                    </select>
                                    
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todas las acciones</option>
                                        {acciones.map(accion => (
                                            <option key={accion} value={accion}>{accion}</option>
                                        ))}
                                    </select>
                                    
                                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                                        <option value="">Todos los niveles</option>
                                        {niveles.map(nivel => (
                                            <option key={nivel} value={nivel}>{nivel}</option>
                                        ))}
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

                    {/* Tabla de actividades */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fecha</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Usuario</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Módulo</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acción</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Descripción</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">IP</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Nivel</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Resultado</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredActividades.length > 0 ? (
                                        filteredActividades.map((actividad) => (
                                            <tr key={actividad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                        {formatDate(actividad.created_at)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-2">
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                                {actividad.usuario?.name?.charAt(0)?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {actividad.usuario?.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                                                            {getModuloIcon(actividad.modulo)}
                                                        </div>
                                                        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                                                            {actividad.modulo}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center mr-2">
                                                            {getAccionIcon(actividad.accion)}
                                                        </div>
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                                            {actividad.accion}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                            {actividad.descripcion}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {actividad.ip_address}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getNivelBadge(actividad.nivel_importancia)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getResultBadge(actividad.resultado)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('auditoria-sistema.show', actividad.id)}
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
                                            <td colSpan="9" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron actividades
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    {actividades?.links && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Mostrando {actividades.data?.length || 0} de {actividades.total || 0} resultados
                                </div>
                                <div className="flex space-x-2">
                                    {actividades.links?.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
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
