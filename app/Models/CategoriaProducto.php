<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaProducto extends Model
{
    protected $table = 'categorias_productos';
    
    // AGREGAR ESTA LÍNEA PARA ACCESORS
    protected $appends = ['descripcion_itbis', 'itbis_formateado'];
    
    protected $fillable = [
        'nombre',
        'codigo',
        'itbis_porcentaje',
        'tasa_itbis',
        'descripcion'
    ];
    
    protected $casts = [
        'itbis_porcentaje' => 'decimal:2',
    ];
    
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
    
    // ACCESSORS PARA FRONTEND
    public function getDescripcionItbisAttribute(): string
    {
        $descripciones = [
            'ITBIS1' => 'ITBIS 18% (General)',
            'ITBIS2' => 'ITBIS 16% (Turismo)',
            'ITBIS3' => 'ITBIS 0% (Selectivos)',
            'EXENTO' => 'Exento',
        ];
        
        return $descripciones[$this->tasa_itbis] ?? 'ITBIS 18%';
    }
    
    public function getItbisFormateadoAttribute(): string
    {
        if ($this->tasa_itbis === 'EXENTO') {
            return '0.00%';
        }
        
        return number_format($this->itbis_porcentaje, 2) . '%';
    }
}