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
    Share2
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

    const formatDateShort = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Estado de la venta para colores del badge - ACTUALIZADO
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
                            <div class="info-row">
                                <span class="info-label">Fecha de emisión:</span>
                                <span class="info-value">${formatDate(venta.fecha_venta)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Método de pago:</span>
                                <span class="info-value">${venta.metodo_pago || 'Efectivo'}</span>
                            </div>
                        </div>
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
                                <th>DESCUENTO</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${venta.detalles?.map((detalle, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${detalle.producto?.nombre || 'Producto eliminado'}</td>
                                    <td>${detalle.cantidad}</td>
                                    <td>${formatCurrency(detalle.precio_unitario)}</td>
                                    <td>${formatCurrency(detalle.descuento || 0)}</td>
                                    <td>${formatCurrency(detalle.total)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="6" style="text-align: center;">No hay productos</td></tr>'}
                        </tbody>
                    </table>
                    
                    <!-- Totales -->
                    <div class="totals-section">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(venta.subtotal || venta.total)}</span>
                        </div>
                        <div class="total-row">
                            <span>Descuento:</span>
                            <span>${formatCurrency(venta.descuento_total || 0)}</span>
                        </div>
                        <div class="total-row">
                            <span>ITBIS (18%):</span>
                            <span>${formatCurrency(venta.impuestos || 0)}</span>
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
                            <p>${venta.notas || venta.observaciones}</p>
                        </div>
                    ` : ''}
                    
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

    // Función para descargar como PDF (placeholder)
    const handleDownloadPDF = () => {
        alert('La funcionalidad de descarga PDF estará disponible próximamente.');
        // Aquí puedes integrar con una librería como jsPDF o html2pdf.js
    };

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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Subtotal</p>
                                            <p className="text-2xl font-bold text-white">
                                                {formatCurrency(venta.subtotal || venta.total)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Impuestos</p>
                                            <p className="text-2xl font-bold text-white">
                                                {formatCurrency(venta.impuestos || 0)}
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
                                {/* Sección Cliente */}
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
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre completo</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {venta.cliente?.nombre_completo || 'Cliente no disponible'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Identificación</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {venta.cliente?.cedula || 'Sin cédula'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
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
                                                Total productos
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
                                                                Precio Unitario
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Total
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {venta.detalles.map((detalle, index) => (
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
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                        {detalle.cantidad}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                                    {formatCurrency(detalle.precio_unitario)}
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                                    {formatCurrency(detalle.total)}
                                                                </td>
                                                            </tr>
                                                        ))}
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
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Número de Comprobante</p>
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
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Condición de Pago</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {venta.condicion_pago}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha de Emisión</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(venta.fecha_venta)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vendedor */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Vendedor
                                        </h3>
                                        
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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

                                    {/* Notas */}
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
                                            Gracias por su compra
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Documento válido como factura
                                        </p>
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
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>

            {/* Estilos para impresión */}
            <style jsx>{`
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