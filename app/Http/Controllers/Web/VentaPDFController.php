<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use Barryvdh\DomPDF\Facade\Pdf; // ← CORREGIDO: use Barryvdh\DomPDF\Facade\Pdf;

class VentaPDFController extends Controller
{
    /**
     * Generar PDF de una venta
     */
    public function generarPDF(Venta $venta)
    {
        try {
            // Cargar relaciones necesarias con eager loading optimizado
            $venta->load([
                'cliente:id,nombre_completo,cedula_rnc,tipo_contribuyente',
                'vendedor:id,name',
                'caja.usuario:id,name',
                'detalles.producto:id,nombre,codigo'
            ]);

            // Generar el PDF con opciones optimizadas (habilitar remote para QR Server API)
            $pdf = Pdf::loadView('ventas.factura', compact('venta'))
                ->setPaper('A4')
                ->setOption('defaultFont', 'Helvetica')
                ->setOption('isRemoteEnabled', true) // Habilitar para QR Server API
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('enableImports', false) // Deshabilitar imports para velocidad
                ->setOption('enablePhp', true);

            // Nombre del archivo
            $filename = 'factura_' . $venta->numero_factura . '_' . date('Y-m-d_H-i-s') . '.pdf';

            // Descargar el PDF
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            \Log::error('Error generando PDF: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Vista previa del PDF en el navegador
     */
    public function vistaPrevia(Venta $venta)
    {
        try {
            \Log::info('Iniciando vista previa PDF para venta: ' . $venta->id);
            
            // Cargar relaciones necesarias con eager loading optimizado
            $venta->load([
                'cliente:id,nombre_completo,cedula_rnc,tipo_contribuyente',
                'vendedor:id,name',
                'caja.usuario:id,name',
                'detalles.producto:id,nombre,codigo'
            ]);
            
            \Log::info('Relaciones cargadas para venta: ' . $venta->id);
            
            // Debug: Verificar datos que se pasan a la vista
            \Log::info('Datos de venta que se pasan a la vista:', [
                'venta_id' => $venta->id,
                'numero_factura' => $venta->numero_factura,
                'cliente_nombre' => $venta->cliente->nombre_completo ?? 'N/A',
                'total' => $venta->total,
                'estado' => $venta->estado
            ]);

            // Generar el PDF con opciones optimizadas (habilitar remote para QR Server API)
            $pdf = Pdf::loadView('ventas.factura', compact('venta'))
                ->setPaper('A4')
                ->setOption('defaultFont', 'Helvetica')
                ->setOption('isRemoteEnabled', true) // Habilitar para QR Server API
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('enableImports', false) // Deshabilitar imports para velocidad
                ->setOption('enablePhp', true);
            
            \Log::info('PDF generado para venta: ' . $venta->id);

            // Mostrar el PDF en el navegador
            return $pdf->stream('factura_' . $venta->numero_factura . '.pdf');
            
        } catch (\Exception $e) {
            \Log::error('Error en vista previa PDF: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Error al generar la vista previa: ' . $e->getMessage());
        }
    }

    /**
     * Imprimir PDF directamente
     */
    public function imprimir(Venta $venta)
    {
        try {
            \Log::info('Iniciando impresión PDF para venta: ' . $venta->id);
            
            // Cargar relaciones necesarias con eager loading optimizado
            $venta->load([
                'cliente:id,nombre_completo,cedula_rnc,tipo_contribuyente',
                'vendedor:id,name',
                'caja.usuario:id,name',
                'detalles.producto:id,nombre,codigo'
            ]);
            
            \Log::info('Relaciones cargadas para impresión venta: ' . $venta->id);

            // Generar el PDF con opciones optimizadas (habilitar remote para QR Server API)
            $pdf = Pdf::loadView('ventas.factura', compact('venta'))
                ->setPaper('A4')
                ->setOption('defaultFont', 'Helvetica')
                ->setOption('isRemoteEnabled', true) // Habilitar para QR Server API
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('enableImports', false) // Deshabilitar imports para velocidad
                ->setOption('enablePhp', true);
            
            \Log::info('PDF generado para impresión venta: ' . $venta->id);

            // Mostrar el PDF en el navegador para impresión
            return $pdf->stream('factura_' . $venta->numero_factura . '.pdf');
            
        } catch (\Exception $e) {
            \Log::error('Error en impresión PDF: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Error al generar el PDF para impresión: ' . $e->getMessage());
        }
    }

    /**
     * Verificar autenticidad de factura (pública)
     */
    public function verificarFactura(Venta $venta)
    {
        try {
            // Cargar relaciones necesarias
            $venta->load([
                'cliente',
                'vendedor',
                'caja.usuario',
                'detalles.producto'
            ]);

            // Preparar datos de verificación
            $verificationData = [
                'factura' => [
                    'numero' => $venta->numero_factura,
                    'ncf' => $venta->ncf,
                    'fecha_emision' => $venta->created_at->format('d/m/Y H:i:s'),
                    'fecha_venta' => $venta->fecha_venta->format('d/m/Y'),
                    'total' => number_format($venta->total, 2),
                    'subtotal' => number_format($venta->subtotal, 2),
                    'itbis' => number_format($venta->itbis, 2),
                    'estado' => $venta->estado,
                    'tipo_comprobante' => $venta->tipo_comprobante,
                    'condicion_pago' => $venta->condicion_pago,
                    'tipo_pago' => $venta->tipo_pago,
                ],
                'empresa' => [
                    'nombre' => config('app.name', 'ERP SISTEMA'),
                    'rnc' => config('app.rnc', '1-23-45678-9'),
                    'direccion' => config('app.address', 'Av. Principal #123, Santo Domingo'),
                    'telefono' => config('app.phone', '(809) 555-1234'),
                    'email' => config('app.email', 'ventas@erpsistema.com'),
                ],
                'cliente' => [
                    'nombre' => $venta->cliente->nombre_completo ?? 'CONSUMIDOR FINAL',
                    'cedula_rnc' => $venta->cliente->cedula_rnc ?? $venta->cliente->cedula ?? '000-0000000-0',
                    'tipo_contribuyente' => $venta->cliente->tipo_contribuyente ?? 'CONSUMIDOR_FINAL',
                ],
                'vendedor' => [
                    'nombre' => $venta->vendedor->name ?? 'Sistema',
                ],
                'caja' => [
                    'nombre' => $venta->caja->nombre ?? 'Caja Principal',
                    'usuario' => $venta->caja->usuario->name ?? 'Sistema',
                ],
                'productos' => $venta->detalles->map(function ($detalle) {
                    return [
                        'nombre' => $detalle->producto->nombre ?? 'Producto eliminado',
                        'codigo' => $detalle->producto->codigo ?? null,
                        'cantidad' => number_format($detalle->cantidad, 2),
                        'precio_unitario' => number_format($detalle->precio_unitario, 2),
                        'descuento' => number_format($detalle->descuento, 2),
                        'itbis_porcentaje' => number_format($detalle->itbis_porcentaje, 2),
                        'total' => number_format(($detalle->cantidad * $detalle->precio_unitario) * (1 - $detalle->descuento / 100) * (1 + $detalle->itbis_porcentaje / 100), 2),
                    ];
                }),
                'verificacion' => [
                    'url' => route('facturas.verify', $venta->id),
                    'fecha_verificacion' => now()->format('d/m/Y H:i:s'),
                    'codigo_verificacion' => hash('sha256', $venta->id . $venta->numero_factura . $venta->total . $venta->created_at),
                    'estado_dgii' => $venta->estado_dgii ?? 'No procesada',
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Factura verificada correctamente',
                'data' => $verificationData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar la factura: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}