<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_sucursal_id_and_role_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Verificar y agregar sucursal_id si no existe
            if (!Schema::hasColumn('users', 'sucursal_id')) {
                $table->foreignId('sucursal_id')
                    ->nullable()
                    ->after('email')
                    ->constrained('sucursales')
                    ->onDelete('set null');
            }
            
            // Verificar y agregar role si no existe
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role', 20)
                    ->default('usuario')
                    ->after('sucursal_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Eliminar foreign key primero
            if (Schema::hasColumn('users', 'sucursal_id')) {
                $table->dropForeign(['sucursal_id']);
            }
            
            // Eliminar columnas
            $table->dropColumn(['sucursal_id', 'role']);
        });
    }
};