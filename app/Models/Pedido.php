<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pedido extends Model
{
   // Constantes de estado
   const ESTADO_PENDIENTE = 'PENDIENTE';
   const ESTADO_APROBADO = 'APROBADO'; // ← Asegúrate de que esta constante exista
   const ESTADO_EN_PROCESO = 'EN_PROCESO';
   const ESTADO_ENTREGADO = 'ENTREGADO';
   const ESTADO_FACTURADO = 'FACTURADO';
   const ESTADO_CANCELADO = 'CANCELADO';
   
   // Constantes de condición de pago
   const CONDICION_CONTADO = 'CONTADO';
   const CONDICION_CREDITO = 'CREDITO';
   
   // Constantes de tipo de pedido
   const TIPO_DOMICILIO = 'DOMICILIO';
   const TIPO_SUCURSAL = 'SUCURSAL';
   
   // Constantes de prioridad
   const PRIORIDAD_BAJA = 'BAJA';
   const PRIORIDAD_MEDIA = 'MEDIA';
   const PRIORIDAD_ALTA = 'ALTA';
   
   protected $fillable = [
    'numero_pedido',
    'cliente_id',
    'sucursal_id',
    'user_id',
    'vendedor_id',
    'repartidor_id',
    'fecha_pedido',
    'fecha_entrega',
    'estado',
    'total',
    'notas',
    'prioridad',
    'tipo_pedido',
    'condicion_pago',
    'tipo_pago',
    'anticipo',
    'saldo_pendiente',
    'codigo_seguimiento',
    'fecha_procesado',
    'fecha_entregado',
    'fecha_cancelado',
    'motivo_cancelacion',
    'cancelado_por',
    'venta_id', // ← Agregar esta línea
    'fecha_facturado', // ← Agregar esta línea si agregaste la columna
];
   
   protected $casts = [
       'fecha_pedido' => 'date',
       'fecha_entrega' => 'date',
       'fecha_procesado' => 'datetime',
       'fecha_entregado' => 'datetime',
       'fecha_cancelado' => 'datetime',
       'total' => 'decimal:2',
       'anticipo' => 'decimal:2',
       'saldo_pendiente' => 'decimal:2',
   ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendedor_id');
    }

    public function repartidor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'repartidor_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetallePedido::class);
    }

    public function direccionEntrega(): HasOne
    {
        return $this->hasOne(DireccionEntrega::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PagoPedido::class);
    }

    public function log(): HasMany
    {
        return $this->hasMany(LogPedido::class);
    }

    public function ventas(): BelongsToMany
    {
        return $this->belongsToMany(Venta::class, 'pedido_venta')
            ->withPivot(['tipo_conversion', 'porcentaje_convertido'])
            ->withTimestamps();
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeProcesados($query)
    {
        return $query->where('estado', 'PROCESADO');
    }

    public function scopeEntregados($query)
    {
        return $query->where('estado', 'ENTREGADO');
    }

    public function scopeCancelados($query)
    {
        return $query->where('estado', 'CANCELADO');
    }

    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_pedido', today());
    }
    public function scopeActivos($query)
    {
        return $query->where('estado', '!=', 'CANCELADO'); // Ajusta según tu lógica
    }
    // Métodos de utilidad
    public function puedeEditar(): bool
    {
        return $this->estado === 'PENDIENTE';
    }

    public function puedeProcesar(): bool
    {
        return $this->estado === 'PENDIENTE' && $this->detalles->count() > 0;
    }

    public function puedeEntregar(): bool
    {
        return $this->estado === 'PROCESADO';
    }

    public function puedeCancelar(): bool
    {
        return in_array($this->estado, ['PENDIENTE', 'PROCESADO']);
    }

    public function tieneStockSuficiente(): bool
    {
        foreach ($this->detalles as $detalle) {
            if ($detalle->producto->control_stock) {
                $inventario = $detalle->producto->inventarios
                    ->where('sucursal_id', $this->sucursal_id)
                    ->first();
                    
                if (!$inventario || $inventario->stock_disponible < $detalle->cantidad_solicitada) {
                    return false;
                }
            }
        }
        
        return true;
    }
}