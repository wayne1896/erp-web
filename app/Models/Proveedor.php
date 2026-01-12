<?php
// app/Models/Proveedor.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Proveedor extends Model
{
    // AGREGA ESTA LÍNEA: Especificar el nombre de la tabla
    protected $table = 'proveedores';
    
    protected $fillable = [
        'codigo',
        'nombre',
        'rnc',
        'telefono',
        'email',
        'direccion',
        'contacto_nombre',
        'contacto_telefono',
        'tipo_proveedor',
        'dias_credito',
        'limite_credito',
        'activo'
    ];
    
    protected $casts = [
        'limite_credito' => 'decimal:2',
        'activo' => 'boolean'
    ];
    
    /**
     * Relación con productos
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'proveedor_id');
    }
    
    /**
     * Scope para proveedores activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
    
    /**
     * Scope por tipo de proveedor
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_proveedor', $tipo);
    }
    
    /**
     * RNC formateado
     */
    public function rncFormateado(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $rnc = $attributes['rnc'] ?? '';
                
                if (empty($rnc) || strlen($rnc) !== 9) {
                    return $rnc;
                }
                
                return substr($rnc, 0, 1) . '-' . 
                       substr($rnc, 1, 2) . '-' . 
                       substr($rnc, 3, 5) . '-' . 
                       substr($rnc, 8, 1);
            }
        );
    }
    
    /**
     * Descripción del tipo de proveedor
     */
    public function tipoProveedorTexto(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                return $attributes['tipo_proveedor'] === 'LOCAL' ? 'Local' : 'Internacional';
            }
        );
    }
    
    /**
     * Límite de crédito formateado
     */
    public function limiteCreditoFormateado(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                return number_format($attributes['limite_credito'] ?? 0, 2);
            }
        );
    }
    
    /**
     * Total productos del proveedor
     */
    public function totalProductos(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->productos()->count()
        );
    }
    
    /**
     * Productos activos del proveedor
     */
    public function productosActivos(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->productos()->where('activo', true)->count()
        );
    }
    
    /**
     * Verificar si tiene crédito disponible
     */
    public function tieneCredito(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->limite_credito > 0
        );
    }
}