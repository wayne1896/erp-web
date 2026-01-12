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
       // database/migrations/2024_01_01_create_configuracion_empresa_table.php
Schema::create('configuracion_empresa', function (Blueprint $table) {
    $table->id();
    $table->string('nombre_empresa');
    $table->string('rnc', 11)->unique(); // RNC dominicano (9 o 11 dígitos)
    $table->string('telefono', 10);
    $table->string('email');
    $table->string('direccion');
    $table->string('provincia'); // RD tiene 32 provincias
    $table->string('municipio');
    $table->string('sector');
    $table->string('actividad_economica');
    $table->decimal('itbis', 5, 2)->default(18.00); // ITBIS general 18%
    $table->string('regimen_pago'); // Normal, Simplificado, Especial
    $table->boolean('facturacion_electronica')->default(false);
    $table->string('certificado_digital_path')->nullable();
    $table->string('pin_certificado')->nullable();
    $table->json('configuraciones')->nullable();
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
