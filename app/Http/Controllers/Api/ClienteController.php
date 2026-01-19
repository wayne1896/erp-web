<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{
    /**
     * GET /api/clientes
     * Lista de clientes para Android
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search', '');
            $limit = $request->query('limit', 20);
            
            $clientes = Cliente::when($search, function($query, $search) {
                    return $query->where('nombre_completo', 'like', "%{$search}%")
                                ->orWhere('cedula_rnc', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('codigo', 'like', "%{$search}%");
                })
                ->where('activo', true)
                ->select([
                    'id',
                    'codigo',
                    'tipo_cliente',
                    'nombre_completo',
                    'cedula_rnc',
                    'telefono',
                    'telefono_alternativo',
                    'email',
                    'direccion',
                    'provincia',
                    'municipio',
                    'sector',
                    'tipo_contribuyente',
                    'limite_credito',
                    'dias_credito',
                    'descuento',
                    'saldo_pendiente',
                    'created_at'
                ])
                ->orderBy('nombre_completo')
                ->limit($limit)
                ->get()
                ->map(function (Cliente $cliente) {
                    return [
                        'id' => $cliente->id,
                        'codigo' => $cliente->codigo,
                        'tipo_cliente' => $cliente->tipo_cliente,
                        'tipo_cliente_texto' => $cliente->tipo_cliente === 'NATURAL' ? 'Persona Física' : 'Persona Jurídica',
                        'nombre_completo' => $cliente->nombre_completo,
                        'cedula_rnc' => $cliente->cedula_rnc,
                        'telefono' => $cliente->telefono,
                        'telefono_alternativo' => $cliente->telefono_alternativo,
                        'email' => $cliente->email,
                        'direccion' => $cliente->direccion,
                        'provincia' => $cliente->provincia,
                        'municipio' => $cliente->municipio,
                        'sector' => $cliente->sector,
                        'tipo_contribuyente' => $cliente->tipo_contribuyente,
                        'tipo_contribuyente_texto' => $this->getTipoContribuyenteTexto($cliente->tipo_contribuyente),
                        'limite_credito' => (float) $cliente->limite_credito,
                        'dias_credito' => (int) $cliente->dias_credito,
                        'descuento' => (float) $cliente->descuento,
                        'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                        'credito_disponible' => max(0, (float) $cliente->limite_credito - (float) $cliente->saldo_pendiente),
                        'fecha_registro' => $cliente->created_at->format('Y-m-d'),
                        'estado_credito' => $this->determinarEstadoCredito($cliente),
                        'ventas_totales' => $cliente->ventas()->count(),
                        'monto_total_compras' => (float) $cliente->ventas()->sum('total'),
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $clientes->count(),
                'data' => $clientes
            ]);

        } catch (\Throwable $e) {
            Log::error('Error al obtener clientes API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/clientes/{id}
     * Cliente individual
     */
    public function show($id): JsonResponse
    {
        try {
            $cliente = Cliente::with(['ventas' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }])->findOrFail($id);

            $ventas_recientes = $cliente->ventas->map(function ($venta) {
                return [
                    'id' => $venta->id,
                    'numero_factura' => $venta->numero_factura,
                    'fecha' => $venta->created_at->format('Y-m-d H:i'),
                    'total' => (float) $venta->total,
                    'estado' => $venta->estado,
                    'metodo_pago' => $venta->metodo_pago,
                ];
            });

            $estadisticas = [
                'total_ventas' => $cliente->ventas()->count(),
                'monto_total' => (float) $cliente->ventas()->sum('total'),
                'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                'ventas_mes_actual' => $cliente->ventas()
                    ->whereMonth('created_at', now()->month)
                    ->count(),
                'monto_mes_actual' => (float) $cliente->ventas()
                    ->whereMonth('created_at', now()->month)
                    ->sum('total'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'cliente' => $this->formatClienteParaAndroid($cliente),
                    'ventas_recientes' => $ventas_recientes,
                    'estadisticas' => $estadisticas,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }
    }

    /**
     * POST /api/clientes/buscar
     * Buscar clientes para autocomplete (más completo)
     */
    public function buscar(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $modo = $request->get('modo', 'nombre');
            $limit = $request->get('limit', 20);

            if (!$query || strlen($query) < 2) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'count' => 0
                ]);
            }

            $clientes = Cliente::where('activo', true)
                ->when($modo === 'cedula', function($q) use ($query) {
                    return $q->where('cedula_rnc', 'like', "%{$query}%");
                })
                ->when($modo === 'email', function($q) use ($query) {
                    return $q->where('email', 'like', "%{$query}%");
                })
                ->when($modo === 'codigo', function($q) use ($query) {
                    return $q->where('codigo', 'like', "%{$query}%");
                })
                ->when($modo === 'nombre', function($q) use ($query) {
                    return $q->where('nombre_completo', 'like', "%{$query}%");
                })
                ->select([
                    'id',
                    'codigo',
                    'tipo_cliente',
                    'nombre_completo',
                    'cedula_rnc',
                    'telefono',
                    'email',
                    'direccion',
                    'limite_credito',
                    'saldo_pendiente'
                ])
                ->limit($limit)
                ->get()
                ->map(function($cliente) {
                    return [
                        'id' => $cliente->id,
                        'codigo' => $cliente->codigo,
                        'tipo' => $cliente->tipo_cliente === 'NATURAL' ? 'FISICA' : 'JURIDICA',
                        'tipo_cliente' => $cliente->tipo_cliente,
                        'cedula_rnc' => $cliente->cedula_rnc,
                        'nombre_completo' => $cliente->nombre_completo,
                        'email' => $cliente->email,
                        'telefono' => $cliente->telefono,
                        'direccion' => $cliente->direccion,
                        'limite_credito' => (float) $cliente->limite_credito,
                        'saldo_pendiente' => (float) $cliente->saldo_pendiente,
                        'credito_disponible' => max(0, (float) $cliente->limite_credito - (float) $cliente->saldo_pendiente),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $clientes,
                'count' => $clientes->count()
            ]);

        } catch (\Throwable $e) {
            Log::error('Error buscando clientes API', [
                'error' => $e->getMessage(),
                'query' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al buscar clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/clientes
     * Crear cliente desde Android
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'tipo_cliente' => 'required|in:NATURAL,JURIDICO',
                'nombre_completo' => 'required|string|max:255',
                'cedula_rnc' => 'required|string|max:20|unique:clientes,cedula_rnc',
                'telefono' => 'required|string|max:10',
                'telefono_alternativo' => 'nullable|string|max:10',
                'email' => 'nullable|email|max:255',
                'direccion' => 'required|string',
                'provincia' => 'required|string',
                'municipio' => 'required|string',
                'sector' => 'required|string',
                'tipo_contribuyente' => 'required|in:CONSUMIDOR_FINAL,CREDITO_FISCAL,GUBERNAMENTAL',
            ]);

            // Generar código único
            $ultimoCliente = Cliente::orderBy('id', 'desc')->first();
            $numero = $ultimoCliente ? intval(preg_replace('/[^0-9]/', '', $ultimoCliente->codigo)) + 1 : 1;
            $codigo = 'CLI' . str_pad($numero, 6, '0', STR_PAD_LEFT);

            $cliente = Cliente::create(array_merge($validated, [
                'codigo' => $codigo,
                'activo' => true,
                'limite_credito' => 0,
                'dias_credito' => 0,
                'descuento' => 0,
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'data' => $this->formatClienteParaAndroid($cliente)
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Error creando cliente API', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/clientes/estadisticas
     * Estadísticas generales de clientes
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $total = Cliente::count();
            $activos = Cliente::where('activo', true)->count();
            $conCredito = Cliente::where('limite_credito', '>', 0)->count();
            $deudores = Cliente::where('saldo_pendiente', '>', 0)->count();
            
            $clientesNuevosMes = Cliente::whereMonth('created_at', now()->month)->count();
            $clientesTop = Cliente::withCount('ventas')
                ->orderBy('ventas_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function($cliente) {
                    return [
                        'id' => $cliente->id,
                        'nombre' => $cliente->nombre_completo,
                        'ventas_count' => $cliente->ventas_count,
                        'monto_total' => (float) $cliente->ventas()->sum('total'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'activos' => $activos,
                    'con_credito' => $conCredito,
                    'deudores' => $deudores,
                    'clientes_nuevos_mes' => $clientesNuevosMes,
                    'top_clientes' => $clientesTop,
                    'distribucion_tipo' => [
                        'natural' => Cliente::where('tipo_cliente', 'NATURAL')->count(),
                        'juridico' => Cliente::where('tipo_cliente', 'JURIDICO')->count(),
                    ],
                ]
            ]);

        } catch (\Throwable $e) {
            Log::error('Error obteniendo estadísticas clientes', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }

    /**
     * Helper: Formatear cliente para Android
     */
    private function formatClienteParaAndroid(Cliente $cliente): array
    {
        return [
            'id' => $cliente->id,
            'codigo' => $cliente->codigo,
            'tipo_cliente' => $cliente->tipo_cliente,
            'tipo_cliente_texto' => $cliente->tipo_cliente === 'NATURAL' ? 'Persona Física' : 'Persona Jurídica',
            'nombre_completo' => $cliente->nombre_completo,
            'cedula_rnc' => $cliente->cedula_rnc,
            'telefono' => $cliente->telefono,
            'telefono_alternativo' => $cliente->telefono_alternativo,
            'email' => $cliente->email,
            'direccion' => $cliente->direccion,
            'provincia' => $cliente->provincia,
            'municipio' => $cliente->municipio,
            'sector' => $cliente->sector,
            'tipo_contribuyente' => $cliente->tipo_contribuyente,
            'tipo_contribuyente_texto' => $this->getTipoContribuyenteTexto($cliente->tipo_contribuyente),
            'limite_credito' => (float) $cliente->limite_credito,
            'dias_credito' => (int) $cliente->dias_credito,
            'descuento' => (float) $cliente->descuento,
            'saldo_pendiente' => (float) $cliente->saldo_pendiente,
            'credito_disponible' => max(0, (float) $cliente->limite_credito - (float) $cliente->saldo_pendiente),
            'activo' => (bool) $cliente->activo,
            'fecha_registro' => $cliente->created_at->format('Y-m-d'),
            'fecha_actualizacion' => $cliente->updated_at->format('Y-m-d'),
            'estado_credito' => $this->determinarEstadoCredito($cliente),
        ];
    }

    /**
     * Helper: Determinar estado de crédito
     */
    private function determinarEstadoCredito(Cliente $cliente): array
    {
        $limite = (float) $cliente->limite_credito;
        $saldo = (float) $cliente->saldo_pendiente;
        $disponible = max(0, $limite - $saldo);

        if ($limite <= 0) {
            return [
                'nivel' => 'sin_credito',
                'color' => '#9e9e9e', // Gris
                'texto' => 'Sin crédito',
                'alerta' => false,
                'porcentaje_uso' => 0
            ];
        }

        $porcentajeUso = $limite > 0 ? ($saldo / $limite) * 100 : 0;

        if ($saldo >= $limite) {
            return [
                'nivel' => 'limite_alcanzado',
                'color' => '#f44336', // Rojo
                'texto' => 'Límite alcanzado',
                'alerta' => true,
                'porcentaje_uso' => round($porcentajeUso, 2)
            ];
        }

        if ($porcentajeUso >= 80) {
            return [
                'nivel' => 'alto_uso',
                'color' => '#ff9800', // Naranja
                'texto' => 'Alto uso de crédito',
                'alerta' => true,
                'porcentaje_uso' => round($porcentajeUso, 2)
            ];
        }

        return [
            'nivel' => 'bueno',
            'color' => '#4caf50', // Verde
            'texto' => 'Crédito disponible',
            'alerta' => false,
            'porcentaje_uso' => round($porcentajeUso, 2)
        ];
    }

    /**
     * Helper: Obtener texto de tipo contribuyente
     */
    private function getTipoContribuyenteTexto(string $tipo): string
    {
        return match($tipo) {
            'CONSUMIDOR_FINAL' => 'Consumidor Final',
            'CREDITO_FISCAL' => 'Crédito Fiscal',
            'GUBERNAMENTAL' => 'Gubernamental',
            default => $tipo,
        };
    }
}