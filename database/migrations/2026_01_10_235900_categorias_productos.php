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
        // Crear tabla categorias_productos si no existe
        if (!Schema::hasTable('categorias_productos')) {
            Schema::create('categorias_productos', function (Blueprint $table) {
                $table->id();
                $table->string('nombre');
                $table->string('codigo', 10)->unique();
                $table->decimal('itbis_porcentaje', 5, 2)->default(18.00);
                $table->enum('tasa_itbis', ['ITBIS1', 'ITBIS2', 'ITBIS3', 'EXENTO'])->default('ITBIS1');
                /* 
                ITBIS en RD:
                - ITBIS1: 18% General
                - ITBIS2: 16% Turismo
                - ITBIS3: 0% Selectivos
                - EXENTO: 0% Bienes exentos
                */
                $table->text('descripcion')->nullable();
                $table->timestamps();
            });
        }

        // Crear tabla productos si no existe
        if (!Schema::hasTable('productos')) {
            Schema::create('productos', function (Blueprint $table) {
                $table->id();
                $table->string('codigo', 50)->unique();
                $table->string('codigo_barras', 100)->nullable()->unique();
                $table->string('nombre');
                $table->text('descripcion')->nullable();
                $table->foreignId('categoria_id')->constrained('categorias_productos');
                $table->unsignedBigInteger('proveedor_id')->nullable();
                
                // Precios
                $table->decimal('precio_compra', 15, 2);
                $table->decimal('precio_venta', 15, 2);
                $table->decimal('precio_mayor', 15, 2)->nullable();
                
                // Impuestos RD
                $table->enum('tasa_itbis', ['ITBIS1', 'ITBIS2', 'ITBIS3', 'EXENTO'])->default('ITBIS1');
                $table->decimal('itbis_porcentaje', 5, 2)->default(18.00);
                $table->boolean('exento_itbis')->default(false);
                
                // Inventario
                $table->decimal('stock_minimo', 10, 2)->default(0);
                $table->decimal('stock_maximo', 10, 2)->nullable();
                $table->boolean('control_stock')->default(true);
                
                // Unidades de medida RD
                $table->enum('unidad_medida', [
                    'UNIDAD', 'PAR', 'JUEGO', 'KILOGRAMO', 'GRAMO', 'LIBRA', 'ONZA',
                    'LITRO', 'MILILITRO', 'GALON', 'METRO', 'CENTIMETRO', 'PULGADA',
                    'CAJA', 'PAQUETE', 'ROLLO', 'DOCENA'
                ])->default('UNIDAD');
                
                $table->boolean('activo')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias_productos');
    }
};
