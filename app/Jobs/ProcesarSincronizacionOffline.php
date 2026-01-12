<?php
// app/Jobs/ProcesarSincronizacionOffline.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\DatoOffline;
use App\Models\SincronizacionMovil;

class ProcesarSincronizacionOffline implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutos
    public $tries = 3;
    public $backoff = [60, 300, 600]; // Reintentar después de 1, 5 y 10 minutos

    protected $datoOfflineId;
    protected $sincronizacionId;

    public function __construct($datoOfflineId, $sincronizacionId)
    {
        $this->datoOfflineId = $datoOfflineId;
        $this->sincronizacionId = $sincronizacionId;
    }

    public function handle()
    {
        $datoOffline = DatoOffline::findOrFail($this->datoOfflineId);
        $sincronizacion = SincronizacionMovil::findOrFail($this->sincronizacionId);

        try {
            $datoOffline->procesar();
            
            // Lógica de procesamiento específica
            $resultado = $this->procesarSegunTipo($datoOffline);
            
            if ($resultado['exitoso']) {
                $datoOffline->marcarComoCompletado($this->sincronizacionId);
                
                // Actualizar estadísticas de sincronización
                $sincronizacion->increment('registros_exitosos');
            } else {
                $datoOffline->marcarComoError($resultado['error']);
                $sincronizacion->increment('registros_fallidos');
                
                throw new \Exception($resultado['error']);
            }

        } catch (\Exception $e) {
            $datoOffline->marcarComoError($e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        // Registrar falla permanente
        $datoOffline = DatoOffline::find($this->datoOfflineId);
        if ($datoOffline) {
            $datoOffline->update([
                'estado' => 'error_permanente',
                'errores' => array_merge($datoOffline->errores ?? [], [
                    'error_final' => $exception->getMessage(),
                    'fecha_fallo' => now()->toISOString(),
                ])
            ]);
        }
    }

    private function procesarSegunTipo($datoOffline)
    {
        // Implementar lógica específica para cada tipo de dato
        // Similar a los métodos en el controlador
    }
}