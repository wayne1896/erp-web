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
        const printContent = printRef.current;
        const printWindow = window.open('', '_blank');
        
        const printStyles = `
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 0.5cm;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                        padding: 20px;
                    }
                    
                    .print-container {
                        max-width: 21cm;
                        margin: 0 auto;
                    }
                    
                    .print-header {
                        border-bottom: 3px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    
                    .company-info {
                        flex: 1;
                    }
                    
                    .company-logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 5px;
                    }
                    
                    .invoice-title {
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                        margin: 20px 0;
                        text-transform: uppercase;
                    }
                    
                    .invoice-number {
                        font-size: 18px;
                        font-weight: bold;
                        background: #f3f4f6;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .info-section {
                        border: 1px solid #e5e7eb;
                        border-radius: 5px;
                        padding: 15px;
                    }
                    
                    .info-section h3 {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #e5e7eb;
                        color: #374151;
                    }
                    
                    .info-row {
                        margin-bottom: 8px;
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .info-label {
                        font-weight: 600;
                        color: #6b7280;
                    }
                    
                    .info-value {
                        font-weight: 500;
                    }
                    
                    .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0 30px 0;
                    }
                    
                    .products-table th {
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        padding: 10px;
                        text-align: left;
                        font-weight: bold;
                        font-size: 12px;
                        color: #374151;
                    }
                    
                    .products-table td {
                        border: 1px solid #e5e7eb;
                        padding: 10px;
                        font-size: 12px;
                    }
                    
                    .products-table tr:nth-child(even) {
                        background: #f9fafb;
                    }
                    
                    .totals-section {
                        border-top: 2px solid #000;
                        padding-top: 20px;
                        margin-top: 30px;
                    }
                    
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                    }
                    
                    .grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        border-top: 2px solid #000;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 11px;
                        color: #6b7280;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .status-procesada {
                        background: #d1fae5;
                        color: #065f46;
                    }
                    
                    .status-pendiente {
                        background: #fef3c7;
                        color: #92400e;
                    }
                    
                    .status-anulada {
                        background: #fee2e2;
                        color: #991b1b;
                    }
                    
                    .no-print {
                        display: none;
                    }
                    
                    .print-only {
                        display: block;
                    }
                    
                    .page-break {
                        page-break-before: always;
                    }
                    
                    .signature-area {
                        margin-top: 60px;
                        padding-top: 20px;
                        border-top: 1px solid #000;
                    }
                    
                    .signature-line {
                        display: inline-block;
                        width: 200px;
                        border-bottom: 1px solid #000;
                        margin: 0 20px;
                    }
                    
                    .payment-info {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f8fafc;
                        border-radius: 5px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .payment-method {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-top: 5px;
                    }
                    
                    .payment-icon {
                        padding: 5px;
                        border-radius: 5px;
                        font-size: 14px;
                    }
                    
                    .payment-cash {
                        background: #d1fae5;
                        color: #065f46;
                    }
                    
                    .payment-card {
                        background: #dbeafe;
                        color: #1e40af;
                    }
                    
                    .payment-transfer {
                        background: #fef3c7;
                        color: #92400e;
                    }
                }
                
                @media screen {
                    .print-only {
                        display: none;
                    }
                }
                
                body {
                    margin: 0;
                    padding: 20px;
                }
            </style>
        `;

        const PaymentIcon = getPaymentIcon(venta.tipo_pago);
        
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura #${venta.numero_factura}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${printStyles}
            </head>
            <body>
                <div class="print-container">
                    <!-- Encabezado de la empresa -->
                    <div class="print-header">
                        <div class="company-info">
                            <div class="company-logo">MI EMPRESA</div>
                            <div><strong>RNC:</strong> 1-23-45678-9</div>
                            <div><strong>Dirección:</strong> Calle Principal #123, Ciudad</div>
                            <div><strong>Teléfono:</strong> (809) 555-1234</div>
                            <div><strong>Email:</strong> contacto@miempresa.com</div>
                        </div>
                        <div class="company-info" style="text-align: right;">
                            <div><strong>FACTURA COMERCIAL</strong></div>
                            <div><strong>N°:</strong> ${venta.numero_factura}</div>
                            <div><strong>Fecha:</strong> ${formatDateShort(venta.fecha_venta)}</div>
                            <div><strong>Hora:</strong> ${formatTime(venta.fecha_venta)}</div>
                            <div><strong>NCF:</strong> ${venta.ncf || 'No aplica'}</div>
                            <div>
                                <strong>Estado:</strong> 
                                <span class="status-badge status-${venta.estado?.toLowerCase() || 'pendiente'}">
                                    ${venta.estado || 'PENDIENTE'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Título de factura -->
                    <div class="invoice-title">FACTURA DE VENTA</div>
                    
                    <!-- Información del cliente -->
                    <div class="info-grid">
                        <div class="info-section">
                            <h3>INFORMACIÓN DEL CLIENTE</h3>
                            <div class="info-row">
                                <span class="info-label">Nombre:</span>
                                <span class="info-value">${venta.cliente?.nombre_completo || 'Cliente no disponible'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Cédula/RNC:</span>
                                <span class="info-value">${venta.cliente?.cedula || 'No disponible'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Teléfono:</span>
                                <span class="info-value">${venta.cliente?.telefono || 'No disponible'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${venta.cliente?.email || 'No disponible'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Dirección:</span>
                                <span class="info-value">${venta.cliente?.direccion || 'No disponible'}</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h3>INFORMACIÓN DE LA VENTA</h3>
                            <div class="info-row">
                                <span class="info-label">Vendedor:</span>
                                <span class="info-value">${venta.vendedor?.name || 'No asignado'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Condición de pago:</span>
                                <span class="info-value">${venta.condicion_pago || 'Contado'}</span>
                            </div>
                            ${venta.condicion_pago === 'CREDITO' && venta.dias_credito ? `
                                <div class="info-row">
                                    <span class="info-label">Días de crédito:</span>
                                    <span class="info-value">${venta.dias_credito} días</span>
                                </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="info-label">Fecha de emisión:</span>
                                <span class="info-value">${formatDate(venta.fecha_venta)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Tipo de comprobante:</span>
                                <span class="info-value">${venta.tipo_comprobante || 'FACTURA'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información de pago -->
                    <div class="payment-info">
                        <h3>INFORMACIÓN DE PAGO</h3>
                        <div class="info-row">
                            <span class="info-label">Método de pago:</span>
                            <span class="info-value">
                                <div class="payment-method">
                                    <span class="payment-icon payment-${venta.tipo_pago?.toLowerCase() || 'cash'}">
                                        ${getPaymentName(venta.tipo_pago)}
                                    </span>
                                </div>
                            </span>
                        </div>
                        ${venta.tipo_pago === 'TRANSFERENCIA' && venta.referencia_transferencia ? `
                            <div class="info-row">
                                <span class="info-label">Referencia de transferencia:</span>
                                <span class="info-value">${venta.referencia_transferencia}</span>
                            </div>
                        ` : ''}
                        ${venta.tipo_pago === 'TARJETA_DEBITO' || venta.tipo_pago === 'TARJETA_CREDITO' ? `
                            <div class="info-row">
                                <span class="info-label">Últimos 4 dígitos:</span>
                                <span class="info-value">${venta.ultimos_digitos_tarjeta || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Autorización:</span>
                                <span class="info-value">${venta.autorizacion_tarjeta || 'N/A'}</span>
                            </div>
                        ` : ''}
                        ${venta.tipo_pago === 'CHEQUE' ? `
                            <div class="info-row">
                                <span class="info-label">Número de cheque:</span>
                                <span class="info-value">${venta.numero_cheque || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Banco:</span>
                                <span class="info-value">${venta.banco_cheque || 'N/A'}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Tabla de productos -->
                    <h3>DETALLE DE PRODUCTOS</h3>
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>DESCRIPCIÓN</th>
                                <th>CANTIDAD</th>
                                <th>PRECIO UNITARIO</th>
                                <th>DESCUENTO %</th>
                                <th>ITBIS %</th>
                                <th>SUBTOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${venta.detalles?.map((detalle, index) => {
                                const subtotalProducto = (parseFloat(detalle.cantidad) || 0) * (parseFloat(detalle.precio_unitario) || 0);
                                const descuentoProducto = subtotalProducto * ((parseFloat(detalle.descuento) || 0) / 100);
                                const subtotalConDescuento = subtotalProducto - descuentoProducto;
                                const itbisProducto = subtotalConDescuento * ((parseFloat(detalle.itbis_porcentaje) || 0) / 100);
                                const totalProducto = subtotalConDescuento + itbisProducto;
                                
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${detalle.producto?.nombre || 'Producto eliminado'}</td>
                                        <td>${detalle.cantidad}</td>
                                        <td>${formatCurrency(detalle.precio_unitario)}</td>
                                        <td>${parseFloat(detalle.descuento || 0).toFixed(2)}%</td>
                                        <td>${parseFloat(detalle.itbis_porcentaje || 0).toFixed(2)}%</td>
                                        <td>${formatCurrency(totalProducto)}</td>
                                    </tr>
                                `;
                            }).join('') || '<tr><td colspan="7" style="text-align: center;">No hay productos</td></tr>'}
                        </tbody>
                    </table>
                    
                    <!-- Totales -->
                    <div class="totals-section">
                        <div class="total-row">
                            <span>Subtotal productos:</span>
                            <span>${formatCurrency(totales.subtotal)}</span>
                        </div>
                        ${totales.descuentoProductos > 0 ? `
                            <div class="total-row">
                                <span>Descuento productos:</span>
                                <span style="color: #dc2626;">-${formatCurrency(totales.descuentoProductos)}</span>
                            </div>
                        ` : ''}
                        ${venta.descuento_global > 0 ? `
                            <div class="total-row">
                                <span>Descuento global (${parseFloat(venta.descuento_global).toFixed(2)}%):</span>
                                <span style="color: #dc2626;">-${formatCurrency(totales.descuentoGlobal)}</span>
                            </div>
                        ` : ''}
                        ${totales.descuentoTotal > 0 ? `
                            <div class="total-row">
                                <span>Descuento total:</span>
                                <span style="color: #dc2626;">-${formatCurrency(totales.descuentoTotal)}</span>
                            </div>
                        ` : ''}
                        <div class="total-row">
                            <span>Subtotal con descuentos:</span>
                            <span>${formatCurrency(totales.subtotal - totales.descuentoTotal)}</span>
                        </div>
                        <div class="total-row">
                            <span>ITBIS:</span>
                            <span>${formatCurrency(totales.itbis)}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>TOTAL GENERAL:</span>
                            <span>${formatCurrency(venta.total)}</span>
                        </div>
                    </div>
                    
                    <!-- Observaciones -->
                    ${venta.notas || venta.observaciones ? `
                        <div class="info-section" style="margin-top: 30px;">
                            <h3>OBSERVACIONES</h3>
                            <p style="white-space: pre-line;">${venta.notas || venta.observaciones}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Información adicional -->
                    <div class="info-section" style="margin-top: 30px;">
                        <h3>INFORMACIÓN ADICIONAL</h3>
                        <div class="info-row">
                            <span class="info-label">Caja:</span>
                            <span class="info-value">${venta.caja?.nombre || 'N/A'} - ${venta.caja?.usuario?.name || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Fecha de registro:</span>
                            <span class="info-value">${formatDate(venta.created_at)}</span>
                        </div>
                        ${venta.updated_at !== venta.created_at ? `
                            <div class="info-row">
                                <span class="info-label">Última actualización:</span>
                                <span class="info-value">${formatDate(venta.updated_at)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Firmas -->
                    <div class="signature-area">
                        <div style="display: flex; justify-content: space-around; margin-top: 40px;">
                            <div style="text-align: center;">
                                <div class="signature-line"></div>
                                <div style="margin-top: 5px; font-size: 11px;">Firma del Cliente</div>
                            </div>
                            <div style="text-align: center;">
                                <div class="signature-line"></div>
                                <div style="margin-top: 5px; font-size: 11px;">Firma del Vendedor</div>
                            </div>
                            <div style="text-align: center;">
                                <div class="signature-line"></div>
                                <div style="margin-top: 5px; font-size: 11px;">Firma del Caja</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>¡Gracias por su compra!</strong></p>
                        <p>Documento válido como factura fiscal - Esta factura cumple con los requisitos de la DGII</p>
                        <p>Para consultas o aclaraciones contacte a: contacto@miempresa.com | Tel: (809) 555-1234</p>
                        <p>Impreso el: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</p>
                        <p style="margin-top: 10px; font-size: 10px; color: #9ca3af;">
                            ID de transacción: ${venta.id} | Usuario: ${venta.user?.name || 'Sistema'} | Versión: 1.0
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Esperar a que cargue el contenido y luego imprimir
        printWindow.onload = function() {
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };
    };

    // Función para descargar como PDF
    const handleDownloadPDF = () => {
        alert('La funcionalidad de descarga PDF estará disponible próximamente.');
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
                                        {formatDate(venta.fecha_venta)}
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
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                PDF
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
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {formatDateShort(venta.fecha_venta)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hora</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {formatTime(venta.fecha_venta)}
                                                    </p>
                                                </div>
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