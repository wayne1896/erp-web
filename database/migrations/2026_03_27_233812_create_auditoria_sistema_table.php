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
        Schema::create('auditoria_sistema', function (Blueprint $table) {
            $table->id();
            
            // Información del usuario
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Información de la acción
            $table->string('accion', 50); // crear, actualizar, eliminar, ver, etc.
            $table->string('modulo', 50); // ventas, productos, clientes, etc.
            $table->string('entidad_id')->nullable(); // ID de la entidad afectada
            $table->string('entidad_type')->nullable(); // Tipo de entidad (App\Models\Venta, etc.)
            
            // Datos de cambio
            $table->json('datos_anteriores')->nullable(); // Datos antes del cambio
            $table->json('datos_nuevos')->nullable(); // Datos después del cambio
            
            // Información técnica
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('session_id', 255)->nullable();
            $table->string('metodo_http', 10)->nullable();
            $table->text('url')->nullable();
            $table->string('controlador', 100)->nullable();
            $table->string('metodo', 100)->nullable();
            $table->integer('linea_codigo')->nullable();
            
            // Descripción y resultado
            $table->text('descripcion')->nullable();
            $table->enum('nivel_importancia', ['info', 'warning', 'error', 'critical', 'debug'])->default('info');
            $table->enum('resultado', ['success', 'error', 'warning'])->default('success');
            
            // Métricas de rendimiento
            $table->decimal('tiempo_ejecucion', 8, 3)->nullable(); // en segundos
            $table->decimal('memoria_usada', 10, 2)->nullable(); // en MB
            
            // Información adicional
            $table->json('detalles_adicionales')->nullable();
            
            $table->timestamps();
            
            // Índices para rendimiento
            $table->index(['user_id', 'created_at']);
            $table->index(['modulo', 'accion']);
            $table->index(['nivel_importancia', 'created_at']);
            $table->index(['resultado', 'created_at']);
            $table->index('created_at');
            $table->index(['entidad_type', 'entidad_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_sistema');
    }
};
