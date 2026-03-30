<?php

/**
 * Script simple para extraer datos reales de pedidos
 * Uso: php extraer_pedidos_db.php [pedido_id] [formato]
 */

// Configuración de la base de datos
$host = 'localhost';
$database = 'erp_web';
$username = 'root';
$password = '';

try {
    // Conectar a la base de datos
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Obtener parámetros
    $pedidoId = isset($argv[1]) ? (int)$argv[1] : null;
    $formato = isset($argv[2]) ? strtolower($argv[2]) : 'json';

    // Validar formato
    if (!in_array($formato, ['json', 'table', 'api'])) {
        echo "Formato no válido. Opciones: json, table, api\n";
        exit(1);
    }

    if ($pedidoId) {
        extraerPedido($pdo, $pedidoId, $formato);
    } else {
        extraerTodos($pdo, $formato);
    }

} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

function extraerPedido($pdo, $pedidoId, $formato)
{
    // Obtener pedido principal
    $stmt = $pdo->prepare("
        SELECT p.*, 
               c.nombre_completo as cliente_nombre,
               c.cedula_rnc as cliente_cedula,
               c.telefono as cliente_telefono,
               c.email as cliente_email,
               u.name as usuario_nombre,
               s.nombre as sucursal_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN sucursales s ON p.sucursal_id = s.id
        WHERE p.id = ?
    ");
    
    $stmt->execute([$pedidoId]);
    $pedido = $stmt->fetch();

    if (!$pedido) {
        echo "❌ Pedido ID {$pedidoId} no encontrado\n";
        return;
    }

    // Obtener detalles
    $stmt = $pdo->prepare("
        SELECT dp.*, 
               pr.nombre as producto_nombre,
               pr.codigo as producto_codigo,
               pr.descripcion as producto_descripcion
        FROM detalle_pedidos dp
        LEFT JOIN productos pr ON dp.producto_id = pr.id
        WHERE dp.pedido_id = ?
        ORDER BY dp.id
    ");
    
    $stmt->execute([$pedidoId]);
    $detalles = $stmt->fetchAll();

    // Obtener dirección de entrega
    $stmt = $pdo->prepare("
        SELECT * FROM direcciones_entrega WHERE pedido_id = ?
    ");
    
    $stmt->execute([$pedidoId]);
    $direccion = $stmt->fetch();

    // Construir respuesta
    $pedido['detalles'] = $detalles;
    $pedido['direccionEntrega'] = $direccion;

    if ($formato === 'json') {
        echo json_encode($pedido, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } elseif ($formato === 'table') {
        mostrarPedidoComoTabla($pedido);
    } elseif ($formato === 'api') {
        mostrarPedidoComoAPI($pedido);
    }
}

function extraerTodos($pdo, $formato)
{
    // Obtener pedidos recientes
    $stmt = $pdo->prepare("
        SELECT p.id, p.numero_pedido, p.estado, p.tipo_pedido,
               p.fecha_pedido, p.fecha_entrega, p.total,
               c.nombre_completo as cliente_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
    ");
    
    $stmt->execute();
    $pedidos = $stmt->fetchAll();

    if (empty($pedidos)) {
        echo "❌ No se encontraron pedidos\n";
        return;
    }

    echo "📋 Se encontraron " . count($pedidos) . " pedidos:\n\n";

    if ($formato === 'table') {
        mostrarTablaResumen($pedidos);
    } else {
        foreach ($pedidos as $index => $pedido) {
            echo "📦 PEDIDO #" . ($index + 1) . " (ID: {$pedido['id']})\n";
            echo str_repeat("=", 60) . "\n";
            echo json_encode($pedido, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
            echo "\n" . str_repeat("-", 60) . "\n\n";
        }
    }
}

function mostrarPedidoComoTabla($pedido)
{
    echo "📋 INFORMACIÓN DEL PEDIDO\n";
    echo "ID: {$pedido['id']}\n";
    echo "Número: {$pedido['numero_pedido']}\n";
    echo "Estado: {$pedido['estado']}\n";
    echo "Tipo: {$pedido['tipo_pedido']}\n";
    echo "Prioridad: {$pedido['prioridad']}\n";
    echo "Condición Pago: {$pedido['condicion_pago']}\n";
    echo "Fecha Pedido: {$pedido['fecha_pedido']}\n";
    echo "Fecha Entrega: {$pedido['fecha_entrega']}\n";
    echo "Subtotal: RD$" . number_format($pedido['subtotal'], 2) . "\n";
    echo "Descuento: RD$" . number_format($pedido['descuento'], 2) . "\n";
    echo "ITBIS: RD$" . number_format($pedido['itbis'], 2) . "\n";
    echo "Total: RD$" . number_format($pedido['total'], 2) . "\n";
    echo "Anticipo: RD$" . number_format($pedido['anticipo'], 2) . "\n";
    echo "Saldo Pendiente: RD$" . number_format($pedido['saldo_pendiente'], 2) . "\n";
    echo "Notas: " . ($pedido['notas'] ?: 'Sin notas') . "\n\n";

    // Cliente
    if ($pedido['cliente_nombre']) {
        echo "👤 CLIENTE\n";
        echo "Nombre: {$pedido['cliente_nombre']}\n";
        echo "Cédula/RNC: {$pedido['cliente_cedula']}\n";
        echo "Teléfono: {$pedido['cliente_telefono']}\n";
        echo "Email: {$pedido['cliente_email']}\n\n";
    }

    // Dirección de entrega
    if ($pedido['direccionEntrega']) {
        $dir = $pedido['direccionEntrega'];
        echo "📍 DIRECCIÓN DE ENTREGA\n";
        echo "Contacto: {$dir['nombre_contacto']}\n";
        echo "Teléfono: {$dir['telefono_contacto']}\n";
        echo "Dirección: {$dir['direccion']}\n";
        echo "Ciudad: {$dir['ciudad']}\n";
        echo "Provincia: {$dir['provincia']}\n";
        echo "Sector: " . ($dir['sector'] ?: 'No especificado') . "\n";
        echo "Código Postal: " . ($dir['codigo_postal'] ?: 'No especificado') . "\n";
        echo "Instrucciones: " . ($dir['instrucciones_entrega'] ?: 'Sin instrucciones') . "\n\n";
    }

    // Productos
    if (!empty($pedido['detalles'])) {
        echo "📦 PRODUCTOS (" . count($pedido['detalles']) . ")\n";
        foreach ($pedido['detalles'] as $index => $detalle) {
            echo "  " . ($index + 1) . ". {$detalle['producto_nombre']}\n";
            echo "     Código: {$detalle['producto_codigo']}\n";
            echo "     Cantidad: {$detalle['cantidad_solicitada']}\n";
            echo "     Precio: RD$" . number_format($detalle['precio_unitario'], 2) . "\n";
            echo "     Descuento: {$detalle['descuento']}% (RD$" . number_format($detalle['descuento_monto'], 2) . ")\n";
            echo "     Subtotal: RD$" . number_format($detalle['subtotal'], 2) . "\n";
            echo "     ITBIS: RD$" . number_format($detalle['itbis_monto'], 2) . "\n";
            echo "     Total: RD$" . number_format($detalle['total'], 2) . "\n\n";
        }
    }
}

function mostrarPedidoComoAPI($pedido)
{
    $apiResponse = [
        'data' => $pedido,
        'links' => [
            'self' => "http://localhost/api/pedidos/{$pedido['id']}",
            'show' => "http://localhost/pedidos/{$pedido['id']}",
        ],
        'meta' => [
            'timestamp' => date('c'),
            'version' => 'v1'
        ]
    ];

    echo json_encode($apiResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

function mostrarTablaResumen($pedidos)
{
    echo "📊 TABLA RESUMEN DE PEDIDOS\n\n";
    echo sprintf("%-6s %-15s %-12s %-10s %-15s %-12s %-10s\n", 
        'ID', 'NÚMERO', 'ESTADO', 'TIPO', 'CLIENTE', 'TOTAL', 'FECHA');
    echo str_repeat("-", 85) . "\n";

    foreach ($pedidos as $pedido) {
        $nombreCliente = substr($pedido['cliente_nombre'], 0, 14);
        
        echo sprintf("%-6d %-15s %-12s %-10s %-15s RD$%-10.2f %-10s\n",
            $pedido['id'],
            $pedido['numero_pedido'],
            $pedido['estado'],
            $pedido['tipo_pedido'],
            $nombreCliente,
            $pedido['total'],
            $pedido['fecha_pedido']
        );
    }
    echo "\n";
}

// Mostrar ayuda si no hay parámetros
if (count($argv) === 1) {
    echo "📖 USO DEL SCRIPT\n\n";
    echo "php extraer_pedidos_db.php [pedido_id] [formato]\n\n";
    echo "Ejemplos:\n";
    echo "  php extraer_pedidos_db.php                    # Todos los pedidos en JSON\n";
    echo "  php extraer_pedidos_db.php 6                    # Pedido ID 6 en JSON\n";
    echo "  php extraer_pedidos_db.php 6 table              # Pedido ID 6 en formato tabla\n";
    echo "  php extraer_pedidos_db.php 6 api                # Pedido ID 6 en formato API\n";
    echo "  php extraer_pedidos_db.php table               # Todos los pedidos en tabla resumen\n\n";
    echo "Formatos disponibles:\n";
    echo "  json  - Formato JSON completo (default)\n";
    echo "  table - Formato tabla legible\n";
    echo "  api   - Formato respuesta API\n";
    exit(0);
}
