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
        Schema::create('auditoria_caja_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auditoria_caja_id')->constrained('auditoria_cajas');
            $table->foreignId('movimiento_caja_id')->constrained('movimientos_caja');
            $table->enum('tipo_movimiento', ['APERTURA', 'CIERRE', 'INGRESO', 'EGRESO']);
            $table->decimal('monto', 12, 2);
            $table->string('descripcion');
            $table->string('referencia')->nullable();
            $table->boolean('validado')->default(true);
            $table->text('observaciones')->nullable();
            
            // Validación
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->datetime('fecha_validacion')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['auditoria_caja_id', 'tipo_movimiento']);
            $table->index('validado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_caja_detalles');
    }
};
