<?php
// app/Models/CategoriaProducto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class CategoriaProducto extends Model
{
    protected $table = 'categorias_productos';
    
    protected $fillable = [
        'nombre',
        'codigo',
        'itbis_porcentaje',
        'tasa_itbis',
        'descripcion'
    ];
    
    protected $casts = [
        'itbis_porcentaje' => 'decimal:2'
    ];
    
    /**
     * Relación con productos
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
    
    /**
     * Scope para categorías activas (con productos)
     */
    public function scopeConProductos($query)
    {
        return $query->whereHas('productos', function($q) {
            $q->where('activo', true);
        });
    }
    
    /**
     * Obtener el porcentaje ITBIS formateado
     */
    public function getItbisFormateadoAttribute(): string
    {
        return $this->itbis_porcentaje . '%';
    }
    
    /**
     * Descripción ITBIS
     */
    public function descripcionItbis(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $descripciones = [
                    'ITBIS1' => 'ITBIS 18%',
                    'ITBIS2' => 'ITBIS 16%',
                    'ITBIS3' => 'ITBIS 0%',
                    'EXENTO' => 'Exento'
                ];
                
                return $descripciones[$attributes['tasa_itbis']] ?? 'ITBIS 18%';
            }
        );
    }
    
    /**
     * Contar productos en la categoría
     */
    public function getCantidadProductosAttribute(): int
    {
        return $this->productos()->count();
    }
}