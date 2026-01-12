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
       // database/migrations/2024_01_08_create_proveedores_table.php
Schema::create('proveedores', function (Blueprint $table) {
    $table->id();
    $table->string('codigo', 20)->unique();
    $table->string('nombre');
    $table->string('rnc', 11)->nullable()->unique();
    $table->string('telefono', 10);
    $table->string('email')->nullable();
    $table->string('direccion');
    $table->string('contacto_nombre')->nullable();
    $table->string('contacto_telefono', 10)->nullable();
    $table->enum('tipo_proveedor', ['LOCAL', 'INTERNACIONAL'])->default('LOCAL');
    $table->integer('dias_credito')->default(0);
    $table->decimal('limite_credito', 15, 2)->default(0);
    $table->boolean('activo')->default(true);
    $table->timestamps();
});

        // Agregar foreign key a productos si la tabla existe y tiene la columna proveedor_id
        if (Schema::hasTable('productos') && Schema::hasColumn('productos', 'proveedor_id')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->foreign('proveedor_id')->references('id')->on('proveedores')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar foreign key antes de eliminar la tabla
        if (Schema::hasTable('productos') && Schema::hasColumn('productos', 'proveedor_id')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropForeign(['proveedor_id']);
            });
        }
        
        Schema::dropIfExists('proveedores');
    }
};
