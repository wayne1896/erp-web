<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Caja;
use App\Models\MovimientoCaja;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CerrarCajasDiarias extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'caja:cerrar-diarias';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cerrar automáticamente todas las cajas abiertas al final del día';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando proceso de cierre automático de cajas...');
        
        try {
            // Obtener todas las cajas abiertas
            $cajasAbiertas = Caja::where('estado', 'abierta')
                ->whereDate('fecha_apertura', '<', now()->toDateString())
                ->orWhere(function($query) {
                    $query->where('estado', 'abierta')
                          ->whereTime('fecha_apertura', '<', now()->subHours(24)->toTimeString());
                })
                ->get();

            $this->info("Se encontraron {$cajasAbiertas->count()} cajas abiertas para cerrar.");

            $cerradasExitosamente = 0;
            $errores = 0;

            foreach ($cajasAbiertas as $caja) {
                DB::beginTransaction();
                
                try {
                    // Calcular el total de ventas del día
                    $totalVentas = MovimientoCaja::where('caja_id', $caja->id)
                        ->where('tipo', 'INGRESO')
                        ->sum('monto');

                    // Calcular otros movimientos (ingresos/egresos)
                    $totalIngresos = MovimientoCaja::where('caja_id', $caja->id)
                        ->where('tipo', 'INGRESO')
                        ->where('descripcion', 'NOT LIKE', '%venta%')
                        ->sum('monto');

                    $totalEgresos = MovimientoCaja::where('caja_id', $caja->id)
                        ->where('tipo', 'EGRESO')
                        ->sum('monto');

                    // Calcular el efectivo final
                    $efectivoFinal = $caja->monto_inicial + $totalVentas + $totalIngresos - $totalEgresos;

                    // Actualizar la caja
                    $caja->update([
                        'estado' => 'cerrada',
                        'fecha_cierre' => now(),
                        'efectivo' => $efectivoFinal,
                        'ventas_totales' => $totalVentas,
                        'ingresos_totales' => $totalIngresos,
                        'egresos_totales' => $totalEgresos,
                        'diferencia' => $efectivoFinal - ($caja->monto_inicial + $totalVentas + $totalIngresos - $totalEgresos)
                    ]);

                    // Crear un movimiento automático de cierre
                    MovimientoCaja::create([
                        'caja_id' => $caja->id,
                        'tipo' => 'CIERRE',
                        'monto' => 0,
                        'descripcion' => 'Cierre automático de caja al finalizar el día',
                        'user_id' => 1, // Usuario sistema
                        'observaciones' => 'Cierre automático programado'
                    ]);

                    DB::commit();
                    $cerradasExitosamente++;
                    
                    $this->line("✓ Caja #{$caja->id} cerrada exitosamente. Efectivo final: RD$" . number_format($efectivoFinal, 2));
                    
                } catch (\Exception $e) {
                    DB::rollBack();
                    $errores++;
                    $this->error("✗ Error al cerrar caja #{$caja->id}: " . $e->getMessage());
                    
                    // Registrar en el log
                    Log::error("Error al cerrar caja automáticamente", [
                        'caja_id' => $caja->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            $this->info("\n=== RESUMEN DEL CIERRE AUTOMÁTICO ===");
            $this->info("Cajas cerradas exitosamente: {$cerradasExitosamente}");
            $this->info("Errores: {$errores}");
            $this->info("Total procesadas: " . ($cerradasExitosamente + $errores));

            if ($errores === 0) {
                $this->info("\n✓ Todas las cajas fueron cerradas correctamente.");
            } else {
                $this->warn("\n⚠ Algunas cajas no pudieron ser cerradas. Revisa los logs para más detalles.");
            }

            return $errores === 0 ? 0 : 1;

        } catch (\Exception $e) {
            $this->error("Error fatal en el proceso de cierre automático: " . $e->getMessage());
            Log::error("Error fatal en cierre automático de cajas", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
