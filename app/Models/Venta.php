<?php
// app/Models/Venta.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    protected $fillable = [
        'numero_factura',
        'ncf',
        'tipo_comprobante',
        'cliente_id',
        'sucursal_id',
        'user_id',
        'fecha_venta',
        'estado',
        'condicion_pago',
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
        'pagado' => 'decimal:2',
        'saldo' => 'decimal:2'
    ];
    
    /**
     * Atributos adicionales
     */
    protected $appends = ['pagado', 'saldo'];
    
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
    // Agregar esta relación como alias
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
        return $query->where('estado', 'PENDIENTE');
    }
    
    /**
     * Scope para ventas a crédito
     */
    public function scopeAlCredito($query)
    {
        return $query->where('condicion_pago', 'CREDITO');
    }
    
    /**
     * Total pagado
     */
    public function getPagadoAttribute()
    {
        return $this->pagos()->sum('monto');
    }
    
    /**
     * Saldo pendiente
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
    
    /**
     * Días de vencimiento
     */
    public function getDiasVencimientoAttribute()
    {
        if (!$this->fecha_vencimiento || $this->esta_pagada) {
            return 0;
        }
        
        return now()->diffInDays($this->fecha_vencimiento, false);
    }
    
    /**
     * Calcular totales
     */
    public function calcularTotales()
    {
        $subtotal = $this->detalles->sum('subtotal');
        $descuento = $this->detalles->sum('descuento');
        $itbis = $this->detalles->sum('itbis_monto');
        
        $this->subtotal = $subtotal;
        $this->descuento = $descuento;
        $this->itbis = $itbis;
        $this->total = $subtotal - $descuento + $itbis;
        
        // Si es a crédito, calcular fecha de vencimiento
        if ($this->condicion_pago === 'CREDITO' && $this->dias_credito > 0) {
            $this->fecha_vencimiento = $this->fecha_venta->addDays($this->dias_credito);
        }
    }
    
    /**
     * Procesar venta (actualizar inventario)
     */
    public function procesar()
    {
        if ($this->estado !== 'PENDIENTE') {
            throw new \Exception('La venta ya fue procesada');
        }
        
        \DB::transaction(function () {
            foreach ($this->detalles as $detalle) {
                $inventario = InventarioSucursal::where('producto_id', $detalle->producto_id)
                    ->where('sucursal_id', $this->sucursal_id)
                    ->first();
                
                if ($inventario) {
                    $inventario->decrementarStock($detalle->cantidad);
                }
            }
            
            $this->estado = 'PROCESADA';
            $this->save();
        });
    }
    
    /**
     * Anular venta
     */
    public function anular($motivo = null)
    {
        if ($this->estado === 'ANULADA') {
            throw new \Exception('La venta ya está anulada');
        }
        
        \DB::transaction(function () use ($motivo) {
            // Revertir inventario
            foreach ($this->detalles as $detalle) {
                $inventario = InventarioSucursal::where('producto_id', $detalle->producto_id)
                    ->where('sucursal_id', $this->sucursal_id)
                    ->first();
                
                if ($inventario) {
                    $inventario->incrementarStock($detalle->cantidad, $detalle->producto->precio_compra);
                }
            }
            
            $this->estado = 'ANULADA';
            $this->notas = $motivo ? ($this->notas . "\nANULADA: " . $motivo) : $this->notas;
            $this->save();
        });
    }
}