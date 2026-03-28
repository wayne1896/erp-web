<?php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\CerrarCajasDiarias::class,
        \App\Console\Commands\AuditarCajas::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Ejecutar alertas cada hora
        $schedule->command('alerts:dashboard')->hourly();
        
        // Limpiar notificaciones expiradas diariamente
        $schedule->command('notifications:cleanup')->daily();
        
        // Cerrar cajas abiertas automáticamente a medianoche
        $schedule->command('caja:cerrar-diarias')->dailyAt('23:59');
        
        // Auditoría automática de cajas cerradas (cada hora)
        $schedule->command('auditoria:cajas --tipo=automatica')->hourly();
        
        // Auditoría programada diaria (a las 00:30)
        $schedule->command('auditoria:cajas --tipo=programada')->dailyAt('00:30');
        
        // Revisar dispositivos inactivos semanalmente
        $schedule->command('notifications:clean-devices')->weekly();
    }
}