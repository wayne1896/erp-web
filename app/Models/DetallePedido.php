<?php
// app/Models/DetallePedido.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetallePedido extends Model
{
    protected $table = 'detalle_pedidos';
    
    protected $fillable = [
        'pedido_id',
        'producto_id',
        'cantidad_solicitada', // CAMBIAR: 'cantidad' → 'cantidad_solicitada'
        'precio_unitario',
        'subtotal',
        'cantidad_entregada', // Agregar este campo también
        'descuento',
        'descuento_monto',
        'itbis_porcentaje',
        'itbis_monto',
        'total',
        'reservado_stock',
        'inventario_sucursal_id',
        'precio_original',
        'costo_unitario',
        'observaciones'
    ];
    
    protected $casts = [
        'cantidad_solicitada' => 'decimal:2', // CAMBIAR AQUÍ
        'cantidad_entregada' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'descuento' => 'decimal:2',
        'descuento_monto' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'itbis_porcentaje' => 'decimal:2',
        'itbis_monto' => 'decimal:2',
        'total' => 'decimal:2',
        'precio_original' => 'decimal:2',
        'costo_unitario' => 'decimal:2',
        'reservado_stock' => 'boolean'
    ];
    
    /**
     * Relaciones
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
    
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
    
    public function inventario(): BelongsTo
    {
        return $this->belongsTo(InventarioSucursal::class, 'inventario_sucursal_id');
    }
    
    /**
     * Eventos del modelo
     */
    protected static function booted()
    {
        static::saving(function ($detalle) {
            // Actualizar cálculo del subtotal usando cantidad_solicitada
            $detalle->subtotal = $detalle->cantidad_solicitada * $detalle->precio_unitario;
        });
    }
}