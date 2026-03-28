<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Models\AuditoriaSistema;
use Carbon\Carbon;

class RegistrarAuditoriaSistema
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\JsonResponse)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Solo registrar si el usuario está autenticado
        if (Auth::check()) {
            $this->registrarActividad($request);
        }

        return $next($request);
    }

    /**
     * Registrar la actividad del usuario
     */
    private function registrarActividad(Request $request)
    {
        try {
            // Obtener información de la ruta
            $route = $request->route();
            if (!$route) return;

            $accion = $this->determinarAccion($request, $route);
            $modulo = $this->determinarModulo($route);
            $descripcion = $this->generarDescripcion($request, $route);

            // No registrar ciertas rutas (assets, imágenes, etc.)
            if ($this->debeIgnorar($request)) {
                return;
            }

            // Registrar la actividad
            AuditoriaSistema::registrarAcceso(
                $accion,
                $modulo,
                $descripcion
            );

        } catch (\Exception $e) {
            // No interrumpir la aplicación por errores en auditoría
            \Log::error('Error en middleware de auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Determinar la acción basada en el método HTTP y la ruta
     */
    private function determinarAccion(Request $request, $route): string
    {
        $metodo = $request->method();
        $uri = $request->path();

        // Acciones basadas en el método HTTP
        $accionesPorMetodo = [
            'GET' => 'ver',
            'POST' => 'crear',
            'PUT' => 'actualizar',
            'PATCH' => 'actualizar',
            'DELETE' => 'eliminar',
        ];

        // Acciones específicas basadas en la URI
        $accionesPorUri = [
            'login' => AuditoriaSistema::ACCION_LOGIN,
            'logout' => AuditoriaSistema::ACCION_LOGOUT,
            'register' => AuditoriaSistema::ACCION_REGISTRAR,
            'buscar' => AuditoriaSistema::ACCION_BUSCAR,
            'exportar' => AuditoriaSistema::ACCION_EXPORTAR,
            'importar' => AuditoriaSistema::ACCION_IMPORTAR,
            'imprimir' => AuditoriaSistema::ACCION_IMPRIMIR,
            'descargar' => AuditoriaSistema::ACCION_DESCARGAR,
            'aprobar' => AuditoriaSistema::ACCION_APROBAR,
            'rechazar' => AuditoriaSistema::ACCION_RECHAZAR,
            'abrir' => AuditoriaSistema::ACCION_ABRIR,
            'cerrar' => AuditoriaSistema::ACCION_CERRAR,
            'transferir' => AuditoriaSistema::ACCION_TRANSFERIR,
            'anular' => AuditoriaSistema::ACCION_ANULAR,
        ];

        // Verificar acciones específicas en la URI
        foreach ($accionesPorUri as $uriPattern => $accion) {
            if (str_contains($uri, $uriPattern)) {
                return $accion;
            }
        }

        return $accionesPorMetodo[$metodo] ?? 'desconocido';
    }

    /**
     * Determinar el módulo basado en la ruta
     */
    private function determinarModulo($route): string
    {
        $uri = $route->uri();
        $controller = class_basename($route->getActionName());

        // Mapeo de módulos basado en la URI
        $modulosPorUri = [
            'ventas' => AuditoriaSistema::MODULO_VENTAS,
            'pedidos' => AuditoriaSistema::MODULO_PEDIDOS,
            'productos' => AuditoriaSistema::MODULO_PRODUCTOS,
            'clientes' => AuditoriaSistema::MODULO_CLIENTES,
            'proveedores' => AuditoriaSistema::MODULO_PROVEEDORES,
            'caja' => AuditoriaSistema::MODULO_CAJA,
            'inventario' => AuditoriaSistema::MODULO_INVENTARIO,
            'reportes' => AuditoriaSistema::MODULO_REPORTES,
            'configuracion' => AuditoriaSistema::MODULO_CONFIGURACION,
            'auditoria' => AuditoriaSistema::MODULO_AUDITORIA,
            'dashboard' => AuditoriaSistema::MODULO_SISTEMA,
        ];

        // Mapeo de módulos basado en el controlador
        $modulosPorController = [
            'VentaController' => AuditoriaSistema::MODULO_VENTAS,
            'PedidoController' => AuditoriaSistema::MODULO_PEDIDOS,
            'ProductoController' => AuditoriaSistema::MODULO_PRODUCTOS,
            'ClienteController' => AuditoriaSistema::MODULO_CLIENTES,
            'ProveedorController' => AuditoriaSistema::MODULO_PROVEEDORES,
            'CajaController' => AuditoriaSistema::MODULO_CAJA,
            'AuditoriaController' => AuditoriaSistema::MODULO_AUDITORIA,
            'DashboardController' => AuditoriaSistema::MODULO_SISTEMA,
        ];

        // Verificar módulos por URI
        foreach ($modulosPorUri as $uriPattern => $modulo) {
            if (str_contains($uri, $uriPattern)) {
                return $modulo;
            }
        }

        // Verificar módulos por controlador
        foreach ($modulosPorController as $controllerName => $modulo) {
            if (str_contains($controller, $controllerName)) {
                return $modulo;
            }
        }

        return AuditoriaSistema::MODULO_SISTEMA;
    }

    /**
     * Generar descripción automática
     */
    private function generarDescripcion(Request $request, $route): string
    {
        $metodo = $request->method();
        $uri = $request->path();
        $accion = $this->determinarAccion($request, $route);
        $modulo = $this->determinarModulo($route);

        $descripciones = [
            'GET' => [
                'ventas' => "Usuario accedió al listado de ventas",
                'pedidos' => "Usuario accedió al listado de pedidos",
                'productos' => "Usuario accedió al listado de productos",
                'clientes' => "Usuario accedió al listado de clientes",
                'proveedores' => "Usuario accedió al listado de proveedores",
                'caja' => "Usuario accedió a la gestión de caja",
                'auditoria' => "Usuario accedió al sistema de auditoría",
                'dashboard' => "Usuario accedió al dashboard principal",
            ],
            'POST' => [
                'ventas' => "Usuario creó una nueva venta",
                'pedidos' => "Usuario creó un nuevo pedido",
                'productos' => "Usuario creó un nuevo producto",
                'clientes' => "Usuario creó un nuevo cliente",
                'proveedores' => "Usuario creó un nuevo proveedor",
                'caja' => "Usuario abrió una nueva caja",
                'auditoria' => "Usuario ejecutó una auditoría",
            ],
            'PUT' => [
                'ventas' => "Usuario actualizó una venta",
                'pedidos' => "Usuario actualizó un pedido",
                'productos' => "Usuario actualizó un producto",
                'clientes' => "Usuario actualizó un cliente",
                'proveedores' => "Usuario actualizó un proveedor",
                'caja' => "Usuario actualizó información de caja",
                'auditoria' => "Usuario actualizó una auditoría",
            ],
            'DELETE' => [
                'ventas' => "Usuario eliminó una venta",
                'pedidos' => "Usuario eliminó un pedido",
                'productos' => "Usuario eliminó un producto",
                'clientes' => "Usuario eliminó un cliente",
                'proveedores' => "Usuario eliminó un proveedor",
                'auditoria' => "Usuario eliminó una auditoría",
            ],
        ];

        $descripcionesPorModulo = $descripciones[$metodo][$modulo] ?? "Usuario realizó acción '{$accion}' en módulo '{$modulo}'";

        // Agregar información específica si está disponible
        if ($request->has('id')) {
            $descripcionesPorModulo .= " (ID: " . $request->get('id') . ")";
        }

        return $descripcionesPorModulo;
    }

    /**
     * Determinar si la ruta debe ser ignorada
     */
    private function debeIgnorar(Request $request): bool
    {
        $uri = $request->path();

        // Ignorar rutas de assets
        $ignorar = [
            'js/',
            'css/',
            'img/',
            'images/',
            'fonts/',
            'favicon',
            'icon',
            'storage/',
            'public/',
            'sanctum',
            'telescope',
            'horizon',
        ];

        foreach ($ignorar as $patron) {
            if (str_starts_with($uri, $patron)) {
                return true;
            }
        }

        // Ignorar solicitudes AJAX (verificado por header)
        if ($request->ajax() || $request->wantsJson()) {
            return true;
        }

        // Ignorar solicitudes a archivos estáticos
        if (str_contains($uri, '.') && !str_contains($uri, 'api/')) {
            return true;
        }

        return false;
    }
}
