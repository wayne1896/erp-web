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
        return $this->hasMany(Venta::class);
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
        return $this->ventas()
            ->where('estado', Venta::ESTADO_PROCESADA)
            ->sum('total');
    }

    public function calcularEfectivoTeorico()
    {
        $totalVentas = $this->calcularTotalVentas();
        $totalIngresos = $this->obtenerTotalIngresos();
        $totalEgresos = $this->obtenerTotalEgresos();
        
        return $this->monto_inicial + $totalVentas + $totalIngresos - $totalEgresos;
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
        $this->total_ventas = Venta::where('caja_id', $this->id)
            ->where('estado', 'PROCESADA')
            ->sum('total');
        
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
        // Calcular diferencia
        $this->total_ventas = $this->calcularTotalVentas();
        $this->total_ingresos = $this->obtenerTotalIngresos();
        $this->total_egresos = $this->obtenerTotalEgresos();
        $this->efectivo = $efectivoFinal;
        $this->diferencia = $this->calcularDiferencia();
        
        $this->estado = self::ESTADO_CERRADA;
        $this->fecha_cierre = now();
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
}