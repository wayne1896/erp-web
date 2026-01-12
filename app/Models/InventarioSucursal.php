<?php
// app/Models/InventarioSucursal.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventarioSucursal extends Model
{
    protected $table = 'inventario_sucursal';
    
    protected $fillable = [
        'producto_id',
        'sucursal_id',
        'stock_actual',
        'stock_reservado',
        'stock_disponible',
        'costo_promedio',
        'valor_inventario'
    ];
    
    protected $casts = [
        'stock_actual' => 'decimal:2',
        'stock_reservado' => 'decimal:2',
        'stock_disponible' => 'decimal:2',
        'costo_promedio' => 'decimal:2',
        'valor_inventario' => 'decimal:2'
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
    
    /**
     * Eventos del modelo
     */
    protected static function booted()
    {
        static::saving(function ($inventario) {
            // Calcular stock disponible
            $inventario->stock_disponible = 
                $inventario->stock_actual - $inventario->stock_reservado;
            
            // Calcular valor del inventario
            $inventario->valor_inventario = 
                $inventario->stock_actual * $inventario->costo_promedio;
        });
    }
    
    /**
     * Incrementar stock
     */
    public function incrementarStock(float $cantidad, float $costo = null): self
    {
        // Calcular nuevo costo promedio
        $valorActual = $this->stock_actual * $this->costo_promedio;
        $valorNuevo = $cantidad * ($costo ?? $this->costo_promedio);
        
        $nuevoStock = $this->stock_actual + $cantidad;
        $nuevoCostoPromedio = ($valorActual + $valorNuevo) / $nuevoStock;
        
        $this->stock_actual = $nuevoStock;
        $this->costo_promedio = $nuevoCostoPromedio;
        $this->save();
        
        return $this;
    }
    
    /**
     * Decrementar stock
     */
    public function decrementarStock(float $cantidad): self
    {
        if ($this->stock_disponible < $cantidad) {
            throw new \Exception('Stock insuficiente');
        }
        
        $this->stock_actual -= $cantidad;
        $this->save();
        
        return $this;
    }
    
    /**
     * Reservar stock
     */
    public function reservarStock(float $cantidad): self
    {
        if ($this->stock_disponible < $cantidad) {
            throw new \Exception('Stock disponible insuficiente');
        }
        
        $this->stock_reservado += $cantidad;
        $this->save();
        
        return $this;
    }
    
    /**
     * Liberar stock reservado
     */
    public function liberarStockReservado(float $cantidad): self
    {
        if ($this->stock_reservado < $cantidad) {
            throw new \Exception('Stock reservado insuficiente');
        }
        
        $this->stock_reservado -= $cantidad;
        $this->save();
        
        return $this;
    }
}