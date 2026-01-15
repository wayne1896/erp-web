import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    FileText, 
    DollarSign, 
    Calendar, 
    CreditCard, 
    ShoppingBag,
    Tag, 
    Building, 
    Percent, 
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Download,
    Printer,
    Activity,
    BarChart3,
    Eye
} from 'lucide-react';

export default function Show({ auth, cliente, ventas_recientes, estadisticas }) {
    // Formateador de moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    // Formateador de fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Porcentaje de uso del crédito
    const porcentajeCredito = cliente.limite_credito > 0 
        ? Math.min(((cliente.saldo_pendiente || 0) / cliente.limite_credito) * 100, 100)
        : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3.5 rounded-xl shadow-lg">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                {cliente.codigo?.slice(-3) || '001'}
                            </div>
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                {cliente.nombre_completo}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    cliente.activo 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                    {cliente.activo ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Activo
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Inactivo
                                        </>
                                    )}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    cliente.tipo_cliente === 'NATURAL' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                }`}>
                                    {cliente.tipo_cliente === 'NATURAL' ? (
                                        <User className="w-3 h-3 mr-1" />
                                    ) : (
                                        <Building className="w-3 h-3 mr-1" />
                                    )}
                                    {cliente.tipo_cliente === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}
                                </span>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Cliente desde {formatDate(cliente.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </button>
                        <Link
                            href={route('clientes.edit', cliente.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                        <Link
                            href={route('clientes.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Cliente: ${cliente.nombre_completo}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Estadísticas del cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Total en Ventas</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(estadisticas?.monto_total || 0)}
                                        </p>
                                    </div>
                                    <ShoppingBag className="w-10 h-10 text-blue-200" />
                                </div>
                                <div className="mt-4 text-sm text-blue-200 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span>{estadisticas?.total_ventas || 0} transacciones</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium mb-1">Saldo Pendiente</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(estadisticas?.saldo_actual || 0)}
                                        </p>
                                    </div>
                                    <CreditCard className="w-10 h-10 text-green-200" />
                                </div>
                                <div className="mt-4 text-sm text-green-200">
                                    <span>Por vencer: {formatCurrency(estadisticas?.saldo_vencido || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium mb-1">Ticket Promedio</p>
                                        <p className="text-2xl font-bold text-white">
                                            {estadisticas?.total_ventas > 0 
                                                ? formatCurrency((estadisticas?.monto_total || 0) / (estadisticas?.total_ventas || 1))
                                                : formatCurrency(0)
                                            }
                                        </p>
                                    </div>
                                    <BarChart3 className="w-10 h-10 text-purple-200" />
                                </div>
                                <div className="mt-4 text-sm text-purple-200">
                                    <span>Valor promedio por compra</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-medium mb-1">Última Compra</p>
                                        <p className="text-2xl font-bold text-white">
                                            {ventas_recientes?.[0] 
                                                ? formatCurrency(ventas_recientes[0].total)
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <Calendar className="w-10 h-10 text-yellow-200" />
                                </div>
                                <div className="mt-4 text-sm text-yellow-200">
                                    <span>{ventas_recientes?.[0] ? formatDate(ventas_recientes[0].created_at) : 'Sin compras'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna izquierda - Información del cliente */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información principal */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Información del Cliente
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha registro</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(cliente.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Código de Cliente</p>
                                            <div className="flex items-center">
                                                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                <p className="font-mono font-bold text-gray-900 dark:text-white">
                                                    {cliente.codigo}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Documento de Identidad</p>
                                            <div className="flex items-center">
                                                <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cliente.cedula_rnc}
                                                </p>
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                    ({cliente.tipo_contribuyente === 'CONSUMIDOR_FINAL' ? 'CF' : 'CF/CF'})
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico</p>
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cliente.email || 'No especificado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono Principal</p>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cliente.telefono || 'No especificado'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono Alternativo</p>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cliente.telefono_alternativo || 'No especificado'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dirección Completa</p>
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mr-2 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {cliente.direccion || 'No especificado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de ubicación */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Información de Ubicación
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Provincia</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {cliente.provincia}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Municipio</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {cliente.municipio}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sector/Barrio</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {cliente.sector}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ventas recientes */}
                            {ventas_recientes && ventas_recientes.length > 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                                            <ShoppingBag className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Ventas Recientes ({ventas_recientes.length})
                                        </h3>
                                        <Link
                                            href={`/ventas?cliente_id=${cliente.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                        >
                                            Ver todas →
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Factura
                                                    </th>
                                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Fecha
                                                    </th>
                                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {ventas_recientes.map((venta) => (
                                                    <tr 
                                                        key={venta.id} 
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                                    >
                                                        <td className="py-4 px-6">
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                #{venta.numero_factura || `V-${venta.id}`}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                NCF: {venta.ncf || 'N/A'}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center text-sm">
                                                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-gray-900 dark:text-white">
                                                                        {formatDate(venta.created_at).split(',')[0]}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatDate(venta.created_at).split(',')[1]}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(venta.total)}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                venta.estado?.toUpperCase() === 'PROCESADA'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : venta.estado?.toUpperCase() === 'PENDIENTE'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                                {venta.estado?.toUpperCase() === 'PROCESADA' && (
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                )}
                                                                {venta.estado?.toUpperCase() === 'PENDIENTE' && (
                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                )}
                                                                {venta.estado?.toUpperCase() === 'ANULADA' && (
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                )}
                                                                {venta.estado || 'PROCESADA'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <Link
                                                                href={route('ventas.show', venta.id)}
                                                                className="inline-flex items-center p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Sin historial de ventas
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Este cliente aún no ha realizado ninguna compra.
                                    </p>
                                    <Link
                                        href={`/ventas/create?cliente_id=${cliente.id}`}
                                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Crear primera venta
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Información adicional */}
                        <div className="space-y-6">
                            {/* Información de crédito */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                    Información de Crédito
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <DollarSign className="w-4 h-4 mr-1" />
                                                Límite de Crédito
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(cliente.limite_credito || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Días de Crédito
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cliente.dias_credito || 0} días
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <Percent className="w-4 h-4 mr-1" />
                                                Descuento Especial
                                            </span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {parseFloat(cliente.descuento || 0).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>

                                    {cliente.limite_credito > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="mb-2 flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Saldo Utilizado</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(cliente.saldo_pendiente || 0)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        porcentajeCredito < 70 ? 'bg-green-500' :
                                                        porcentajeCredito < 90 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${porcentajeCredito}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-2 flex justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {porcentajeCredito.toFixed(1)}% utilizado
                                                </span>
                                                <span className={`font-medium ${
                                                    porcentajeCredito < 70 ? 'text-green-600 dark:text-green-400' :
                                                    porcentajeCredito < 90 ? 'text-yellow-600 dark:text-yellow-400' : 
                                                    'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {porcentajeCredito < 70 ? 'Bajo uso' :
                                                     porcentajeCredito < 90 ? 'Uso moderado' : 'Alto uso'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información del sistema */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                    Información del Sistema
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha de creación</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(cliente.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Última actualización</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(cliente.updated_at)}
                                        </p>
                                    </div>
                                    {cliente.deleted_at && (
                                        <div>
                                            <p className="text-sm text-red-500 dark:text-red-400 mb-1">Fecha de eliminación</p>
                                            <p className="font-medium text-red-600 dark:text-red-400">
                                                {formatDate(cliente.deleted_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                    Acciones Rápidas
                                </h3>
                                
                                <div className="space-y-3">
                                    <Link
                                        href={`/ventas/create?cliente_id=${cliente.id}`}
                                        className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Nueva Venta
                                    </Link>
                                    <Link
                                        href={route('clientes.edit', cliente.id)}
                                        className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar Cliente
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Está seguro de eliminar este cliente?\n\nEsta acción no se puede deshacer y podría afectar el historial de ventas relacionadas.')) {
                                                router.delete(route('clientes.destroy', cliente.id));
                                            }
                                        }}
                                        className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Eliminar Cliente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}