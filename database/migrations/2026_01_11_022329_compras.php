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
       // database/migrations/2024_01_13_create_compras_table.php
Schema::create('compras', function (Blueprint $table) {
    $table->id();
    $table->string('numero_factura')->nullable();
    $table->string('ncf_proveedor', 19)->nullable();
    $table->foreignId('proveedor_id')->constrained('proveedores');
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->date('fecha_compra');
    $table->date('fecha_vencimiento')->nullable();
    $table->enum('condicion_pago', ['CONTADO', 'CREDITO'])->default('CREDITO');
    $table->integer('dias_credito')->default(30);
    $table->enum('estado', ['PENDIENTE', 'PAGADA', 'CANCELADA'])->default('PENDIENTE');
    $table->decimal('subtotal', 15, 2);
    $table->decimal('itbis', 15, 2);
    $table->decimal('total', 15, 2);
    $table->decimal('pagado', 15, 2)->default(0);
    $table->decimal('saldo', 15, 2)->default(0);
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
