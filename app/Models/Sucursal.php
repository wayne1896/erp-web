<?php
// app/Models/Sucursal.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sucursal extends Model
{
    // Especificar el nombre de la tabla
    protected $table = 'sucursales';
    
    protected $fillable = [
        'codigo',
        'nombre',
        'rnc',
        'telefono',
        'direccion',
        'provincia',
        'municipio',
        'sector',
        'activa',
        'principal',
        'configuracion'
    ];
    
    protected $casts = [
        'activa' => 'boolean',
        'principal' => 'boolean',
        'configuracion' => 'array'
    ];
    
    /**
     * Relaciones
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }
    
    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }
    
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }
    
    public function inventario(): HasMany
    {
        return $this->hasMany(InventarioSucursal::class);
    }
    
    public function cajas(): HasMany
    {
        return $this->hasMany(Caja::class);
    }
    
    /**
     * Scope para sucursales activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }
    
    /**
     * Obtener sucursal principal
     */
    public static function principal()
    {
        return self::where('principal', true)->first();
    }
}