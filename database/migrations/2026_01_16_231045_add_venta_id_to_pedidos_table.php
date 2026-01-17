<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            // Agregar columna venta_id como nullable (por si el pedido aún no tiene venta)
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->onDelete('set null');
            
            // También puedes agregar una columna para la fecha de procesado/facturación
            $table->timestamp('fecha_facturado')->nullable()->after('fecha_entregado');
        });
    }

    public function down()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['venta_id']);
            $table->dropColumn('venta_id');
            $table->dropColumn('fecha_facturado');
        });
    }
};