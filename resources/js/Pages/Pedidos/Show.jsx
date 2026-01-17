import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft,
    Printer,
    Download,
    Edit,
    Trash2,
    Package,
    PackageCheck,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    MapPin,
    Truck,
    DollarSign,
    Percent,
    FileText,
    CreditCard,
    Phone,
    Mail,
    Home,
    Building,
    Tag,
    Layers,
    BarChart,
    Info,
    MoreVertical,
    Share2,
    Copy,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    History,
    RefreshCw,
    ThumbsUp,
    AlertCircle,
    ShoppingBag,
    Receipt,
    PackageX,
    CheckSquare,
    XSquare,
    Send,
    MessageCircle,
    Plus
} from 'lucide-react';

const convertirAVenta = (pedidoId) => {
    if (confirm('¿Está seguro de generar la factura para este pedido?\n\nEsta acción creará una venta/factura y actualizará el inventario. No se podrá deshacer.')) {
        router.post(route('pedidos.convertir-venta', pedidoId), {}, {
            onStart: () => {
                console.log('Generando factura...');
            },
            onSuccess: (page) => {
                console.log('Factura generada exitosamente');
                alert('¡Factura generada exitosamente! Redirigiendo a la venta...');
            },
            onError: (errors) => {
                console.error('Error al generar factura:', errors);
                alert('Error al generar factura: ' + (errors.error || errors.message || 'Error desconocido'));
            }
        });
    }
};

export default function PedidosShow({ pedido, productos, canEdit = true, canDelete = true }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        productos: true,
        direccion: false,
        pagos: false,
        historial: false
    });

    // Formateadores
    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Estado badge
    const getStatusBadge = (estado) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
        
        switch(estado?.toUpperCase()) {
            case 'PROCESADO':
            case 'APROBADO':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>
                        <PackageCheck className="w-4 h-4 mr-2" />
                        {estado}
                    </span>
                );
            case 'ENTREGADO':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {estado}
                    </span>
                );
            case 'PENDIENTE':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>
                        <Clock className="w-4 h-4 mr-2" />
                        {estado}
                    </span>
                );
            case 'CANCELADO':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
                        <XCircle className="w-4 h-4 mr-2" />
                        {estado}
                    </span>
                );
            case 'FACTURADO':
                return (
                    <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`}>
                        <Receipt className="w-4 h-4 mr-2" />
                        {estado}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        {estado || 'N/A'}
                    </span>
                );
        }
    };

    // Prioridad badge
    const getPriorityBadge = (prioridad) => {
        const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
        
        switch(prioridad?.toUpperCase()) {
            case 'URGENTE':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'ALTA':
                return (
                    <span className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'MEDIA':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>
                        <Layers className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            case 'BAJA':
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        <Layers className="w-3 h-3 mr-1" />
                        {prioridad}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}>
                        {prioridad || 'MEDIA'}
                    </span>
                );
        }
    };

    // Acciones según estado
    const getAvailableActions = () => {
        const actions = [];
        
        // Verificar si el pedido ya tiene venta asociada
        const tieneVenta = pedido.venta_id || pedido.venta;
        
        // Si ya tiene venta, mostrar enlace a la venta
        if (tieneVenta) {
            actions.push({
                label: 'Ver Factura',
                icon: Receipt,
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                href: route('ventas.show', pedido.venta_id || pedido.venta?.id),
                disabled: false
            });
            return actions;
        }
        
        // Si no tiene venta, mostrar acciones según estado
        switch(pedido.estado?.toUpperCase()) {
            case 'PENDIENTE':
                actions.push({
                    label: 'Procesar Pedido',
                    icon: PackageCheck,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    action: () => {
                        if (confirm('¿Está seguro de procesar este pedido?')) {
                            router.post(route('pedidos.procesar', pedido.id));
                        }
                    }
                });
                if (canEdit) {
                    actions.push({
                        label: 'Editar Pedido',
                        icon: Edit,
                        color: 'text-yellow-600 dark:text-yellow-400',
                        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                        href: route('pedidos.edit', pedido.id)
                    });
                }
                actions.push({
                    label: 'Cancelar Pedido',
                    icon: XSquare,
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    action: () => {
                        const motivo = prompt('Ingrese el motivo de cancelación:');
                        if (motivo) {
                            router.post(route('pedidos.cancelar', pedido.id), { motivo });
                        }
                    }
                });
                break;
                
            case 'PROCESADO':
            case 'APROBADO':
                actions.push({
                    label: 'Marcar como Entregado',
                    icon: CheckSquare,
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    action: () => {
                        if (confirm('¿Marcar como entregado?')) {
                            router.post(route('pedidos.entregar', pedido.id));
                        }
                    }
                });
                actions.push({
                    label: 'Cancelar Pedido',
                    icon: XSquare,
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    action: () => {
                        const motivo = prompt('Ingrese el motivo de cancelación:');
                        if (motivo) {
                            router.post(route('pedidos.cancelar', pedido.id), { motivo });
                        }
                    }
                });
                break;
                
            case 'ENTREGADO':
                // Solo mostrar opción de generar factura si está entregado y no tiene venta
                actions.push({
                    label: 'Generar Factura',
                    icon: Receipt,
                    color: 'text-purple-600 dark:text-purple-400',
                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                    action: () => convertirAVenta(pedido.id)
                });
                break;
        }
        
        return actions;
    };

    const availableActions = getAvailableActions();

    // Calcular días restantes/hace
    const getDaysStatus = () => {
        if (!pedido.fecha_entrega) return null;
        
        const entrega = new Date(pedido.fecha_entrega);
        const hoy = new Date();
        const diffTime = entrega - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            return {
                type: 'remaining',
                days: diffDays,
                text: `${diffDays} día${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`,
                color: diffDays <= 2 ? 'text-red-600 dark:text-red-400' : 
                       diffDays <= 5 ? 'text-amber-600 dark:text-amber-400' : 
                       'text-green-600 dark:text-green-400'
            };
        } else if (diffDays < 0) {
            return {
                type: 'overdue',
                days: Math.abs(diffDays),
                text: `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`,
                color: 'text-red-600 dark:text-red-400'
            };
        } else {
            return {
                type: 'today',
                days: 0,
                text: 'Entrega hoy',
                color: 'text-amber-600 dark:text-amber-400'
            };
        }
    };

    const daysStatus = getDaysStatus();

    // Calcular totales
    const calcularTotales = () => {
        let subtotal = 0;
        let descuentoTotal = 0;
        let itbisTotal = 0;
        let total = 0;

        pedido.detalles?.forEach(detalle => {
            subtotal += parseFloat(detalle.subtotal) || 0;
            descuentoTotal += parseFloat(detalle.descuento) || 0;
            itbisTotal += parseFloat(detalle.itbis) || 0;
            total += parseFloat(detalle.total) || 0;
        });

        return { subtotal, descuentoTotal, itbisTotal, total };
    };

    const totales = calcularTotales();

    // Toggle secciones
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('pedidos.index')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                    Pedido #{pedido.numero_pedido}
                                </h2>
                                {getStatusBadge(pedido.estado)}
                                {pedido.prioridad && getPriorityBadge(pedido.prioridad)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Creado por {pedido.usuario?.name || 'Usuario'} • {formatDateTime(pedido.created_at)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowActionsMenu(!showActionsMenu)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            
                            {showActionsMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                window.print();
                                                setShowActionsMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Printer className="w-4 h-4 mr-3" />
                                            Imprimir Pedido
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Función para exportar PDF
                                                alert('Exportar PDF en desarrollo');
                                                setShowActionsMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Download className="w-4 h-4 mr-3" />
                                            Exportar PDF
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Enlace copiado al portapapeles');
                                                setShowActionsMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Share2 className="w-4 h-4 mr-3" />
                                            Compartir
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {canDelete && pedido.estado === 'PENDIENTE' && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                title="Eliminar pedido"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Pedido #${pedido.numero_pedido}`} />

            {/* Confirmación de eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        Confirmar Eliminación
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                                ¿Está seguro de eliminar el pedido <strong>#{pedido.numero_pedido}</strong>?
                            </p>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        router.delete(route('pedidos.destroy', pedido.id));
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Encabezado del pedido */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información principal */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                                            {pedido.cliente?.nombre_completo || pedido.cliente?.nombre || 'Cliente no disponible'}
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center text-sm">
                                                <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {pedido.cliente?.cedula_rnc || pedido.cliente?.cedula || 'Sin cédula/RNC'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {pedido.cliente?.telefono || 'Sin teléfono'}
                                                </span>
                                            </div>
                                            {pedido.cliente?.email && (
                                                <div className="flex items-center text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {pedido.cliente.email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 md:mt-0">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total del Pedido</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(totales.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Fechas importantes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha Pedido</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(pedido.fecha_pedido)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg border ${
                                        daysStatus?.type === 'overdue' 
                                            ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700'
                                            : daysStatus?.type === 'today'
                                            ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700'
                                            : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700'
                                    }`}>
                                        <div className="flex items-center">
                                            <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha Entrega</p>
                                                <div className="flex items-center">
                                                    <p className="font-semibold text-gray-900 dark:text-white mr-2">
                                                        {formatDate(pedido.fecha_entrega)}
                                                    </p>
                                                    {daysStatus && (
                                                        <span className={`text-xs font-medium ${daysStatus.color}`}>
                                                            {daysStatus.text}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Sucursal</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {pedido.sucursal?.nombre || 'Sin sucursal'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Detalles de pago */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detalles de Pago</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Condición</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {pedido.condicion_pago === 'CREDITO' ? 'Crédito' : 
                                                 pedido.condicion_pago === 'MIXTO' ? 'Mixto' : 'Contado'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Anticipo</p>
                                            <p className="font-medium text-green-600 dark:text-green-400">
                                                {formatCurrency(pedido.anticipo || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Pendiente</p>
                                            <p className="font-medium text-amber-600 dark:text-amber-400">
                                                {formatCurrency(pedido.saldo_pendiente || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Pedido</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {pedido.tipo_pedido === 'DOMICILIO' ? 'Domicilio' :
                                                 pedido.tipo_pedido === 'RESERVA' ? 'Reserva' :
                                                 pedido.tipo_pedido === 'PREVENTA' ? 'Preventa' : 'Local'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Notas */}
                                {pedido.notas && (
                                    <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg border border-amber-200 dark:border-amber-700">
                                        <div className="flex items-start">
                                            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Notas del Pedido</h4>
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {pedido.notas}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Panel de acciones */}
                        <div className="space-y-6">
                            {/* Resumen de totales */}
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-white mb-4">Resumen Financiero</h3>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-100">Subtotal</span>
                                            <span className="font-medium text-white">
                                                {formatCurrency(totales.subtotal)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-100">Descuento</span>
                                            <span className="font-medium text-red-300">
                                                -{formatCurrency(totales.descuentoTotal)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-100">ITBIS (18%)</span>
                                            <span className="font-medium text-white">
                                                {formatCurrency(totales.itbisTotal)}
                                            </span>
                                        </div>
                                        
                                        <div className="pt-3 border-t border-purple-500">
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-100 font-semibold">Total</span>
                                                <span className="text-xl font-bold text-white">
                                                    {formatCurrency(totales.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Acciones disponibles */}
                            {availableActions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Acciones</h3>
                                    
                                    <div className="space-y-3">
                                        {availableActions.map((action, index) => (
                                            action.href ? (
                                                <Link
                                                    key={index}
                                                    href={action.href}
                                                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${action.bg} ${action.color} hover:opacity-90`}
                                                >
                                                    <action.icon className="w-5 h-5 mr-3" />
                                                    {action.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    key={index}
                                                    onClick={action.action}
                                                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${action.bg} ${action.color} hover:opacity-90`}
                                                    disabled={action.disabled}
                                                >
                                                    <action.icon className="w-5 h-5 mr-3" />
                                                    {action.label}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Información de seguimiento */}
                            {pedido.codigo_seguimiento && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Truck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Seguimiento
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Código de Seguimiento</p>
                                            <p className="font-mono font-bold text-gray-900 dark:text-white">
                                                {pedido.codigo_seguimiento}
                                            </p>
                                        </div>
                                        
                                        <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors">
                                            Rastrear Envío
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Productos del pedido */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div 
                            className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30"
                            onClick={() => toggleSection('productos')}
                        >
                            <div className="flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    Productos ({pedido.detalles?.length || 0})
                                </h3>
                            </div>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                {expandedSections.productos ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                        
                        {expandedSections.productos && (
                            <div className="p-6">
                                {pedido.detalles && pedido.detalles.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Producto</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Cantidad</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Precio Unit.</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Descuento</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Subtotal</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">ITBIS</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {pedido.detalles.map((detalle, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {detalle.producto?.nombre || 'Producto no disponible'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Código: {detalle.producto?.codigo || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="font-medium">{detalle.cantidad || 0}</span>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium">
                                                            {formatCurrency(detalle.precio_unitario || 0)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-red-600 dark:text-red-400">
                                                                {formatCurrency(detalle.descuento || 0)}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium">
                                                            {formatCurrency(detalle.subtotal || 0)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-amber-600 dark:text-amber-400">
                                                                {formatCurrency(detalle.itbis || 0)}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(detalle.total || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <PackageX className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No hay productos en este pedido</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Historial del pedido */}
                    {pedido.log && pedido.log.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div 
                                className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                onClick={() => toggleSection('historial')}
                            >
                                <div className="flex items-center">
                                    <History className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        Historial de Actividades ({pedido.log.length})
                                    </h3>
                                </div>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                    {expandedSections.historial ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                            </div>
                            
                            {expandedSections.historial && (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {pedido.log.map((registro, index) => (
                                            <div key={index} className="flex">
                                                <div className="flex-shrink-0 mr-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        registro.accion === 'CREACION' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                                                        registro.accion === 'PROCESAMIENTO' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                                                        registro.accion === 'ENTREGA_COMPLETA' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' :
                                                        registro.accion === 'CANCELACION' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                                                        'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
                                                    }`}>
                                                        {registro.accion === 'CREACION' ? <Plus className="w-4 h-4" /> :
                                                         registro.accion === 'PROCESAMIENTO' ? <PackageCheck className="w-4 h-4" /> :
                                                         registro.accion === 'ENTREGA_COMPLETA' ? <CheckCircle className="w-4 h-4" /> :
                                                         registro.accion === 'CANCELACION' ? <XCircle className="w-4 h-4" /> :
                                                         <Edit className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {registro.accion === 'CREACION' ? 'Pedido creado' :
                                                             registro.accion === 'PROCESAMIENTO' ? 'Pedido procesado' :
                                                             registro.accion === 'ENTREGA_COMPLETA' ? 'Pedido entregado' :
                                                             registro.accion === 'CANCELACION' ? 'Pedido cancelado' :
                                                             'Pedido actualizado'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDateTime(registro.created_at)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Por: {registro.user?.name || 'Usuario'} • {registro.descripcion || 'Sin descripción'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}