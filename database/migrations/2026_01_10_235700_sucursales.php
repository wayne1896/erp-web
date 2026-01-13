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
        // database/migrations/2024_01_03_create_sucursales_table.php
Schema::create('sucursales', function (Blueprint $table) {
    $table->id();
    $table->string('codigo', 10)->unique();
    $table->string('nombre');
    $table->string('rnc', 11)->nullable(); // RNC específico si aplica
    $table->string('telefono', 15);
    $table->string('direccion');
    $table->enum('provincia', [
        'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal',
        'Puerto Plata', 'La Altagracia', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
        'Barahona', 'San Juan', 'Azua', 'Monte Plata', 'Peravia', 'Valverde', 'María Trinidad Sánchez',
        'El Seibo', 'Hato Mayor', 'Sánchez Ramírez', 'Monte Cristi', 'Bahoruco', 'Dajabón',
        'Elías Piña', 'Independencia', 'Pedernales', 'Samana', 'Santiago Rodríguez', 'Monseñor Nouel'
    ]);
    $table->string('municipio');
    $table->string('sector');
    $table->boolean('activa')->default(true);
    $table->boolean('principal')->default(false);
    $table->json('configuracion')->nullable();
    $table->timestamps();
});

        // Agregar foreign key a users si la tabla existe y tiene la columna sucursal_id
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'sucursal_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('sucursal_id')->references('id')->on('sucursales')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar foreign key antes de eliminar la tabla
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'sucursal_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['sucursal_id']);
            });
        }
        
        Schema::dropIfExists('sucursales');
    }
};
