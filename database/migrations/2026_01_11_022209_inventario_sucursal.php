<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       // database/migrations/2024_01_06_create_inventario_sucursal_table.php
Schema::create('inventario_sucursal', function (Blueprint $table) {
    $table->id();
    $table->foreignId('producto_id')->constrained('productos');
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->decimal('stock_actual', 15, 2)->default(0);
    $table->decimal('stock_reservado', 15, 2)->default(0);
    $table->decimal('stock_disponible', 15, 2)->default(0);
    $table->decimal('costo_promedio', 15, 2)->default(0);
    $table->decimal('valor_inventario', 15, 2)->default(0);
    $table->timestamps();
    
    $table->unique(['producto_id', 'sucursal_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
