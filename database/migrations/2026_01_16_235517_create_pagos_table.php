<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained()->onDelete('cascade');
            $table->decimal('monto', 12, 2);
            $table->date('fecha_pago');
            $table->enum('metodo_pago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE'])->default('EFECTIVO');
            $table->string('referencia')->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pagos');
    }
};