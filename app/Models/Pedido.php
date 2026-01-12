<?php
// app/Models/Pedido.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    protected $fillable = [
        'numero_pedido',
        'cliente_id',
        'sucursal_id',
        'user_id',
        'fecha_pedido',
        'fecha_entrega',
        'estado',
        'total',
        'notas'
    ];
    
    protected $casts = [
        'fecha_pedido' => 'date',
        'fecha_entrega' => 'date',
        'total' => 'decimal:2'
    ];
    
    /**
     * Relaciones
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
    
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function detalles(): HasMany
    {
        return $this->hasMany(DetallePedido::class);
    }
    
    /**
     * Scope para pedidos pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }
    
    /**
     * Scope para pedidos del día
     */
    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_pedido', today());
    }
    
    /**
     * Calcular total del pedido
     */
    public function calcularTotal()
    {
        $this->total = $this->detalles->sum('subtotal');
        $this->save();
    }
    
    /**
     * Procesar pedido (convertir a venta)
     */
    public function procesar()
    {
        if ($this->estado !== 'PENDIENTE') {
            throw new \Exception('El pedido ya fue procesado');
        }
        
        \DB::transaction(function () {
            // Crear venta a partir del pedido
            $venta = Venta::create([
                'cliente_id' => $this->cliente_id,
                'sucursal_id' => $this->sucursal_id,
                'user_id' => $this->user_id,
                'fecha_venta' => now(),
                'condicion_pago' => 'CONTADO',
                'subtotal' => $this->total,
                'itbis' => 0,
                'total' => $this->total,
                'notas' => "Generado desde pedido #{$this->numero_pedido}"
            ]);
            
            // Crear detalles de venta
            foreach ($this->detalles as $detallePedido) {
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $detallePedido->producto_id,
                    'cantidad' => $detallePedido->cantidad,
                    'precio_unitario' => $detallePedido->precio_unitario,
                    'subtotal' => $detallePedido->subtotal
                ]);
            }
            
            $this->estado = 'PROCESADO';
            $this->save();
        });
    }
}