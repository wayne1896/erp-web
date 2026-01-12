<?php
// app/Models/ConfiguracionEmpresa.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ConfiguracionEmpresa extends Model
{
    protected $table = 'configuracion_empresa';
    
    protected $fillable = [
        'nombre_empresa',
        'rnc',
        'telefono',
        'email',
        'direccion',
        'provincia',
        'municipio',
        'sector',
        'actividad_economica',
        'itbis',
        'regimen_pago',
        'facturacion_electronica',
        'certificado_digital_path',
        'pin_certificado',
        'configuraciones'
    ];
    
    protected $casts = [
        'facturacion_electronica' => 'boolean',
        'itbis' => 'decimal:2',
        'configuraciones' => 'array'
    ];
    
    /**
     * Obtener RNC formateado
     */
    public function rncFormateado(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $rnc = $attributes['rnc'] ?? '';
                if (strlen($rnc) == 9) {
                    return substr($rnc, 0, 1) . '-' . substr($rnc, 1, 2) . '-' . 
                           substr($rnc, 3, 5) . '-' . substr($rnc, 8, 1);
                }
                return $rnc;
            }
        );
    }
    
    /**
     * Obtener dirección completa
     */
    public function direccionCompleta(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                return sprintf('%s, %s, %s, %s',
                    $attributes['direccion'] ?? '',
                    $attributes['sector'] ?? '',
                    $attributes['municipio'] ?? '',
                    $attributes['provincia'] ?? ''
                );
            }
        );
    }
    
    /**
     * Obtener tasa ITBIS como decimal
     */
    public function tasaItbisDecimal(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['itbis'] / 100
        );
    }
}