<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BodegaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['id' => 1, 'nombre' => 'Bodega Principal'],
                ['id' => 2, 'nombre' => 'Bodega Secundaria'],
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Inventario de bodega
     */
    public function inventario(string $id)
    {
        return response()->json([
            'success' => true,
            'bodega_id' => $id,
            'inventario' => [
                ['producto_id' => 1, 'nombre' => 'Producto 1', 'stock' => 50],
                ['producto_id' => 2, 'nombre' => 'Producto 2', 'stock' => 30],
            ]
        ]);
    }
}