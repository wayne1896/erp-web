<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar tabla movimientos_caja primero si existe
        Schema::dropIfExists('movimientos_caja');
        
        // Eliminar tabla cajas si existe
        Schema::dropIfExists('cajas');
        
        // Crear tabla cajas con estructura correcta
        Schema::create('cajas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->constrained('sucursales');
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('monto_inicial', 15, 2)->default(0);
            $table->decimal('efectivo', 15, 2)->default(0);
            $table->enum('estado', ['abierta', 'cerrada', 'pendiente'])->default('pendiente');
            $table->timestamp('fecha_apertura')->nullable();
            $table->timestamp('fecha_cierre')->nullable();
            $table->text('observaciones')->nullable();
            $table->decimal('total_ventas', 15, 2)->default(0);
            $table->decimal('total_ingresos', 15, 2)->default(0);
            $table->decimal('total_egresos', 15, 2)->default(0);
            $table->decimal('diferencia', 15, 2)->default(0);
            $table->foreignId('cerrada_por_id')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['sucursal_id', 'estado']);
            $table->index(['user_id', 'fecha_apertura']);
        });

        // Crear tabla movimientos_caja
        Schema::create('movimientos_caja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_id')->constrained('cajas');
            $table->enum('tipo', ['INGRESO', 'EGRESO', 'APERTURA', 'CIERRE']);
            $table->decimal('monto', 15, 2);
            $table->string('descripcion');
            $table->string('referencia')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->string('comprobante')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index(['caja_id', 'tipo']);
            $table->index('referencia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_caja');
        Schema::dropIfExists('cajas');
    }
};