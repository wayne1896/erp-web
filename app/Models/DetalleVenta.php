<?php
// app/Models/DetalleVenta.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    protected $table = 'detalle_ventas';
    
    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'descuento',
        'subtotal',
        'itbis_porcentaje',
        'itbis_monto',
        'total'
    ];
    
    protected $casts = [
        'cantidad' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'descuento' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'itbis_porcentaje' => 'decimal:2',
        'itbis_monto' => 'decimal:2',
        'total' => 'decimal:2'
    ];
    
    /**
     * Relaciones
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }
    
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
    
    /**
     * Eventos del modelo
     */
    protected static function booted()
    {
        static::saving(function ($detalle) {
            // Calcular subtotal
            $detalle->subtotal = $detalle->cantidad * $detalle->precio_unitario;
            
            // Calcular ITBIS
            $detalle->itbis_monto = $detalle->subtotal * ($detalle->itbis_porcentaje / 100);
            
            // Calcular total
            $detalle->total = $detalle->subtotal - $detalle->descuento + $detalle->itbis_monto;
        });
    }
    
    /**
     * Precio unitario con ITBIS
     */
    public function precioConItbis(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->precio_unitario * (1 + ($this->itbis_porcentaje / 100))
        );
    }
}