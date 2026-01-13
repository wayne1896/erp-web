<?php
// database/seeders/AdminUserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema; // Importar Schema

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si ya existe el usuario admin
        $existeAdmin = User::where('email', 'test@erp.com')->exists();
        
        if (!$existeAdmin) {
            $data = [
                'name' => 'Administrador ERP',
                'email' => 'test@erp.com',
                'password' => Hash::make('test123'),
                'email_verified_at' => now(),
                'sucursal_id' => 1, // Asegúrate de que la sucursal con ID 1 exista
                'updated_at' => now(),
                'created_at' => now(),
            ];
            
            // Solo agregar role si la columna existe
            if (Schema::hasColumn('users', 'role')) {
                $data['role'] = 'admin';
            }
            
            User::create($data);
            
            $this->command->info('Usuario administrador creado exitosamente.');
        } else {
            $this->command->info('Usuario administrador ya existe.');
        }
    }
}
