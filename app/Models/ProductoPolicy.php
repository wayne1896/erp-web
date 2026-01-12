<?php
// app/Policies/ProductoPolicy.php
namespace App\Policies;

use App\Models\User;
use App\Models\Producto;

class ProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->tipo_usuario, ['admin', 'gerente', 'almacen']);
    }
    
    public function create(User $user): bool
    {
        return in_array($user->tipo_usuario, ['admin', 'almacen']);
    }
    
    public function update(User $user, Producto $producto): bool
    {
        return $user->tipo_usuario === 'admin' || 
               ($user->tipo_usuario === 'almacen' && $user->sucursal_id === $producto->sucursal_id);
    }
}

// app/Policies/VentaPolicy.php
class VentaPolicy
{
    public function anular(User $user, Venta $venta): bool
    {
        return $user->tipo_usuario === 'admin' || 
               ($user->tipo_usuario === 'gerente' && $user->sucursal_id === $venta->sucursal_id);
    }
}