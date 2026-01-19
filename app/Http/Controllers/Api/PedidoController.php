<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Http\Resources\PedidoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    // GET /api/pedidos
    public function index(Request $request)
    {
        // Filtra pedidos del usuario actual
        $pedidos = Pedido::with(['cliente', 'items.producto'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return PedidoResource::collection($pedidos);
    }
    
    // POST /api/pedidos (CREAR DESDE APP)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio' => 'required|numeric',
        ]);
        
        return DB::transaction(function () use ($validated, $request) {
            // Crear pedido
            $pedido = Pedido::create([
                'cliente_id' => $validated['cliente_id'],
                'user_id' => $request->user()->id,
                'estado' => 'pendiente',
                'total' => 0, // Se calculará
            ]);
            
            $total = 0;
            
            // Agregar items
            foreach ($validated['items'] as $item) {
                $pedidoItem = PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'precio' => $item['precio'],
                    'subtotal' => $item['cantidad'] * $item['precio'],
                ]);
                
                $total += $pedidoItem->subtotal;
                
                // Actualizar inventario (si aplica)
                Producto::where('id', $item['producto_id'])->decrement('stock', $item['cantidad']);
            }
            
            // Actualizar total
            $pedido->update(['total' => $total]);
            
            return new PedidoResource($pedido->load(['cliente', 'items.producto']));
        });
    }
}