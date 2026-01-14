<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'codigo_barras',
        'nombre',
        'descripcion',
        'categoria_id',
        'proveedor_id',
        'unidad_medida',
        'precio_compra',
        'precio_venta',
        'precio_mayor',
        'tasa_itbis',
        'itbis_porcentaje',
        'exento_itbis',
        'stock_minimo',
        'control_stock',
        'activo'
    ];
    
    protected $casts = [
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'precio_mayor' => 'decimal:2',
        'itbis_porcentaje' => 'decimal:2',
        'exento_itbis' => 'boolean',
        'stock_minimo' => 'decimal:2',
        'control_stock' => 'boolean',
        'activo' => 'boolean'
    ];
    
    /**
     * Relaciones
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_id');
    }
    
    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
    
    public function inventarios(): HasMany
    {
        return $this->hasMany(InventarioSucursal::class, 'producto_id');
    }
    
    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class, 'producto_id');
    }
    
    /**
     * Scope para productos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
    
    /**
     * Scope para productos con stock bajo en sucursal específica
     */
    public function scopeStockBajo($query, $sucursalId = null)
    {
        return $query->where('control_stock', true)
                    ->whereHas('inventarios', function($q) use ($sucursalId) {
                        if ($sucursalId) {
                            $q->where('sucursal_id', $sucursalId);
                        }
                        $q->whereColumn('stock_disponible', '<=', 'productos.stock_minimo');
                    });
    }
    
    /**
     * Calcula el precio con ITBIS
     */
    public function getPrecioVentaConItbisAttribute(): float
    {
        if ($this->exento_itbis) {
            return floatval($this->precio_venta);
        }
        return floatval($this->precio_venta) * (1 + (floatval($this->itbis_porcentaje) / 100));
    }
    
    /**
     * Calcula el margen de ganancia
     */
    public function getMargenGananciaAttribute(): float
    {
        if (floatval($this->precio_compra) == 0) return 0;
        return ((floatval($this->precio_venta) - floatval($this->precio_compra)) / floatval($this->precio_compra)) * 100;
    }
    
    /**
     * Descripción ITBIS
     */
    public function getDescripcionItbisAttribute(): string
    {
        $descripciones = [
            'ITBIS1' => 'ITBIS 18%',
            'ITBIS2' => 'ITBIS 16%',
            'ITBIS3' => 'ITBIS 0%',
            'EXENTO' => 'Exento'
        ];
        
        return $descripciones[$this->tasa_itbis] ?? 'ITBIS 18%';
    }
    
    /**
     * Unidad de medida formateada
     */
    public function getUnidadMedidaTextoAttribute(): string
    {
        $unidades = [
            'UNIDAD' => 'Unidad',
            'KILO' => 'Kilogramo',
            'LITRO' => 'Litro',
            'METRO' => 'Metro',
            'CAJA' => 'Caja',
            'PAQUETE' => 'Paquete',
            'SACO' => 'Saco',
            'PAR' => 'Par',
            'JUEGO' => 'Juego',
            'GRAMO' => 'Gramo',
            'LIBRA' => 'Libra',
            'ONZA' => 'Onza',
            'MILILITRO' => 'Mililitro',
            'GALON' => 'Galón',
            'CENTIMETRO' => 'Centímetro',
            'PULGADA' => 'Pulgada',
            'ROLLO' => 'Rollo',
            'DOCENA' => 'Docena'
        ];
        
        return $unidades[$this->unidad_medida] ?? $this->unidad_medida;
    }
    
    /**
     * Obtener inventario de una sucursal específica
     */
    public function inventarioSucursal($sucursalId)
    {
        return $this->inventarios()->where('sucursal_id', $sucursalId)->first();
    }
    
    /**
     * Stock total en todas las sucursales
     */
    public function getStockTotalAttribute(): float
    {
        return $this->inventarios()->sum('stock_actual');
    }
    
    /**
     * Stock disponible total
     */
    public function getStockDisponibleTotalAttribute(): float
    {
        return $this->inventarios()->sum('stock_disponible');
    }
    
    /**
     * Valor total del inventario
     */
    public function getValorInventarioTotalAttribute(): float
    {
        return $this->inventarios()->sum('valor_inventario');
    }
    
    /**
     * Buscar productos por término
     */
    public static function buscar($termino)
    {
        return self::where('nombre', 'like', "%{$termino}%")
            ->orWhere('codigo', 'like', "%{$termino}%")
            ->orWhere('codigo_barras', 'like', "%{$termino}%")
            ->activos()
            ->with(['categoria', 'inventarios'])
            ->limit(20)
            ->get();
    }
}