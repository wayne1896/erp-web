<?php
// app/Http\Controllers/Api/Mobile/NotificacionController.php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\DispositivoPush;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class NotificacionController extends Controller
{
    protected $pushService;
    
    public function __construct(PushNotificationService $pushService)
    {
        $this->pushService = $pushService;
    }
    
    /**
     * Obtener notificaciones del usuario
     * GET /api/mobile/notificaciones
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $perPage = $request->get('per_page', 20);
        $page = $request->get('page', 1);
        
        $cacheKey = "mobile.notificaciones.{$user->id}.page{$page}.per{$perPage}";
        $cacheTime = 60; // 1 minuto
        
        $notificaciones = Cache::remember($cacheKey, $cacheTime, function () use ($user, $perPage, $request) {
            $query = Notificacion::where('user_id', $user->id)
                ->validas()
                ->orderBy('fecha_envio', 'desc');
            
            // Filtrar por tipo
            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }
            
            // Filtrar por nivel
            if ($request->has('nivel')) {
                $query->where('nivel', $request->nivel);
            }
            
            // Filtrar por estado (leídas/no leídas)
            if ($request->has('leido')) {
                $query->where('leido', $request->boolean('leido'));
            }
            
            return $query->paginate($perPage)->through(function($notificacion) {
                return $this->formatearNotificacion($notificacion);
            });
        });
        
        $estadisticas = [
            'total' => Notificacion::where('user_id', $user->id)->validas()->count(),
            'no_leidas' => Notificacion::where('user_id', $user->id)
                ->validas()
                ->noLeidas()
                ->count(),
            'urgentes' => Notificacion::where('user_id', $user->id)
                ->validas()
                ->urgentes()
                ->count(),
            'por_tipo' => Notificacion::where('user_id', $user->id)
                ->validas()
                ->select('tipo', DB::raw('COUNT(*) as total'))
                ->groupBy('tipo')
                ->get()
                ->pluck('total', 'tipo'),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $notificaciones->items(),
            'pagination' => [
                'current_page' => $notificaciones->currentPage(),
                'per_page' => $notificaciones->perPage(),
                'total' => $notificaciones->total(),
                'last_page' => $notificaciones->lastPage(),
            ],
            'estadisticas' => $estadisticas,
            'badge_count' => $user->notificaciones_sin_leer ?? 0,
            'metadata' => [
                'fecha_consulta' => now()->toISOString(),
                'filtros_aplicados' => $request->only(['tipo', 'nivel', 'leido']),
            ]
        ]);
    }
    
    /**
     * Obtener notificaciones no leídas (para badge)
     * GET /api/mobile/notificaciones/unread
     */
    public function unread(Request $request)
    {
        $user = $request->user();
        
        $notificaciones = Notificacion::where('user_id', $user->id)
            ->validas()
            ->noLeidas()
            ->orderBy('fecha_envio', 'desc')
            ->limit(20)
            ->get()
            ->map(function($notificacion) {
                return $this->formatearNotificacion($notificacion);
            });
        
        return response()->json([
            'success' => true,
            'data' => $notificaciones,
            'count' => $notificaciones->count(),
            'badge_count' => $user->notificaciones_sin_leer ?? 0,
            'timestamp' => now()->toISOString(),
        ]);
    }
    
    /**
     * Marcar notificación como leída
     * POST /api/mobile/notificaciones/{id}/read
     */
    public function markAsRead(Request $request, $id)
    {
        $notificacion = Notificacion::where('user_id', $request->user()->id)
            ->findOrFail($id);
        
        if (!$notificacion->leido) {
            $notificacion->marcarComoLeida();
            
            // Invalidar cache
            Cache::forget("mobile.notificaciones.{$request->user()->id}");
            
            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída',
                'data' => $this->formatearNotificacion($notificacion),
                'badge_count' => $request->user()->refresh()->notificaciones_sin_leer ?? 0,
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'La notificación ya estaba leída',
        ], 400);
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     * POST /api/mobile/notificaciones/mark-all-read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        $count = Notificacion::where('user_id', $user->id)
            ->noLeidas()
            ->update([
                'leido' => true,
                'fecha_leido' => now(),
            ]);
        
        // Actualizar contador del usuario
        $user->update(['notificaciones_sin_leer' => 0]);
        
        // Invalidar cache
        Cache::forget("mobile.notificaciones.{$user->id}");
        
        return response()->json([
            'success' => true,
            'message' => "{$count} notificaciones marcadas como leídas",
            'count' => $count,
            'badge_count' => 0,
        ]);
    }
    
    /**
     * Registrar dispositivo para push notifications
     * POST /api/mobile/notificaciones/register-device
     */
    public function registerDevice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'plataforma' => 'required|in:android,ios,web',
            'modelo' => 'nullable|string|max:100',
            'version_sistema' => 'nullable|string|max:50',
            'version_app' => 'required|string|max:20',
            'idioma' => 'nullable|string|max:10',
            'zona_horaria' => 'nullable|string|max:50',
            'preferencias' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        DB::beginTransaction();
        
        try {
            // Verificar si el dispositivo ya está registrado
            $dispositivo = DispositivoPush::where('token', $request->token)->first();
            
            if ($dispositivo) {
                // Actualizar dispositivo existente
                $dispositivo->update([
                    'user_id' => $user->id,
                    'plataforma' => $request->plataforma,
                    'modelo' => $request->modelo,
                    'version_sistema' => $request->version_sistema,
                    'version_app' => $request->version_app,
                    'idioma' => $request->idioma,
                    'zona_horaria' => $request->zona_horaria,
                    'ultima_conexion' => now(),
                    'estado' => DispositivoPush::ESTADO_ACTIVO,
                    'preferencias' => array_merge(
                        $dispositivo->preferencias ?? [],
                        $request->preferencias ?? []
                    ),
                ]);
            } else {
                // Crear nuevo dispositivo
                $dispositivo = DispositivoPush::create([
                    'user_id' => $user->id,
                    'token' => $request->token,
                    'plataforma' => $request->plataforma,
                    'modelo' => $request->modelo,
                    'version_sistema' => $request->version_sistema,
                    'version_app' => $request->version_app,
                    'idioma' => $request->idioma,
                    'zona_horaria' => $request->zona_horaria,
                    'ultima_conexion' => now(),
                    'estado' => DispositivoPush::ESTADO_ACTIVO,
                    'preferencias' => $request->preferencias ?? [],
                    'topics' => ['usuario_' . $user->id], // Suscribir a topic del usuario
                ]);
            }
            
            // Suscribir a topics generales
            $dispositivo->suscribirATopic('todos');
            $dispositivo->suscribirATopic('sucursal_' . $user->sucursal_id);
            
            // Suscribir según tipo de usuario
            if ($user->esVendedor()) {
                $dispositivo->suscribirATopic('vendedores');
            }
            if ($user->esAdministrador()) {
                $dispositivo->suscribirATopic('administradores');
            }
            
            DB::commit();
            
            // Enviar notificación de bienvenida
            $this->pushService->enviarAUsuario(
                $user,
                '📱 Dispositivo Registrado',
                'Tu dispositivo ha sido registrado para recibir notificaciones',
                Notificacion::TIPO_SISTEMA,
                Notificacion::NIVEL_BAJA
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Dispositivo registrado exitosamente',
                'data' => [
                    'dispositivo_id' => $dispositivo->id,
                    'token' => substr($dispositivo->token, 0, 20) . '...',
                    'plataforma' => $dispositivo->plataforma,
                    'topics' => $dispositivo->topics,
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error registrando dispositivo push', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'token' => substr($request->token, 0, 20) . '...',
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error registrando dispositivo: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Actualizar preferencias de notificaciones
     * PUT /api/mobile/notificaciones/preferences
     */
    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'preferencias' => 'required|array',
            'preferencias.ventas' => 'boolean',
            'preferencias.inventario' => 'boolean',
            'preferencias.clientes' => 'boolean',
            'preferencias.caja' => 'boolean',
            'preferencias.sistema' => 'boolean',
            'preferencias.promociones' => 'boolean',
            'preferencias.sonido' => 'boolean',
            'preferencias.vibracion' => 'boolean',
            'preferencias.nocturno' => 'boolean',
            'preferencias.hora_inicio' => 'string|regex:/^([0-9]{2}):([0-9]{2})$/',
            'preferencias.hora_fin' => 'string|regex:/^([0-9]{2}):([0-9]{2})$/',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Actualizar preferencias en todos los dispositivos del usuario
        $dispositivos = DispositivoPush::where('user_id', $user->id)->get();
        
        foreach ($dispositivos as $dispositivo) {
            $preferenciasActuales = $dispositivo->preferencias ?? [];
            $dispositivo->preferencias = array_merge($preferenciasActuales, $request->preferencias);
            $dispositivo->save();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Preferencias actualizadas',
            'data' => [
                'preferencias' => $request->preferencias,
                'dispositivos_actualizados' => $dispositivos->count(),
            ]
        ]);
    }
    
    /**
     * Obtener estadísticas de notificaciones
     * GET /api/mobile/notificaciones/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $stats = Cache::remember("mobile.notificaciones.stats.{$user->id}", 300, function () use ($user) {
            // Estadísticas generales
            $total = Notificacion::where('user_id', $user->id)
                ->where('fecha_envio', '>=', now()->subDays(30))
                ->count();
            
            $leidas = Notificacion::where('user_id', $user->id)
                ->where('fecha_envio', '>=', now()->subDays(30))
                ->where('leido', true)
                ->count();
            
            $tasaApertura = $total > 0 ? ($leidas / $total) * 100 : 0;
            
            // Estadísticas por tipo
            $porTipo = Notificacion::where('user_id', $user->id)
                ->where('fecha_envio', '>=', now()->subDays(30))
                ->select('tipo', DB::raw('COUNT(*) as total'))
                ->groupBy('tipo')
                ->get()
                ->mapWithKeys(function($item) {
                    return [$item->tipo => $item->total];
                });
            
            // Estadísticas por día (últimos 7 días)
            $porDia = Notificacion::where('user_id', $user->id)
                ->where('fecha_envio', '>=', now()->subDays(7))
                ->select(
                    DB::raw('DATE(fecha_envio) as fecha'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy(DB::raw('DATE(fecha_envio)'))
                ->orderBy('fecha')
                ->get();
            
            // Horas de mayor actividad
            $porHora = Notificacion::where('user_id', $user->id)
                ->where('fecha_envio', '>=', now()->subDays(30))
                ->select(
                    DB::raw('HOUR(fecha_envio) as hora'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy(DB::raw('HOUR(fecha_envio)'))
                ->orderBy('hora')
                ->get();
            
            return [
                'periodo' => '30_dias',
                'totales' => [
                    'total' => $total,
                    'leidas' => $leidas,
                    'no_leidas' => $total - $leidas,
                    'tasa_apertura' => round($tasaApertura, 1),
                ],
                'por_tipo' => $porTipo,
                'por_dia' => $porDia,
                'por_hora' => $porHora,
                'dispositivos_activos' => DispositivoPush::where('user_id', $user->id)
                    ->activos()
                    ->recientes()
                    ->count(),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $stats,
            'fecha_generacion' => now()->toISOString(),
        ]);
    }
    
    /**
     * Simular notificación de prueba
     * POST /api/mobile/notificaciones/test
     */
    public function sendTest(Request $request)
    {
        $user = $request->user();
        
        $titulo = '🔔 Notificación de Prueba';
        $mensaje = 'Esta es una notificación de prueba enviada a las ' . now()->format('H:i');
        
        $enviada = $this->pushService->enviarAUsuario(
            $user,
            $titulo,
            $mensaje,
            Notificacion::TIPO_SISTEMA,
            Notificacion::NIVEL_BAJA,
            [
                'accion' => 'test',
                'ruta' => '/dashboard',
                'test' => true,
            ]
        );
        
        return response()->json([
            'success' => $enviada,
            'message' => $enviada ? 
                'Notificación de prueba enviada' : 
                'Error enviando notificación de prueba',
            'data' => [
                'titulo' => $titulo,
                'mensaje' => $mensaje,
                'timestamp' => now()->toISOString(),
                'dispositivos_activos' => DispositivoPush::where('user_id', $user->id)
                    ->activos()
                    ->recientes()
                    ->count(),
            ]
        ]);
    }
    
    /**
     * Formatear notificación para respuesta
     */
    private function formatearNotificacion(Notificacion $notificacion): array
    {
        return [
            'id' => $notificacion->id,
            'titulo' => $notificacion->titulo,
            'mensaje' => $notificacion->mensaje,
            'tipo' => $notificacion->tipo,
            'nivel' => $notificacion->nivel,
            'icono' => $notificacion->icono_tipo,
            'color' => $notificacion->color_nivel,
            'leido' => $notificacion->leido,
            'tiempo_transcurrido' => $notificacion->tiempo_transcurrido,
            'fecha_envio' => $notificacion->fecha_envio->toISOString(),
            'fecha_leido' => $notificacion->fecha_leido?->toISOString(),
            'data' => $notificacion->data,
            'accion' => $notificacion->obtenerAccion(),
            'ruta' => $notificacion->obtenerRuta(),
            'parametros' => $notificacion->obtenerParametros(),
        ];
    }
}