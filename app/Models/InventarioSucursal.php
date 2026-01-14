<?php

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
        return $this->belongsTo(Producto::class, 'producto_id');
    }
    
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_id');
    }
    
    /**
     * Eventos del modelo - CORREGIDO
     */
    protected static function booted()
    {
        static::saving(function ($inventario) {
            // Calcular stock disponible
            $inventario->stock_disponible = $inventario->stock_actual - $inventario->stock_reservado;
            
            // Calcular valor del inventario
            $inventario->valor_inventario = $inventario->stock_actual * $inventario->costo_promedio;
            
            \Log::info('Inventario saving:', [
                'stock_actual' => $inventario->stock_actual,
                'stock_reservado' => $inventario->stock_reservado,
                'stock_disponible' => $inventario->stock_disponible,
                'costo_promedio' => $inventario->costo_promedio,
                'valor_inventario' => $inventario->valor_inventario
            ]);
        });

        static::created(function ($inventario) {
            \Log::info('Inventario created:', $inventario->toArray());
        });

        static::updated(function ($inventario) {
            \Log::info('Inventario updated:', $inventario->toArray());
        });
    }
    
    /**
     * Incrementar stock - CORREGIDO
     */
    public function incrementarStock(float $cantidad, float $costo = null): self
    {
        \Log::info('Método incrementarStock llamado:', [
            'cantidad' => $cantidad,
            'costo' => $costo,
            'stock_actual_antes' => $this->stock_actual,
            'costo_promedio_antes' => $this->costo_promedio
        ]);

        // Si no se proporciona costo, usar el costo promedio actual
        if ($costo === null) {
            $costo = $this->costo_promedio;
        }

        // Calcular nuevo costo promedio
        $valorActual = $this->stock_actual * $this->costo_promedio;
        $valorNuevo = $cantidad * $costo;
        
        $nuevoStock = $this->stock_actual + $cantidad;
        
        // Evitar división por cero
        if ($nuevoStock > 0) {
            $nuevoCostoPromedio = ($valorActual + $valorNuevo) / $nuevoStock;
        } else {
            $nuevoCostoPromedio = $costo;
        }

        \Log::info('Cálculos:', [
            'valorActual' => $valorActual,
            'valorNuevo' => $valorNuevo,
            'nuevoStock' => $nuevoStock,
            'nuevoCostoPromedio' => $nuevoCostoPromedio
        ]);

        // Actualizar valores
        $this->stock_actual = $nuevoStock;
        $this->costo_promedio = $nuevoCostoPromedio;
        
        // Guardar para disparar los eventos
        $this->save();

        \Log::info('Después de guardar:', [
            'stock_actual' => $this->stock_actual,
            'costo_promedio' => $this->costo_promedio,
            'stock_disponible' => $this->stock_disponible,
            'valor_inventario' => $this->valor_inventario
        ]);

        return $this;
    }
    
    /**
     * Decrementar stock - CORREGIDO
     */
    public function decrementarStock(float $cantidad): self
    {
        \Log::info('Método decrementarStock llamado:', [
            'cantidad' => $cantidad,
            'stock_actual_antes' => $this->stock_actual,
            'stock_disponible_antes' => $this->stock_disponible
        ]);

        if ($this->stock_disponible < $cantidad) {
            throw new \Exception('Stock insuficiente. Disponible: ' . $this->stock_disponible);
        }
        
        $this->stock_actual = $this->stock_actual - $cantidad;
        
        // Guardar para disparar los eventos
        $this->save();

        \Log::info('Después de decrementar:', [
            'stock_actual' => $this->stock_actual,
            'stock_disponible' => $this->stock_disponible
        ]);

        return $this;
    }
    
    /**
     * Reservar stock
     */
    public function reservarStock(float $cantidad): self
    {
        if ($this->stock_disponible < $cantidad) {
            throw new \Exception('Stock disponible insuficiente. Disponible: ' . $this->stock_disponible);
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
            throw new \Exception('Stock reservado insuficiente. Reservado: ' . $this->stock_reservado);
        }
        
        $this->stock_reservado -= $cantidad;
        $this->save();
        
        return $this;
    }
}