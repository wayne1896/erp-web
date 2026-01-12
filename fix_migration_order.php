<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=========================================\n";
echo "EJECUTANDO MIGRACIONES EN ORDEN CORRECTO\n";
echo "=========================================\n\n";

// ORDEN CORRECTO de ejecución
$migrationOrder = [
    // 1. Tablas básicas del sistema
    '2026_01_10_225853_create_sessions_table.php',
    
    // 2. Tablas principales (si existen)
    '*create_users_table.php',
    '*create_clientes_table.php',
    '*create_productos_table.php',
    '*create_ventas_table.php',  // ¡IMPORTANTE! Debe ir ANTES de pagos_ventas
    
    // 3. Tablas dependientes
    '*create_pagos_ventas_table.php',
    '*create_auditoria_*.php',
    '*create_inventarios_table.php',
    '*create_cajas_table.php',
    '*create_notifications_system.php',
];

// Buscar archivos reales
$allMigrations = glob(database_path('migrations/*.php'));

// Ejecutar en orden
foreach ($migrationOrder as $pattern) {
    foreach ($allMigrations as $migrationFile) {
        $filename = basename($migrationFile);
        
        if (fnmatch($pattern, $filename)) {
            echo "Ejecutando: $filename\n";
            
            try {
                // Cargar y ejecutar migración
                $migration = require $migrationFile;
                $instance = new $migration();
                $instance->up();
                echo "✓ Completado\n";
            } catch (Exception $e) {
                echo "✗ Error: " . $e->getMessage() . "\n";
                
                // Si es error de foreign key, intentar sin ella
                if (strpos($e->getMessage(), 'foreign key') !== false) {
                    echo "  Intentando crear tabla sin foreign keys...\n";
                    try {
                        // Ejecutar SQL básico sin foreign keys
                        DB::statement("
                            CREATE TABLE IF NOT EXISTS pagos_ventas (
                                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                venta_id BIGINT UNSIGNED,
                                monto DECIMAL(12,2),
                                metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'MIXTO'),
                                referencia VARCHAR(100) NULL,
                                observaciones TEXT NULL,
                                fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                user_id BIGINT UNSIGNED,
                                created_at TIMESTAMP NULL,
                                updated_at TIMESTAMP NULL,
                                INDEX idx_venta_fecha (venta_id, fecha_pago)
                            )
                        ");
                        echo "✓ Tabla creada sin foreign key\n";
                    } catch (Exception $e2) {
                        echo "✗ Error secundario: " . $e2->getMessage() . "\n";
                    }
                }
            }
            
            echo "---\n";
        }
    }
}

echo "\n=========================================\n";
echo "PROCESO COMPLETADO\n";
echo "Agregando foreign keys pendientes...\n";
echo "=========================================\n";

// Agregar foreign keys después de crear todas las tablas
try {
    if (Schema::hasTable('ventas') && Schema::hasTable('pagos_ventas')) {
        DB::statement("
            ALTER TABLE pagos_ventas
            ADD CONSTRAINT pagos_ventas_venta_id_foreign 
            FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
        ");
        echo "✓ Foreign key venta_id agregada\n";
    }
    
    if (Schema::hasTable('users') && Schema::hasTable('pagos_ventas')) {
        DB::statement("
            ALTER TABLE pagos_ventas
            ADD CONSTRAINT pagos_ventas_user_id_foreign 
            FOREIGN KEY (user_id) REFERENCES users(id)
        ");
        echo "✓ Foreign key user_id agregada\n";
    }
    
    if (Schema::hasTable('clientes') && Schema::hasTable('auditoria_clientes')) {
        DB::statement("
            ALTER TABLE auditoria_clientes
            ADD CONSTRAINT auditoria_clientes_cliente_id_foreign 
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
        ");
        echo "✓ Foreign key cliente_id (auditoria) agregada\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error agregando foreign keys: " . $e->getMessage() . "\n";
}