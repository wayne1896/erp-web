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
        // database/migrations/2024_01_17_create_asistencias_table.php
Schema::create('asistencias', function (Blueprint $table) {
    $table->id();
    $table->foreignId('empleado_id')->constrained('empleados');
    $table->date('fecha');
    $table->time('hora_entrada')->nullable();
    $table->time('hora_salida')->nullable();
    $table->decimal('horas_trabajadas', 5, 2)->default(0);
    $table->decimal('horas_extras', 5, 2)->default(0);
    $table->enum('estado', ['PRESENTE', 'AUSENTE', 'VACACIONES', 'LICENCIA', 'FERIADO'])->default('PRESENTE');
    $table->text('observaciones')->nullable();
    $table->timestamps();
    
    $table->unique(['empleado_id', 'fecha']);
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
