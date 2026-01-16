<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogPedido extends Model
{
    protected $table = 'log_pedidos';
    
    protected $fillable = [
        'pedido_id',
        'user_id',
        'accion',
        'descripcion',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent'
    ];
    
    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array'
    ];
    
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}