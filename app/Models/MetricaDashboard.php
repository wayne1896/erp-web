<?php
// app/Models/MetricaDashboard.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricaDashboard extends Model
{
    protected $table = 'metricas_dashboard';
    
    protected $fillable = [
        'user_id',
        'sucursal_id',
        'tipo_metrica',
        'periodo',
        'valor',
        'meta',
        'tendencia',
        'variacion',
        'fecha_referencia',
        'datos_detallados',
    ];
    
    protected $casts = [
        'valor' => 'decimal:2',
        'meta' => 'decimal:2',
        'tendencia' => 'decimal:2',
        'variacion' => 'decimal:2',
        'fecha_referencia' => 'date',
        'datos_detallados' => 'array',
    ];
    
    /**
     * Tipos de métricas
     */
    const TIPO_VENTAS = 'ventas';
    const TIPO_CLIENTES = 'clientes';
    const TIPO_PRODUCTOS = 'productos';
    const TIPO_INVENTARIO = 'inventario';
    const TIPO_CAJA = 'caja';
    const TIPO_VENDEDOR = 'vendedor';
    
    /**
     * Periodos
     */
    const PERIODO_HOY = 'hoy';
    const PERIODO_SEMANA = 'semana';
    const PERIODO_MES = 'mes';
    const PERIODO_ANIO = 'anio';
    
    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    /**
     * Scopes
     */
    public function scopeDelUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopeDeSucursal($query, $sucursalId)
    {
        return $query->where('sucursal_id', $sucursalId);
    }
    
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_metrica', $tipo);
    }
    
    public function scopePorPeriodo($query, $periodo)
    {
        return $query->where('periodo', $periodo);
    }
    
    public function scopeRecientes($query, $dias = 7)
    {
        return $query->where('fecha_referencia', '>=', now()->subDays($dias));
    }
    
    /**
     * Accessors
     */
    public function porcentajeMeta(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->meta <= 0) {
                    return 100;
                }
                return round(($this->valor / $this->meta) * 100, 2);
            }
        );
    }
    
    public function estadoMeta(): Attribute
    {
        return Attribute::make(
            get: function () {
                $porcentaje = $this->porcentaje_meta;
                
                if ($porcentaje >= 100) {
                    return 'superada';
                } elseif ($porcentaje >= 90) {
                    return 'cercana';
                } elseif ($porcentaje >= 70) {
                    return 'en_progreso';
                } else {
                    return 'atrasada';
                }
            }
        );
    }
    
    public function tendenciaIcono(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->tendencia > 0) {
                    return '↑'; // Subiendo
                } elseif ($this->tendencia < 0) {
                    return '↓'; // Bajando
                } else {
                    return '→'; // Estable
                }
            }
        );
    }
    
    public function colorEstado(): Attribute
    {
        return Attribute::make(
            get: function () {
                return match($this->estado_meta) {
                    'superada' => 'success',
                    'cercana' => 'warning',
                    'en_progreso' => 'info',
                    'atrasada' => 'danger',
                    default => 'secondary',
                };
            }
        );
    }
    
    /**
     * Métodos de negocio
     */
    public static function calcularParaUsuario($userId, $sucursalId, $tipo, $periodo)
    {
        return match($tipo) {
            self::TIPO_VENTAS => self::calcularMetricasVentas($userId, $sucursalId, $periodo),
            self::TIPO_CLIENTES => self::calcularMetricasClientes($sucursalId, $periodo),
            self::TIPO_PRODUCTOS => self::calcularMetricasProductos($sucursalId, $periodo),
            self::TIPO_INVENTARIO => self::calcularMetricasInventario($sucursalId, $periodo),
            self::TIPO_CAJA => self::calcularMetricasCaja($userId, $sucursalId, $periodo),
            self::TIPO_VENDEDOR => self::calcularMetricasVendedor($userId, $sucursalId, $periodo),
            default => null,
        };
    }
    
    private static function calcularMetricasVentas($userId, $sucursalId, $periodo)
    {
        $fechas = self::obtenerFechasPeriodo($periodo);
        
        $ventas = Venta::where('sucursal_id', $sucursalId)
            ->where('estado', 'PROCESADA')
            ->whereBetween('fecha_venta', [$fechas['inicio'], $fechas['fin']]);
            
        if ($periodo === self::PERIODO_HOY) {
            $ventas->where('user_id', $userId);
        }
        
        $totalVentas = $ventas->count();
        $totalMonto = $ventas->sum('total');
        $ventasCredito = $ventas->where('condicion_pago', 'CREDITO')->count();
        $promedioVenta = $totalVentas > 0 ? $totalMonto / $totalVentas : 0;
        
        // Comparar con período anterior
        $fechasAnterior = self::obtenerFechasPeriodoAnterior($periodo);
        $ventasAnterior = Venta::where('sucursal_id', $sucursalId)
            ->where('estado', 'PROCESADA')
            ->whereBetween('fecha_venta', [$fechasAnterior['inicio'], $fechasAnterior['fin']])
            ->sum('total');
            
        $variacion = $ventasAnterior > 0 ? 
            (($totalMonto - $ventasAnterior) / $ventasAnterior) * 100 : 0;
        
        // Calcular meta (ejemplo: meta diaria = promedio mensual / 30)
        $meta = self::calcularMetaVentas($sucursalId, $periodo);
        
        return [
            'total_ventas' => $totalVentas,
            'total_monto' => $totalMonto,
            'ventas_credito' => $ventasCredito,
            'promedio_venta' => $promedioVenta,
            'variacion' => $variacion,
            'meta' => $meta,
            'porcentaje_meta' => $meta > 0 ? ($totalMonto / $meta) * 100 : 100,
        ];
    }
    
    private static function calcularMetricasClientes($sucursalId, $periodo)
    {
        $fechas = self::obtenerFechasPeriodo($periodo);
        
        $clientesNuevos = Cliente::where('activo', true)
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->count();
            
        $clientesActivos = Venta::where('sucursal_id', $sucursalId)
            ->whereBetween('fecha_venta', [$fechas['inicio'], $fechas['fin']])
            ->distinct('cliente_id')
            ->count('cliente_id');
            
        $clientesRecurrentes = DB::table('ventas as v1')
            ->join('ventas as v2', function($join) use ($fechas) {
                $join->on('v1.cliente_id', '=', 'v2.cliente_id')
                     ->where('v2.fecha_venta', '<', $fechas['inicio']);
            })
            ->where('v1.sucursal_id', $sucursalId)
            ->whereBetween('v1.fecha_venta', [$fechas['inicio'], $fechas['fin']])
            ->distinct('v1.cliente_id')
            ->count('v1.cliente_id');
        
        return [
            'clientes_nuevos' => $clientesNuevos,
            'clientes_activos' => $clientesActivos,
            'clientes_recurrentes' => $clientesRecurrentes,
            'tasa_retencion' => $clientesActivos > 0 ? 
                ($clientesRecurrentes / $clientesActivos) * 100 : 0,
        ];
    }
}