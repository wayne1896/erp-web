<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        'company_name',
        'legal_name',
        'rnc',
        'address',
        'phone',
        'email',
        'website',
        'logo_path',
        'branch_name',
        'description',
        'industry',
        'taxpayer_type',
        'is_active',
    ];

    protected $appends = ['logo_url'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Obtener el perfil activo de la empresa
     */
    public static function getActive()
    {
        return static::where('is_active', true)->first();
    }

    /**
     * Obtener URL del logo
     */
    public function getLogoUrlAttribute()
    {
        if ($this->logo_path) {
            return asset('storage/' . $this->logo_path);
        }
        
        return null;
    }

    /**
     * Obtener nombre completo para mostrar
     */
    public function getDisplayNameAttribute()
    {
        return $this->company_name ?? $this->legal_name ?? 'Empresa';
    }
}
