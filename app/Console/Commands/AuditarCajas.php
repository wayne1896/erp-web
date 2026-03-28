<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Caja;
use App\Models\AuditoriaCaja;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\AuditoriaCajaDiscrepanciaMail;

class AuditarCajas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auditoria:cajas {--tipo=automatica : Tipo de auditoría (automatica/manual/programada)} {--caja-id= : ID específico de caja para auditar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Realizar auditoría automática de cajas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tipo = $this->option('tipo');
        $cajaId = $this->option('caja-id');

        $this->info("Iniciando auditoría de cajas (tipo: {$tipo})...");
        
        try {
            if ($cajaId) {
                // Auditoría de caja específica
                $caja = Caja::find($cajaId);
                if (!$caja) {
                    $this->error("Caja #{$cajaId} no encontrada");
                    return 1;
                }
                
                $this->auditarCajaIndividual($caja, $tipo);
            } else {
                // Auditoría masiva según el tipo
                $this->realizarAuditoriaMasiva($tipo);
            }

            $this->info("\n✅ Auditoría completada exitosamente");
            return 0;

        } catch (\Exception $e) {
            $this->error("\n❌ Error durante la auditoría: " . $e->getMessage());
            Log::error("Error en auditoría de cajas", [
                'error' => $e->getMessage(),
                'tipo' => $tipo,
                'caja_id' => $cajaId
            ]);
            return 1;
        }
    }

    /**
     * Realizar auditoría masiva
     */
    private function realizarAuditoriaMasiva(string $tipo)
    {
        switch ($tipo) {
            case 'automatica':
                $this->auditoriaCierresAutomaticos();
                break;
            case 'programada':
                $this->auditoriaProgramadaDiaria();
                break;
            case 'manual':
                $this->auditoriaCajasAbiertas();
                break;
            default:
                $this->error("Tipo de auditoría no válido: {$tipo}");
                break;
        }
    }

    /**
     * Auditoría de cierres automáticos
     */
    private function auditoriaCierresAutomaticos()
    {
        $this->info("🔍 Auditando cajas cerradas automáticamente en las últimas 24 horas...");
        
        $cajas = Caja::where('estado', 'cerrada')
            ->where('fecha_cierre', '>=', now()->subHours(24))
            ->whereDoesntHave('auditorias')
            ->get();

        $this->line("Se encontraron {$cajas->count()} cajas por auditar");
        
        foreach ($cajas as $caja) {
            $this->auditarCajaIndividual($caja, 'automatica');
        }
    }

    /**
     * Auditoría programada diaria
     */
    private function auditoriaProgramadaDiaria()
    {
        $this->info("📅 Realizando auditoría programada diaria...");
        
        // Auditar todas las cajas cerradas hoy
        $cajas = Caja::where('estado', 'cerrada')
            ->whereDate('fecha_cierre', today())
            ->get();

        $this->line("Auditando {$cajas->count()} cajas cerradas hoy");
        
        foreach ($cajas as $caja) {
            $this->auditarCajaIndividual($caja, 'programada');
        }

        // También auditar cajas abiertas (para detectar anomalías)
        $cajasAbiertas = Caja::where('estado', 'abierta')->get();
        if ($cajasAbiertas->count() > 0) {
            $this->line("Auditando {$cajasAbiertas->count()} cajas abiertas");
            foreach ($cajasAbiertas as $caja) {
                $this->auditarCajaIndividual($caja, 'programada');
            }
        }
    }

    /**
     * Auditoría de cajas abiertas
     */
    private function auditoriaCajasAbiertas()
    {
        $this->info("🔓 Auditando cajas actualmente abiertas...");
        
        $cajas = Caja::where('estado', 'abierta')->get();
        
        $this->line("Se encontraron {$cajas->count()} cajas abiertas");
        
        foreach ($cajas as $caja) {
            $this->auditarCajaIndividual($caja, 'manual');
        }
    }

    /**
     * Auditar caja individual
     */
    private function auditarCajaIndividual(Caja $caja, string $tipo)
    {
        $this->line("📊 Auditando caja #{$caja->id}...");
        
        try {
            $auditoria = AuditoriaCaja::auditarCaja($caja, $tipo);
            
            $this->line("✓ Auditoría #{$auditoria->id} creada");
            
            // Mostrar resultados
            if ($auditoria->tieneDiscrepancias()) {
                $this->warn("⚠️  Discrepancias detectadas:");
                $this->line("   Diferencia: RD$" . number_format($auditoria->diferencia_total, 2));
                $this->line("   Gravedad: " . $auditoria->gravedad);
                $this->line("   Resultado: " . $auditoria->resultado);
                
                // Enviar notificación si es grave
                if ($auditoria->gravedad === 'critica' || $auditoria->resultado === 'fraude') {
                    $this->enviarNotificacionCritica($auditoria);
                }
            } else {
                $this->info("✅ Auditoría sin discrepancias");
            }
            
            // Mostrar resumen financiero
            $this->line("   Efectivo esperado: RD$" . number_format($auditoria->efectivo_esperado, 2));
            $this->line("   Efectivo real: RD$" . number_format($auditoria->efectivo_real, 2));
            $this->line("   Ventas: RD$" . number_format($auditoria->ventas_reales, 2));
            
        } catch (\Exception $e) {
            $this->error("✗ Error auditando caja #{$caja->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Enviar notificación crítica
     */
    private function enviarNotificacionCritica(AuditoriaCaja $auditoria)
    {
        try {
            // Aquí podrías enviar email, Slack, etc.
            // Mail::to('admin@empresa.com')->send(new AuditoriaCajaDiscrepanciaMail($auditoria));
            
            $this->error("🚨 ALERTA CRÍTICA: Discrepancia grave detectada en caja #{$auditoria->caja_id}");
            Log::critical("Discrepancia crítica en auditoría", [
                'auditoria_id' => $auditoria->id,
                'caja_id' => $auditoria->caja_id,
                'diferencia' => $auditoria->diferencia_total,
                'gravedad' => $auditoria->gravedad
            ]);
            
        } catch (\Exception $e) {
            $this->error("Error enviando notificación: " . $e->getMessage());
        }
    }

    /**
     * Generar reporte de auditoría
     */
    private function generarReporte(array $auditorias)
    {
        $this->info("\n📋 REPORTE DE AUDITORÍA");
        $this->info("==================");
        
        $total = count($auditorias);
        $conDiscrepancias = collect($auditorias)->filter(fn($a) => $a->tieneDiscrepancias())->count();
        $criticas = collect($auditorias)->filter(fn($a) => $a->gravedad === 'critica')->count();
        
        $this->info("Total auditorías: {$total}");
        $this->info("Con discrepancias: {$conDiscrepancias}");
        $this->info("Críticas: {$criticas}");
        
        if ($criticas > 0) {
            $this->error("⚠️  Se detectaron {$criticas} discrepancias críticas que requieren atención inmediata");
        }
        
        $this->info("\nResumen por resultado:");
        $resultados = collect($auditorias)->groupBy('resultado');
        foreach ($resultados as $resultado => $items) {
            $this->line("  {$resultado}: " . $items->count());
        }
    }
}
