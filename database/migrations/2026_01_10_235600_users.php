<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Si la tabla ya existe, modificarla; si no, crearla
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                // Agregar columnas que no existen
                if (!Schema::hasColumn('users', 'cedula')) {
                    $table->string('cedula', 11)->unique()->nullable()->after('name');
                }
                if (!Schema::hasColumn('users', 'telefono')) {
                    $table->string('telefono', 10)->nullable()->after('password');
                }
                if (!Schema::hasColumn('users', 'direccion')) {
                    $table->string('direccion')->nullable()->after('telefono');
                }
                if (!Schema::hasColumn('users', 'tipo_usuario')) {
                    $table->enum('tipo_usuario', ['admin', 'gerente', 'vendedor', 'almacen', 'rrhh', 'contabilidad'])->default('vendedor')->after('direccion');
                }
                if (!Schema::hasColumn('users', 'sucursal_id')) {
                    $table->unsignedBigInteger('sucursal_id')->nullable()->after('tipo_usuario');
                }
                if (!Schema::hasColumn('users', 'activo')) {
                    $table->boolean('activo')->default(true)->after('sucursal_id');
                }
            });
        } else {
            // Crear la tabla si no existe
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('cedula', 11)->unique()->nullable(); // Cédula dominicana
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('telefono', 10)->nullable();
                $table->string('direccion')->nullable();
                $table->enum('tipo_usuario', ['admin', 'gerente', 'vendedor', 'almacen', 'rrhh', 'contabilidad'])->default('vendedor');
                $table->unsignedBigInteger('sucursal_id')->nullable();
                $table->boolean('activo')->default(true);
                $table->rememberToken();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Solo eliminar las columnas agregadas, no la tabla completa
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'sucursal_id')) {
                    $table->dropForeign(['sucursal_id']);
                    $table->dropColumn('sucursal_id');
                }
                if (Schema::hasColumn('users', 'activo')) {
                    $table->dropColumn('activo');
                }
                if (Schema::hasColumn('users', 'tipo_usuario')) {
                    $table->dropColumn('tipo_usuario');
                }
                if (Schema::hasColumn('users', 'direccion')) {
                    $table->dropColumn('direccion');
                }
                if (Schema::hasColumn('users', 'telefono')) {
                    $table->dropColumn('telefono');
                }
                if (Schema::hasColumn('users', 'cedula')) {
                    $table->dropColumn('cedula');
                }
            });
        }
    }
};
