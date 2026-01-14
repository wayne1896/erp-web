<?php
// database/migrations/xxxx_create_movimientos_inventario_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMovimientosInventarioTable extends Migration
{
    public function up()
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->foreignId('sucursal_id')->constrained('sucursales')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade'); // <-- CAMBIAR AQUÍ
            $table->string('tipo'); // entrada, salida, ajuste
            $table->decimal('cantidad', 10, 2);
            $table->decimal('cantidad_anterior', 10, 2);
            $table->decimal('cantidad_nueva', 10, 2);
            $table->decimal('costo', 10, 2)->nullable();
            $table->text('motivo');
            $table->string('referencia')->nullable();
            $table->timestamps();
            
            $table->index('producto_id');
            $table->index('sucursal_id');
            $table->index('usuario_id');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('movimientos_inventario');
    }
}