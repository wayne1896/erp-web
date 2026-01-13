<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('movimientos_inventario')) {
            Schema::create('movimientos_inventario', function (Blueprint $table) {
                $table->id();
                $table->foreignId('producto_id')->constrained()->onDelete('cascade');
                $table->foreignId('sucursal_id')->constrained('sucursales')->onDelete('cascade');
                $table->foreignId('usuario_id')->constrained()->onDelete('cascade');
                $table->string('tipo', 20); // entrada, salida, ajuste, transferencia
                $table->decimal('cantidad', 12, 2);
                $table->decimal('cantidad_anterior', 12, 2);
                $table->decimal('cantidad_nueva', 12, 2);
                $table->decimal('costo', 12, 2)->nullable();
                $table->string('motivo', 255);
                $table->timestamps();
                
                // Índices
                $table->index('tipo');
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};