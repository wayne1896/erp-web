<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DireccionEntrega extends Model
{
    protected $table = 'direcciones_entrega';
    
    protected $fillable = [
        'pedido_id',
        'nombre_contacto',
        'telefono_contacto',
        'direccion',
        'ciudad',
        'provincia',
        'sector',
        'codigo_postal',
        'instrucciones_entrega',
        'latitud',
        'longitud'
    ];
    
    protected $casts = [
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8'
    ];
    
    /**
     * Relación con el pedido
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
}
