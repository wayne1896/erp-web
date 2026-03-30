<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$pedido = App\Models\Pedido::with(['cliente', 'detalles.producto', 'direccionEntrega', 'usuario', 'sucursal'])->find(6);

if ($pedido) {
    echo json_encode($pedido->toArray(), JSON_PRETTY_PRINT);
} else {
    echo 'Pedido no encontrado';
}
