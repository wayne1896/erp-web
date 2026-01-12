<?php
// app/Models/Empleado.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empleado extends Model
{
    protected $fillable = [
        'codigo',
        'cedula',
        'nss',
        'nombre_completo',
        'fecha_nacimiento',
        'lugar_nacimiento',
        'sexo',
        'estado_civil',
        'telefono',
        'telefono_emergencia',
        'email',
        'direccion',
        'provincia',
        'municipio',
        'sector',
        'sucursal_id',
        'departamento_id',
        'cargo_id',
        'fecha_ingreso',
        'tipo_contrato',
        'salario_base',
        'periodo_pago',
        'cuenta_bancaria',
        'banco',
        'tipo_cuenta',
        'afiliado_ars',
        'ars',
        'numero_ars',
        'afiliado_afp',
        'afp',
        'numero_afp',
        'estado',
        'fecha_baja',
        'motivo_baja'
    ];
    
    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
        'fecha_baja' => 'date',
        'salario_base' => 'decimal:2',
        'afiliado_ars' => 'boolean',
        'afiliado_afp' => 'boolean'
    ];
    
    /**
     * Relaciones
     */
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class);
    }
    
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class);
    }
    
    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }
    
    public function nominas(): HasMany
    {
        return $this->hasMany(DetalleNomina::class);
    }
    
    public function vacaciones(): HasMany
    {
        return $this->hasMany(Vacacion::class);
    }
    
    /**
     * Scope para empleados activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
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
    
    /**
     * Edad del empleado
     */
    public function edad(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->fecha_nacimiento->age
        );
    }
    
    /**
     * Antigüedad en la empresa
     */
    public function antiguedad(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->fecha_baja) {
                    return $this->fecha_ingreso->diffInYears($this->fecha_baja);
                }
                return $this->fecha_ingreso->diffInYears(now());
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
     * Calcular salario diario
     */
    public function salarioDiario(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->periodo_pago === 'MENSUAL') {
                    return $this->salario_base / 23.83; // Días laborables promedio RD
                }
                return $this->salario_base / 15; // Quincena
            }
        );
    }
    
    /**
     * Calcular salario hora
     */
    public function salarioHora(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->salario_diario / 8
        );
    }
}