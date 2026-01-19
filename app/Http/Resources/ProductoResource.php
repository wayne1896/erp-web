<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
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
        'codigo' => $this->codigo,
        'nombre' => $this->nombre,
        'descripcion' => $this->descripcion,
        'precio' => $this->precio,
        'stock' => $this->stock,
        'stock_minimo' => $this->stock_minimo,
        'categoria' => $this->categoria->nombre,
        'bodega' => $this->bodega->nombre,
        'alerta_stock' => $this->stock <= $this->stock_minimo, // Útil para app
    ];
}
}
