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
        // database/migrations/2024_01_19_create_cajas_table.php
Schema::create('cajas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->string('nombre');
    $table->enum('tipo_caja', ['EFECTIVO', 'BANCO', 'TARJETA'])->default('EFECTIVO');
    $table->decimal('saldo_inicial', 15, 2)->default(0);
    $table->decimal('saldo_actual', 15, 2)->default(0);
    $table->boolean('activa')->default(true);
    $table->timestamps();
});

// database/migrations/2024_01_20_create_movimientos_caja_table.php
Schema::create('movimientos_caja', function (Blueprint $table) {
    $table->id();
    $table->foreignId('caja_id')->constrained('cajas');
    $table->enum('tipo_movimiento', ['INGRESO', 'EGRESO', 'APERTURA', 'CIERRE']);
    $table->string('referencia')->nullable();
    $table->string('descripcion');
    $table->decimal('monto', 15, 2);
    $table->decimal('saldo_anterior', 15, 2);
    $table->decimal('saldo_nuevo', 15, 2);
    $table->foreignId('user_id')->constrained('users');
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
