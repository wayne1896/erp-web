// resources/js/Pages/Ventas/Imprimir.jsx
import React, { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';

export default function Imprimir({ venta }) {
    const printRef = useRef();

    useEffect(() => {
        // Imprimir automáticamente cuando se carga la página
        window.print();
        
        // Volver atrás después de imprimir (opcional)
        const handleAfterPrint = () => {
            setTimeout(() => {
                window.history.back();
            }, 100);
        };

        window.addEventListener('afterprint', handleAfterPrint);
        
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

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
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
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

    if (!venta) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Factura no encontrada
                </h1>
                <p className="text-gray-600">
                    No se pudo cargar la información de la factura.
                </p>
            </div>
        );
    }

    return (
        <>
            <Head title={`Factura #${venta.numero_factura}`} />
            
            {/* Estilos para impresión */}
            <style jsx>{`
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
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                    .no-print {
                        display: block;
                    }
                    .print-only {
                        display: none;
                    }
                }
            `}</style>

            {/* Contenido de impresión */}
            <div ref={printRef} className="print-container">
                {/* Encabezado de la empresa */}
                <div className="print-header">
                    <div className="company-info">
                        <div className="company-logo">MI EMPRESA</div>
                        <div><strong>RNC:</strong> 1-23-45678-9</div>
                        <div><strong>Dirección:</strong> Calle Principal #123, Ciudad</div>
                        <div><strong>Teléfono:</strong> (809) 555-1234</div>
                        <div><strong>Email:</strong> contacto@miempresa.com</div>
                    </div>
                    <div className="company-info" style={{ textAlign: 'right' }}>
                        <div><strong>FACTURA COMERCIAL</strong></div>
                        <div><strong>N°:</strong> {venta.numero_factura}</div>
                        <div><strong>Fecha:</strong> {formatDateShort(venta.fecha_venta)}</div>
                        <div><strong>NCF:</strong> {venta.ncf || 'No aplica'}</div>
                        <div>
                            <strong>Estado:</strong> 
                            <span className={`status-badge status-${(venta.estado || 'pendiente').toLowerCase()}`}>
                                {venta.estado || 'PENDIENTE'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Título de factura */}
                <div className="invoice-title">FACTURA DE VENTA</div>
                
                {/* Información del cliente */}
                <div className="info-grid">
                    <div className="info-section">
                        <h3>INFORMACIÓN DEL CLIENTE</h3>
                        <div className="info-row">
                            <span className="info-label">Nombre:</span>
                            <span className="info-value">{venta.cliente?.nombre_completo || 'Cliente no disponible'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Cédula/RNC:</span>
                            <span className="info-value">{venta.cliente?.cedula || 'No disponible'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Teléfono:</span>
                            <span className="info-value">{venta.cliente?.telefono || 'No disponible'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{venta.cliente?.email || 'No disponible'}</span>
                        </div>
                    </div>
                    
                    <div className="info-section">
                        <h3>INFORMACIÓN DE LA VENTA</h3>
                        <div className="info-row">
                            <span className="info-label">Vendedor:</span>
                            <span className="info-value">{venta.vendedor?.name || 'No asignado'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Condición de pago:</span>
                            <span className="info-value">{venta.condicion_pago || 'Contado'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Fecha de emisión:</span>
                            <span className="info-value">{formatDate(venta.fecha_venta)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Método de pago:</span>
                            <span className="info-value">{venta.metodo_pago || 'Efectivo'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Tabla de productos */}
                <h3>DETALLE DE PRODUCTOS</h3>
                <table className="products-table">
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
                        {venta.detalles?.map((detalle, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{detalle.producto?.nombre || 'Producto eliminado'}</td>
                                <td>{detalle.cantidad}</td>
                                <td>{formatCurrency(detalle.precio_unitario)}</td>
                                <td>{formatCurrency(detalle.descuento || 0)}</td>
                                <td>{formatCurrency(detalle.total)}</td>
                            </tr>
                        )) || (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No hay productos</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Totales */}
                <div className="totals-section">
                    <div className="total-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(venta.subtotal || venta.total)}</span>
                    </div>
                    <div className="total-row">
                        <span>Descuento:</span>
                        <span>{formatCurrency(venta.descuento_total || 0)}</span>
                    </div>
                    <div className="total-row">
                        <span>ITBIS (18%):</span>
                        <span>{formatCurrency(venta.impuestos || 0)}</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>TOTAL GENERAL:</span>
                        <span>{formatCurrency(venta.total)}</span>
                    </div>
                </div>
                
                {/* Observaciones */}
                {(venta.notas || venta.observaciones) && (
                    <div className="info-section" style={{ marginTop: '30px' }}>
                        <h3>OBSERVACIONES</h3>
                        <p>{venta.notas || venta.observaciones}</p>
                    </div>
                )}
                
                {/* Firmas */}
                <div className="signature-area">
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="signature-line"></div>
                            <div style={{ marginTop: '5px', fontSize: '11px' }}>Firma del Cliente</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="signature-line"></div>
                            <div style={{ marginTop: '5px', fontSize: '11px' }}>Firma del Vendedor</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="signature-line"></div>
                            <div style={{ marginTop: '5px', fontSize: '11px' }}>Firma del Caja</div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="footer">
                    <p><strong>¡Gracias por su compra!</strong></p>
                    <p>Documento válido como factura fiscal - Esta factura cumple con los requisitos de la DGII</p>
                    <p>Para consultas o aclaraciones contacte a: contacto@miempresa.com | Tel: (809) 555-1234</p>
                    <p>Impreso el: {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</p>
                </div>
            </div>

            {/* Mensaje para pantalla */}
            <div className="no-print">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h1 className="text-2xl font-bold mb-4">Preparando impresión...</h1>
                    <p className="text-gray-600 mb-4">
                        La factura se abrirá en una nueva ventana para imprimir.
                    </p>
                    <p className="text-sm text-gray-500">
                        Si la ventana de impresión no se abre, verifica los bloqueadores de ventanas emergentes.
                    </p>
                </div>
            </div>
        </>
    );
}