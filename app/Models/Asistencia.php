<?php
// app/Models/Asistencia.php
class Asistencia extends Model
{
    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }
}

// app/Models/Nomina.php
class Nomina extends Model
{
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleNomina::class);
    }
}

// app/Models/DetalleNomina.php
class DetalleNomina extends Model
{
    public function nomina(): BelongsTo
    {
        return $this->belongsTo(Nomina::class);
    }
    
    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }
}

// app/Models/Vacacion.php
class Vacacion extends Model
{
    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }
}

// app/Models/Caja.php
class Caja extends Model
{
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }
    
    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoCaja::class);
    }
}

// app/Models/MovimientoCaja.php
class MovimientoCaja extends Model
{
    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }
    
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

// app/Models/SincronizacionMovil.php
class SincronizacionMovil extends Model
{
    protected $table = 'sincronizacion_movil';
    
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}