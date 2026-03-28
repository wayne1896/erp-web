<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura #{{ $venta->numero_factura }}</title>
    <style>
        @page {
            size: A4;
            margin: 0cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', 'Segoe UI', 'Roboto', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #1f2937;
            background: #f3f4f6;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 21cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .invoice-content {
            padding: 40px;
        }
        
        /* Header Styles */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .company-details {
            flex: 1;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }
        
        .company-info {
            color: #6b7280;
            font-size: 10px;
            line-height: 1.6;
        }
        
        .company-info div {
            margin-bottom: 4px;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-badge {
            font-size: 32px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            background: #f3f4f6;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-procesada, .status-completada {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        
        .status-pendiente {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }
        
        .status-anulada, .status-cancelada {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        
        /* Grid Layout */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 35px;
        }
        
        .info-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .card-title {
            font-size: 13px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
            display: inline-block;
            letter-spacing: 0.5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 10px;
        }
        
        .info-label {
            font-weight: 600;
            color: #6b7280;
        }
        
        .info-value {
            font-weight: 500;
            color: #1f2937;
            text-align: right;
        }
        
        /* Payment Methods */
        .payment-methods {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        
        .payment-badge {
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
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
            background: #fed7aa;
            color: #92400e;
        }
        
        .payment-check {
            background: #e0e7ff;
            color: #3730a3;
        }
        
        /* Products Table */
        .products-section {
            margin: 35px 0;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .products-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .products-table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 10px;
        }
        
        .products-table tr:hover {
            background: #f9fafb;
        }
        
        /* Totals Section */
        .totals-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 12px;
            padding: 8px 0;
        }
        
        .total-label {
            font-weight: 500;
            color: #6b7280;
            width: 200px;
            text-align: right;
            margin-right: 20px;
        }
        
        .total-amount {
            font-weight: 600;
            color: #1f2937;
            width: 120px;
            text-align: right;
        }
        
        .grand-total-row {
            border-top: 2px solid #e5e7eb;
            margin-top: 15px;
            padding-top: 15px;
        }
        
        .grand-total-label {
            font-size: 16px;
            font-weight: 800;
            color: #2563eb;
        }
        
        .grand-total-amount {
            font-size: 20px;
            font-weight: 800;
            color: #2563eb;
        }
        
        /* Notes Section */
        .notes-section {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .notes-title {
            font-weight: 700;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .notes-text {
            color: #78350f;
            font-size: 10px;
            line-height: 1.6;
            white-space: pre-line;
        }
        
        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-text {
            color: #9ca3af;
            font-size: 9px;
            line-height: 1.5;
        }
        
        .signatures {
            display: flex;
            justify-content: space-between;
            margin: 40px 0 30px;
            gap: 30px;
        }
        
        .signature-item {
            flex: 1;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #d1d5db;
            margin-bottom: 8px;
            padding-top: 20px;
        }
        
        .signature-label {
            font-size: 9px;
            color: #9ca3af;
        }
        
        /* Utility Classes */
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .font-bold {
            font-weight: 700;
        }
        
        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .status-badge {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .payment-badge {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-content">
            <!-- Header -->
            <div class="header">
                <div class="company-details">
                    <div class="company-name">{{ config('app.name', 'ERP SISTEMA') }}</div>
                    <div class="company-info">
                        <div><strong>RNC:</strong> {{ config('app.rnc', '1-23-45678-9') }}</div>
                        <div><strong>Dirección:</strong> {{ config('app.address', 'Av. Principal #123, Santo Domingo') }}</div>
                        <div><strong>Teléfono:</strong> {{ config('app.phone', '(809) 555-1234') }}</div>
                        <div><strong>Email:</strong> {{ config('app.email', 'ventas@erpsistema.com') }}</div>
                        <div><strong>Website:</strong> {{ config('app.url', 'www.erpsistema.com') }}</div>
                    </div>
                </div>
                <div class="invoice-title">
                    <div class="invoice-badge">FACTURA</div>
                    <div class="invoice-number">#{{ $venta->numero_factura }}</div>
                </div>
            </div>
            
            <!-- Info Grid -->
            <div class="info-grid">
                <div class="info-card">
                    <div class="card-title">INFORMACIÓN DEL CLIENTE</div>
                    <div class="info-row">
                        <span class="info-label">Nombre/Razón Social:</span>
                        <span class="info-value"><strong>{{ $venta->cliente->nombre_completo ?? 'CONSUMIDOR FINAL' }}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cédula/RNC:</span>
                        <span class="info-value">{{ $venta->cliente->cedula_rnc ?? $venta->cliente->cedula ?? '000-0000000-0' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">{{ $venta->cliente->telefono ?? 'No disponible' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $venta->cliente->email ?? 'No disponible' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">{{ $venta->cliente->direccion ?? 'No disponible' }}</span>
                    </div>
                    @if($venta->cliente->tipo_contribuyente)
                    <div class="info-row">
                        <span class="info-label">Tipo Contribuyente:</span>
                        <span class="info-value">{{ $venta->cliente->tipo_contribuyente }}</span>
                    </div>
                    @endif
                </div>
                
                <div class="info-card">
                    <div class="card-title">DETALLES DE LA FACTURA</div>
                    <div class="info-row">
                        <span class="info-label">Fecha de Emisión:</span>
                        <span class="info-value">{{ $venta->created_at->format('d/m/Y h:i A') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vendedor:</span>
                        <span class="info-value">{{ $venta->vendedor->name ?? 'Sistema' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Condición de Pago:</span>
                        <span class="info-value">
                            <span class="payment-badge payment-{{ strtolower($venta->condicion_pago ?? 'contado') }}">
                                {{ $venta->condicion_pago ?? 'CONTADO' }}
                            </span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">NCF:</span>
                        <span class="info-value">{{ $venta->ncf ?? 'B01-000000001' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Estado:</span>
                        <span class="info-value">
                            <span class="status-badge status-{{ strtolower($venta->estado ?? 'procesada') }}">
                                {{ $venta->estado ?? 'COMPLETADA' }}
                            </span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tipo de Comprobante:</span>
                        <span class="info-value">{{ $venta->tipo_comprobante ?? 'FACTURA DE CONSUMO' }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Payment Information -->
            <div class="info-card" style="margin-bottom: 30px;">
                <div class="card-title">MÉTODO DE PAGO</div>
                <div class="payment-methods">
                    <span class="payment-badge payment-{{ strtolower(str_replace('_', '', $venta->tipo_pago ?? 'cash')) }}">
                        💰 {{ $venta->tipo_pago_nombre ?? 'EFECTIVO' }}
                    </span>
                    @if($venta->tipo_pago === 'TRANSFERENCIA' && $venta->referencia_transferencia)
                        <span class="payment-badge payment-transfer">🔢 Ref: {{ $venta->referencia_transferencia }}</span>
                    @endif
                    @if(in_array($venta->tipo_pago, ['TARJETA_DEBITO', 'TARJETA_CREDITO']))
                        <span class="payment-badge payment-card">💳 ****{{ $venta->ultimos_digitos_tarjeta ?? '****' }}</span>
                    @endif
                    @if($venta->tipo_pago === 'CHEQUE')
                        <span class="payment-badge payment-check">📝 Ch#: {{ $venta->numero_cheque ?? 'N/A' }}</span>
                    @endif
                </div>
                @if($venta->tipo_pago === 'CREDITO' && $venta->dias_credito)
                    <div class="info-row" style="margin-top: 12px;">
                        <span class="info-label">Plazo de Crédito:</span>
                        <span class="info-value">{{ $venta->dias_credito }} días</span>
                    </div>
                @endif
            </div>
            
            <!-- Products Table -->
            <div class="products-section">
                <div class="section-title">DETALLE DE PRODUCTOS Y SERVICIOS</div>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th width="40%">DESCRIPCIÓN</th>
                            <th width="10%">CANT.</th>
                            <th width="15%">PRECIO UNIT.</th>
                            <th width="10%">DTO. %</th>
                            <th width="10%">ITBIS %</th>
                            <th width="10%">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($venta->detalles as $index => $detalle)
                            @php
                                $subtotalProducto = $detalle->cantidad * $detalle->precio_unitario;
                                $descuentoProducto = $subtotalProducto * ($detalle->descuento / 100);
                                $subtotalConDescuento = $subtotalProducto - $descuentoProducto;
                                $itbisProducto = $subtotalConDescuento * ($detalle->itbis_porcentaje / 100);
                                $totalProducto = $subtotalConDescuento + $itbisProducto;
                            @endphp
                            <tr>
                                <td class="text-center">{{ $index + 1 }}</td>
                                <td>
                                    <strong>{{ $detalle->producto->nombre ?? 'Producto eliminado' }}</strong>
                                    @if($detalle->producto->codigo ?? false)
                                        <br><small style="color: #9ca3af;">Cód: {{ $detalle->producto->codigo }}</small>
                                    @endif
                                </td>
                                <td class="text-center">{{ number_format($detalle->cantidad, 2) }}</td>
                                <td class="text-right">${{ number_format($detalle->precio_unitario, 2) }}</td>
                                <td class="text-center">{{ number_format($detalle->descuento, 2) }}%</td>
                                <td class="text-center">{{ number_format($detalle->itbis_porcentaje, 2) }}%</td>
                                <td class="text-right"><strong>${{ number_format($totalProducto, 2) }}</strong></td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center" style="padding: 40px;">No hay productos registrados en esta factura</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <!-- Totals -->
            <div class="totals-section">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-amount">${{ number_format($venta->subtotal, 2) }}</span>
                </div>
                @if($venta->descuento_productos > 0)
                <div class="total-row">
                    <span class="total-label">Descuento por productos:</span>
                    <span class="total-amount" style="color: #dc2626;">-${{ number_format($venta->descuento_productos, 2) }}</span>
                </div>
                @endif
                @if($venta->descuento_global > 0)
                <div class="total-row">
                    <span class="total-label">Descuento global ({{ number_format($venta->descuento_global, 2) }}%):</span>
                    <span class="total-amount" style="color: #dc2626;">-${{ number_format($venta->descuento_global_monto ?? ($venta->subtotal * $venta->descuento_global / 100), 2) }}</span>
                </div>
                @endif
                <div class="total-row">
                    <span class="total-label">Subtotal después de descuentos:</span>
                    <span class="total-amount">${{ number_format($venta->subtotal - ($venta->descuento_total ?? 0), 2) }}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">ITBIS ({{ $venta->itbis_porcentaje ?? '18' }}%):</span>
                    <span class="total-amount">${{ number_format($venta->itbis, 2) }}</span>
                </div>
                <div class="total-row grand-total-row">
                    <span class="total-label grand-total-label">TOTAL A PAGAR:</span>
                    <span class="total-amount grand-total-amount">${{ number_format($venta->total, 2) }}</span>
                </div>
            </div>
            
            <!-- Notes -->
            @if($venta->notas || $venta->observaciones)
            <div class="notes-section">
                <div class="notes-title">📝 NOTAS Y OBSERVACIONES</div>
                <div class="notes-text">{{ $venta->notas ?? $venta->observaciones }}</div>
            </div>
            @endif
            
            <!-- Additional Information -->
            <div class="info-card" style="margin: 20px 0;">
                <div class="card-title">INFORMACIÓN ADICIONAL</div>
                <div class="info-row">
                    <span class="info-label">Caja Registradora:</span>
                    <span class="info-value">{{ $venta->caja->nombre ?? 'Caja Principal' }} - {{ $venta->caja->usuario->name ?? 'Sistema' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha de Registro:</span>
                    <span class="info-value">{{ $venta->created_at->format('d/m/Y h:i A') }}</span>
                </div>
                @if($venta->updated_at != $venta->created_at)
                <div class="info-row">
                    <span class="info-label">Última Modificación:</span>
                    <span class="info-value">{{ $venta->updated_at->format('d/m/Y h:i A') }}</span>
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">ID Transacción:</span>
                    <span class="info-value">#{{ $venta->id }}</span>
                </div>
            </div>
            
            <!-- Signatures -->
            <div class="signatures">
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <div class="signature-label">RECIBIDO POR (CLIENTE)</div>
                    <div class="signature-label" style="margin-top: 5px;">Fecha: ___/___/_____</div>
                </div>
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <div class="signature-label">ENTREGADO POR (VENDEDOR)</div>
                    <div class="signature-label" style="margin-top: 5px;">{{ $venta->vendedor->name ?? '_________________' }}</div>
                </div>
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <div class="signature-label">AUTORIZADO POR (CAJA)</div>
                    <div class="signature-label" style="margin-top: 5px;">{{ $venta->caja->usuario->name ?? '_________________' }}</div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text">
                    <strong>¡Gracias por su compra!</strong><br>
                    Este documento es una factura fiscal válida según las disposiciones de la DGII.<br>
                    Para cualquier consulta, comuníquese al {{ config('app.phone', '(809) 555-1234') }} o a {{ config('app.email', 'ventas@erpsistema.com') }}<br>
                    <span style="font-size: 8px;">Documento generado electrónicamente - Válido sin firma - {{ now()->format('d/m/Y h:i A') }}</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>