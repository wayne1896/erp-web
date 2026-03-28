import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Eye, 
    Monitor, 
    Calendar, 
    User, 
    Globe, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Clock,
    Download,
    Printer,
    Share,
    Activity,
    Info,
    Shield,
    Smartphone,
    Server,
    Database,
    Code,
    MapPin,
    Fingerprint,
    Hash,
    Settings,
    Bug,
    ShoppingCart,
    Package,
    DollarSign,
    Plus,
    Edit,
    Trash2,
    LogIn,
    LogOut,
    FileText,
    Building
} from 'lucide-react';

export default function AuditoriaSistemaShow({ actividad }) {
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
    const [showDataChanges, setShowDataChanges] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
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

        const icons = {
            'info': <Info className="w-4 h-4" />,
            'warning': <AlertTriangle className="w-4 h-4" />,
            'error': <XCircle className="w-4 h-4" />,
            'critical': <Shield className="w-4 h-4" />,
            'debug': <Bug className="w-4 h-4" />
        };

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[nivel] || 'bg-gray-100 text-gray-800'}`}>
                {icons[nivel]}
                <span className="ml-1">{nivel?.toUpperCase()}</span>
            </div>
        );
    };

    const getResultBadge = (resultado) => {
        const styles = {
            'success': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'warning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };

        const icons = {
            'success': <CheckCircle className="w-4 h-4" />,
            'error': <XCircle className="w-4 h-4" />,
            'warning': <AlertTriangle className="w-4 h-4" />
        };

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[resultado] || 'bg-gray-100 text-gray-800'}`}>
                {icons[resultado]}
                <span className="ml-1">{resultado?.toUpperCase()}</span>
            </div>
        );
    };

    const getModuloIcon = (modulo) => {
        const icons = {
            'ventas': <ShoppingCart className="w-5 h-5" />,
            'pedidos': <FileText className="w-5 h-5" />,
            'productos': <Package className="w-5 h-5" />,
            'clientes': <User className="w-5 h-5" />,
            'proveedores': <Building className="w-5 h-5" />,
            'caja': <DollarSign className="w-5 h-5" />,
            'auditoria': <Activity className="w-5 h-5" />,
            'sistema': <Monitor className="w-5 h-5" />,
            'configuracion': <Settings className="w-5 h-5" />
        };

        return icons[modulo] || <Globe className="w-5 h-5" />;
    };

    const getAccionIcon = (accion) => {
        const icons = {
            'crear': <Plus className="w-5 h-5" />,
            'actualizar': <Edit className="w-5 h-5" />,
            'eliminar': <Trash2 className="w-5 h-5" />,
            'ver': <Eye className="w-5 h-5" />,
            'login': <LogIn className="w-5 h-5" />,
            'logout': <LogOut className="w-5 h-5" />,
            'error': <AlertTriangle className="w-5 h-5" />
        };

        return icons[accion] || <Activity className="w-5 h-5" />;
    };

    const formatJsonData = (data) => {
        if (!data) return 'N/A';
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return 'Datos no válidos';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('auditoria-sistema.index')}
                            className="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Volver
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                                <Monitor className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                    Detalle de Actividad
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Actividad #{actividad.id}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Actividad #${actividad.id}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Información Principal */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ID de Actividad</h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{actividad.id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Fecha y Hora</h3>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {formatDate(actividad.created_at)}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nivel</h3>
                                <div>{getNivelBadge(actividad.nivel_importancia)}</div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Resultado</h3>
                                <div>{getResultBadge(actividad.resultado)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Usuario y Acción */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            Información de la Actividad
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Usuario</h4>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-2">
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            {actividad.usuario?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {actividad.usuario?.name || 'Sistema'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Módulo</h4>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                                        {getModuloIcon(actividad.modulo)}
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                        {actividad.modulo}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Acción</h4>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center mr-2">
                                        {getAccionIcon(actividad.accion)}
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {actividad.accion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-green-600" />
                            Descripción
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            {actividad.descripcion}
                        </p>
                    </div>

                    {/* Detalles Técnicos */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Server className="w-5 h-5 mr-2 text-purple-600" />
                                Detalles Técnicos
                            </h3>
                            <button
                                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                            >
                                {showTechnicalDetails ? 'Ocultar' : 'Mostrar'} detalles técnicos
                            </button>
                        </div>
                        
                        {showTechnicalDetails && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Globe className="w-4 h-4 mr-1" />
                                        IP Address
                                    </h4>
                                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {actividad.ip_address || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Smartphone className="w-4 h-4 mr-1" />
                                        User Agent
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                                        {actividad.user_agent || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Fingerprint className="w-4 h-4 mr-1" />
                                        Session ID
                                    </h4>
                                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                                        {actividad.session_id || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Hash className="w-4 h-4 mr-1" />
                                        Método HTTP
                                    </h4>
                                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {actividad.metodo_http || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        URL
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                                        {actividad.url || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Code className="w-4 h-4 mr-1" />
                                        Controlador
                                    </h4>
                                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {actividad.controlador || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Database className="w-4 h-4 mr-1" />
                                        Entidad
                                    </h4>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {actividad.entidad_type ? 
                                            `${actividad.entidad_type} #${actividad.entidad_id}` : 
                                            'N/A'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Línea de Código
                                    </h4>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {actividad.linea_codigo || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cambios de Datos */}
                    {(actividad.datos_anteriores || actividad.datos_nuevos) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-orange-600" />
                                    Cambios de Datos
                                </h3>
                                <button
                                    onClick={() => setShowDataChanges(!showDataChanges)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                                >
                                    {showDataChanges ? 'Ocultar' : 'Mostrar'} cambios
                                </button>
                            </div>
                            
                            {showDataChanges && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Datos Anteriores</h4>
                                        <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                                            {formatJsonData(actividad.datos_anteriores)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Datos Nuevos</h4>
                                        <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                                            {formatJsonData(actividad.datos_nuevos)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Métricas de Rendimiento */}
                    {(actividad.tiempo_ejecucion || actividad.memoria_usada) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-green-600" />
                                Métricas de Rendimiento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tiempo de Ejecución</h4>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {actividad.tiempo_formateado || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Memoria Usada</h4>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {actividad.memoria_formateada || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalles Adicionales */}
                    {actividad.detalles_adicionales && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-indigo-600" />
                                Detalles Adicionales
                            </h3>
                            <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                                {formatJsonData(actividad.detalles_adicionales)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
