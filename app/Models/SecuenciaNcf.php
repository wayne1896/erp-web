<?php
// app/Models/SecuenciaNcf.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecuenciaNcf extends Model
{
    protected $table = 'secuencias_ncf';
    
    protected $fillable = [
        'tipo_comprobante',
        'prefijo',
        'secuencia_inicial',
        'secuencia_actual',
        'secuencia_final',
        'fecha_vigencia_desde',
        'fecha_vigencia_hasta',
        'activo'
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'fecha_vigencia_desde' => 'date',
        'fecha_vigencia_hasta' => 'date'
    ];
    
    /**
     * Scope para secuencias activas
     */
    public function scopeActivas($query)
    {
        $now = now()->format('Y-m-d');
        return $query->where('activo', true)
                    ->where('fecha_vigencia_desde', '<=', $now)
                    ->where('fecha_vigencia_hasta', '>=', $now);
    }
    
    /**
     * Obtener secuencia por tipo
     */
    public static function obtenerPorTipo($tipo)
    {
        return self::activas()->where('tipo_comprobante', $tipo)->first();
    }
    
    /**
     * Generar NCF
     */
    public function generarNcf(): string
    {
        if ($this->secuencia_actual >= $this->secuencia_final) {
            throw new \Exception('Secuencia NCF agotada');
        }
        
        $ncf = $this->prefijo . str_pad($this->secuencia_actual, 10, '0', STR_PAD_LEFT);
        $this->increment('secuencia_actual');
        
        return $ncf;
    }
    
    /**
     * Descripción del tipo de comprobante
     */
    public function descripcionComprobante(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $tipos = [
                    '01' => 'Facturas de Crédito Fiscal',
                    '02' => 'Facturas de Consumo',
                    '03' => 'Notas de Débito',
                    '04' => 'Notas de Crédito',
                    '11' => 'Comprobantes de Compras',
                    '12' => 'Comprobantes de Gastos Menores',
                    '13' => 'Comprobantes para Régimenes Especiales',
                    '14' => 'Comprobantes Gubernamentales',
                    '15' => 'Comprobantes para Exportaciones'
                ];
                
                return $tipos[$attributes['tipo_comprobante']] ?? 'Desconocido';
            }
        );
    }
}