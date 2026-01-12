<?php
// app/Services/PushNotificationService.php

namespace App\Services;

use App\Models\User;
use App\Models\Notificacion;
use App\Models\DispositivoPush;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PushNotificationService
{
    private $fcmKey;
    private $apnsKey;
    private $apnsTopic;
    
    public function __construct()
    {
        $this->fcmKey = config('services.fcm.key');
        $this->apnsKey = config('services.apns.key');
        $this->apnsTopic = config('services.apns.topic');
    }
    
    /**
     * Enviar notificación push a un usuario
     */
    public function enviarAUsuario(
        User $usuario,
        string $titulo,
        string $mensaje,
        string $tipo = Notificacion::TIPO_SISTEMA,
        string $nivel = Notificacion::NIVEL_MEDIA,
        array $data = [],
        string $canal = Notificacion::CANAL_PUSH
    ): bool {
        // Obtener dispositivos activos del usuario
        $dispositivos = $usuario->dispositivos()
            ->activos()
            ->recientes()
            ->get();
        
        if ($dispositivos->isEmpty()) {
            Log::warning('Usuario sin dispositivos activos para notificación', [
                'user_id' => $usuario->id,
                'titulo' => $titulo,
            ]);
            return false;
        }
        
        $resultados = [];
        $exitosos = 0;
        
        foreach ($dispositivos as $dispositivo) {
            try {
                $enviado = $this->enviarADispositivo($dispositivo, $titulo, $mensaje, $data, $tipo);
                
                if ($enviado) {
                    $exitosos++;
                }
                
                $resultados[$dispositivo->id] = $enviado;
                
            } catch (\Exception $e) {
                Log::error('Error enviando notificación push', [
                    'dispositivo_id' => $dispositivo->id,
                    'error' => $e->getMessage(),
                ]);
                $resultados[$dispositivo->id] = false;
            }
        }
        
        // Registrar notificación en base de datos
        $this->registrarNotificacion(
            $usuario->id,
            $titulo,
            $mensaje,
            $tipo,
            $nivel,
            $data,
            $canal,
            $exitosos > 0
        );
        
        // Actualizar contador de notificaciones sin leer
        if ($exitosos > 0) {
            $usuario->increment('notificaciones_sin_leer');
        }
        
        return $exitosos > 0;
    }
    
    /**
     * Enviar notificación push a múltiples usuarios
     */
    public function enviarAMultiplesUsuarios(
        array $userIds,
        string $titulo,
        string $mensaje,
        string $tipo = Notificacion::TIPO_SISTEMA,
        string $nivel = Notificacion::NIVEL_MEDIA,
        array $data = []
    ): array {
        $resultados = [
            'total_usuarios' => count($userIds),
            'notificaciones_enviadas' => 0,
            'notificaciones_fallidas' => 0,
            'detalles' => [],
        ];
        
        foreach ($userIds as $userId) {
            try {
                $usuario = User::find($userId);
                if (!$usuario) {
                    continue;
                }
                
                $enviado = $this->enviarAUsuario($usuario, $titulo, $mensaje, $tipo, $nivel, $data);
                
                if ($enviado) {
                    $resultados['notificaciones_enviadas']++;
                } else {
                    $resultados['notificaciones_fallidas']++;
                }
                
                $resultados['detalles'][$userId] = $enviado;
                
            } catch (\Exception $e) {
                Log::error('Error enviando notificación a usuario múltiple', [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
                $resultados['notificaciones_fallidas']++;
                $resultados['detalles'][$userId] = false;
            }
        }
        
        return $resultados;
    }
    
    /**
     * Enviar notificación push a un dispositivo específico
     */
    public function enviarADispositivo(
        DispositivoPush $dispositivo,
        string $titulo,
        string $mensaje,
        array $data = [],
        string $tipo = Notificacion::TIPO_SISTEMA
    ): bool {
        // Verificar preferencias del usuario
        $preferencias = $dispositivo->obtenerPreferenciasUsuario();
        
        if (!$this->verificarPreferencias($preferencias, $tipo)) {
            return false;
        }
        
        if (!$this->verificarHorario($preferencias)) {
            // Programar para más tarde
            $this->programarNotificacion($dispositivo, $titulo, $mensaje, $data, $tipo);
            return false;
        }
        
        // Preparar payload según plataforma
        $payload = $this->prepararPayload($dispositivo, $titulo, $mensaje, $data, $tipo);
        
        // Enviar según plataforma
        return match($dispositivo->plataforma) {
            DispositivoPush::PLATAFORMA_ANDROID => $this->enviarFCM($dispositivo->token, $payload),
            DispositivoPush::PLATAFORMA_IOS => $this->enviarAPNS($dispositivo->token, $payload),
            DispositivoPush::PLATAFORMA_WEB => $this->enviarWebPush($dispositivo->token, $payload),
            default => false,
        };
    }
    
    /**
     * Enviar notificación push por topic (broadcast)
     */
    public function enviarPorTopic(
        string $topic,
        string $titulo,
        string $mensaje,
        array $data = [],
        string $tipo = Notificacion::TIPO_SISTEMA
    ): bool {
        $payload = [
            'to' => '/topics/' . $topic,
            'notification' => [
                'title' => $titulo,
                'body' => $mensaje,
                'sound' => 'default',
                'badge' => '1',
            ],
            'data' => array_merge($data, [
                'tipo' => $tipo,
                'timestamp' => now()->timestamp,
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ]),
            'priority' => 'high',
        ];
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->fcmKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);
            
            $success = $response->successful() && $response->json('success') == 1;
            
            if (!$success) {
                Log::error('Error enviando notificación por topic', [
                    'topic' => $topic,
                    'response' => $response->json(),
                ]);
            }
            
            return $success;
            
        } catch (\Exception $e) {
            Log::error('Excepción enviando notificación por topic', [
                'topic' => $topic,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    /**
     * Enviar notificación de alerta de inventario
     */
    public function enviarAlertaInventario(
        User $usuario,
        string $productoNombre,
        int $stockActual,
        int $stockMinimo,
        string $sucursalNombre
    ): bool {
        $titulo = '⚠️ Alerta de Inventario';
        $mensaje = "{$productoNombre} bajo stock mínimo ({$stockActual}/{$stockMinimo}) en {$sucursalNombre}";
        
        $data = [
            'tipo' => Notificacion::TIPO_INVENTARIO,
            'nivel' => Notificacion::NIVEL_ALTA,
            'accion' => 'ver_inventario',
            'ruta' => '/inventario',
            'producto_nombre' => $productoNombre,
            'stock_actual' => $stockActual,
            'stock_minimo' => $stockMinimo,
            'sucursal' => $sucursalNombre,
        ];
        
        return $this->enviarAUsuario(
            $usuario,
            $titulo,
            $mensaje,
            Notificacion::TIPO_INVENTARIO,
            Notificacion::NIVEL_ALTA,
            $data
        );
    }
    
    /**
     * Enviar notificación de venta exitosa
     */
    public function enviarVentaExitosa(
        User $usuario,
        string $numeroFactura,
        float $monto,
        string $clienteNombre
    ): bool {
        $titulo = '✅ Venta Registrada';
        $mensaje = "Factura #{$numeroFactura} por RD$ " . number_format($monto, 2) . " a {$clienteNombre}";
        
        $data = [
            'tipo' => Notificacion::TIPO_VENTA,
            'nivel' => Notificacion::NIVEL_MEDIA,
            'accion' => 'ver_venta',
            'ruta' => '/ventas/' . $numeroFactura,
            'numero_factura' => $numeroFactura,
            'monto' => $monto,
            'cliente' => $clienteNombre,
        ];
        
        return $this->enviarAUsuario(
            $usuario,
            $titulo,
            $mensaje,
            Notificacion::TIPO_VENTA,
            Notificacion::NIVEL_MEDIA,
            $data
        );
    }
    
    /**
     * Enviar notificación de sincronización completada
     */
    public function enviarSincronizacionCompletada(
        User $usuario,
        int $registrosSincronizados,
        int $ventasOffline
    ): bool {
        $titulo = '🔄 Sincronización Exitosa';
        $mensaje = "Se sincronizaron {$registrosSincronizados} registros, incluyendo {$ventasOffline} ventas offline";
        
        $data = [
            'tipo' => Notificacion::TIPO_SINCRONIZACION,
            'nivel' => Notificacion::NIVEL_MEDIA,
            'accion' => 'ver_sincronizacion',
            'ruta' => '/sincronizacion',
            'registros_sincronizados' => $registrosSincronizados,
            'ventas_offline' => $ventasOffline,
        ];
        
        return $this->enviarAUsuario(
            $usuario,
            $titulo,
            $mensaje,
            Notificacion::TIPO_SINCRONIZACION,
            Notificacion::NIVEL_MEDIA,
            $data
        );
    }
    
    /**
     * Enviar notificación de caja abierta/cerrada
     */
    public function enviarEstadoCaja(
        User $usuario,
        string $estado,
        float $montoInicial = null,
        float $montoFinal = null
    ): bool {
        $titulo = $estado === 'abierta' ? '🏦 Caja Abierta' : '🏦 Caja Cerrada';
        $mensaje = $estado === 'abierta' 
            ? "Caja abierta con RD$ " . number_format($montoInicial, 2)
            : "Caja cerrada con RD$ " . number_format($montoFinal, 2);
        
        $data = [
            'tipo' => Notificacion::TIPO_CAJA,
            'nivel' => Notificacion::NIVEL_MEDIA,
            'accion' => 'ver_caja',
            'ruta' => '/caja',
            'estado' => $estado,
            'monto_inicial' => $montoInicial,
            'monto_final' => $montoFinal,
        ];
        
        return $this->enviarAUsuario(
            $usuario,
            $titulo,
            $mensaje,
            Notificacion::TIPO_CAJA,
            Notificacion::NIVEL_MEDIA,
            $data
        );
    }
    
    /**
     * Métodos privados auxiliares
     */
    private function enviarFCM(string $token, array $payload): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->fcmKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);
            
            $success = $response->successful() && $response->json('success') == 1;
            
            if (!$success) {
                Log::warning('FCM response error', [
                    'token' => substr($token, 0, 20) . '...',
                    'response' => $response->json(),
                ]);
                
                // Si el token es inválido, marcar dispositivo como inactivo
                if ($response->json('results.0.error') === 'InvalidRegistration' ||
                    $response->json('results.0.error') === 'NotRegistered') {
                    $this->marcarTokenInvalido($token);
                }
            }
            
            return $success;
            
        } catch (\Exception $e) {
            Log::error('Excepción enviando FCM', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    private function enviarAPNS(string $token, array $payload): bool
    {
        // Implementación para iOS APNS
        // Nota: Requiere certificados y configuración adicional
        try {
            // Usar biblioteca como apns-http2 o similar
            // Esta es una implementación simplificada
            
            Log::info('APNS notification sent (simulated)', [
                'token' => substr($token, 0, 20) . '...',
                'payload' => $payload,
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Error enviando APNS', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    private function enviarWebPush(string $token, array $payload): bool
    {
        // Implementación para Web Push (VAPID)
        try {
            // Usar biblioteca como minishlink/web-push
            // Esta es una implementación simplificada
            
            Log::info('Web Push notification sent (simulated)', [
                'token' => substr($token, 0, 20) . '...',
                'payload' => $payload,
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Error enviando Web Push', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    private function prepararPayload(
        DispositivoPush $dispositivo,
        string $titulo,
        string $mensaje,
        array $data,
        string $tipo
    ): array {
        $basePayload = [
            'notification' => [
                'title' => $titulo,
                'body' => $mensaje,
                'sound' => 'default',
                'badge' => '1',
            ],
            'data' => array_merge($data, [
                'tipo' => $tipo,
                'timestamp' => now()->timestamp,
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ]),
            'priority' => 'high',
        ];
        
        if ($dispositivo->plataforma === DispositivoPush::PLATAFORMA_ANDROID) {
            $basePayload['to'] = $dispositivo->token;
            $basePayload['android'] = [
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'erp_mobile_channel',
                    'sound' => 'default',
                    'vibrate' => '300,200,300',
                ],
            ];
        } elseif ($dispositivo->plataforma === DispositivoPush::PLATAFORMA_IOS) {
            $basePayload['to'] = $dispositivo->token;
            $basePayload['apns'] = [
                'headers' => [
                    'apns-priority' => '10',
                ],
                'payload' => [
                    'aps' => [
                        'alert' => [
                            'title' => $titulo,
                            'body' => $mensaje,
                        ],
                        'sound' => 'default',
                        'badge' => 1,
                        'category' => 'ERP_MOBILE',
                    ],
                ],
            ];
        }
        
        return $basePayload;
    }
    
    private function verificarPreferencias(array $preferencias, string $tipo): bool
    {
        // Verificar si el usuario tiene habilitado este tipo de notificación
        return match($tipo) {
            Notificacion::TIPO_VENTA => $preferencias['ventas'] ?? true,
            Notificacion::TIPO_INVENTARIO => $preferencias['inventario'] ?? true,
            Notificacion::TIPO_CLIENTE => $preferencias['clientes'] ?? true,
            Notificacion::TIPO_CAJA => $preferencias['caja'] ?? true,
            Notificacion::TIPO_SISTEMA => $preferencias['sistema'] ?? true,
            Notificacion::TIPO_PROMOCION => $preferencias['promociones'] ?? false,
            Notificacion::TIPO_ALERTA => true, // Las alertas siempre se envían
            default => true,
        };
    }
    
    private function verificarHorario(array $preferencias): bool
    {
        // Verificar si está dentro del horario permitido
        if ($preferencias['nocturno'] ?? false) {
            return true; // Modo nocturno: recibir a cualquier hora
        }
        
        $horaActual = now()->format('H:i');
        $horaInicio = $preferencias['hora_inicio'] ?? '08:00';
        $horaFin = $preferencias['hora_fin'] ?? '20:00';
        
        return $horaActual >= $horaInicio && $horaActual <= $horaFin;
    }
    
    private function programarNotificacion(
        DispositivoPush $dispositivo,
        string $titulo,
        string $mensaje,
        array $data,
        string $tipo
    ): void {
        // Programar notificación para horario permitido
        $preferencias = $dispositivo->obtenerPreferenciasUsuario();
        $horaInicio = $preferencias['hora_inicio'] ?? '08:00';
        
        DB::table('notificaciones_programadas')->insert([
            'dispositivo_id' => $dispositivo->id,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'data' => json_encode($data),
            'tipo' => $tipo,
            'programada_para' => now()->tomorrow()->setTime(
                explode(':', $horaInicio)[0],
                explode(':', $horaInicio)[1]
            ),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
    
    private function registrarNotificacion(
        int $userId,
        string $titulo,
        string $mensaje,
        string $tipo,
        string $nivel,
        array $data,
        string $canal,
        bool $enviada
    ): void {
        Notificacion::create([
            'user_id' => $userId,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'nivel' => $nivel,
            'data' => $data,
            'leido' => false,
            'fecha_envio' => now(),
            'fecha_expiracion' => now()->addDays(7),
            'canal' => $canal,
            'badge_count' => 1,
            'sound' => true,
            'vibration' => true,
            'priority' => $nivel === Notificacion::NIVEL_URGENTE ? 'high' : 'normal',
            'enviada' => $enviada,
        ]);
    }
    
    private function marcarTokenInvalido(string $token): void
    {
        DispositivoPush::where('token', $token)
            ->update(['estado' => DispositivoPush::ESTADO_INACTIVO]);
    }
}