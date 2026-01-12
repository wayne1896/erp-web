<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Provincias de RD
        // $this->call(ProvinciasDominicanasSeeder::class);
        
        // Configuración inicial empresa
        // $this->call(ConfiguracionEmpresaSeeder::class);
        
        // Tipos de comprobantes NCF
        // $this->call(TiposComprobanteSeeder::class);
        
        // Plan de cuentas básico RD
        // $this->call(PlanCuentasSeeder::class);
        
        // Usuario administrador
        // $this->call(AdminUserSeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
