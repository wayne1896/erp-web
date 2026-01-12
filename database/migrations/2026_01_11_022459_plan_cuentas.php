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
// database/migrations/2024_01_21_create_plan_cuentas_table.php
Schema::create('plan_cuentas', function (Blueprint $table) {
    $table->id();
    $table->string('codigo', 20)->unique(); // 1-01-01-001
    $table->string('nombre');
    $table->enum('tipo', ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'COSTO', 'GASTO']);
    $table->enum('naturaleza', ['DEUDORA', 'ACREEDORA']);
    $table->boolean('acepta_movimiento')->default(true);
    $table->timestamps();
});

// database/migrations/2024_01_22_create_asientos_contables_table.php
Schema::create('asientos_contables', function (Blueprint $table) {
    $table->id();
    $table->string('numero_asiento')->unique();
    $table->date('fecha_asiento');
    $table->text('concepto');
    $table->decimal('total_debe', 15, 2);
    $table->decimal('total_haber', 15, 2);
    $table->enum('estado', ['BORRADOR', 'PUBLICADO'])->default('BORRADOR');
    $table->timestamps();
});    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
