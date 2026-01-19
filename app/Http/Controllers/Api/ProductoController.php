<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\CategoriaProducto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductoController extends Controller
{
    /**
     * GET /api/productos
     * Lista de productos para Android
     */
    public function index(Request $request): JsonResponse
{
    try {
        $productos = Producto::with(['categoria:id,nombre'])
            ->activos()
            ->select([
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'precio_venta',
                'precio_mayor',
                'unidad_medida',
                'categoria_id',
                'stock_minimo',
                'control_stock'
            ])
            ->limit(10)
            ->get()
            ->map(function (Producto $producto) {
                return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'precio_venta' => (float) $producto->precio_venta,
                    'precio_mayor' => $producto->precio_mayor ? (float) $producto->precio_mayor : null,
                    'stock_disponible_total' => (float) $producto->stock_disponible_total,
                    'unidad_medida' => $producto->unidad_medida,
                    'unidad_medida_texto' => $producto->unidad_medida_texto,
                    'categoria' => $producto->categoria ? [
                        'id' => $producto->categoria->id,
                        'nombre' => $producto->categoria->nombre,
                    ] : null,
                    'estado_stock' => $this->determinarEstadoStock($producto)
                ];return [
                    'id' => $producto->id,
                    'codigo' => $producto->codigo,
                    'nombre' => $producto->nombre,
                    'descripcion' => $producto->descripcion,
                    'precio_venta' => (float) $producto->precio_venta,
                    'precio_mayor' => $producto->precio_mayor ? (float) $producto->precio_mayor : null,
                    'precio_venta_con_itbis' => (float) $producto->precio_venta_con_itbis, // Importante!
                    'stock_disponible_total' => (float) $producto->stock_disponible_total,
                    'stock_minimo' => (float) $producto->stock_minimo, // Para el detalle
                    'unidad_medida' => $producto->unidad_medida,
                    'unidad_medida_texto' => $producto->unidad_medida_texto,
                    'itbis_porcentaje' => (float) $producto->itbis_porcentaje, // Para el detalle
                    'tasa_itbis' => $producto->tasa_itbis,
                    'descripcion_itbis' => $producto->descripcion_itbis, // Para el detalle
                    'categoria' => $producto->categoria ? [
                        'id' => $producto->categoria->id,
                        'nombre' => $producto->categoria->nombre,
                    ] : null,
                    'estado_stock' => $this->determinarEstadoStock($producto)
                ];
            });

        return response()->json([
            'success' => true,
            'count' => $productos->count(),
            'data' => $productos
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener productos',
            'error' => $e->getMessage()
        ], 500);
    }
}
    
    /**
     * Formatea el producto para respuesta Android
     */
    private function formatProductoParaAndroid(Producto $producto): array
    {
        return [
            'id' => $producto->id,
            'codigo' => $producto->codigo,
            'codigo_barras' => $producto->codigo_barras,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'unidad_medida' => $producto->unidad_medida,
            'unidad_medida_texto' => $producto->unidad_medida_texto,
            'precio_compra' => (float) $producto->precio_compra,
            'precio_venta' => (float) $producto->precio_venta,
            'precio_mayor' => $producto->precio_mayor ? (float) $producto->precio_mayor : null,
            'tasa_itbis' => $producto->tasa_itbis,
            'itbis_porcentaje' => (float) $producto->itbis_porcentaje,
            'exento_itbis' => (bool) $producto->exento_itbis,
            'precio_venta_con_itbis' => (float) $producto->precio_venta_con_itbis,
            'stock_minimo' => (float) $producto->stock_minimo,
            'control_stock' => (bool) $producto->control_stock,
            'activo' => (bool) $producto->activo,
            
            // Campos calculados
            'stock_total' => (float) $producto->stock_total,
            'stock_disponible_total' => (float) $producto->stock_disponible_total,
            'valor_inventario_total' => (float) $producto->valor_inventario_total,
            'margen_ganancia' => (float) $producto->margen_ganancia,
            'descripcion_itbis' => $producto->descripcion_itbis,
            
            // Relación con categoría
            'categoria' => $producto->categoria ? [
                'id' => $producto->categoria->id,
                'nombre' => $producto->categoria->nombre,
                'descripcion' => $producto->categoria->descripcion
            ] : null,
            
            // Estado de stock (para mostrar colores en Android)
            'estado_stock' => $this->determinarEstadoStock($producto)
        ];
    }
    
    /**
     * Determina el estado del stock para colores en Android
     */
    private function determinarEstadoStock(Producto $producto): array
    {
        $stockDisponible = (float) $producto->stock_disponible_total;
        $stockMinimo = (float) $producto->stock_minimo;
        
        if ($stockDisponible <= 0) {
            return [
                'nivel' => 'agotado',
                'color' => '#f44336', // Rojo
                'texto' => 'Agotado',
                'alerta' => true
            ];
        }
        
        if ($stockDisponible <= $stockMinimo) {
            return [
                'nivel' => 'bajo',
                'color' => '#ff9800', // Naranja
                'texto' => 'Stock bajo',
                'alerta' => true
            ];
        }
        
        return [
            'nivel' => 'bueno',
            'color' => '#4caf50', // Verde
            'texto' => 'Stock suficiente',
            'alerta' => false
        ];
    }
    
    /**
     * GET /api/productos/{id}
     * Producto individual
     */
    public function show($id): JsonResponse
    {
        try {
            $producto = Producto::with([
                'categoria:id,nombre,descripcion',
                'inventarios.sucursal:id,nombre'
            ])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $this->formatProductoParaAndroid($producto)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }
    }
    
    /**
     * GET /api/productos/categorias
     * Lista de categorías
     */
    public function categorias(): JsonResponse
    {
        $categorias = CategoriaProducto::select(['id', 'nombre', 'descripcion'])
            ->orderBy('nombre')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $categorias
        ]);
    }
}