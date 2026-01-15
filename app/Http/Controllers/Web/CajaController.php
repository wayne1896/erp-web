<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Caja;
use App\Models\MovimientoCaja;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CajaController extends Controller
{
    /**
     * Mostrar estado de caja
     */
    public function index()
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        $cajaActual = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->whereNull('fecha_cierre')
            ->first();
            
        $cajasHoy = Caja::with(['usuario', 'cerradaPor'])
            ->where('sucursal_id', $sucursalId)
            ->whereDate('fecha_apertura', today())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Caja/Index', [
            'cajaActual' => $cajaActual,
            'cajasHoy' => $cajasHoy,
            'sucursal' => Sucursal::find($sucursalId),
        ]);
    }
    
    /**
     * Formulario para abrir caja
     */
    public function create()
    {
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Verificar si ya tiene caja abierta
        $cajaAbierta = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->whereNull('fecha_cierre')
            ->exists();
            
        if ($cajaAbierta) {
            return redirect()->route('caja.index')
                ->with('error', 'Ya tienes una caja abierta');
        }
        
        return Inertia::render('Caja/Create', [
            'sucursal' => Sucursal::find($sucursalId),
            'ultimaCaja' => Caja::where('sucursal_id', $sucursalId)
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first(),
        ]);
    }
    
    /**
     * Abrir caja
     */
    public function store(Request $request)
    {
        $request->validate([
            'monto_inicial' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string|max:500',
        ]);
        
        $user = auth()->user();
        $sucursalId = $user->sucursal_id;
        
        // Verificar si ya tiene caja abierta
        $cajaAbierta = Caja::where('sucursal_id', $sucursalId)
            ->where('user_id', $user->id)
            ->where('estado', 'abierta')
            ->whereNull('fecha_cierre')
            ->exists();
            
        if ($cajaAbierta) {
            return redirect()->route('caja.index')
                ->with('error', 'Ya tienes una caja abierta');
        }
        
        DB::transaction(function () use ($request, $user, $sucursalId) {
            // Crear caja
            $caja = Caja::create([
                'sucursal_id' => $sucursalId,
                'user_id' => $user->id,
                'monto_inicial' => $request->monto_inicial,
                'efectivo' => $request->monto_inicial,
                'estado' => 'abierta',
                'fecha_apertura' => now(),
                'observaciones' => $request->observaciones,
            ]);
            
            // Registrar movimiento de apertura
            MovimientoCaja::create([
                'caja_id' => $caja->id,
                'tipo' => 'APERTURA',
                'monto' => $request->monto_inicial,
                'descripcion' => 'Apertura de caja',
                'user_id' => $user->id,
            ]);
        });
        
        return redirect()->route('caja.index')
            ->with('success', 'Caja abierta exitosamente');
    }
    
    /**
     * Formulario para cerrar caja
     */
    public function edit(Caja $caja)
    {
        $user = auth()->user();
        
        // Verificar permisos
        if ($caja->user_id !== $user->id || $caja->estado !== 'abierta') {
            return redirect()->route('caja.index')
                ->with('error', 'No puedes cerrar esta caja');
        }
        
        // Calcular resumen
        $resumen = [
            'monto_inicial' => (float) $caja->monto_inicial,
            'total_ventas' => (float) $caja->calcularTotalVentas(),
            'total_ingresos' => (float) $caja->obtenerTotalIngresos(),
            'total_egresos' => (float) $caja->obtenerTotalEgresos(),
            'efectivo_teorico' => (float) $caja->calcularEfectivoTeorico(),
            'efectivo_actual' => (float) $caja->efectivo,
        ];
        
        return Inertia::render('Caja/Cerrar', [
            'caja' => $caja,
            'resumen' => $resumen,
            'movimientos' => $caja->movimientos()->orderBy('created_at', 'desc')->get(),
            'ventas' => $caja->ventas()->with(['cliente'])->get(),
            'sucursal' => $caja->sucursal, // Asegúrate de incluir esto
        ]);
    }
    
    /**
     * Cerrar caja
     */
    public function update(Request $request, Caja $caja)
    {
        $request->validate([
            'efectivo_final' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string|max:500',
        ]);
        
        $user = auth()->user();
        
        // Verificar permisos
        if ($caja->user_id !== $user->id || $caja->estado !== 'abierta') {
            return redirect()->route('caja.index')
                ->with('error', 'No puedes cerrar esta caja');
        }
        
        DB::transaction(function () use ($request, $caja, $user) {
            // Calcular diferencias
            $totalVentas = $caja->calcularTotalVentas();
            $totalIngresos = $caja->obtenerTotalIngresos();
            $totalEgresos = $caja->obtenerTotalEgresos();
            
            $efectivoTeorico = $caja->monto_inicial + $totalVentas + $totalIngresos - $totalEgresos;
            $diferencia = $request->efectivo_final - $efectivoTeorico;
            
            $caja->update([
                'total_ventas' => $totalVentas,
                'total_ingresos' => $totalIngresos,
                'total_egresos' => $totalEgresos,
                'efectivo' => $request->efectivo_final,
                'diferencia' => $diferencia,
                'estado' => 'cerrada',
                'fecha_cierre' => now(),
                'cerrada_por_id' => $user->id,
                'observaciones' => $request->observaciones ?: $caja->observaciones,
            ]);
            
            // Registrar movimiento de cierre
            MovimientoCaja::create([
                'caja_id' => $caja->id,
                'tipo' => 'CIERRE',
                'monto' => $request->efectivo_final,
                'descripcion' => 'Cierre de caja',
                'user_id' => $user->id,
            ]);
        });
        
        return redirect()->route('caja.index')
            ->with('success', 'Caja cerrada exitosamente');
    }
    
    /**
     * Mostrar movimientos de caja
     */
    public function movimientos(Caja $caja)
    {
        $user = auth()->user();
        
        // Verificar permisos
        if ($caja->user_id !== $user->id && $user->role !== 'admin') {
            return redirect()->route('caja.index')
                ->with('error', 'No tienes permisos para ver estos movimientos');
        }
        
        return Inertia::render('Caja/Movimientos', [
            'caja' => $caja,
            'movimientos' => $caja->movimientos()
                ->with(['usuario'])
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }
    
    /**
     * Registrar ingreso
     */
    public function registrarIngreso(Request $request, Caja $caja)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'required|string|max:255',
            'referencia' => 'nullable|string|max:100',
        ]);
        
        if ($caja->estado !== 'abierta') {
            return back()->with('error', 'La caja debe estar abierta');
        }
        
        $movimiento = MovimientoCaja::create([
            'caja_id' => $caja->id,
            'tipo' => 'INGRESO',
            'monto' => $request->monto,
            'descripcion' => $request->descripcion,
            'referencia' => $request->referencia,
            'user_id' => auth()->id(),
        ]);
        
        $caja->increment('efectivo', $request->monto);
        
        return back()->with('success', 'Ingreso registrado exitosamente');
    }
    /**
 * Reporte de caja
 */
public function reporteCaja(Request $request)
{
    $user = auth()->user();
    $sucursalId = $user->sucursal_id;
    
    $fechaInicio = $request->get('fecha_inicio', date('Y-m-01'));
    $fechaFin = $request->get('fecha_fin', date('Y-m-d'));
    
    $cajas = Caja::where('sucursal_id', $sucursalId)
        ->whereBetween('fecha_apertura', [$fechaInicio, $fechaFin])
        ->with(['user'])
        ->orderBy('fecha_apertura', 'desc')
        ->paginate(20);
    
    return Inertia::render('Caja/Reporte', [
        'cajas' => $cajas,
        'fechaInicio' => $fechaInicio,
        'fechaFin' => $fechaFin,
    ]);
}
    /**
     * Registrar egreso
     */
    public function registrarEgreso(Request $request, Caja $caja)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'required|string|max:255',
            'referencia' => 'nullable|string|max:100',
        ]);
        
        if ($caja->estado !== 'abierta') {
            return back()->with('error', 'La caja debe estar abierta');
        }
        
        // Verificar que haya suficiente efectivo
        if ($request->monto > $caja->efectivo) {
            return back()->with('error', 'No hay suficiente efectivo en caja');
        }
        
        $movimiento = MovimientoCaja::create([
            'caja_id' => $caja->id,
            'tipo' => 'EGRESO',
            'monto' => $request->monto,
            'descripcion' => $request->descripcion,
            'referencia' => $request->referencia,
            'user_id' => auth()->id(),
        ]);
        
        $caja->decrement('efectivo', $request->monto);
        
        return back()->with('success', 'Egreso registrado exitosamente');
    }
}