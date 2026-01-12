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
       // database/migrations/2024_01_12_create_pedidos_table.php
Schema::create('pedidos', function (Blueprint $table) {
    $table->id();
    $table->string('numero_pedido')->unique();
    $table->foreignId('cliente_id')->constrained('clientes');
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->foreignId('user_id')->constrained('users');
    $table->date('fecha_pedido');
    $table->date('fecha_entrega')->nullable();
    $table->enum('estado', ['PENDIENTE', 'PROCESADO', 'ENTREGADO', 'CANCELADO'])->default('PENDIENTE');
    $table->decimal('total', 15, 2);
    $table->text('notas')->nullable();
    $table->timestamps();
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
