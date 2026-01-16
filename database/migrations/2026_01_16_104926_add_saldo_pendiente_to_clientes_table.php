<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->decimal('saldo_pendiente', 15, 2)->default(0)->after('limite_credito');
            // También agrega estas columnas útiles para crédito:
            $table->decimal('credito_utilizado', 15, 2)->default(0);
            $table->decimal('credito_disponible', 15, 2)->default(0);
            $table->date('ultima_compra')->nullable();
            $table->integer('dias_mora')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'saldo_pendiente',
                'credito_utilizado', 
                'credito_disponible',
                'ultima_compra',
                'dias_mora'
            ]);
        });
    }
};