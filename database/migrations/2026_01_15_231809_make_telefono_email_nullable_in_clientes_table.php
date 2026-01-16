<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Para MySQL/MariaDB
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE clientes MODIFY email VARCHAR(255) NULL');
            DB::statement('ALTER TABLE clientes MODIFY telefono VARCHAR(255) NULL');
            DB::statement('ALTER TABLE clientes MODIFY direccion VARCHAR(255) NULL');
        } 
        // Para PostgreSQL
        elseif (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE clientes ALTER COLUMN email DROP NOT NULL');
            DB::statement('ALTER TABLE clientes ALTER COLUMN telefono DROP NOT NULL');
            DB::statement('ALTER TABLE clientes ALTER COLUMN direccion DROP NOT NULL');
        }
        // Para SQLite
        elseif (DB::connection()->getDriverName() === 'sqlite') {
            // SQLite no soporta MODIFY COLUMN fácilmente, necesitamos recrear la tabla
            // Esta es una solución más compleja para SQLite
        }
    }

    public function down()
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE clientes MODIFY email VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE clientes MODIFY telefono VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE clientes MODIFY direccion VARCHAR(255) NOT NULL');
        } 
        elseif (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE clientes ALTER COLUMN email SET NOT NULL');
            DB::statement('ALTER TABLE clientes ALTER COLUMN telefono SET NOT NULL');
            DB::statement('ALTER TABLE clientes ALTER COLUMN direccion SET NOT NULL');
        }
    }
};