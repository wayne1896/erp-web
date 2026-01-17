<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Cambiar a VARCHAR para más flexibilidad
        DB::statement("ALTER TABLE ventas MODIFY condicion_pago VARCHAR(20) DEFAULT 'CONTADO' NOT NULL");
        
        // También asegurar que tipo_pago tenga suficiente espacio
        DB::statement("ALTER TABLE ventas MODIFY tipo_pago VARCHAR(30) DEFAULT 'EFECTIVO'");
    }

    public function down()
    {
        // Volver a ENUM si es necesario
        DB::statement("ALTER TABLE ventas MODIFY condicion_pago ENUM('CONTADO','CREDITO') DEFAULT 'CONTADO' NOT NULL");
        DB::statement("ALTER TABLE ventas MODIFY tipo_pago ENUM('EFECTIVO','TARJETA_DEBITO','TARJETA_CREDITO','TRANSFERENCIA','CHEQUE') DEFAULT 'EFECTIVO'");
    }
};