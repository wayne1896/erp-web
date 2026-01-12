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
        // database/migrations/2024_01_07_create_clientes_table.php
Schema::create('clientes', function (Blueprint $table) {
    $table->id();
    $table->string('codigo', 20)->unique();
    $table->enum('tipo_cliente', ['NATURAL', 'JURIDICO'])->default('NATURAL');
    $table->string('nombre_completo');
    $table->string('cedula_rnc', 11)->nullable()->unique();
    /* 
    Tipos de identificación RD:
    - Cédula: 001-xxxxxxx-9 (11 dígitos)
    - RNC: 1-01-xxxxx-9 (9 dígitos) o 1-30-xxxxx-9
    - Pasaporte: para extranjeros
    */
    $table->string('telefono', 10);
    $table->string('telefono_alternativo', 10)->nullable();
    $table->string('email')->nullable();
    $table->string('direccion');
    $table->string('provincia');
    $table->string('municipio');
    $table->string('sector');
    $table->enum('tipo_contribuyente', ['CONSUMIDOR_FINAL', 'CREDITO_FISCAL', 'GUBERNAMENTAL'])->default('CONSUMIDOR_FINAL');
    $table->decimal('limite_credito', 15, 2)->default(0);
    $table->integer('dias_credito')->default(0);
    $table->decimal('descuento', 5, 2)->default(0);
    $table->boolean('activo')->default(true);
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
