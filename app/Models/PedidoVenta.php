<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoVenta extends Model
{
    protected $table = 'pedido_venta';
    
    protected $fillable = [
        'pedido_id',
        'venta_id',
        'tipo_conversion',
        'porcentaje_convertido'
    ];
    
    protected $casts = [
        'porcentaje_convertido' => 'decimal:2'
    ];
    
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
    
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }
}