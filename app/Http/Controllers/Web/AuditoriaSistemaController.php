<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditoriaSistema;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AuditoriaSistemaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AuditoriaSistema::with(['usuario'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('modulo')) {
            $query->where('modulo', $request->modulo);
        }

        if ($request->filled('accion')) {
            $query->where('accion', $request->accion);
        }

        if ($request->filled('nivel_importancia')) {
            $query->where('nivel_importancia', $request->nivel_importancia);
        }

        if ($request->filled('resultado')) {
            $query->where('resultado', $request->resultado);
        }

        if ($request->filled('fecha_inicio')) {
            $query->whereDate('created_at', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('created_at', '<=', $request->fecha_fin);
        }

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function($q) use ($busqueda) {
                $q->where('descripcion', 'like', "%{$busqueda}%")
                  ->orWhere('controlador', 'like', "%{$busqueda}%")
                  ->orWhere('url', 'like', "%{$busqueda}%")
                  ->orWhereHas('usuario', function($user) use ($busqueda) {
                      $user->where('name', 'like', "%{$busqueda}%");
                  });
            });
        }

        $actividades = $query->paginate(50);

        // Estadísticas
        $estadisticas = AuditoriaSistema::obtenerEstadisticas('dia');

        // Opciones para filtros
        $usuarios = User::orderBy('name')->get(['id', 'name']);
        $modulos = AuditoriaSistema::distinct('modulo')->pluck('modulo');
        $acciones = AuditoriaSistema::distinct('accion')->pluck('accion');
        $niveles = ['info', 'warning', 'error', 'critical', 'debug'];
        $resultados = ['success', 'error', 'warning'];

        return Inertia::render('AuditoriaSistema/Index', [
            'actividades' => $actividades,
            'estadisticas' => $estadisticas,
            'usuarios' => $usuarios,
            'modulos' => $modulos,
            'acciones' => $acciones,
            'niveles' => $niveles,
            'resultados' => $resultados,
            'filters' => $request->only([
                'user_id', 'modulo', 'accion', 'nivel_importancia', 
                'resultado', 'fecha_inicio', 'fecha_fin', 'busqueda'
            ])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('AuditoriaSistema/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Este método probablemente no se usará ya que el registro es automático
        return redirect()->route('auditoria-sistema.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(AuditoriaSistema $auditoriaSistema)
    {
        $auditoriaSistema->load(['usuario']);

        return Inertia::render('AuditoriaSistema/Show', [
            'actividad' => $auditoriaSistema
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AuditoriaSistema $auditoriaSistema)
    {
        // Las auditorías de sistema no deberían editarse
        return redirect()->route('auditoria-sistema.show', $auditoriaSistema)
            ->with('warning', 'Las auditorías de sistema son de solo lectura');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuditoriaSistema $auditoriaSistema)
    {
        // Las auditorías de sistema no deberían actualizarse
        return redirect()->route('auditoria-sistema.show', $auditoriaSistema)
            ->with('warning', 'Las auditorías de sistema son de solo lectura');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditoriaSistema $auditoriaSistema)
    {
        try {
            $auditoriaSistema->delete();

            return redirect()
                ->route('auditoria-sistema.index')
                ->with('success', 'Registro de auditoría eliminado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al eliminar registro: ' . $e->getMessage());
        }
    }

    /**
     * Exportar actividades
     */
    public function exportar(Request $request)
    {
        $query = AuditoriaSistema::with(['usuario']);

        // Aplicar los mismos filtros que en index
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('modulo')) {
            $query->where('modulo', $request->modulo);
        }
        if ($request->filled('accion')) {
            $query->where('accion', $request->accion);
        }
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('created_at', '>=', $request->fecha_inicio);
        }
        if ($request->filled('fecha_fin')) {
            $query->whereDate('created_at', '<=', $request->fecha_fin);
        }

        $actividades = $query->get();

        // Aquí podrías generar un Excel o CSV
        // Por ahora, retornamos una vista simple
        return Inertia::render('AuditoriaSistema/Export', [
            'actividades' => $actividades,
            'total' => $actividades->count()
        ]);
    }

    /**
     * Limpiar registros antiguos
     */
    public function limpiar(Request $request)
    {
        $dias = $request->get('dias', 90);
        
        try {
            $eliminados = AuditoriaSistema::limpiarRegistrosAntiguos($dias);

            return back()
                ->with('success', "Se eliminaron {$eliminados} registros antiguos");

        } catch (\Exception $e) {
            return back()
                ->with('error', 'Error al limpiar registros: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas en tiempo real
     */
    public function estadisticas(Request $request)
    {
        $periodo = $request->get('periodo', 'dia');
        $estadisticas = AuditoriaSistema::obtenerEstadisticas($periodo);

        return response()->json($estadisticas);
    }

    /**
     * Obtener actividades en tiempo real (para dashboard)
     */
    public function actividadesRecientes(Request $request)
    {
        $limite = $request->get('limite', 10);
        
        $actividades = AuditoriaSistema::with(['usuario'])
            ->orderBy('created_at', 'desc')
            ->limit($limite)
            ->get();

        return response()->json($actividades);
    }

    /**
     * Buscar actividades (API)
     */
    public function buscar(Request $request)
    {
        $query = $request->get('q');
        $limite = $request->get('limite', 20);
        
        $actividades = AuditoriaSistema::with(['usuario'])
            ->where(function($q) use ($query) {
                $q->where('descripcion', 'like', "%{$query}%")
                  ->orWhere('controlador', 'like', "%{$query}%")
                  ->orWhere('url', 'like', "%{$query}%")
                  ->orWhereHas('usuario', function($user) use ($query) {
                      $user->where('name', 'like', "%{$query}%");
                  });
            })
            ->orderBy('created_at', 'desc')
            ->limit($limite)
            ->get();

        return response()->json($actividades);
    }

    /**
     * Dashboard de auditoría de sistema
     */
    public function dashboard(Request $request)
    {
        $periodo = $request->get('periodo', 'semana');
        
        // Estadísticas principales
        $estadisticas = AuditoriaSistema::obtenerEstadisticas($periodo);
        
        // Actividades recientes
        $actividadesRecientes = AuditoriaSistema::with(['usuario'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        // Usuarios más activos
        $usuariosActivos = AuditoriaSistema::with(['usuario'])
            ->where('created_at', '>=', match($periodo) {
                'dia' => now()->startOfDay(),
                'semana' => now()->startOfWeek(),
                'mes' => now()->startOfMonth(),
                'año' => now()->startOfYear(),
                default => now()->startOfWeek()
            })
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Módulos más utilizados
        $modulosPopulares = AuditoriaSistema::where('created_at', '>=', match($periodo) {
            'dia' => now()->startOfDay(),
            'semana' => now()->startOfWeek(),
            'mes' => now()->startOfMonth(),
            'año' => now()->startOfYear(),
            default => now()->startOfWeek()
        })
            ->selectRaw('modulo, count(*) as count')
            ->groupBy('modulo')
            ->orderBy('count', 'desc')
            ->get();

        // Errores críticos recientes
        $erroresCriticos = AuditoriaSistema::with(['usuario'])
            ->where('nivel_importancia', 'critical')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('AuditoriaSistema/Dashboard', [
            'estadisticas' => $estadisticas,
            'actividadesRecientes' => $actividadesRecientes,
            'usuariosActivos' => $usuariosActivos,
            'modulosPopulares' => $modulosPopulares,
            'erroresCriticos' => $erroresCriticos,
            'periodo' => $periodo
        ]);
    }
}
