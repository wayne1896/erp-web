<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura de Crédito Fiscal Electrónica #{{ $venta->numero_factura }}</title>
    @php
        // Cargar perfil de empresa de forma simple
        try {
            $companyProfile = \App\Models\CompanyProfile::where('is_active', true)->first();
            if ($companyProfile) {
                // Generar logo URL relativa para DomPDF
                if ($companyProfile->logo_path) {
                    // Usar ruta relativa en lugar de URL absoluta
                    $companyProfile->logo_path_relative = 'storage/' . $companyProfile->logo_path;
                    $companyProfile->logo_url = null; // No usar URL absoluta
                } else {
                    $companyProfile->logo_path_relative = null;
                    $companyProfile->logo_url = null;
                }
                
                // Debug: Log para verificar datos
                \Log::info('Factura - Company Profile cargado', [
                    'id' => $companyProfile->id,
                    'company_name' => $companyProfile->company_name,
                    'legal_name' => $companyProfile->legal_name,
                    'display_name' => $companyProfile->display_name,
                    'logo_path_relative' => $companyProfile->logo_path_relative,
                    'rnc' => $companyProfile->rnc
                ]);
            } else {
                \Log::info('Factura - No hay company profile activo');
            }
        } catch (\Exception $e) {
            \Log::error('Factura - Error cargando company profile: ' . $e->getMessage());
            $companyProfile = null;
        }
    @endphp
    <style>
        @page {
            size: A4;
            margin: 0.5cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 10px;
        }
        
        .invoice-container {
            max-width: 21cm;
            margin: 0 auto;
            background: white;
            position: relative;
        }
        
        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 900;
            color: rgba(200, 200, 200, 0.3);
            z-index: -1;
            pointer-events: none;
        }
        
        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
                    width: 80px;
                    height: 80px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    background: #f9fafb;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 11px;
            line-height: 1.3;
            color: #333;
        }
        
        .invoice-info {
            text-align: right;
            flex-shrink: 0;
        }
        
        .invoice-title {
            font-size: 16px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
            text-align: right;
        }
        
        .invoice-details {
            font-size: 11px;
            text-align: right;
            line-height: 1.4;
        }
        
        /* Client Section */
        .client-section {
            margin-bottom: 20px;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
        }
        
        .client-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .client-field {
            font-size: 12px;
            margin-bottom: 5px;
        }
        
        .client-label {
            font-weight: bold;
        }
        
        .client-value {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
            padding-bottom: 2px;
        }
        
        /* Table */
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        .products-table th {
            background: #f0f0f0;
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
        }
        
        .products-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: center;
        }
        
        .products-table td.description {
            text-align: left;
        }
        
        .products-table td.amount {
            text-align: right;
        }
        
        /* Summary Section */
        .summary-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-top: 2px solid #000;
            padding-top: 15px;
        }
        
        .qr-section {
            flex: 1;
            max-width: 200px;
        }
        
        .qr-code {
            width: 80px;
            height: 80px;
            border: 1px solid #000;
            margin-bottom: 10px;
            background: white;
        }
        
        .security-info {
            font-size: 9px;
            line-height: 1.3;
        }
        
        .totals-section {
            flex: 1;
            max-width: 300px;
            border: 1px solid #000;
            padding: 10px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
        }
        
        .total-row.grand-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 10px;
        }
        
        .total-label {
            font-weight: bold;
        }
        
        .total-amount {
            text-align: right;
            min-width: 100px;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 9px;
            color: #666;
        }
        
        .disclaimer {
            font-style: italic;
            margin-bottom: 10px;
        }
        
        /* Print Styles */
        @media print {
            body {
                padding: 0;
                font-size: 10px;
            }
            
            .watermark {
                color: rgba(200, 200, 200, 0.2);
            }
            
            .invoice-container {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Watermark -->
        @if($venta->estado === 'ANULADA')
            <div class="watermark">ANULADA</div>
        @endif
        
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">
                    @if($companyProfile && $companyProfile->logo_path_relative)
                        <img src="{{ $companyProfile->logo_path_relative }}" alt="Logo" style="width: 100%; height: 100%; border-radius: 8px; object-fit: cover;">
                    @else
                        📦
                    @endif
                </div>
                <div class="company-name">
                    {{ $companyProfile->display_name ?? config('app.name', 'ERP SISTEMA') }}
                </div>
                <div class="company-details">
                    @if($companyProfile)
                        @if($companyProfile->legal_name && $companyProfile->legal_name !== $companyProfile->company_name)
                            <div>{{ $companyProfile->legal_name }}</div>
                        @endif
                        @if($companyProfile->branch_name)
                            <div>Sucursal {{ $companyProfile->branch_name }}</div>
                        @endif
                        <div>RNC {{ str_replace(['-', ' '], '', $companyProfile->rnc) }}</div>
                        <div>Dirección: {{ $companyProfile->address }}</div>
                        <div>Fecha Emisión: {{ $venta->created_at->format('d-m-Y') }}</div>
                    @else
                        <div>{{ config('app.legal_name', 'ERP SISTEMA SRL') }}</div>
                        <div>Sucursal {{ config('app.branch_name', 'Principal') }}</div>
                        <div>RNC {{ str_replace(['-', ' '], '', config('app.rnc', '123456789')) }}</div>
                        <div>Dirección: {{ config('app.address', 'Calle Principal #123, Santo Domingo') }}</div>
                        <div>Fecha Emisión: {{ $venta->created_at->format('d-m-Y') }}</div>
                    @endif
                </div>
            </div>
            
            <div class="invoice-info">
                <div class="invoice-title">Factura de Crédito Fiscal Electrónica</div>
                <div class="invoice-details">
                    <div><strong>e-NCF:</strong> {{ $venta->ncf ?? 'E310000000001' }}</div>
                    @if($venta->fecha_vencimiento)
                        <div><strong>Fecha Vencimiento:</strong> {{ $venta->fecha_vencimiento->format('d-m-Y') }}</div>
                    @endif
                    <div><strong>Número:</strong> {{ $venta->numero_factura }}</div>
                </div>
            </div>
        </div>
        
        <!-- Client Section -->
        <div class="client-section">
            <div class="client-info">
                <div>
                    <div class="client-field">
                        <span class="client-label">Razón Social Cliente:</span>
                        <span class="client-value">{{ $venta->cliente->nombre_completo ?? 'CONSUMIDOR FINAL' }}</span>
                    </div>
                </div>
                <div>
                    <div class="client-field">
                        <span class="client-label">RNC Cliente:</span>
                        <span class="client-value">{{ $venta->cliente->cedula_rnc ?? $venta->cliente->cedula ?? '000000000' }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Products Table -->
        <table class="products-table">
            <thead>
                <tr>
                    <th width="8%">Cantidad</th>
                    <th width="45%">Descripción</th>
                    <th width="12%">Unidad de Medida</th>
                    <th width="12%">Precio</th>
                    <th width="12%">ITBIS</th>
                    <th width="11%">Valor</th>
                </tr>
            </thead>
            <tbody>
                @forelse($venta->detalles as $detalle)
                    @php
                        $cantidad = $detalle->cantidad;
                        $precioUnitario = $detalle->precio_unitario;
                        $itbisPorcentaje = $detalle->itbis_porcentaje ?? 18;
                        $itbisMonto = $cantidad * $precioUnitario * ($itbisPorcentaje / 100);
                        $valorTotal = ($cantidad * $precioUnitario) + $itbisMonto;
                    @endphp
                    <tr>
                        <td>{{ number_format($cantidad, 2) }}</td>
                        <td class="description">
                            {{ $detalle->producto->nombre ?? 'Producto eliminado' }}
                            @if($detalle->producto->codigo ?? false)
                                <br><small>(Cód: {{ $detalle->producto->codigo }})</small>
                            @endif
                        </td>
                        <td>{{ $detalle->producto->unidad_medida ?? 'UNI' }}</td>
                        <td class="amount">{{ number_format($precioUnitario, 2) }}</td>
                        <td class="amount">{{ number_format($itbisMonto, 2) }}</td>
                        <td class="amount">{{ number_format($valorTotal, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            No hay productos registrados en esta factura
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        
        <!-- Summary Section -->
        <div class="summary-section">
            <div class="qr-section">
                @php
                    $qrData = json_encode([
                        'eNCF' => $venta->ncf ?? 'E310000000001',
                        'RNCEmisor' => str_replace(['-', ' '], '', $companyProfile->rnc ?? config('app.rnc', '123456789')),
                        'FechaEmision' => $venta->created_at->format('Y-m-d H:i:s'),
                        'Total' => number_format($venta->total, 2, '.', ''),
                        'RNCCliente' => str_replace(['-', ' '], '', $venta->cliente->cedula_rnc ?? $venta->cliente->cedula ?? '000000000')
                    ]);
                    
                    // Generar URL para QR Server API (más confiable que Google Charts)
                    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&format=png&data=' . urlencode($qrData);
                @endphp
                <div class="qr-code">
                    <!-- QR Code usando QR Server API (más profesional) -->
                    <img src="{{ $qrUrl }}" alt="QR Código" style="width: 80px; height: 80px; border: 1px solid #ccc;" />
                </div>
                <div class="security-info">
                    <div><strong>Código de Seguridad:</strong> {{ substr(md5($venta->id . $venta->ncf . $venta->total), 0, 10) }}</div>
                    <div><strong>Fecha Firma:</strong> {{ $venta->created_at->format('d-m-Y H:i:s') }}</div>
                </div>
            </div>
            
            <div class="totals-section">
                <div class="total-row">
                    <span class="total-label">Subtotal Gravado:</span>
                    <span class="total-amount">{{ number_format($venta->subtotal, 2) }}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">Total ITBIS:</span>
                    <span class="total-amount">{{ number_format($venta->itbis, 2) }}</span>
                </div>
                @if($venta->descuento > 0)
                    <div class="total-row">
                        <span class="total-label">Descuento:</span>
                        <span class="total-amount">-{{ number_format($venta->descuento, 2) }}</span>
                    </div>
                @endif
                <div class="total-row grand-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount">{{ number_format($venta->total, 2) }}</span>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="disclaimer">
                *Este modelo de comprobante fiscal es generado electrónicamente y cumple con las disposiciones de la DGII.
            </div>
            <div>
                <strong>{{ $companyProfile->display_name ?? config('app.name', 'ERP SISTEMA') }}</strong> | 
                RNC {{ str_replace(['-', ' '], '', $companyProfile->rnc ?? config('app.rnc', '123456789')) }} | 
                Tel: {{ $companyProfile->phone ?? config('app.phone', '(809) 555-1234') }} | 
                Email: {{ $companyProfile->email ?? config('app.email', 'info@erpsistema.com') }}
            </div>
            <div>
                Fecha de Emisión Electrónica: {{ $venta->created_at->format('d-m-Y H:i:s') }} | 
                ID Transacción: #{{ $venta->id }}
            </div>
        </div>
    </div>
</body>
</html>