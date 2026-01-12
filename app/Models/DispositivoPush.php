<?php
// app/Models/DispositivoPush.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispositivoPush extends Model
{
    protected $table = 'dispositivos_push';
    
    protected $fillable = [
        'user_id',
        'token',
        'plataforma',
        'modelo',
        'version_sistema',
        'version_app',
        'idioma',
        'zona_horaria',
        'ultima_conexion',
        'estado',
        'preferencias',
        'topics',
    ];
    
    protected $casts = [
        'ultima_conexion' => 'datetime',
        'preferencias' => 'array',
        'topics' => 'array',
    ];
    
    /**
     * Estados
     */
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';
    const ESTADO_BLOQUEADO = 'bloqueado';
    
    /**
     * Plataformas
     */
    const PLATAFORMA_IOS = 'ios';
    const PLATAFORMA_ANDROID = 'android';
    const PLATAFORMA_WEB = 'web';
    
    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scopes
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', self::ESTADO_ACTIVO);
    }
    
    public function scopePorUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopePorPlataforma($query, $plataforma)
    {
        return $query->where('plataforma', $plataforma);
    }
    
    public function scopeRecientes($query, $dias = 7)
    {
        return $query->where('ultima_conexion', '>=', now()->subDays($dias));
    }
    
    /**
     * Métodos de negocio
     */
    public function marcarComoActivo()
    {
        $this->estado = self::ESTADO_ACTIVO;
        $this->ultima_conexion = now();
        $this->save();
    }
    
    public function marcarComoInactivo()
    {
        $this->estado = self::ESTADO_INACTIVO;
        $this->save();
    }
    
    public function estaActivo()
    {
        return $this->estado === self::ESTADO_ACTIVO && 
               $this->ultima_conexion > now()->subDays(7);
    }
    
    public function suscribirATopic($topic)
    {
        $topics = $this->topics ?? [];
        if (!in_array($topic, $topics)) {
            $topics[] = $topic;
            $this->topics = $topics;
            $this->save();
        }
    }
    
    public function desuscribirDeTopic($topic)
    {
        $topics = $this->topics ?? [];
        $key = array_search($topic, $topics);
        if ($key !== false) {
            unset($topics[$key]);
            $this->topics = array_values($topics);
            $this->save();
        }
    }
    
    public function tieneTopic($topic)
    {
        $topics = $this->topics ?? [];
        return in_array($topic, $topics);
    }
    
    public function obtenerPreferenciasUsuario()
    {
        $defaults = [
            'ventas' => true,
            'inventario' => true,
            'clientes' => true,
            'caja' => true,
            'sistema' => true,
            'promociones' => false,
            'sonido' => true,
            'vibracion' => true,
            'nocturno' => false,
            'hora_inicio' => '08:00',
            'hora_fin' => '20:00',
        ];
        
        return array_merge($defaults, $this->preferencias ?? []);
    }
}