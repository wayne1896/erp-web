<?php
// app/Models/Notificacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    
    protected $fillable = [
        'user_id',
        'titulo',
        'mensaje',
        'tipo',
        'nivel',
        'data',
        'leido',
        'fecha_leido',
        'fecha_envio',
        'fecha_expiracion',
        'canal',
        'dispositivo_id',
        'entidad_type',
        'entidad_id',
        'accion',
        'badge_count',
        'sound',
        'vibration',
        'priority',
    ];
    
    protected $casts = [
        'data' => 'array',
        'leido' => 'boolean',
        'fecha_leido' => 'datetime',
        'fecha_envio' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'badge_count' => 'integer',
        'vibration' => 'boolean',
    ];
    
    /**
     * Tipos de notificaciones
     */
    const TIPO_VENTA = 'venta';
    const TIPO_CLIENTE = 'cliente';
    const TIPO_INVENTARIO = 'inventario';
    const TIPO_CAJA = 'caja';
    const TIPO_SINCRONIZACION = 'sincronizacion';
    const TIPO_SISTEMA = 'sistema';
    const TIPO_PROMOCION = 'promocion';
    const TIPO_ALERTA = 'alerta';
    
    /**
     * Niveles de prioridad
     */
    const NIVEL_BAJA = 'baja';
    const NIVEL_MEDIA = 'media';
    const NIVEL_ALTA = 'alta';
    const NIVEL_URGENTE = 'urgente';
    
    /**
     * Canales de envío
     */
    const CANAL_PUSH = 'push';
    const CANAL_IN_APP = 'in_app';
    const CANAL_EMAIL = 'email';
    const CANAL_SMS = 'sms';
    const CANAL_TODOS = 'todos';
    
    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function entidad(): MorphTo
    {
        return $this->morphTo();
    }
    
    /**
     * Scopes
     */
    public function scopeNoLeidas($query)
    {
        return $query->where('leido', false);
    }
    
    public function scopeLeidas($query)
    {
        return $query->where('leido', true);
    }
    
    public function scopePorUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
    
    public function scopePorNivel($query, $nivel)
    {
        return $query->where('nivel', $nivel);
    }
    
    public function scopeValidas($query)
    {
        return $query->where(function($q) {
            $q->whereNull('fecha_expiracion')
              ->orWhere('fecha_expiracion', '>', now());
        });
    }
    
    public function scopeRecientes($query, $horas = 24)
    {
        return $query->where('fecha_envio', '>=', now()->subHours($horas));
    }
    
    public function scopeUrgentes($query)
    {
        return $query->where('nivel', self::NIVEL_URGENTE)
                     ->where('leido', false)
                     ->validas();
    }
    
    /**
     * Accessors
     */
    public function tiempoTranscurrido(): Attribute
    {
        return Attribute::make(
            get: function () {
                $diferencia = now()->diff($this->fecha_envio);
                
                if ($diferencia->d > 0) {
                    return $diferencia->d . ' día' . ($diferencia->d > 1 ? 's' : '');
                } elseif ($diferencia->h > 0) {
                    return $diferencia->h . ' hora' . ($diferencia->h > 1 ? 's' : '');
                } elseif ($diferencia->i > 0) {
                    return $diferencia->i . ' minuto' . ($diferencia->i > 1 ? 's' : '');
                } else {
                    return 'Ahora mismo';
                }
            }
        );
    }
    
    public function iconoTipo(): Attribute
    {
        return Attribute::make(
            get: function () {
                return match($this->tipo) {
                    self::TIPO_VENTA => '💰',
                    self::TIPO_CLIENTE => '👥',
                    self::TIPO_INVENTARIO => '📦',
                    self::TIPO_CAJA => '🏦',
                    self::TIPO_SINCRONIZACION => '🔄',
                    self::TIPO_SISTEMA => '⚙️',
                    self::TIPO_PROMOCION => '🎯',
                    self::TIPO_ALERTA => '⚠️',
                    default => '📢',
                };
            }
        );
    }
    
    public function colorNivel(): Attribute
    {
        return Attribute::make(
            get: function () {
                return match($this->nivel) {
                    self::NIVEL_URGENTE => 'danger',
                    self::NIVEL_ALTA => 'warning',
                    self::NIVEL_MEDIA => 'info',
                    self::NIVEL_BAJA => 'success',
                    default => 'secondary',
                };
            }
        );
    }
    
    /**
     * Métodos de negocio
     */
    public function marcarComoLeida()
    {
        $this->leido = true;
        $this->fecha_leido = now();
        $this->save();
        
        // Actualizar badge count del usuario
        $this->usuario->decrement('notificaciones_sin_leer');
    }
    
    public function marcarComoNoLeida()
    {
        $this->leido = false;
        $this->fecha_leido = null;
        $this->save();
        
        $this->usuario->increment('notificaciones_sin_leer');
    }
    
    public function esUrgente()
    {
        return $this->nivel === self::NIVEL_URGENTE;
    }
    
    public function estaExpirada()
    {
        return $this->fecha_expiracion && $this->fecha_expiracion->isPast();
    }
    
    public function puedeMostrarse()
    {
        return !$this->leido && !$this->estaExpirada();
    }
    
    public function obtenerAccion()
    {
        if (!$this->data || !isset($this->data['accion'])) {
            return null;
        }
        
        return $this->data['accion'];
    }
    
    public function obtenerRuta()
    {
        if (!$this->data || !isset($this->data['ruta'])) {
            return null;
        }
        
        return $this->data['ruta'];
    }
    
    public function obtenerParametros()
    {
        if (!$this->data || !isset($this->data['parametros'])) {
            return [];
        }
        
        return $this->data['parametros'];
    }
}