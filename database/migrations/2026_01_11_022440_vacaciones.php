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
        // database/migrations/2024_01_18_create_vacaciones_table.php
Schema::create('vacaciones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('empleado_id')->constrained('empleados');
    $table->integer('periodo'); // Año de las vacaciones
    $table->integer('dias_acumulados')->default(0); // RD: 14 días mínimo
    $table->integer('dias_tomados')->default(0);
    $table->integer('dias_disponibles')->default(0);
    $table->date('fecha_inicio')->nullable();
    $table->date('fecha_fin')->nullable();
    $table->enum('estado', ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'TOMANDO', 'FINALIZADA'])->default('PENDIENTE');
    $table->text('observaciones')->nullable();
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
