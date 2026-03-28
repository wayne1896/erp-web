<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuditoriaCaja extends Model
{
    protected $table = 'auditoria_cajas';

    protected $fillable = [
        'caja_id',
        'user_id',
        'tipo_auditoria',
        'fecha_auditoria',
        'monto_inicial_esperado',
        'monto_inicial_real',
        'ventas_esperadas',
        'ventas_reales',
        'ingresos_esperados',
        'ingresos_reales',
        'egresos_esperados',
        'egresos_reales',
        'efectivo_esperado',
        'efectivo_real',
        'diferencia_total',
        'discrepancias',
        'estado',
        'observaciones',
        'resultado',
        'revisado_por_id',
        'fecha_revision',
    ];

    protected $casts = [
        'monto_inicial_esperado' => 'decimal:2',
        'monto_inicial_real' => 'decimal:2',
        'ventas_esperadas' => 'decimal:2',
        'ventas_reales' => 'decimal:2',
        'ingresos_esperados' => 'decimal:2',
        'ingresos_reales' => 'decimal:2',
        'egresos_esperados' => 'decimal:2',
        'egresos_reales' => 'decimal:2',
        'efectivo_esperado' => 'decimal:2',
        'efectivo_real' => 'decimal:2',
        'diferencia_total' => 'decimal:2',
        'discrepancias' => 'json',
        'fecha_auditoria' => 'datetime',
        'fecha_revision' => 'datetime',
    ];

    // Tipos de auditoría
    const TIPO_AUTOMATICA = 'automatica';
    const TIPO_MANUAL = 'manual';
    const TIPO_PROGRAMADA = 'programada';

    // Estados de auditoría
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_EN_PROCESO = 'en_proceso';
    const ESTADO_COMPLETADA = 'completada';
    const ESTADO_CON_DISCREPANCIAS = 'con_discrepancias';
    const ESTADO_RECHAZADA = 'rechazada';

    // Resultados
    const RESULTADO_OK = 'ok';
    const RESULTADO_ADVERTENCIA = 'advertencia';
    const RESULTADO_ERROR = 'error';
    const RESULTADO_FRAUDE = 'fraude';

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

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(AuditoriaCajaDetalle::class);
    }

    /**
     * Scopes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    public function scopeConDiscrepancias($query)
    {
        return $query->where('estado', self::ESTADO_CON_DISCREPANCIAS);
    }

    public function scopeDeHoy($query)
    {
        return $query->whereDate('fecha_auditoria', today());
    }

    public function scopeDeCaja($query, $cajaId)
    {
        return $query->where('caja_id', $cajaId);
    }

    /**
     * Métodos
     */
    public function tieneDiscrepancias(): bool
    {
        return !empty($this->discrepancias) || abs($this->diferencia_total) > 0.01;
    }

    public function getGravedadAttribute(): string
    {
        $diferencia = abs($this->diferencia_total);
        
        if ($diferencia < 100) {
            return 'baja';
        } elseif ($diferencia < 500) {
            return 'media';
        } elseif ($diferencia < 1000) {
            return 'alta';
        } else {
            return 'critica';
        }
    }

    public function getColorEstadoAttribute(): string
    {
        return match($this->estado) {
            self::ESTADO_PENDIENTE => 'warning',
            self::ESTADO_EN_PROCESO => 'info',
            self::ESTADO_COMPLETADA => 'success',
            self::ESTADO_CON_DISCREPANCIAS => 'warning',
            self::ESTADO_RECHAZADA => 'danger',
            default => 'secondary'
        };
    }

    public function getColorResultadoAttribute(): string
    {
        return match($this->resultado) {
            self::RESULTADO_OK => 'success',
            self::RESULTADO_ADVERTENCIA => 'warning',
            self::RESULTADO_ERROR => 'danger',
            self::RESULTADO_FRAUDE => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Realizar auditoría automática
     */
    public static function auditarCaja(Caja $caja, string $tipo = self::TIPO_AUTOMATICA): self
    {
        // Obtener datos reales de la caja
        $resumen = $caja->obtenerResumenCierre();
        
        // Calcular valores esperados
        $efectivoEsperado = $caja->calcularEfectivoTeorico();
        
        // Detectar discrepancias
        $discrepancias = [];
        $diferenciaTotal = 0;

        // Validar monto inicial
        if ($caja->monto_inicial != $caja->monto_inicial) {
            $discrepancias[] = [
                'tipo' => 'monto_inicial',
                'esperado' => $caja->monto_inicial,
                'real' => $caja->monto_inicial,
                'diferencia' => 0,
                'descripcion' => 'El monto inicial coincide'
            ];
        }

        // Validar ventas
        $ventasReales = $caja->calcularTotalVentas();
        if (abs($ventasReales - $resumen['total_ventas']) > 0.01) {
            $discrepancias[] = [
                'tipo' => 'ventas',
                'esperado' => $ventasReales,
                'real' => $resumen['total_ventas'],
                'diferencia' => $ventasReales - $resumen['total_ventas'],
                'descripcion' => 'Discrepancia en el cálculo de ventas'
            ];
        }

        // Validar efectivo
        $diferenciaEfectivo = $caja->efectivo - $efectivoEsperado;
        if (abs($diferenciaEfectivo) > 0.01) {
            $discrepancias[] = [
                'tipo' => 'efectivo',
                'esperado' => $efectivoEsperado,
                'real' => $caja->efectivo,
                'diferencia' => $diferenciaEfectivo,
                'descripcion' => 'Diferencia entre efectivo real y teórico'
            ];
            $diferenciaTotal += $diferenciaEfectivo;
        }

        // Determinar resultado
        $resultado = self::RESULTADO_OK;
        if (!empty($discrepancias)) {
            $maxDiferencia = max(array_column($discrepancias, 'diferencia'));
            if ($maxDiferencia > 1000) {
                $resultado = self::RESULTADO_FRAUDE;
            } elseif ($maxDiferencia > 100) {
                $resultado = self::RESULTADO_ERROR;
            } else {
                $resultado = self::RESULTADO_ADVERTENCIA;
            }
        }

        // Crear auditoría
        $auditoria = self::create([
            'caja_id' => $caja->id,
            'user_id' => auth()->id() ?? 1,
            'tipo_auditoria' => $tipo,
            'fecha_auditoria' => now(),
            'monto_inicial_esperado' => $caja->monto_inicial,
            'monto_inicial_real' => $caja->monto_inicial,
            'ventas_esperadas' => $ventasReales,
            'ventas_reales' => $resumen['total_ventas'],
            'ingresos_esperados' => $caja->obtenerTotalIngresos(),
            'ingresos_reales' => $resumen['total_ingresos'],
            'egresos_esperados' => $caja->obtenerTotalEgresos(),
            'egresos_reales' => $resumen['total_egresos'],
            'efectivo_esperado' => $efectivoEsperado,
            'efectivo_real' => $caja->efectivo,
            'diferencia_total' => $diferenciaTotal,
            'discrepancias' => $discrepancias,
            'estado' => !empty($discrepancias) ? self::ESTADO_CON_DISCREPANCIAS : self::ESTADO_COMPLETADA,
            'resultado' => $resultado,
            'observaciones' => 'Auditoría generada automáticamente'
        ]);

        // Crear detalles de auditoría
        foreach ($caja->movimientos as $movimiento) {
            AuditoriaCajaDetalle::create([
                'auditoria_caja_id' => $auditoria->id,
                'movimiento_caja_id' => $movimiento->id,
                'tipo_movimiento' => $movimiento->tipo,
                'monto' => $movimiento->monto,
                'descripcion' => $movimiento->descripcion,
                'validado' => true,
                'observaciones' => 'Movimiento validado automáticamente'
            ]);
        }

        return $auditoria;
    }

    /**
     * Aprobar auditoría
     */
    public function aprobar(int $userId, string $observaciones = null): bool
    {
        $this->estado = self::ESTADO_COMPLETADA;
        $this->revisado_por_id = $userId;
        $this->fecha_revision = now();
        if ($observaciones) {
            $this->observaciones .= "\n\n[Aprobado por: {$userId} - " . now() . "]\n{$observaciones}";
        }
        
        return $this->save();
    }

    /**
     * Rechazar auditoría
     */
    public function rechazar(int $userId, string $motivo): bool
    {
        $this->estado = self::ESTADO_RECHAZADA;
        $this->revisado_por_id = $userId;
        $this->fecha_revision = now();
        $this->observaciones .= "\n\n[Rechazado por: {$userId} - " . now() . "]\nMotivo: {$motivo}";
        
        return $this->save();
    }
}
