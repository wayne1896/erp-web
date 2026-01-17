<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Si usas ENUM
        DB::statement("ALTER TABLE pedidos MODIFY estado ENUM('PENDIENTE','APROBADO','PROCESADO','ENTREGADO','FACTURADO','CANCELADO') DEFAULT 'PENDIENTE'");
        
        // O si usas VARCHAR, aumenta el tamaño
        DB::statement("ALTER TABLE pedidos MODIFY estado VARCHAR(20) DEFAULT 'PENDIENTE'");
    }

    public function down()
    {
        // Revertir a valores anteriores si es necesario
        DB::statement("ALTER TABLE pedidos MODIFY estado ENUM('PENDIENTE','APROBADO','PROCESADO','ENTREGADO','CANCELADO') DEFAULT 'PENDIENTE'");
    }
};