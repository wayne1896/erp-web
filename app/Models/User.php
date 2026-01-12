<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    
    protected $fillable = [
        'name',
        'cedula',
        'email',
        'password',
        'telefono',
        'direccion',
        'tipo_usuario',
        'sucursal_id',
        'activo'
    ];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'activo' => 'boolean'
    ];
    
    /**
     * Relaciones
     */
    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }
    
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
    
    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
    
    /**
     * Scope por tipo de usuario
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_usuario', $tipo);
    }
    
    /**
     * Verificar si es administrador
     */
    public function esAdministrador(): bool
    {
        return $this->tipo_usuario === 'admin' || $this->hasRole('admin');
    }
    
    /**
     * Verificar si es vendedor
     */
    public function esVendedor(): bool
    {
        return $this->tipo_usuario === 'vendedor' || $this->hasRole('vendedor');
    }
    
    /**
     * Cédula formateada
     */
    public function cedulaFormateada(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $cedula = $attributes['cedula'] ?? '';
                if (strlen($cedula) == 11) {
                    return substr($cedula, 0, 3) . '-' . 
                           substr($cedula, 3, 7) . '-' . 
                           substr($cedula, 10, 1);
                }
                return $cedula;
            }
        );
    }
}