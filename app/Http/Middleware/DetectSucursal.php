// app/Http/Middleware/DetectSucursal.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Sucursal;
use Illuminate\Support\Facades\Auth;

class DetectSucursal
{
    public function handle(Request $request, Closure $next)
    {
        // Si el usuario está autenticado
        if (Auth::check()) {
            $user = Auth::user();
            
            // Si el usuario tiene una sucursal asignada
            if ($user->sucursal_id) {
                $sucursal = Sucursal::find($user->sucursal_id);
            } else {
                // Obtener sucursal principal por defecto
                $sucursal = Sucursal::principal();
                
                // Asignar sucursal principal al usuario si no tiene
                $user->sucursal_id = $sucursal->id ?? null;
                $user->save();
            }
            
            // Compartir sucursal con todas las vistas
            view()->share('sucursalActiva', $sucursal);
        }
        
        return $next($request);
    }
}