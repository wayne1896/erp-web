<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditoriaCaja;
use App\Models\Caja;
use App\Models\User;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AuditoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AuditoriaCaja::with(['caja.sucursal', 'usuario', 'revisadoPor'])
            ->orderBy('fecha_auditoria', 'desc');

        // Filtros
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('resultado')) {
            $query->where('resultado', $request->resultado);
        }

        if ($request->filled('tipo_auditoria')) {
            $query->where('tipo_auditoria', $request->tipo_auditoria);
        }

        if ($request->filled('fecha_inicio')) {
            $query->whereDate('fecha_auditoria', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('fecha_auditoria', '<=', $request->fecha_fin);
        }

        if ($request->filled('caja_id')) {
            $query->where('caja_id', $request->caja_id);
        }

        $auditorias = $query->paginate(20);

        // Estadísticas para filtros
        $estadisticas = [
            'total' => AuditoriaCaja::count(),
            'completadas' => AuditoriaCaja::where('estado', 'completada')->count(),
            'con_discrepancias' => AuditoriaCaja::where('estado', 'con_discrepancias')->count(),
            'criticas' => AuditoriaCaja::where('resultado', 'fraude')->count(),
            'hoy' => AuditoriaCaja::whereDate('fecha_auditoria', today())->count(),
        ];

        return Inertia::render('Auditoria/Index', [
            'auditorias' => $auditorias,
            'filters' => $request->only(['estado', 'resultado', 'tipo_auditoria', 'fecha_inicio', 'fecha_fin', 'caja_id']),
            'estadisticas' => $estadisticas
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cajas = Caja::with(['sucursal', 'usuario'])
            ->where('estado', 'abierta')
            ->orWhere('estado', 'cerrada')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Auditoria/Create', [
            'cajas' => $cajas
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'caja_id' => 'required|exists:cajas,id',
            'tipo_auditoria' => 'required|in:automatica,manual,programada',
            'observaciones' => 'nullable|string',
        ]);

        try {
            $caja = Caja::findOrFail($validated['caja_id']);
            $auditoria = AuditoriaCaja::auditarCaja($caja, $validated['tipo_auditoria']);

            if ($validated['observaciones']) {
                $auditoria->observaciones = $validated['observaciones'];
                $auditoria->save();
            }

            return redirect()
                ->route('auditoria.show', $auditoria->id)
                ->with('success', 'Auditoría creada exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al crear auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AuditoriaCaja $auditoria)
    {
        $auditoria->load([
            'caja.sucursal',
            'caja.usuario',
            'usuario',
            'revisadoPor',
            'detalles.movimiento'
        ]);

        return Inertia::render('Auditoria/Show', [
            'auditoria' => $auditoria
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AuditoriaCaja $auditoria)
    {
        $auditoria->load(['caja.sucursal', 'caja.usuario']);

        return Inertia::render('Auditoria/Edit', [
            'auditoria' => $auditoria
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuditoriaCaja $auditoria)
    {
        $validated = $request->validate([
            'observaciones' => 'nullable|string',
            'estado' => 'sometimes|in:pendiente,en_proceso,completada,con_discrepancias,rechazada',
            'resultado' => 'sometimes|in:ok,advertencia,error,fraude',
        ]);

        try {
            $auditoria->update($validated);

            return redirect()
                ->route('auditoria.show', $auditoria->id)
                ->with('success', 'Auditoría actualizada exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error al actualizar auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditoriaCaja $auditoria)
    {
        try {
            $auditoria->delete();

            return redirect()
                ->route('auditoria.index')
                ->with('success', 'Auditoría eliminada exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al eliminar auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Aprobar auditoría
     */
    public function aprobar(Request $request, AuditoriaCaja $auditoria)
    {
        $validated = $request->validate([
            'observaciones' => 'nullable|string',
        ]);

        try {
            $auditoria->aprobar(Auth::id(), $validated['observaciones']);

            return back()
                ->with('success', 'Auditoría aprobada exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al aprobar auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Rechazar auditoría
     */
    public function rechazar(Request $request, AuditoriaCaja $auditoria)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|min:10',
        ]);

        try {
            $auditoria->rechazar(Auth::id(), $validated['motivo']);

            return back()
                ->with('success', 'Auditoría rechazada exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al rechazar auditoría: ' . $e->getMessage());
        }
    }

    /**
     * Exportar auditoría
     */
    public function exportar(AuditoriaCaja $auditoria)
    {
        try {
            $auditoria->load(['caja.sucursal', 'caja.usuario', 'detalles.movimiento']);

            // Aquí podrías generar un PDF o Excel
            // Por ahora, redirigimos a una vista simple
            return Inertia::render('Auditoria/Export', [
                'auditoria' => $auditoria
            ]);

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al exportar auditoría: ' . $e->getMessage());
        }
    }

    /**
     * API: Buscar auditorías
     */
    public function buscar(Request $request)
    {
        $query = $request->get('q');
        
        $auditorias = AuditoriaCaja::with(['caja.sucursal', 'usuario'])
            ->where(function($q) use ($query) {
                $q->where('id', 'like', "%{$query}%")
                  ->orWhereHas('caja', function($caja) use ($query) {
                      $caja->where('id', 'like', "%{$query}%");
                  })
                  ->orWhereHas('usuario', function($user) use ($query) {
                      $user->where('name', 'like', "%{$query}%");
                  });
            })
            ->limit(10)
            ->get();

        return response()->json($auditorias);
    }

    /**
     * API: Estadísticas de auditoría
     */
    public function estadisticas(Request $request)
    {
        $periodo = $request->get('periodo', 'mes'); // dia, semana, mes, año

        $fecha = match($periodo) {
            'dia' => Carbon::today(),
            'semana' => Carbon::now()->startOfWeek(),
            'mes' => Carbon::now()->startOfMonth(),
            'año' => Carbon::now()->startOfYear(),
            default => Carbon::now()->startOfMonth()
        };

        $estadisticas = [
            'total' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)->count(),
            'completadas' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)->where('estado', 'completada')->count(),
            'con_discrepancias' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)->where('estado', 'con_discrepancias')->count(),
            'criticas' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)->where('resultado', 'fraude')->count(),
            'por_tipo' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)
                ->selectRaw('tipo_auditoria, count(*) as count')
                ->groupBy('tipo_auditoria')
                ->get(),
            'por_resultado' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)
                ->selectRaw('resultado, count(*) as count')
                ->groupBy('resultado')
                ->get(),
            'diferencia_promedio' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)
                ->avg('diferencia_total') ?? 0,
            'diferencia_total' => AuditoriaCaja::where('fecha_auditoria', '>=', $fecha)
                ->sum('diferencia_total') ?? 0,
        ];

        return response()->json($estadisticas);
    }

    /**
     * API: Ejecutar auditoría manual
     */
    public function ejecutar(Request $request)
    {
        $validated = $request->validate([
            'caja_id' => 'required|exists:cajas,id',
            'tipo' => 'required|in:automatica,manual,programada',
        ]);

        try {
            $caja = Caja::findOrFail($validated['caja_id']);
            $auditoria = AuditoriaCaja::auditarCaja($caja, $validated['tipo']);

            return response()->json([
                'success' => true,
                'auditoria' => $auditoria,
                'message' => 'Auditoría ejecutada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al ejecutar auditoría: ' . $e->getMessage()
            ], 500);
        }
    }
}
