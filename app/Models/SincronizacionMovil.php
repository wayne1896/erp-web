<?php
// app/Models/SincronizacionMovil.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class SincronizacionMovil extends Model
{
    protected $table = 'sincronizacion_movil';
    
    protected $fillable = [
        'user_id',
        'dispositivo_id',
        'tipo_sincronizacion',
        'estado',
        'datos_enviados',
        'datos_recibidos',
        'total_registros',
        'registros_exitosos',
        'registros_fallidos',
        'errores',
        'fecha_inicio',
        'fecha_fin',
        'duracion_segundos',
        'tamano_datos_kb',
        'ip_dispositivo',
        'version_app',
        'plataforma',
        'bateria_inicial',
        'bateria_final',
        'conexion_tipo',
        'latitud',
        'longitud',
    ];
    
    protected $casts = [
        'datos_enviados' => 'array',
        'datos_recibidos' => 'array',
        'errores' => 'array',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'duracion_segundos' => 'decimal:2',
        'tamano_datos_kb' => 'decimal:2',
        'bateria_inicial' => 'integer',
        'bateria_final' => 'integer',
        'latitud' => 'decimal:10,8',
        'longitud' => 'decimal:11,8',
    ];
    
    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    /**
     * Scopes
     */
    public function scopeExitosas($query)
    {
        return $query->where('estado', 'completada');
    }
    
    public function scopeFallidas($query)
    {
        return $query->where('estado', 'fallida');
    }
    
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }
    
    public function scopeDelUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_inicio', today());
    }
    
    public function scopeRecientes($query, $horas = 24)
    {
        return $query->where('fecha_inicio', '>=', now()->subHours($horas));
    }
    
    /**
     * Accessors
     */
    public function velocidadTransferencia(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->duracion_segundos <= 0) {
                    return 0;
                }
                
                return round($this->tamano_datos_kb / $this->duracion_segundos, 2);
            }
        );
    }
    
    public function eficiencia(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->total_registros <= 0) {
                    return 100;
                }
                
                return round(($this->registros_exitosos / $this->total_registros) * 100, 2);
            }
        );
    }
    
    public function consumoBateria(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->bateria_inicial || !$this->bateria_final) {
                    return 0;
                }
                
                return $this->bateria_inicial - $this->bateria_final;
            }
        );
    }
    
    /**
     * Métodos de negocio
     */
    public function marcarComoExitosa(array $datosRecibidos = [], array $errores = [])
    {
        $this->estado = 'completada';
        $this->fecha_fin = now();
        $this->duracion_segundos = $this->fecha_inicio->diffInSeconds($this->fecha_fin);
        $this->datos_recibidos = $datosRecibidos;
        $this->errores = $errores;
        
        // Calcular tamaño de datos
        $this->tamano_datos_kb = round(strlen(json_encode($this->datos_enviados)) / 1024, 2);
        
        $this->save();
        
        // Registrar métrica de sincronización
        $this->registrarMetrica();
    }
    
    public function marcarComoFallida(string $error, array $erroresDetallados = [])
    {
        $this->estado = 'fallida';
        $this->fecha_fin = now();
        $this->duracion_segundos = $this->fecha_inicio->diffInSeconds($this->fecha_fin);
        $this->errores = array_merge($erroresDetallados, ['error_principal' => $error]);
        $this->save();
    }
    
    private function registrarMetrica()
    {
        // Registrar métricas para análisis de performance
        DB::table('metricas_sincronizacion')->insert([
            'sincronizacion_id' => $this->id,
            'user_id' => $this->user_id,
            'duracion_segundos' => $this->duracion_segundos,
            'tamano_datos_kb' => $this->tamano_datos_kb,
            'velocidad_kbps' => $this->velocidad_transferencia,
            'eficiencia' => $this->eficiencia,
            'plataforma' => $this->plataforma,
            'version_app' => $this->version_app,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}