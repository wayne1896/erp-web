<?php
// database/seeders/SucursalSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sucursal; // Importar el modelo

class SucursalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar si ya existe una sucursal principal
        $existePrincipal = Sucursal::where('principal', true)->exists();
        
        if (!$existePrincipal) {
            Sucursal::create([
                'codigo' => 'SUC001',
                'nombre' => 'Sucursal Principal',
                'rnc' => '13100000000',
                'telefono' => '809-555-0000',
                'direccion' => 'Calle Principal #123',
                'provincia' => 'Distrito Nacional',
                'municipio' => 'Santo Domingo',
                'sector' => 'Centro',
                'activa' => true,
                'principal' => true,
                'configuracion' => [
                    'impresora_fiscal' => false,
                    'serie_facturacion' => 'A',
                    'secuencia_facturacion' => 1,
                    'correo_ventas' => 'ventas@empresa.com',
                    'telefono_ventas' => '809-555-0001'
                ]
            ]);
            
            $this->command->info('Sucursal principal creada exitosamente.');
        } else {
            $this->command->info('Ya existe una sucursal principal.');
        }

        // Crear sucursal adicional si no existe
        $existeSecundaria = Sucursal::where('codigo', 'SUC002')->exists();
        
        if (!$existeSecundaria) {
            Sucursal::create([
                'codigo' => 'SUC002',
                'nombre' => 'Sucursal Norte',
                'rnc' => '13100000000',
                'telefono' => '809-555-0002',
                'direccion' => 'Av. Norte #456',
                'provincia' => 'Santiago',
                'municipio' => 'Santiago de los Caballeros',
                'sector' => 'Centro',
                'activa' => true,
                'principal' => false,
                'configuracion' => [
                    'impresora_fiscal' => false,
                    'serie_facturacion' => 'B',
                    'secuencia_facturacion' => 1,
                    'correo_ventas' => 'ventasnorte@empresa.com',
                    'telefono_ventas' => '809-555-0003'
                ]
            ]);
            
            $this->command->info('Sucursal Norte creada exitosamente.');
        } else {
            $this->command->info('Sucursal Norte ya existe.');
        }
    }
}