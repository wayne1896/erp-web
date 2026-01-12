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
        // database/migrations/2024_01_23_create_sincronizacion_table.php
Schema::create('sincronizacion_movil', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users'); // Vendedor
    $table->string('dispositivo_id')->nullable();
    $table->enum('tipo_sincronizacion', ['INICIAL', 'INCREMENTAL', 'COMPLETA']);
    $table->timestamp('fecha_sincronizacion');
    $table->integer('registros_enviados')->default(0);
    $table->integer('registros_recibidos')->default(0);
    $table->enum('estado', ['PENDIENTE', 'COMPLETADA', 'ERROR'])->default('PENDIENTE');
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
