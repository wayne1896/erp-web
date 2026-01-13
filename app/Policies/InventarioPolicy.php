// app/Policies/InventarioPolicy.php
namespace App\Policies;

use App\Models\User;
use App\Models\Sucursal;

class InventarioPolicy
{
    public function ajustarStock(User $user, Sucursal $sucursal)
    {
        // Solo usuarios con rol de administrador o encargado de inventario
        return in_array($user->role, ['admin', 'inventario']);
    }
}
