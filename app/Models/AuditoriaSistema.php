<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class AuditoriaSistema extends Model
{
    protected $table = 'auditoria_sistema';

    protected $fillable = [
        'user_id',
        'accion',
        'modulo',
        'entidad_id',
        'entidad_type',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent',
        'session_id',
        'metodo_http',
        'url',
        'controlador',
        'metodo',
        'linea_codigo',
        'descripcion',
        'nivel_importancia',
        'resultado',
        'tiempo_ejecucion',
        'memoria_usada',
        'detalles_adicionales',
    ];

    protected $casts = [
        'datos_anteriores' => 'json',
        'datos_nuevos' => 'json',
        'detalles_adicionales' => 'json',
        'tiempo_ejecucion' => 'float',
        'memoria_usada' => 'float',
        'created_at' => 'datetime',
    ];

    // Niveles de importancia
    const NIVEL_INFO = 'info';
    const NIVEL_WARNING = 'warning';
    const NIVEL_ERROR = 'error';
    const NIVEL_CRITICAL = 'critical';
    const NIVEL_DEBUG = 'debug';

    // Módulos del sistema
    const MODULO_AUTH = 'auth';
    const MODULO_VENTAS = 'ventas';
    const MODULO_PEDIDOS = 'pedidos';
    const MODULO_PRODUCTOS = 'productos';
    const MODULO_CLIENTES = 'clientes';
    const MODULO_PROVEEDORES = 'proveedores';
    const MODULO_CAJA = 'caja';
    const MODULO_INVENTARIO = 'inventario';
    const MODULO_REPORTES = 'reportes';
    const MODULO_CONFIGURACION = 'configuracion';
    const MODULO_AUDITORIA = 'auditoria';
    const MODULO_SISTEMA = 'sistema';

    // Acciones comunes
    const ACCION_CREAR = 'crear';
    const ACCION_ACTUALIZAR = 'actualizar';
    const ACCION_ELIMINAR = 'eliminar';
    const ACCION_VER = 'ver';
    const ACCION_LISTAR = 'listar';
    const ACCION_BUSCAR = 'buscar';
    const ACCION_EXPORTAR = 'exportar';
    const ACCION_IMPORTAR = 'importar';
    const ACCION_LOGIN = 'login';
    const ACCION_LOGOUT = 'logout';
    const ACCION_REGISTRAR = 'registrar';
    const ACCION_APROBAR = 'aprobar';
    const ACCION_RECHAZAR = 'rechazar';
    const ACCION_ABRIR = 'abrir';
    const ACCION_CERRAR = 'cerrar';
    const ACCION_TRANSFERIR = 'transferir';
    const ACCION_ANULAR = 'anular';
    const ACCION_IMPRIMIR = 'imprimir';
    const ACCION_DESCARGAR = 'descargar';

    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scopes
     */
    public function scopeDeUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDeModulo($query, $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    public function scopeDeAccion($query, $accion)
    {
        return $query->where('accion', $accion);
    }

    public function scopeDeImportancia($query, $nivel)
    {
        return $query->where('nivel_importancia', $nivel);
    }

    public function scopeDeFecha($query, $fechaInicio, $fechaFin = null)
    {
        if ($fechaFin) {
            return $query->whereBetween('created_at', [$fechaInicio, $fechaFin]);
        }
        return $query->whereDate('created_at', $fechaInicio);
    }

    /**
     * Métodos estáticos para registro automático
     */
    public static function registrarActividad(
        string $accion,
        string $modulo,
        string $descripcion = null,
        $entidadId = null,
        $entidadType = null,
        array $datosAnteriores = null,
        array $datosNuevos = null,
        string $nivelImportancia = self::NIVEL_INFO
    ) {
        $request = request();
        
        $datos = [
            'user_id' => Auth::id(),
            'accion' => $accion,
            'modulo' => $modulo,
            'entidad_id' => $entidadId,
            'entidad_type' => $entidadType,
            'datos_anteriores' => $datosAnteriores,
            'datos_nuevos' => $datosNuevos,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'metodo_http' => $request->method(),
            'url' => $request->fullUrl(),
            'controlador' => class_basename($request->route()?->getActionName()),
            'metodo' => $request->route()?->getActionMethod(),
            'linea_codigo' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1)[0]['line'] ?? null,
            'descripcion' => $descripcion,
            'nivel_importancia' => $nivelImportancia,
            'resultado' => 'success',
        ];

        return self::create($datos);
    }

    /**
     * Registrar cambio en datos
     */
    public static function registrarCambio(
        string $accion,
        string $modulo,
        string $descripcion,
        $entidadId,
        $entidadType,
        array $datosAnteriores,
        array $datosNuevos,
        string $nivelImportancia = self::NIVEL_INFO
    ) {
        return self::registrarActividad(
            $accion,
            $modulo,
            $descripcion,
            $entidadId,
            $entidadType,
            $datosAnteriores,
            $datosNuevos,
            $nivelImportancia
        );
    }

    /**
     * Registrar error
     */
    public static function registrarError(
        string $modulo,
        string $descripcion,
        \Exception $exception = null,
        string $nivelImportancia = self::NIVEL_ERROR
    ) {
        $request = request();
        
        $datos = [
            'user_id' => Auth::id(),
            'accion' => 'error',
            'modulo' => $modulo,
            'datos_anteriores' => $exception ? [
                'mensaje' => $exception->getMessage(),
                'archivo' => $exception->getFile(),
                'linea' => $exception->getLine(),
                'traza' => $exception->getTraceAsString()
            ] : null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'metodo_http' => $request->method(),
            'url' => $request->fullUrl(),
            'controlador' => class_basename(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[0]['class'] ?? null),
            'metodo' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[0]['function'] ?? null,
            'linea_codigo' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[0]['line'] ?? null,
            'descripcion' => $descripcion,
            'nivel_importancia' => $nivelImportancia,
            'resultado' => 'error',
        ];

        return self::create($datos);
    }

    /**
     * Registrar acceso de usuario
     */
    public static function registrarAcceso(string $accion, string $modulo, $descripcion = null)
    {
        $request = request();
        
        $datos = [
            'user_id' => Auth::id(),
            'accion' => $accion,
            'modulo' => $modulo,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'metodo_http' => $request->method(),
            'url' => $request->fullUrl(),
            'descripcion' => $descripcion ?? "Usuario {$accion} en módulo {$modulo}",
            'nivel_importancia' => self::NIVEL_INFO,
            'resultado' => 'success',
        ];

        return self::create($datos);
    }

    /**
     * Obtener estadísticas
     */
    public static function obtenerEstadisticas($periodo = 'dia')
    {
        $fecha = match($periodo) {
            'dia' => now()->startOfDay(),
            'semana' => now()->startOfWeek(),
            'mes' => now()->startOfMonth(),
            'año' => now()->startOfYear(),
            default => now()->startOfDay()
        };

        return [
            'total_actividades' => self::where('created_at', '>=', $fecha)->count(),
            'actividades_unicas' => self::where('created_at', '>=', $fecha)->distinct('user_id')->count('user_id'),
            'errores' => self::where('created_at', '>=', $fecha)->where('resultado', 'error')->count(),
            'errores_criticos' => self::where('created_at', '>=', $fecha)->where('nivel_importancia', self::NIVEL_CRITICAL)->count(),
            'por_modulo' => self::where('created_at', '>=', $fecha)
                ->selectRaw('modulo, count(*) as count')
                ->groupBy('modulo')
                ->orderBy('count', 'desc')
                ->get(),
            'por_accion' => self::where('created_at', '>=', $fecha)
                ->selectRaw('accion, count(*) as count')
                ->groupBy('accion')
                ->orderBy('count', 'desc')
                ->get(),
            'por_importancia' => self::where('created_at', '>=', $fecha)
                ->selectRaw('nivel_importancia, count(*) as count')
                ->groupBy('nivel_importancia')
                ->get(),
            'usuarios_mas_activos' => self::where('created_at', '>=', $fecha)
                ->with('usuario')
                ->selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Limpiar registros antiguos
     */
    public static function limpiarRegistrosAntiguos($dias = 90)
    {
        $fechaLimite = now()->subDays($dias);
        
        $eliminados = self::where('created_at', '<', $fechaLimite)->delete();
        
        return $eliminados;
    }

    /**
     * Obtener color según nivel de importancia
     */
    public function getColorAttribute()
    {
        return match($this->nivel_importancia) {
            self::NIVEL_CRITICAL => 'red',
            self::NIVEL_ERROR => 'orange',
            self::NIVEL_WARNING => 'yellow',
            self::NIVEL_INFO => 'blue',
            self::NIVEL_DEBUG => 'gray',
            default => 'gray'
        };
    }

    /**
     * Obtener icono según acción
     */
    public function getIconoAttribute()
    {
        return match($this->accion) {
            self::ACCION_CREAR => 'plus-circle',
            self::ACCION_ACTUALIZAR => 'edit',
            self::ACCION_ELIMINAR => 'trash-2',
            self::ACCION_VER => 'eye',
            self::ACCION_LISTAR => 'list',
            self::ACCION_BUSCAR => 'search',
            self::ACCION_EXPORTAR => 'download',
            self::ACCION_IMPORTAR => 'upload',
            self::ACCION_LOGIN => 'log-in',
            self::ACCION_LOGOUT => 'log-out',
            self::ACCION_REGISTRAR => 'user-plus',
            self::ACCION_APROBAR => 'check-circle',
            self::ACCION_RECHAZAR => 'x-circle',
            self::ACCION_ABRIR => 'unlock',
            self::ACCION_CERRAR => 'lock',
            self::ACCION_TRANSFERIR => 'arrow-right-left',
            self::ACCION_ANULAR => 'ban',
            self::ACCION_IMPRIMIR => 'printer',
            self::ACCION_DESCARGAR => 'download',
            'error' => 'alert-circle',
            default => 'activity'
        };
    }

    /**
     * Formatear tiempo de ejecución
     */
    public function getTiempoFormateadoAttribute()
    {
        if ($this->tiempo_ejecucion) {
            return number_format($this->tiempo_ejecucion * 1000, 2) . ' ms';
        }
        return 'N/A';
    }

    /**
     * Formatear memoria usada
     */
    public function getMemoriaFormateadaAttribute()
    {
        if ($this->memoria_usada) {
            return number_format($this->memoria_usada / 1024 / 1024, 2) . ' MB';
        }
        return 'N/A';
    }
}
