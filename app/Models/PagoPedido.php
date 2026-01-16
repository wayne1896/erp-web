<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoPedido extends Model
{
    protected $table = 'pagos_pedidos';
    
    protected $fillable = [
        'pedido_id',
        'numero_referencia',
        'monto',
        'tipo',
        'metodo_pago',
        'banco',
        'numero_cheque',
        'ultimos_digitos_tarjeta',
        'autorizacion',
        'fecha_pago',
        'estado',
        'observaciones',
        'caja_id',
        'user_id'
    ];
    
    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'date'
    ];
    
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }
}