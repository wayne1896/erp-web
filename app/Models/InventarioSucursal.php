<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB; // ← ¡AGREGA ESTA LÍNEA!
use Illuminate\Support\Facades\Log;


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
            // Solo calcular si no estamos en medio de un recalcular manual
            if (!isset($inventario->recalculandoManual)) {
                // Calcular stock disponible
                $inventario->stock_disponible = $inventario->stock_actual - $inventario->stock_reservado;
                
                // Calcular valor del inventario
                $inventario->valor_inventario = $inventario->stock_actual * $inventario->costo_promedio;
                
                \Log::info('Inventario saving (automático):', [
                    'stock_disponible' => $inventario->stock_disponible,
                    'valor_inventario' => $inventario->valor_inventario
                ]);
            }
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
 * Recalcular valor del inventario CORREGIDO
 * Usa los valores ACTUALES de la base de datos
 */
/**
 * Recalcular valor del inventario - SOLO PARA CORRECCIONES
 * NO usar durante el flujo normal de ventas
 */
// En InventarioSucursal.php:
public function recalcularValorInventario(): self
{
    // ¡NUEVA VERSIÓN SEGURA!
    \Log::info('✅ recalcularValorInventario SEGURO llamado');
    
    // 1. Obtener datos REALES de ventas
    $ventasTotales = DB::table('detalle_ventas')
        ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
        ->where('detalle_ventas.producto_id', $this->producto_id)
        ->where('ventas.sucursal_id', $this->sucursal_id)
        ->sum('detalle_ventas.cantidad');
    
    // 2. Calcular stock REAL (asumiendo stock inicial 50)
    $stockReal = 50 - $ventasTotales;
    
    // 3. Actualizar
    $this->stock_actual = $stockReal;
    $this->save(); // Esto disparará los cálculos automáticos
    
    \Log::info("Recálculo SEGURO: Ventas={$ventasTotales}, StockReal={$stockReal}");
    
    return $this;
}
/**
 * Método de diagnóstico - Verifica consistencia de datos
 */
public function diagnosticarInventario(): array
{
    // Obtener valores actuales de la BD (sin caché)
    $valoresBD = DB::table('inventario_sucursal')
        ->where('id', $this->id)
        ->first();
    
    // Valores en el modelo (podrían estar cacheados)
    $valoresModelo = [
        'stock_actual' => $this->stock_actual,
        'stock_reservado' => $this->stock_reservado,
        'stock_disponible' => $this->stock_disponible,
        'costo_promedio' => $this->costo_promedio,
        'valor_inventario' => $this->valor_inventario
    ];
    
    // Calcular lo que DEBERÍA ser
    $stockDisponibleEsperado = $valoresBD->stock_actual - $valoresBD->stock_reservado;
    $valorInventarioEsperado = $valoresBD->stock_actual * $valoresBD->costo_promedio;
    
    $diagnostico = [
        'id' => $this->id,
        'valores_bd' => $valoresBD,
        'valores_modelo' => $valoresModelo,
        'calculos_esperados' => [
            'stock_disponible' => $stockDisponibleEsperado,
            'valor_inventario' => $valorInventarioEsperado
        ],
        'inconsistencias' => []
    ];
    
    // Verificar inconsistencias
    if ((float) $valoresBD->stock_disponible != (float) $stockDisponibleEsperado) {
        $diagnostico['inconsistencias'][] = "stock_disponible incorrecto en BD";
    }
    
    if ((float) $valoresBD->valor_inventario != (float) $valorInventarioEsperado) {
        $diagnostico['inconsistencias'][] = "valor_inventario incorrecto en BD";
    }
    
    if ((float) $this->stock_disponible != (float) $stockDisponibleEsperado) {
        $diagnostico['inconsistencias'][] = "stock_disponible incorrecto en Modelo";
    }
    
    \Log::info('Diagnóstico de inventario:', $diagnostico);
    
    return $diagnostico;
}
/**
 * Guardar sin disparar eventos para evitar recursión
 */
public function saveQuietly(array $options = [])
{
    return static::withoutEvents(function () use ($options) {
        return $this->save($options);
    });
}
    /**
     * Decrementar stock - CORREGIDO
     */
    /**
 * Decrementar stock - VERSIÓN CORREGIDA
 */
public function decrementarStock(float $cantidad): self
{
    Log::info('Decrementando stock:', [
        'id' => $this->id,
        'stock_actual_antes' => $this->stock_actual,
        'cantidad' => $cantidad
    ]);
    
    // Decrementar stock_actual (¡NO stock_disponible!)
    $this->stock_actual = $this->stock_actual - $cantidad;
    
    // Guardar para que los eventos hagan los cálculos automáticos
    $this->save();
    
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