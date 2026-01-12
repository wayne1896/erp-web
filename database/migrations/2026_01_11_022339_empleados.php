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
        // Crear tabla empleados si no existe
        if (!Schema::hasTable('empleados')) {
            Schema::create('empleados', function (Blueprint $table) {
    $table->id();
    $table->string('codigo', 20)->unique();
    $table->string('cedula', 11)->unique();
    $table->string('nss', 9)->nullable()->unique(); // Número Seguridad Social
    $table->string('nombre_completo');
    $table->date('fecha_nacimiento');
    $table->string('lugar_nacimiento')->nullable();
    $table->enum('sexo', ['M', 'F']);
    $table->string('estado_civil')->nullable();
    $table->string('telefono', 10);
    $table->string('telefono_emergencia', 10)->nullable();
    $table->string('email')->nullable();
    $table->string('direccion');
    $table->string('provincia');
    $table->string('municipio');
    $table->string('sector');
    
    // Información laboral
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->unsignedBigInteger('departamento_id')->nullable();
    $table->unsignedBigInteger('cargo_id')->nullable();
    $table->date('fecha_ingreso');
    $table->enum('tipo_contrato', ['INDEFINIDO', 'TEMPORAL', 'PRUEBA'])->default('INDEFINIDO');
    $table->decimal('salario_base', 15, 2);
    $table->enum('periodo_pago', ['QUINCENAL', 'MENSUAL'])->default('MENSUAL');
    $table->string('cuenta_bancaria')->nullable();
    $table->string('banco')->nullable();
    $table->string('tipo_cuenta')->nullable();
    
    // Seguridad social RD
    $table->boolean('afiliado_ars')->default(true);
    $table->string('ars')->nullable();
    $table->string('numero_ars')->nullable();
    $table->boolean('afiliado_afp')->default(true);
    $table->string('afp')->nullable();
    $table->string('numero_afp')->nullable();
    
    $table->enum('estado', ['ACTIVO', 'LICENCIA', 'VACACIONES', 'INACTIVO'])->default('ACTIVO');
    $table->date('fecha_baja')->nullable();
    $table->string('motivo_baja')->nullable();
    $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
