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
        // Cargar relaciones necesarias
        $venta->load([
            'cliente',
            'vendedor',
            'caja.usuario',
            'detalles.producto'
        ]);

        // Generar el PDF
        $pdf = Pdf::loadView('ventas.factura', compact('venta')) // ← CORREGIDO: Pdf:: en lugar de PDF::
            ->setPaper('A4')
            ->setOption('defaultFont', 'Arial')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        // Nombre del archivo
        $filename = 'factura_' . $venta->numero_factura . '_' . date('Y-m-d_H-i-s') . '.pdf';

        // Descargar el PDF
        return $pdf->download($filename);
    }

    /**
     * Vista previa del PDF en el navegador
     */
    public function vistaPrevia(Venta $venta)
    {
        // Cargar relaciones necesarias
        $venta->load([
            'cliente',
            'vendedor',
            'caja.usuario',
            'detalles.producto'
        ]);

        // Generar el PDF para vista previa
        $pdf = Pdf::loadView('ventas.factura', compact('venta')) // ← CORREGIDO: Pdf:: en lugar de PDF::
            ->setPaper('A4')
            ->setOption('defaultFont', 'Arial')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        // Mostrar en el navegador
        return $pdf->stream('factura_' . $venta->numero_factura . '.pdf');
    }

    /**
     * Imprimir PDF directamente
     */
    public function imprimir(Venta $venta)
    {
        // Cargar relaciones necesarias
        $venta->load([
            'cliente',
            'vendedor',
            'caja.usuario',
            'detalles.producto'
        ]);

        // Generar el PDF
        $pdf = Pdf::loadView('ventas.factura', compact('venta')) // ← CORREGIDO: Pdf:: en lugar de PDF::
            ->setPaper('A4')
            ->setOption('defaultFont', 'Arial')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        // Nombre del archivo
        $filename = 'factura_' . $venta->numero_factura . '_' . date('Y-m-d_H-i-s') . '.pdf';

        // Descargar el PDF
        return $pdf->download($filename);
    }
}