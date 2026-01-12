<?php
// database/migrations/2024_01_03_create_notifications_system.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Tabla de notificaciones
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titulo');
            $table->text('mensaje');
            $table->enum('tipo', [
                'venta', 'cliente', 'inventario', 'caja', 
                'sincronizacion', 'sistema', 'promocion', 'alerta'
            ]);
            $table->enum('nivel', ['baja', 'media', 'alta', 'urgente']);
            $table->json('data')->nullable();
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha_leido')->nullable();
            $table->timestamp('fecha_envio')->useCurrent();
            $table->timestamp('fecha_expiracion')->nullable();
            $table->enum('canal', ['push', 'in_app', 'email', 'sms', 'todos'])->default('push');
            $table->string('dispositivo_id', 100)->nullable();
            $table->string('entidad_type')->nullable();
            $table->unsignedBigInteger('entidad_id')->nullable();
            $table->string('accion', 100)->nullable();
            $table->integer('badge_count')->default(1);
            $table->boolean('sound')->default(true);
            $table->boolean('vibration')->default(true);
            $table->enum('priority', ['normal', 'high'])->default('normal');
            $table->boolean('enviada')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'leido', 'fecha_envio']);
            $table->index(['tipo', 'nivel']);
            $table->index(['entidad_type', 'entidad_id']);
            $table->index('fecha_expiracion');
        });
        
        // Tabla de dispositivos push
        Schema::create('dispositivos_push', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('token', 500);
            $table->enum('plataforma', ['android', 'ios', 'web']);
            $table->string('modelo', 100)->nullable();
            $table->string('version_sistema', 50)->nullable();
            $table->string('version_app', 20);
            $table->string('idioma', 10)->default('es');
            $table->string('zona_horaria', 50)->default('America/Santo_Domingo');
            $table->timestamp('ultima_conexion')->useCurrent();
            $table->enum('estado', ['activo', 'inactivo', 'bloqueado'])->default('activo');
            $table->json('preferencias')->nullable();
            $table->json('topics')->nullable();
            $table->timestamps();
            
            $table->unique('token');
            $table->index(['user_id', 'plataforma', 'estado']);
            $table->index('ultima_conexion');
        });
        
        // Tabla de notificaciones programadas
        Schema::create('notificaciones_programadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispositivo_id')->constrained('dispositivos_push')->onDelete('cascade');
            $table->string('titulo');
            $table->text('mensaje');
            $table->json('data')->nullable();
            $table->string('tipo', 50);
            $table->timestamp('programada_para');
            $table->boolean('enviada')->default(false);
            $table->timestamp('fecha_envio')->nullable();
            $table->timestamps();
            
            $table->index(['programada_para', 'enviada']);
            $table->index('dispositivo_id');
        });
        
        // Agregar columna de notificaciones sin leer a usuarios
        Schema::table('users', function (Blueprint $table) {
            $table->integer('notificaciones_sin_leer')->default(0)->after('remember_token');
        });
    }
    
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('notificaciones_sin_leer');
        });
        
        Schema::dropIfExists('notificaciones_programadas');
        Schema::dropIfExists('dispositivos_push');
        Schema::dropIfExists('notificaciones');
    }
};