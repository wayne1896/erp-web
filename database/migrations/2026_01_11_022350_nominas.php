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
        // database/migrations/2024_01_15_create_nominas_table.php
Schema::create('nominas', function (Blueprint $table) {
    $table->id();
    $table->string('periodo'); // 2024-01, 2024-02
    $table->enum('tipo_nomina', ['QUINCENA1', 'QUINCENA2', 'MENSUAL', 'EXTRAORDINARIA']);
    $table->date('fecha_inicio');
    $table->date('fecha_fin');
    $table->date('fecha_pago');
    $table->enum('estado', ['BORRADOR', 'CALCULADA', 'APROBADA', 'PAGADA'])->default('BORRADOR');
    
    // Totales
    $table->decimal('total_devengado', 15, 2)->default(0);
    $table->decimal('total_deducciones', 15, 2)->default(0);
    $table->decimal('total_pagar', 15, 2)->default(0);
    
    // Retenciones legales RD
    $table->decimal('total_isr', 15, 2)->default(0); // Impuesto Sobre la Renta
    $table->decimal('total_afp', 15, 2)->default(0); // AFP
    $table->decimal('total_ars', 15, 2)->default(0); // ARS
    $table->decimal('total_prestamo', 15, 2)->default(0); // Préstamos laborales
    
    $table->timestamps();
});

// database/migrations/2024_01_16_create_detalle_nominas_table.php
Schema::create('detalle_nominas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('nomina_id')->constrained('nominas')->onDelete('cascade');
    $table->foreignId('empleado_id')->constrained('empleados');
    
    // Devengados
    $table->decimal('salario_base', 15, 2);
    $table->decimal('horas_extras', 15, 2)->default(0);
    $table->decimal('bonificaciones', 15, 2)->default(0);
    $table->decimal('comisiones', 15, 2)->default(0);
    $table->decimal('otros_devengados', 15, 2)->default(0);
    $table->decimal('total_devengado', 15, 2);
    
    // Deducciones RD
    $table->decimal('isr', 15, 2)->default(0); // Impuesto sobre la renta
    $table->decimal('afp_empleado', 15, 2)->default(0); // 2.87% - 7.10%
    $table->decimal('afp_empleador', 15, 2)->default(0); // 7.10% patronal
    $table->decimal('ars_empleado', 15, 2)->default(0); // 3.04%
    $table->decimal('ars_empleador', 15, 2)->default(0); // 7.09% patronal
    $table->decimal('prestamo_laboral', 15, 2)->default(0);
    $table->decimal('otros_deducciones', 15, 2)->default(0);
    $table->decimal('total_deducciones', 15, 2);
    
    $table->decimal('neto_a_pagar', 15, 2);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
