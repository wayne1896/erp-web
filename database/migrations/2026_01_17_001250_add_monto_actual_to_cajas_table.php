<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('cajas', function (Blueprint $table) {
            // Agregar columna monto_actual si no existe
            if (!Schema::hasColumn('cajas', 'monto_actual')) {
                $table->decimal('monto_actual', 12, 2)->default(0)->after('monto_inicial');
            }
            
            // También podrías necesitar monto_inicial si no existe
            if (!Schema::hasColumn('cajas', 'monto_inicial')) {
                $table->decimal('monto_inicial', 12, 2)->default(0)->after('estado');
            }
        });
    }

    public function down()
    {
        Schema::table('cajas', function (Blueprint $table) {
            $table->dropColumn(['monto_actual', 'monto_inicial']);
        });
    }
};