<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Caja extends Model
{
    use SoftDeletes;

    protected $table = 'cajas';

    protected $fillable = [
        'sucursal_id',
        'user_id',
        'monto_inicial',
        'efectivo',
        'estado',
        'fecha_apertura',
        'fecha_cierre',
        'observaciones',
        'total_ventas',
        'total_ingresos',
        'total_egresos',
        'diferencia',
        'cerrada_por_id',
    ];

    protected $casts = [
        'monto_inicial' => 'decimal:2',
        'efectivo' => 'decimal:2',
        'total_ventas' => 'decimal:2',
        'total_ingresos' => 'decimal:2',
        'total_egresos' => 'decimal:2',
        'diferencia' => 'decimal:2',
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    // Estados de la caja
    const ESTADO_ABIERTA = 'abierta';
    const ESTADO_CERRADA = 'cerrada';
    const ESTADO_PENDIENTE = 'pendiente';

    /**
     * Relaciones
     */
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function cerradaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cerrada_por_id');
    }

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class, 'caja_id'); // Asegurar que use el campo correcto
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoCaja::class);
    }

    /**
     * Scopes
     */
    public function scopeAbiertas($query)
    {
        return $query->where('estado', self::ESTADO_ABIERTA);
    }

    public function scopeCerradas($query)
    {
        return $query->where('estado', self::ESTADO_CERRADA);
    }

    public function scopeDeSucursal($query, $sucursalId)
    {
        return $query->where('sucursal_id', $sucursalId);
    }

    public function scopeDeUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDeHoy($query)
    {
        return $query->whereDate('fecha_apertura', today());
    }

    /**
     * Métodos
     */
    public function calcularTotalVentas()
    {
        // CORRECCIÓN: Usar la relación directa en lugar de filtrar manualmente
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->sum('total');
    }

    public function calcularVentasEfectivo()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->where('tipo_pago', 'EFECTIVO')
            ->sum('total');
    }

    public function calcularVentasTarjetaDebito()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->where('tipo_pago', 'TARJETA_DEBITO')
            ->sum('total');
    }

    public function calcularVentasTarjetaCredito()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->where('tipo_pago', 'TARJETA_CREDITO')
            ->sum('total');
    }

    public function calcularVentasTransferencia()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->where('tipo_pago', 'TRANSFERENCIA')
            ->sum('total');
    }
    public function calcularVentasPorCondicion()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->selectRaw('condicion_pago, SUM(total) as total, COUNT(*) as cantidad')
            ->groupBy('condicion_pago')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->condicion_pago => [
                    'total' => (float) $item->total,
                    'cantidad' => $item->cantidad
                ]];
            })
            ->toArray();
    }
    public function calcularVentasPorTipo()
    {
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->selectRaw('tipo_pago, SUM(total) as total, COUNT(*) as cantidad')
            ->groupBy('tipo_pago')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->tipo_pago => [
                    'total' => (float) $item->total,
                    'cantidad' => $item->cantidad
                ]];
            })
            ->toArray();
    }

    public function calcularEfectivoTeorico()
    {
        // CORRECCIÓN: Usar solo ventas en efectivo para cálculo teórico
        $ventasEfectivo = $this->calcularVentasEfectivo();
        $totalIngresos = $this->obtenerTotalIngresos();
        $totalEgresos = $this->obtenerTotalEgresos();
        
        return $this->monto_inicial + $ventasEfectivo + $totalIngresos - $totalEgresos;
    }

    public function calcularDiferencia()
    {
        $efectivoTeorico = $this->calcularEfectivoTeorico();
        return $this->efectivo - $efectivoTeorico;
    }

    public function obtenerTotalIngresos()
    {
        return $this->movimientos()
            ->where('tipo', MovimientoCaja::TIPO_INGRESO)
            ->sum('monto');
    }

    public function obtenerTotalEgresos()
    {
        return $this->movimientos()
            ->where('tipo', MovimientoCaja::TIPO_EGRESO)
            ->sum('monto');
    }

    public function recalcularVentas()
    {
        $this->total_ventas = $this->calcularTotalVentas();
        $this->save();
        return $this;
    }

    public function puedeCerrarse(): bool
    {
        return $this->estado === self::ESTADO_ABIERTA && 
               $this->ventas()->where('estado', Venta::ESTADO_PENDIENTE)->doesntExist();
    }

    public function abrir($montoInicial, $observaciones = null)
    {
        $this->monto_inicial = $montoInicial;
        $this->efectivo = $montoInicial;
        $this->estado = self::ESTADO_ABIERTA;
        $this->fecha_apertura = now();
        $this->observaciones = $observaciones;
        $this->save();

        // Registrar movimiento de apertura
        MovimientoCaja::create([
            'caja_id' => $this->id,
            'tipo' => MovimientoCaja::TIPO_APERTURA,
            'monto' => $montoInicial,
            'descripcion' => 'Apertura de caja',
            'user_id' => $this->user_id,
        ]);
    }

    public function cerrar($efectivoFinal, $observaciones = null)
    {
        // Calcular todos los totales
        $this->total_ventas = $this->calcularTotalVentas();
        $this->total_ingresos = $this->obtenerTotalIngresos();
        $this->total_egresos = $this->obtenerTotalEgresos();
        $this->efectivo = $efectivoFinal;
        $this->diferencia = $this->calcularDiferencia();
        
        $this->estado = self::ESTADO_CERRADA;
        $this->fecha_cierre = now();
        $this->cerrada_por_id = auth()->id();
        $this->observaciones = $observaciones ?: $this->observaciones;
        $this->save();

        // Registrar movimiento de cierre
        MovimientoCaja::create([
            'caja_id' => $this->id,
            'tipo' => MovimientoCaja::TIPO_CIERRE,
            'monto' => $efectivoFinal,
            'descripcion' => 'Cierre de caja',
            'user_id' => auth()->id(),
        ]);

        // Si hay diferencia, registrar movimiento adicional
        if ($this->diferencia != 0) {
            MovimientoCaja::create([
                'caja_id' => $this->id,
                'tipo' => $this->diferencia > 0 ? MovimientoCaja::TIPO_INGRESO : MovimientoCaja::TIPO_EGRESO,
                'monto' => abs($this->diferencia),
                'descripcion' => $this->diferencia > 0 ? 'Sobrante en cierre' : 'Faltante en cierre',
                'user_id' => auth()->id(),
            ]);
        }
    }

    public function registrarIngreso($monto, $descripcion, $referencia = null)
    {
        $movimiento = MovimientoCaja::create([
            'caja_id' => $this->id,
            'tipo' => MovimientoCaja::TIPO_INGRESO,
            'monto' => $monto,
            'descripcion' => $descripcion,
            'referencia' => $referencia,
            'user_id' => auth()->id(),
        ]);

        $this->efectivo += $monto;
        $this->save();

        return $movimiento;
    }

    public function registrarEgreso($monto, $descripcion, $referencia = null)
    {
        $movimiento = MovimientoCaja::create([
            'caja_id' => $this->id,
            'tipo' => MovimientoCaja::TIPO_EGRESO,
            'monto' => $monto,
            'descripcion' => $descripcion,
            'referencia' => $referencia,
            'user_id' => auth()->id(),
        ]);

        $this->efectivo -= $monto;
        $this->save();

        return $movimiento;
    }

    /**
     * Obtener resumen completo para el cierre
     */
    public function obtenerResumenCierre()
    {
        $ventasPorTipo = $this->calcularVentasPorTipo();
        $ventasPorCondicion = $this->calcularVentasPorCondicion();
        
        return [
            // Resumen financiero básico
            'monto_inicial' => (float) $this->monto_inicial,
            'total_ventas' => (float) $this->calcularTotalVentas(),
            'total_ingresos' => (float) $this->obtenerTotalIngresos(),
            'total_egresos' => (float) $this->obtenerTotalEgresos(),
            'efectivo_teorico' => (float) $this->calcularEfectivoTeorico(),
            'efectivo_actual' => (float) $this->efectivo,
            
            // Ventas por tipo de pago
            'ventas_efectivo' => (float) $this->calcularVentasEfectivo(),
            'ventas_tarjeta_debito' => (float) $this->calcularVentasTarjetaDebito(),
            'ventas_tarjeta_credito' => (float) $this->calcularVentasTarjetaCredito(),
            'ventas_tarjeta_total' => (float) ($this->calcularVentasTarjetaDebito() + $this->calcularVentasTarjetaCredito()),
            'ventas_transferencia' => (float) $this->calcularVentasTransferencia(),
            'ventas_por_tipo' => $ventasPorTipo,
            
            // Ventas por condición de pago
            'ventas_contado' => (float) ($ventasPorCondicion['CONTADO']['total'] ?? 0),
            'ventas_credito' => (float) ($ventasPorCondicion['CREDITO']['total'] ?? 0),
            'ventas_por_condicion' => $ventasPorCondicion,
            
            // Cantidades
            'cantidad_ventas' => $this->ventas()->where('estado', Venta::ESTADO_PROCESADA)->count(),
        ];
    }

    /**
     * Attribute: Diferencia formateada
     */
    public function getDiferenciaFormateadaAttribute()
    {
        return number_format($this->diferencia, 2);
    }

    /**
     * Attribute: Estado formateado
     */
    public function getEstadoFormateadoAttribute()
    {
        return ucfirst($this->estado);
    }

    /**
     * Attribute: Color del estado
     */
    public function getColorEstadoAttribute()
    {
        return match($this->estado) {
            self::ESTADO_ABIERTA => 'success',
            self::ESTADO_CERRADA => 'secondary',
            self::ESTADO_PENDIENTE => 'warning',
            default => 'light'
        };
    }

    /**
     * Attribute: Icono del estado
     */
    public function getIconoEstadoAttribute()
    {
        return match($this->estado) {
            self::ESTADO_ABIERTA => 'lock-open',
            self::ESTADO_CERRADA => 'lock',
            self::ESTADO_PENDIENTE => 'clock',
            default => 'question-circle'
        };
    }

    /**
     * Verificar si la caja está abierta
     */
    public function estaAbierta(): bool
    {
        return $this->estado === self::ESTADO_ABIERTA;
    }

    /**
     * Verificar si la caja está cerrada
     */
    public function estaCerrada(): bool
    {
        return $this->estado === self::ESTADO_CERRADA;
    }
}