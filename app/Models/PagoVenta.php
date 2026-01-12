<?php
// app/Models/PagoVenta.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoVenta extends Model
{
    protected $table = 'pagos_ventas';
    
    protected $fillable = [
        'venta_id',
        'monto',
        'metodo_pago',
        'referencia',
        'observaciones',
        'fecha_pago',
        'user_id',
    ];
    
    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
    ];
    
    /**
     * Relaciones
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }
    
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    /**
     * Scope para pagos del día
     */
    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_pago', today());
    }
    
    /**
     * Scope por método de pago
     */
    public function scopePorMetodo($query, $metodo)
    {
        return $query->where('metodo_pago', $metodo);
    }
    
    /**
     * Referencia formateada
     */
    public function referenciaFormateada(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $metodo = $attributes['metodo_pago'] ?? '';
                $referencia = $attributes['referencia'] ?? '';
                
                return strtoupper($metodo) . '-' . $referencia;
            }
        );
    }
}