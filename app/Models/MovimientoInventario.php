<?php
// app/Models/MovimientoInventario.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoInventario extends Model
{
    protected $table = 'movimientos_inventario';
    
    protected $fillable = [
        'producto_id',
        'sucursal_id',
        'usuario_id',
        'tipo',
        'cantidad',
        'cantidad_anterior',
        'cantidad_nueva',
        'costo',
        'motivo'
    ];
    
    protected $casts = [
        'cantidad' => 'decimal:2',
        'cantidad_anterior' => 'decimal:2',
        'cantidad_nueva' => 'decimal:2',
        'costo' => 'decimal:2'
    ];
    
    /**
     * Relaciones
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
    
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scope para tipos específicos
     */
    public function scopeEntradas($query)
    {
        return $query->where('tipo', 'entrada');
    }
    
    public function scopeSalidas($query)
    {
        return $query->where('tipo', 'salida');
    }
    
    public function scopeAjustes($query)
    {
        return $query->where('tipo', 'ajuste');
    }
    
    public function scopeTransferencias($query)
    {
        return $query->where('tipo', 'transferencia');
    }
}