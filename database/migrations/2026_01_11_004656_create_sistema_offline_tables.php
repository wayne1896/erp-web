<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Tabla de datos offline
        Schema::create('datos_offline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('dispositivo_id', 100);
            $table->string('tabla', 50);
            $table->enum('accion', ['create', 'update', 'delete']);
            $table->json('datos');
            $table->enum('estado', ['pendiente', 'procesando', 'completado', 'error', 'conflicto'])
                  ->default('pendiente');
            $table->integer('intentos')->default(0);
            $table->timestamp('ultimo_intento')->nullable();
            $table->json('errores')->nullable();
            $table->json('dependencias')->nullable();
            $table->enum('prioridad', ['alta', 'media', 'baja'])->default('media');
            $table->timestamp('fecha_creacion_offline')->useCurrent();
            $table->timestamp('fecha_sincronizacion')->nullable();
            $table->foreignId('sincronizacion_id')->nullable()->constrained('sincronizacion_movil');
            $table->string('checksum', 32);
            $table->timestamps();
            
            $table->index(['user_id', 'estado', 'prioridad']);
            $table->index(['dispositivo_id', 'estado']);
            $table->index(['tabla', 'fecha_creacion_offline']);
            $table->index('checksum');
        });

        // Tabla de métricas de sincronización
        Schema::create('metricas_sincronizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sincronizacion_id')->constrained('sincronizacion_movil')->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->decimal('duracion_segundos', 8, 2);
            $table->decimal('tamano_datos_kb', 10, 2);
            $table->decimal('velocidad_kbps', 10, 2);
            $table->decimal('eficiencia', 5, 2);
            $table->string('plataforma', 20);
            $table->string('version_app', 20);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index('plataforma');
        });

        // Tabla de conflictos de sincronización
        Schema::create('conflictos_sincronizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dato_offline_id')->constrained('datos_offline')->onDelete('cascade');
            $table->string('tipo_conflicto', 50);
            $table->json('datos_local');
            $table->json('datos_servidor');
            $table->enum('resolucion', ['mantener_local', 'usar_servidor', 'fusionar', 'pendiente'])
                  ->default('pendiente');
            $table->foreignId('resuelto_por')->nullable()->constrained('users');
            $table->timestamp('fecha_resolucion')->nullable();
            $table->text('comentarios')->nullable();
            $table->timestamps();
            
            $table->index(['tipo_conflicto', 'resolucion']);
        });

        // Agregar columna offline_id a ventas
        Schema::table('ventas', function (Blueprint $table) {
            $table->string('offline_id', 100)->nullable()->after('id');
            $table->boolean('offline')->default(false)->after('offline_id');
            $table->timestamp('fecha_sincronizacion')->nullable()->after('updated_at');
            $table->index('offline_id');
            $table->index(['user_id', 'offline']);
        });

        // Agregar columna offline_id a clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('offline_id', 100)->nullable()->after('id');
            $table->index('offline_id');
        });
    }

    public function down()
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('offline_id');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn(['offline_id', 'offline', 'fecha_sincronizacion']);
        });

        Schema::dropIfExists('conflictos_sincronizacion');
        Schema::dropIfExists('metricas_sincronizacion');
        Schema::dropIfExists('datos_offline');
    }
};
