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
        // Primero crea la tabla SIN la foreign key
    Schema::create('pagos_ventas', function (Blueprint $table) {
        $table->id();
        $table->foreignId('venta_id')->constrained()->onDelete('cascade');
        $table->decimal('monto', 10, 2);
        $table->date('fecha_pago');
        $table->enum('metodo_pago', ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'CHEQUE'])->default('EFECTIVO');
        $table->string('referencia')->nullable();
        $table->text('notas')->nullable();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->timestamps();
        $table->softDeletes();
        
        $table->index(['venta_id', 'fecha_pago']);
    });

        
        Schema::create('auditoria_clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained()->onDelete('cascade');
            $table->enum('accion', ['creacion', 'actualizacion', 'desactivacion', 'creacion_movil', 'actualizacion_movil']);
            $table->foreignId('user_id')->constrained();
            $table->json('detalles')->nullable();
            $table->timestamps();
            
            $table->index(['cliente_id', 'created_at']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('auditoria_clientes');
        Schema::dropIfExists('pagos_ventas');
    }
};
