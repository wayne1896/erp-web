// resources/js/Pages/Ventas/Show.jsx
import React, { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, 
    Printer, 
    FileText, 
    User, 
    Calendar,
    DollarSign, 
    Package, 
    CreditCard,
    MapPin, 
    Phone, 
    Mail, 
    Building,
    CheckCircle,
    AlertCircle,
    Download,
    Share2,
    Clock,
    Tag,
    Percent,
    Wallet,
    Banknote,
    Landmark,
    Smartphone,
    FileCheck,
    AlertTriangle,
    Truck,
    Shield
} from 'lucide-react';

export default function VentasShow({ venta }) {
    const printRef = useRef();

    // Manejo de estado de venta no encontrada
    if (!venta) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                            <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 dark:text-white leading-tight">
                                Error: Venta no encontrada
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                No se pudo cargar la información solicitada
                            </p>
                        </div>
                    </div>
                }
            >
                <Head title="Venta no encontrada" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center shadow-sm">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Venta no disponible
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                La información de la venta solicitada no se encuentra disponible o ha sido eliminada.
                            </p>
                            <Link
                                href={route('ventas.index')}
                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al listado de ventas
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

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

    const formatDateShort = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Estado de la venta para colores del badge
    const getStatusClasses = (estado) => {
        switch(estado?.toUpperCase()) {
            case 'PROCESADA':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'ANULADA':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        }
    };

    // Obtener icono de tipo de pago
    const getPaymentIcon = (tipoPago) => {
        switch(tipoPago?.toUpperCase()) {
            case 'EFECTIVO':
                return Banknote;
            case 'TARJETA_DEBITO':
            case 'TARJETA_CREDITO':
                return CreditCard;
            case 'TRANSFERENCIA':
                return Landmark;
            case 'PAGO_MOVIL':
                return Smartphone;
            case 'CHEQUE':
                return FileCheck;
            default:
                return Wallet;
        }
    };

    // Obtener color de tipo de pago
    const getPaymentColor = (tipoPago) => {
        switch(tipoPago?.toUpperCase()) {
            case 'EFECTIVO':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'TARJETA_DEBITO':
                return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'TARJETA_CREDITO':
                return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
            case 'TRANSFERENCIA':
                return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
            case 'PAGO_MOVIL':
                return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30';
            case 'CHEQUE':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
        }
    };

    // Obtener nombre de tipo de pago
    const getPaymentName = (tipoPago) => {
        switch(tipoPago?.toUpperCase()) {
            case 'EFECTIVO':
                return 'Efectivo';
            case 'TARJETA_DEBITO':
                return 'Tarjeta Débito';
            case 'TARJETA_CREDITO':
                return 'Tarjeta Crédito';
            case 'TRANSFERENCIA':
                return 'Transferencia';
            case 'PAGO_MOVIL':
                return 'Pago Móvil';
            case 'CHEQUE':
                return 'Cheque';
            default:
                return tipoPago?.replace('_', ' ') || 'No especificado';
        }
    };

    // Calcular totales de impresión
    const calcularTotalesImpuestos = () => {
        let subtotal = 0;
        let itbis = 0;
        let descuentoProductos = 0;
        
        if (venta.detalles) {
            venta.detalles.forEach(detalle => {
                const cantidad = parseFloat(detalle.cantidad) || 0;
                const precio = parseFloat(detalle.precio_unitario) || 0;
                const descuentoPorcentaje = parseFloat(detalle.descuento) || 0;
                const itbisPorcentaje = parseFloat(detalle.itbis_porcentaje) || 0;
                
                const subtotalProducto = cantidad * precio;
                const descuentoProducto = subtotalProducto * (descuentoPorcentaje / 100);
                const subtotalConDescuento = subtotalProducto - descuentoProducto;
                const itbisProducto = subtotalConDescuento * (itbisPorcentaje / 100);
                
                subtotal += subtotalProducto;
                itbis += itbisProducto;
                descuentoProductos += descuentoProducto;
            });
        }
        
        const descuentoGlobalMonto = (subtotal - descuentoProductos) * (parseFloat(venta.descuento_global) / 100 || 0);
        const descuentoTotal = descuentoProductos + descuentoGlobalMonto;
        const total = (subtotal - descuentoTotal) + itbis;
        
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            itbis: parseFloat(itbis.toFixed(2)),
            descuentoProductos: parseFloat(descuentoProductos.toFixed(2)),
            descuentoGlobal: parseFloat(descuentoGlobalMonto.toFixed(2)),
            descuentoTotal: parseFloat(descuentoTotal.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    };

    const totales = calcularTotalesImpuestos();

    // Función para imprimir
    const handlePrint = () => {
        // Abrir el PDF en una nueva ventana para impresión
        window.open(`/ventas/${venta.id}/pdf/imprimir`, '_blank');
    };

    // Función para descargar como PDF
    const handleDownloadPDF = () => {
        window.open(`/ventas/${venta.id}/pdf/descargar`, '_blank');
    };

    // Función para vista previa del PDF
    const handlePreviewPDF = () => {
        window.open(`/ventas/${venta.id}/pdf/vista`, '_blank');
    };

    // Obtener icono de tipo de pago
    const PaymentIcon = getPaymentIcon(venta.tipo_pago);
    const paymentColor = getPaymentColor(venta.tipo_pago);
    const paymentName = getPaymentName(venta.tipo_pago);

    return (
        <>
            <AuthenticatedLayout
                header={
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3.5 rounded-xl shadow-lg">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                    {venta.numero_factura?.toString().slice(-3) || '001'}
                                </div>
                            </div>
                            <div>
                                <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                    Factura #{venta.numero_factura}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(venta.estado)}`}>
                                        {venta.estado || 'PENDIENTE'}
                                    </span>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        {formatDateTime(venta.created_at)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <PaymentIcon className="w-4 h-4 mr-1.5" />
                                        {paymentName}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <CreditCard className="w-4 h-4 mr-1.5" />
                                        {venta.condicion_pago}
                                    </div>
                                    {venta.condicion_pago === 'CREDITO' && venta.dias_credito && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4 mr-1.5" />
                                            {venta.dias_credito} días
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handlePreviewPDF}
                                className="inline-flex items-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Vista Previa
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir Factura
                            </button>
                            <Link
                                href={route('ventas.index')}
                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Link>
                        </div>
                    </div>
                }
            >
                <Head title={`Factura ${venta.numero_factura}`} />

                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                        {/* Vista previa para impresión (oculta en pantalla) */}
                        <div ref={printRef} className="print-only">
                            {/* Este div está oculto en pantalla pero se usa para imprimir */}
                        </div>

                        {/* Contenido normal de la página */}
                        <div className="no-print">
                            {/* Resumen de totales - Card superior */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Subtotal</p>
                                            <p className="text-2xl font-bold text-white">
                                                {formatCurrency(totales.subtotal)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Descuentos</p>
                                            <p className="text-2xl font-bold text-white">
                                                -{formatCurrency(totales.descuentoTotal)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">ITBIS</p>
                                            <p className="text-2xl font-bold text-white">
                                                {formatCurrency(totales.itbis)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Total General</p>
                                            <p className="text-3xl font-bold text-white">
                                                {formatCurrency(venta.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid principal de información */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Sección Cliente y Datos de venta */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Información del cliente */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                                <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Información del Cliente
                                            </h3>
                                            {venta.cliente?.id && (
                                                <Link
                                                    href={route('clientes.show', venta.cliente.id)}
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    Ver perfil completo →
                                                </Link>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre completo</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {venta.cliente?.nombre_completo || 'Cliente no disponible'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Identificación</p>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {venta.cliente?.cedula || 'Sin cédula'}
                                                        </span>
                                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                            venta.cliente?.tipo === 'JURIDICA' 
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                        }`}>
                                                            {venta.cliente?.tipo || 'FISICA'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {venta.cliente?.email && (
                                                    <div className="flex items-start">
                                                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Correo electrónico</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.cliente.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {venta.cliente?.telefono && (
                                                    <div className="flex items-start">
                                                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.cliente.telefono}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {venta.cliente?.direccion && (
                                                    <div className="flex items-start">
                                                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dirección</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.cliente.direccion}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {venta.cliente?.created_at && (
                                                    <div className="flex items-start">
                                                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cliente desde</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {formatDate(venta.cliente.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Productos */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Productos ({venta.detalles?.length || 0})
                                            </h3>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Total productos: {formatCurrency(totales.subtotal)}
                                            </span>
                                        </div>
                                        
                                        {venta.detalles?.length > 0 ? (
                                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-900">
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Producto
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Cantidad
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Precio
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Desc. %
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                ITBIS %
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Total
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {venta.detalles.map((detalle, index) => {
                                                            const cantidad = parseFloat(detalle.cantidad) || 0;
                                                            const precio = parseFloat(detalle.precio_unitario) || 0;
                                                            const descuentoPorcentaje = parseFloat(detalle.descuento) || 0;
                                                            const itbisPorcentaje = parseFloat(detalle.itbis_porcentaje) || 0;
                                                            
                                                            const subtotal = cantidad * precio;
                                                            const descuentoProducto = subtotal * (descuentoPorcentaje / 100);
                                                            const subtotalConDescuento = subtotal - descuentoProducto;
                                                            const itbis = subtotalConDescuento * (itbisPorcentaje / 100);
                                                            const total = subtotalConDescuento + itbis;
                                                            
                                                            return (
                                                                <tr 
                                                                    key={index}
                                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                                                >
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center">
                                                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                                                                                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                                    {detalle.producto?.nombre || 'Producto eliminado'}
                                                                                </p>
                                                                                {detalle.producto?.codigo && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        Código: {detalle.producto.codigo}
                                                                                        {detalle.producto?.codigo_barras && ` | Barras: ${detalle.producto.codigo_barras}`}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                            {cantidad}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                                        {formatCurrency(precio)}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {descuentoPorcentaje > 0 ? (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                                                -{descuentoPorcentaje.toFixed(2)}%
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-gray-400 text-sm">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                                                            {itbisPorcentaje.toFixed(2)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                                        {formatCurrency(total)}
                                                                        {descuentoProducto > 0 && (
                                                                            <div className="text-xs text-red-600 dark:text-red-400">
                                                                                -{formatCurrency(descuentoProducto)} desc.
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    No hay productos registrados en esta venta
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar - Información adicional */}
                                <div className="space-y-6">
                                    {/* Datos de facturación */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Datos de Facturación
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Número de Factura</p>
                                                <p className="font-mono font-bold text-gray-900 dark:text-white">
                                                    #{venta.numero_factura}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NCF</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {venta.ncf || 'No aplica'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha de Factura</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(venta.created_at)}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo de Comprobante</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {venta.tipo_comprobante}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Condición de Pago</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        venta.condicion_pago === 'CONTADO' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                                    }`}>
                                                        {venta.condicion_pago}
                                                    </span>
                                                    {venta.condicion_pago === 'CREDITO' && venta.dias_credito && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                                            {venta.dias_credito} días
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información de pago */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <PaymentIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Información de Pago
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Método de Pago</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${paymentColor}`}>
                                                        <PaymentIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {paymentName}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Información específica del método de pago */}
                                            {venta.tipo_pago === 'TRANSFERENCIA' && venta.referencia_transferencia && (
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Referencia</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {venta.referencia_transferencia}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {(venta.tipo_pago === 'TARJETA_DEBITO' || venta.tipo_pago === 'TARJETA_CREDITO') && (
                                                <>
                                                    {venta.ultimos_digitos_tarjeta && (
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Últimos 4 dígitos</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                **** {venta.ultimos_digitos_tarjeta}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {venta.autorizacion_tarjeta && (
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Autorización</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.autorizacion_tarjeta}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {venta.tipo_pago === 'CHEQUE' && (
                                                <>
                                                    {venta.numero_cheque && (
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Número de cheque</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.numero_cheque}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {venta.banco_cheque && (
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Banco</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.banco_cheque}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vendedor y Caja */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Personal y Caja
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vendedor</p>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {venta.vendedor?.name?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {venta.vendedor?.name || 'No asignado'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {venta.vendedor?.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {venta.caja && (
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Caja</p>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                                                            <Wallet className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {venta.caja.nombre || 'Caja Principal'}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Responsable: {venta.caja.usuario?.name || 'Sistema'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descuentos y Totales */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Descuentos y Totales
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal productos</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(totales.subtotal)}
                                                </span>
                                            </div>
                                            
                                            {totales.descuentoProductos > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Descuento productos</span>
                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                        -{formatCurrency(totales.descuentoProductos)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {venta.descuento_global > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Descuento global</span>
                                                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                            {parseFloat(venta.descuento_global).toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                        -{formatCurrency(totales.descuentoGlobal)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {totales.descuentoTotal > 0 && (
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total descuentos</span>
                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                        -{formatCurrency(totales.descuentoTotal)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">ITBIS</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(totales.itbis)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total General</span>
                                                <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
                                                    {formatCurrency(venta.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notas y Observaciones */}
                                    {(venta.notas || venta.observaciones) && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Observaciones
                                            </h3>
                                            
                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                    {venta.notas || venta.observaciones}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer de la factura */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            Garantía y soporte
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-1.5" />
                                                <span>Garantía 30 días</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1.5" />
                                                <span>Entrega inmediata</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-1.5" />
                                                <span>Factura original requerida</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total pagado</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(venta.total)}
                                            </p>
                                        </div>
                                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Información de fecha */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <p>
                                        Registrado el: {formatDate(venta.created_at)} | 
                                        Última actualización: {formatDate(venta.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>

            {/* Estilos para impresión */}
            <style jsx="true">{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .no-print, .no-print * {
                        display: none !important;
                    }
                    .print-only, .print-only * {
                        visibility: visible;
                    }
                    .print-only {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
                
                @media screen {
                    .print-only {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}