<?php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console;

class Kernel extends Command
{
protected function schedule(Schedule $schedule)
{
    // Ejecutar alertas cada hora
    $schedule->command('alerts:dashboard')->hourly();
    
    // Limpiar notificaciones expiradas diariamente
    $schedule->command('notifications:cleanup')->daily();
    
    // Revisar dispositivos inactivos semanalmente
    $schedule->command('notifications:clean-devices')->weekly();
}
}