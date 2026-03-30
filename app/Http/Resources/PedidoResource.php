<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => (string) $this->id,
            'folio' => 'PED' . $this->created_at->format('ym') . str_pad($this->id, 4, '0', STR_PAD_LEFT),
            'numero_pedido' => $this->numero_pedido,
            'tipo_pedido' => $this->tipo_pedido,
            'notas' => $this->notas ?: '',
            'cliente' => [
                'id' => (string) $this->cliente->id,
                'nombre' => $this->cliente->nombre_completo ?: 'CONSUMIDOR FINAL',
                'telefono' => $this->cliente->telefono ?: '',
                'rnc' => $this->cliente->cedula_rnc ?: '000-0000000-0',
                'email' => $this->cliente->email ?: '',
                'direccion' => $this->cliente->direccion ?: '',
                'sector' => $this->cliente->sector ?: '',
                'municipio' => $this->cliente->municipio ?: '',
                'provincia' => $this->cliente->provincia ?: '',
            ],
            'direccion_entrega' => $this->when($this->tipo_pedido === 'DOMICILIO', function () {
                return [
                    'id' => (string) $this->direccionEntrega->id,
                    'direccion' => $this->direccionEntrega->direccion ?? '',
                    'sector' => $this->direccionEntrega->sector ?? '',
                    'municipio' => $this->direccionEntrega->municipio ?? '',
                    'provincia' => $this->direccionEntrega->provincia ?? '',
                    'referencia' => $this->direccionEntrega->referencia ?? '',
                    'contacto_nombre' => $this->direccionEntrega->contacto_nombre ?? '',
                    'contacto_telefono' => $this->direccionEntrega->contacto_telefono ?? '',
                ];
            }),
            'fechas' => [
                'pedido' => $this->fecha_pedido->format('d M Y'),
                'entrega' => $this->fecha_entrega ? $this->fecha_entrega->format('d M Y') : null,
                'creado' => $this->created_at->format('d M Y'),
            ],
            'estado' => [
                'actual' => $this->estado,
                'prioridad' => $this->prioridad ?: 'MEDIA',
            ],
            'condicion_pago' => $this->condicion_pago ?: 'CONTADO',
            'montos' => [
                'total' => (float) $this->total,
                'anticipo' => (float) ($this->anticipo ?? 0),
                'saldo' => (float) ($this->saldo_pendiente ?? $this->total),
            ],
            'items' => $this->detalles->map(function ($detalle) {
                return [
                    'id' => (string) $detalle->id,
                    'producto_id' => (string) $detalle->producto_id,
                    'producto_nombre' => $detalle->producto->nombre ?? 'Producto eliminado',
                    'producto_codigo' => $detalle->producto->codigo ?? '',
                    'categoria' => $detalle->producto && $detalle->producto->categoria ? $detalle->producto->categoria->nombre : '',
                    'cantidad_solicitada' => (float) $detalle->cantidad_solicitada,
                    'cantidad_entregada' => (float) $detalle->cantidad_entregada,
                    'precio_unitario' => (float) $detalle->precio_unitario,
                    'precio_original' => (float) ($detalle->precio_original ?? 0),
                    'subtotal' => (float) $detalle->subtotal,
                    'itbis_porcentaje' => (float) $detalle->itbis_porcentaje,
                    'itbis_monto' => (float) $detalle->itbis_monto,
                    'descuento_porcentaje' => (float) $detalle->descuento,
                    'descuento_monto' => (float) $detalle->descuento_monto,
                    'total' => (float) $detalle->total,
                    'observaciones' => $detalle->observaciones ?: '',
                ];
            }),
            'resumen' => [
                'subtotal' => (float) $this->detalles->sum('subtotal'),
                'itbis_total' => (float) $this->detalles->sum('itbis_monto'),
                'descuento_total' => (float) $this->detalles->sum('descuento_monto'),
                'total' => (float) $this->total,
            ],
            'repartidor' => $this->when($this->repartidor, function () {
                return [
                    'id' => (string) $this->repartidor->id,
                    'nombre' => $this->repartidor->name,
                    'email' => $this->repartidor->email,
                    'telefono' => $this->repartidor->telefono ?? '',
                ];
            }),
            'vendedor' => [
                'id' => (string) $this->usuario->id,
                'nombre' => $this->usuario->name,
                'email' => $this->usuario->email,
                'telefono' => $this->usuario->telefono ?? '',
            ],
            'sucursal' => [
                'id' => (string) $this->sucursal->id,
                'nombre' => $this->sucursal->nombre,
                'direccion' => $this->sucursal->direccion,
                'telefono' => $this->sucursal->telefono,
            ],
            'acciones' => [
                'puede_editar' => $this->puedeEditar(),
                'puede_procesar' => $this->puedeProcesar(),
                'puede_entregar' => $this->puedeEntregar(),
                'puede_cancelar' => $this->puedeCancelar(),
            ],
        ];
    }
}
