<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaCajaDetalle extends Model
{
    protected $table = 'auditoria_caja_detalles';

    protected $fillable = [
        'auditoria_caja_id',
        'movimiento_caja_id',
        'tipo_movimiento',
        'monto',
        'descripcion',
        'referencia',
        'validado',
        'observaciones',
        'usuario_id',
        'fecha_validacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'validado' => 'boolean',
        'fecha_validacion' => 'datetime',
    ];

    /**
     * Relaciones
     */
    public function auditoria(): BelongsTo
    {
        return $this->belongsTo(AuditoriaCaja::class, 'auditoria_caja_id');
    }

    public function movimiento(): BelongsTo
    {
        return $this->belongsTo(MovimientoCaja::class, 'movimiento_caja_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scopes
     */
    public function scopeValidados($query)
    {
        return $query->where('validado', true);
    }

    public function scopeNoValidados($query)
    {
        return $query->where('validado', false);
    }

    public function scopeDeTipo($query, $tipo)
    {
        return $query->where('tipo_movimiento', $tipo);
    }

    /**
     * Métodos
     */
    public function validar(int $userId, string $observaciones = null): bool
    {
        $this->validado = true;
        $this->usuario_id = $userId;
        $this->fecha_validacion = now();
        if ($observaciones) {
            $this->observaciones = $observaciones;
        }
        
        return $this->save();
    }

    public function invalidar(int $userId, string $motivo): bool
    {
        $this->validado = false;
        $this->usuario_id = $userId;
        $this->fecha_validacion = now();
        $this->observaciones = $motivo;
        
        return $this->save();
    }
}
