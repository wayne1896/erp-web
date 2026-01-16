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
        // database/migrations/2024_01_09_create_secuencias_ncf_table.php
Schema::create('secuencias_ncf', function (Blueprint $table) {
    $table->id();
    $table->string('tipo_comprobante'); // 01, 02, 14, 15, etc.
    $table->string('prefijo', 3); // B01, B02, etc.
    $table->bigInteger('secuencia_inicial');
    $table->bigInteger('secuencia_actual');
    $table->bigInteger('secuencia_final');
    $table->date('fecha_vigencia_desde');
    $table->date('fecha_vigencia_hasta');
    $table->boolean('activo')->default(true);
    $table->timestamps();
});

// database/migrations/2024_01_10_create_ventas_table.php
Schema::create('ventas', function (Blueprint $table) {
    $table->id();
    $table->string('numero_factura')->unique();
    $table->string('ncf', 19)->unique(); // NCF dominicano: B0100000001
    $table->enum('tipo_comprobante', ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'COMPROBANTE_GASTOS']);
    
    $table->foreignId('cliente_id')->constrained('clientes');
    $table->foreignId('sucursal_id')->constrained('sucursales');
    $table->foreignId('user_id')->constrained('users');
    $table->datetime('fecha_venta');
    $table->foreignId('caja_id')->nullable()->constrained('cajas')->onDelete('set null');
    $table->enum('estado', ['PENDIENTE', 'PROCESADA', 'ANULADA', 'DEVUELTA'])->default('PENDIENTE');
    $table->enum('condicion_pago', ['CONTADO', 'CREDITO'])->default('CONTADO');
    $table->enum('tipo_pago', ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'CHEQUE', 'OTRO'])
    ->default('EFECTIVO');
    $table->integer('dias_credito')->default(0);
    $table->date('fecha_vencimiento')->nullable();
    
    // Totales
    $table->decimal('subtotal', 15, 2);
    $table->decimal('descuento', 15, 2)->default(0);
    $table->decimal('itbis', 15, 2);
    $table->decimal('total', 15, 2);
    
    // Para facturación electrónica DGII
    $table->string('estado_dgii')->nullable(); // 1=Aceptado, 2=Rechazado
    $table->string('codigo_autorizacion_dgii')->nullable();
    $table->text('respuesta_dgii')->nullable();
    $table->timestamp('fecha_autorizacion_dgii')->nullable();
    
    $table->text('notas')->nullable();
    $table->timestamps();
});

// database/migrations/2024_01_11_create_detalle_ventas_table.php
Schema::create('detalle_ventas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
    $table->foreignId('producto_id')->constrained('productos');
    $table->decimal('cantidad', 15, 2);
    $table->decimal('precio_unitario', 15, 2);
    $table->decimal('descuento', 15, 2)->default(0);
    $table->decimal('descuento_monto', 15, 2)->default(0); // Monto en pesos
    $table->decimal('subtotal', 15, 2);
    $table->decimal('itbis_porcentaje', 5, 2)->default(18.00);
    $table->decimal('itbis_monto', 15, 2);
    $table->decimal('total', 15, 2);
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
