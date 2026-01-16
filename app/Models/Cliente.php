<?php
// app/Models/Cliente.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $attributes = [
        'codigo' => '',
        'email' => '',
        'telefono' => '',
        'direccion' => '',
    ];
    protected $fillable = [
        'codigo',
        'tipo_cliente',
        'nombre_completo',
        'cedula_rnc',
        'telefono',
        'telefono_alternativo',
        'email',
        'direccion',
        'provincia',
        'municipio',
        'sector',
        'tipo_contribuyente',
        'limite_credito',
        'dias_credito',
        'descuento',
        'activo'
    ];
    
    protected $casts = [
        'limite_credito' => 'decimal:2',
        'descuento' => 'decimal:2',
        'activo' => 'boolean'
    ];
    
    /**
     * Relaciones
     */
    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }
    protected static function boot()
{
    parent::boot();
    
    static::creating(function ($cliente) {
        if (empty($cliente->codigo)) {
            $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
            $numero = $ultimoCliente ? intval(substr($ultimoCliente->codigo, 3)) + 1 : 1;
            $cliente->codigo = 'CLI' . str_pad($numero, 6, '0', STR_PAD_LEFT);
        }
    });
}
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }
    
    /**
     * Scope para clientes activos
     */
   
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo'); // Ajusta según tu campo de estado
        // O si no tienes campo estado:
        // return $query;
    }
    /**
     * Scope por tipo de cliente
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_cliente', $tipo);
    }
    
    /**
     * Cédula/RNC formateado
     */
    public function identificacionFormateada(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $identificacion = $attributes['cedula_rnc'] ?? '';
                
                if (empty($identificacion)) {
                    return 'N/A';
                }
                
                // Si es RNC (9 dígitos)
                if (strlen($identificacion) == 9) {
                    return substr($identificacion, 0, 1) . '-' . 
                           substr($identificacion, 1, 2) . '-' . 
                           substr($identificacion, 3, 5) . '-' . 
                           substr($identificacion, 8, 1);
                }
                
                // Si es cédula (11 dígitos)
                if (strlen($identificacion) == 11) {
                    return substr($identificacion, 0, 3) . '-' . 
                           substr($identificacion, 3, 7) . '-' . 
                           substr($identificacion, 10, 1);
                }
                
                return $identificacion;
            }
        );
    }
    
    /**
     * Dirección completa
     */
    public function direccionCompleta(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                return sprintf('%s, %s, %s, %s',
                    $attributes['direccion'] ?? '',
                    $attributes['sector'] ?? '',
                    $attributes['municipio'] ?? '',
                    $attributes['provincia'] ?? ''
                );
            }
        );
    }
    
    /**
     * Saldo pendiente del cliente
     */
    public function saldoPendiente(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->ventas()
                    ->where('condicion_pago', 'CREDITO')
                    ->where('estado', 'PROCESADA')
                    ->sum('total') - 
                    $this->ventas()
                    ->where('condicion_pago', 'CREDITO')
                    ->sum('pagado');
            }
        );
    }
    
    /**
     * Verificar si excede límite de crédito
     */
    public function excedeLimiteCredito(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->saldo_pendiente > $this->limite_credito
        );
    }
    
    /**
     * Total comprado por el cliente
     */
    public function totalComprado(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->ventas()->sum('total')
        );
    }
}