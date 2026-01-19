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
            'id' => $this->id,
            'folio' => 'PED-' . str_pad($this->id, 6, '0', STR_PAD_LEFT),
            'cliente' => [
                'id' => $this->cliente->id,
                'nombre' => $this->cliente->nombre,
                'telefono' => $this->cliente->telefono,
            ],
            'estado' => $this->estado,
            'total' => $this->total,
            'fecha' => $this->created_at->format('d/m/Y H:i'),
            'items' => $this->items->map(function ($item) {
                return [
                    'producto_id' => $item->producto_id,
                    'producto_nombre' => $item->producto->nombre,
                    'cantidad' => $item->cantidad,
                    'precio' => $item->precio,
                    'subtotal' => $item->subtotal,
                ];
            }),
        ];
    }
}
