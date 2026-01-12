<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrador ERP',
            'email' => 'test@erp.com',
            'password' => Hash::make('test123'),
            'email_verified_at' => now(),
        ]);
    }
}
