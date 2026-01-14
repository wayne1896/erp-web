<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoCaja extends Model
{
    protected $table = 'movimientos_caja';

    protected $fillable = [
        'caja_id',
        'tipo',
        'monto',
        'descripcion',
        'referencia',
        'user_id',
        'comprobante',
        'observaciones',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    // Tipos de movimiento
    const TIPO_INGRESO = 'INGRESO';
    const TIPO_EGRESO = 'EGRESO';
    const TIPO_APERTURA = 'APERTURA';
    const TIPO_CIERRE = 'CIERRE';

    /**
     * Relaciones
     */
    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scopes
     */
    public function scopeIngresos($query)
    {
        return $query->where('tipo', self::TIPO_INGRESO);
    }

    public function scopeEgresos($query)
    {
        return $query->where('tipo', self::TIPO_EGRESO);
    }

    public function scopeDeCaja($query, $cajaId)
    {
        return $query->where('caja_id', $cajaId);
    }

    public function scopeDelDia($query)
    {
        return $query->whereDate('created_at', today());
    }
}