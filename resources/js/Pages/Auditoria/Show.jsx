import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Eye, 
    FileText, 
    DollarSign, 
    Calendar, 
    User, 
    Building, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Clock,
    Download,
    Printer,
    Share,
    TrendingUp,
    TrendingDown,
    Info,
    Shield,
    Activity
} from 'lucide-react';

export default function AuditoriaShow({ auditoria }) {
    const [showDetails, setShowDetails] = useState(true);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(amount);
    };

    const getEstadoBadge = (estado) => {
        const styles = {
            'completada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'con_discrepancias': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'pendiente': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'rechazada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };

        const icons = {
            'completada': <CheckCircle className="w-4 h-4" />,
            'con_discrepancias': <AlertTriangle className="w-4 h-4" />,
            'pendiente': <Clock className="w-4 h-4" />,
            'rechazada': <XCircle className="w-4 h-4" />
        };

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
                {icons[estado]}
                <span className="ml-1">{estado?.toUpperCase()}</span>
            </div>
        );
    };

    const getResultadoBadge = (resultado) => {
        const styles = {
            'ok': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'advertencia': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'fraude': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };

        const icons = {
            'ok': <CheckCircle className="w-4 h-4" />,
            'advertencia': <AlertTriangle className="w-4 h-4" />,
            'error': <XCircle className="w-4 h-4" />,
            'fraude': <Shield className="w-4 h-4" />
        };

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[resultado] || 'bg-gray-100 text-gray-800'}`}>
                {icons[resultado]}
                <span className="ml-1">{resultado?.toUpperCase()}</span>
            </div>
        );
    };

    const getTipoBadge = (tipo) => {
        const styles = {
            'automatica': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'manual': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'programada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[tipo] || 'bg-gray-100 text-gray-800'}`}>
                {tipo?.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('auditoria.index')}
                            className="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Volver
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                    Detalle de Auditoría
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Auditoría #{auditoria.id}
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
            <Head title={`Auditoría #${auditoria.id}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Información Principal */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ID de Auditoría</h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{auditoria.id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Fecha de Auditoría</h3>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {formatDate(auditoria.fecha_auditoria)}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tipo</h3>
                                <div>{getTipoBadge(auditoria.tipo_auditoria)}</div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Estado</h3>
                                <div>{getEstadoBadge(auditoria.estado)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Información de la Caja */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Información de la Caja
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Caja ID</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">#{auditoria.caja?.id}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sucursal</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {auditoria.caja?.sucursal?.nombre || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Responsable</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {auditoria.caja?.usuario?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Apertura</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {auditoria.caja?.fecha_apertura ? formatDate(auditoria.caja.fecha_apertura) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cierre</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {auditoria.caja?.fecha_cierre ? formatDate(auditoria.caja.fecha_cierre) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monto Inicial</h4>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(auditoria.caja?.monto_inicial || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resultados de la Auditoría */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                            Resultados de la Auditoría
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monto Esperado</h4>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(auditoria.monto_esperado || 0)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monto Real</h4>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(auditoria.monto_real || 0)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Diferencia</h4>
                                <p className={`text-2xl font-bold ${auditoria.diferencia_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(auditoria.diferencia_total || 0)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Resultado</h4>
                                <div>{getResultadoBadge(auditoria.resultado)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {auditoria.observaciones && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-600" />
                                Observaciones
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                {auditoria.observaciones}
                            </p>
                        </div>
                    )}

                    {/* Detalles de Validación */}
                    {auditoria.detalles && auditoria.detalles.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Eye className="w-5 h-5 mr-2 text-purple-600" />
                                    Detalles de Validación
                                </h3>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                                >
                                    {showDetails ? 'Ocultar' : 'Mostrar'} detalles
                                </button>
                            </div>
                            
                            {showDetails && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Movimiento</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tipo</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Monto</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Validado</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {auditoria.detalles.map((detalle, index) => (
                                                <tr key={detalle.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            #{detalle.movimiento?.id || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {detalle.movimiento?.created_at ? formatDate(detalle.movimiento.created_at) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            detalle.movimiento?.tipo === 'ingreso' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                            {detalle.movimiento?.tipo?.toUpperCase() || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(detalle.movimiento?.monto || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {detalle.validado ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600" />
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                            {detalle.observaciones || '-'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Información de Revisión */}
                    {auditoria.revisadoPor && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-indigo-600" />
                                Información de Revisión
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Revisado por</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {auditoria.revisadoPor?.name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Revisión</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {auditoria.fecha_revision ? formatDate(auditoria.fecha_revision) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
