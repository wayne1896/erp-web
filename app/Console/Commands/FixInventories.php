// En app/Console/Commands/FixInventories.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventarioSucursal;
use App\Models\DetalleVenta;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;

class FixInventories extends Command
{
    protected $signature = 'inventories:fix {--producto= : ID del producto específico}';
    protected $description = 'Corregir inconsistencias en inventarios';

    public function handle()
    {
        if ($this->option('producto')) {
            $this->fixProducto($this->option('producto'));
        } else {
            $this->fixAll();
        }
    }
    
    protected function fixProducto($productoId)
    {
        $this->info("Corrigiendo producto ID: {$productoId}");
        
        // 1. Calcular ventas reales
        $ventasTotales = DetalleVenta::where('producto_id', $productoId)
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->where('ventas.sucursal_id', 1) // Asumiendo sucursal principal
            ->sum('detalle_ventas.cantidad');
        
        $this->info("Ventas totales: {$ventasTotales}");
        
        // 2. Stock inicial era 50
        $stockCorrecto = 50 - $ventasTotales;
        
        // 3. Actualizar inventario
        $inventario = InventarioSucursal::where('producto_id', $productoId)
            ->where('sucursal_id', 1)
            ->first();
            
        if ($inventario) {
            $this->info("Stock actual en BD: {$inventario->stock_actual}");
            $this->info("Stock CORRECTO debería ser: {$stockCorrecto}");
            
            if ($inventario->stock_actual != $stockCorrecto) {
                $inventario->stock_actual = $stockCorrecto;
                $inventario->save();
                $this->info("✓ Inventario corregido a {$stockCorrecto}");
            } else {
                $this->info("✓ Inventario ya está correcto");
            }
        }
    }
    
    protected function fixAll()
    {
        $this->info("Corrigiendo TODOS los inventarios...");
        
        // Obtener todos los productos vendidos
        $productosVendidos = DetalleVenta::select('producto_id', DB::raw('SUM(cantidad) as ventas_totales'))
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->where('ventas.sucursal_id', 1)
            ->groupBy('producto_id')
            ->get();
        
        foreach ($productosVendidos as $producto) {
            $this->fixProducto($producto->producto_id);
        }
        
        $this->info("✓ Corrección completada");
    }
}