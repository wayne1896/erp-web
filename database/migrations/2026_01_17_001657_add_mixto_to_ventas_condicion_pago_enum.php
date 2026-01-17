<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Si es ENUM, modificar para incluir 'MIXTO'
        DB::statement("ALTER TABLE ventas MODIFY condicion_pago ENUM('CONTADO','CREDITO','MIXTO') DEFAULT 'CONTADO'");
        
        // O si es VARCHAR, aumentar tamaño si es necesario
        // DB::statement("ALTER TABLE ventas MODIFY condicion_pago VARCHAR(20) DEFAULT 'CONTADO'");
    }

    public function down()
    {
        // Revertir si es necesario
        DB::statement("ALTER TABLE ventas MODIFY condicion_pago ENUM('CONTADO','CREDITO') DEFAULT 'CONTADO'");
    }
};