<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    // Constantes de estado
    const ESTADO_PENDIENTE = 'PENDIENTE';
    const ESTADO_PROCESADA = 'PROCESADA';
    const ESTADO_ANULADA = 'ANULADA';
    const ESTADO_FACTURADA = 'FACTURADA';
    const ESTADO_ENVIADA = 'ENVIADA';
    
    // Constantes de condición de pago
    const CONDICION_CONTADO = 'CONTADO';
    const CONDICION_CREDITO = 'CREDITO';
    const CONDICION_MIXTO = 'MIXTO'; // ← Agregar esta línea
    
    // Constantes de tipo de comprobante
    const TIPO_FACTURA = 'FACTURA';
    const TIPO_NOTA_CREDITO = 'NOTA_CREDITO';
    const TIPO_NOTA_DEBITO = 'NOTA_DEBITO';
    const TIPO_COMPROBANTE_FISCAL = 'COMPROBANTE_FISCAL';
    
    // Constantes de tipo de pago
    const TIPO_PAGO_EFECTIVO = 'EFECTIVO';
    const TIPO_PAGO_TARJETA_DEBITO = 'TARJETA_DEBITO';
    const TIPO_PAGO_TARJETA_CREDITO = 'TARJETA_CREDITO';
    const TIPO_PAGO_TRANSFERENCIA = 'TRANSFERENCIA';
    const TIPO_PAGO_CHEQUE = 'CHEQUE';

    protected $fillable = [
        'numero_factura',
        'ncf',
        'tipo_comprobante',
        'cliente_id',
        'sucursal_id',
        'user_id',
        'caja_id', // Agregar este campo
        'fecha_venta',
        'estado',
        'condicion_pago',
        'tipo_pago', // Agregar este campo
        'dias_credito',
        'fecha_vencimiento',
        'subtotal',
        'descuento',
        'itbis',
        'total',
        'estado_dgii',
        'codigo_autorizacion_dgii',
        'respuesta_dgii',
        'fecha_autorizacion_dgii',
        'notas'
    ];
    
    protected $casts = [
        'fecha_venta' => 'date',
        'fecha_vencimiento' => 'date',
        'fecha_autorizacion_dgii' => 'datetime',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'itbis' => 'decimal:2',
        'total' => 'decimal:2',
    ];
    
    /**
     * Relaciones
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
    
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class, 'caja_id');
    }
    
    // Alias para compatibilidad
    public function usuario(): BelongsTo
    {
        return $this->vendedor();
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }
    
    public function pagos(): HasMany
    {
        return $this->hasMany(PagoVenta::class);
    }
    
    /**
     * Scope para ventas procesadas
     */
    public function scopeProcesadas($query)
    {
        return $query->where('estado', self::ESTADO_PROCESADA);
    }
    
    /**
     * Scope para ventas del día
     */
    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_venta', today());
    }
    
    /**
     * Scope para ventas pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }
    
    /**
     * Scope para ventas a crédito
     */
    public function scopeAlCredito($query)
    {
        return $query->where('condicion_pago', self::CONDICION_CREDITO);
    }
    
    /**
     * Obtener opciones de estado
     */
    public static function getEstados()
    {
        return [
            self::ESTADO_PENDIENTE => 'Pendiente',
            self::ESTADO_PROCESADA => 'Procesada',
            self::ESTADO_ANULADA => 'Anulada',
            self::ESTADO_FACTURADA => 'Facturada',
            self::ESTADO_ENVIADA => 'Enviada',
        ];
    }
    
    /**
     * Obtener opciones de condición de pago
     */
    public static function getCondicionesPago()
    {
        return [
            self::CONDICION_CONTADO => 'Contado',
            self::CONDICION_CREDITO => 'Crédito',
        ];
    }
    
    /**
     * Obtener opciones de tipo de pago
     */
    public static function getTiposPago()
    {
        return [
            self::TIPO_PAGO_EFECTIVO => 'Efectivo',
            self::TIPO_PAGO_TARJETA_DEBITO => 'Tarjeta Débito',
            self::TIPO_PAGO_TARJETA_CREDITO => 'Tarjeta Crédito',
            self::TIPO_PAGO_TRANSFERENCIA => 'Transferencia',
            self::TIPO_PAGO_CHEQUE => 'Cheque',
        ];
    }
    
    /**
     * Obtener opciones de tipo de comprobante
     */
    public static function getTiposComprobante()
    {
        return [
            self::TIPO_FACTURA => 'Factura',
            self::TIPO_NOTA_CREDITO => 'Nota de Crédito',
            self::TIPO_NOTA_DEBITO => 'Nota de Débito',
            self::TIPO_COMPROBANTE_FISCAL => 'Comprobante Fiscal',
        ];
    }
    
    /**
     * Calcular total pagado
     */
    public function getPagadoAttribute()
    {
        return $this->pagos()->sum('monto');
    }
    
    /**
     * Calcular saldo pendiente
     */
    public function getSaldoAttribute()
    {
        return $this->total - $this->pagado;
    }
    
    /**
     * Verificar si está pagada
     */
    public function getEstaPagadaAttribute()
    {
        return $this->saldo <= 0;
    }
    
    /**
     * Verificar si está vencida
     */
    public function getEstaVencidaAttribute()
    {
        if (!$this->fecha_vencimiento || $this->esta_pagada) {
            return false;
        }
        
        return now()->greaterThan($this->fecha_vencimiento);
    }
}