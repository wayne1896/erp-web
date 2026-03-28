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
        Schema::create('auditoria_cajas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_id')->constrained('cajas');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('tipo_auditoria', ['automatica', 'manual', 'programada'])->default('automatica');
            $table->datetime('fecha_auditoria');
            
            // Montos esperados vs reales
            $table->decimal('monto_inicial_esperado', 12, 2)->default(0);
            $table->decimal('monto_inicial_real', 12, 2)->default(0);
            $table->decimal('ventas_esperadas', 12, 2)->default(0);
            $table->decimal('ventas_reales', 12, 2)->default(0);
            $table->decimal('ingresos_esperados', 12, 2)->default(0);
            $table->decimal('ingresos_reales', 12, 2)->default(0);
            $table->decimal('egresos_esperados', 12, 2)->default(0);
            $table->decimal('egresos_reales', 12, 2)->default(0);
            $table->decimal('efectivo_esperado', 12, 2)->default(0);
            $table->decimal('efectivo_real', 12, 2)->default(0);
            $table->decimal('diferencia_total', 12, 2)->default(0);
            
            // Control de auditoría
            $table->json('discrepancias')->nullable();
            $table->enum('estado', ['pendiente', 'en_proceso', 'completada', 'con_discrepancias', 'rechazada'])->default('pendiente');
            $table->enum('resultado', ['ok', 'advertencia', 'error', 'fraude'])->default('ok');
            $table->text('observaciones')->nullable();
            
            // Revisión
            $table->foreignId('revisado_por_id')->nullable()->constrained('users');
            $table->datetime('fecha_revision')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['caja_id', 'fecha_auditoria']);
            $table->index(['estado', 'resultado']);
            $table->index('fecha_auditoria');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_cajas');
    }
};
