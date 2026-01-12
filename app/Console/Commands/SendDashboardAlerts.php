<?php
// app/Console/Commands/SendDashboardAlerts.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DashboardAlertService;

class SendDashboardAlerts extends Command
{
    protected $signature = 'alerts:dashboard 
                            {--test : Enviar alertas de prueba}
                            {--type=all : Tipo de alertas a enviar (inventario, ventas, caja, clientes, sincronizacion, all)}';
    
    protected $description = 'Enviar alertas automáticas del dashboard';
    
    protected $alertService;
    
    public function __construct(DashboardAlertService $alertService)
    {
        parent::__construct();
        $this->alertService = $alertService;
    }
    
    public function handle()
    {
        $this->info('Iniciando envío de alertas del dashboard...');
        
        if ($this->option('test')) {
            $this->enviarAlertasPrueba();
            return 0;
        }
        
        $tipo = $this->option('type');
        
        if ($tipo === 'all') {
            $resultados = $this->alertService->revisarAlertasAutomaticas();
        } else {
            $method = 'revisarAlertas' . ucfirst($tipo);
            if (method_exists($this->alertService, $method)) {
                $resultados = $this->alertService->$method();
            } else {
                $this->error("Tipo de alerta no válido: {$tipo}");
                return 1;
            }
        }
        
        $this->info('Alertas enviadas exitosamente');
        $this->table(
            ['Tipo', 'Total'],
            [
                ['Total Alertas', $resultados['total_alertas_generadas'] ?? count($resultados)],
            ]
        );
        
        // Log detallado
        foreach ($resultados['detalles'] ?? [] as $tipo => $alertas) {
            $this->line("{$tipo}: " . count($alertas) . " alertas");
        }
        
        return 0;
    }
    
    private function enviarAlertasPrueba()
    {
        $this->info('Enviando alertas de prueba...');
        
        // Ejemplo de alerta de inventario
        $this->alert('Prueba de alerta de inventario', function() {
            // Lógica de prueba
        });
        
        $this->info('Alertas de prueba enviadas');
    }
}