<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    /**
     * Display the company profile.
     */
    public function index()
    {
        $profile = CompanyProfile::getActive();
        
        if ($profile) {
            \Log::info('Profile found with logo_path: ' . $profile->logo_path);
            \Log::info('Logo URL: ' . $profile->logo_url);
            
            // Asegurar que logo_url esté incluido
            $profile->makeVisible(['logo_url']);
        } else {
            \Log::info('No profile found');
        }
        
        return Inertia::render('CompanyProfile/Index', [
            'profile' => $profile
        ]);
    }

    /**
     * Show the form for editing the company profile.
     */
    public function edit()
    {
        $profile = CompanyProfile::getActive();
        
        if ($profile) {
            \Log::info('Edit - Profile found with logo_path: ' . $profile->logo_path);
            \Log::info('Edit - Logo URL: ' . $profile->logo_url);
            
            // Asegurar que logo_url esté incluido
            $profile->makeVisible(['logo_url']);
        } else {
            \Log::info('Edit - No profile found');
        }
        
        return Inertia::render('CompanyProfile/Edit', [
            'profile' => $profile
        ]);
    }

    /**
     * Update the company profile.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'rnc' => 'required|string|max:20|unique:company_profiles,rnc,' . $id,
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'website' => 'nullable|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'taxpayer_type' => 'required|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $profile = CompanyProfile::findOrFail($id);
        
        $profile->fill($request->except('logo'));
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            \Log::info('Logo file detected');
            
            // Delete old logo if exists
            if ($profile->logo_path) {
                Storage::disk('public')->delete($profile->logo_path);
                \Log::info('Old logo deleted: ' . $profile->logo_path);
            }
            
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $profile->logo_path = $logoPath;
            
            \Log::info('New logo saved: ' . $logoPath);
            \Log::info('Full logo URL: ' . asset('storage/' . $logoPath));
        } else {
            \Log::info('No logo file detected in request');
        }
        
        $profile->save();
        
        return redirect()->route('company-profile.index')
            ->with('success', 'Perfil de empresa actualizado exitosamente');
    }

    /**
     * Store a new company profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'rnc' => 'required|string|max:20|unique:company_profiles',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'website' => 'nullable|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'taxpayer_type' => 'required|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('logo');
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            \Log::info('Logo file detected in store');
            
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $data['logo_path'] = $logoPath;
            
            \Log::info('Logo saved in store: ' . $logoPath);
            \Log::info('Full logo URL: ' . asset('storage/' . $logoPath));
        } else {
            \Log::info('No logo file detected in store request');
        }
        
        CompanyProfile::create($data);
        
        return redirect()->route('company-profile.index')
            ->with('success', 'Perfil de empresa creado exitosamente');
    }

    /**
     * Get company profile data for API usage
     */
    public function getProfileData()
    {
        $profile = CompanyProfile::getActive();
        
        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'No hay perfil de empresa configurado'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'name' => $profile->display_name,
                'legal_name' => $profile->legal_name,
                'rnc' => $profile->rnc,
                'address' => $profile->address,
                'phone' => $profile->phone,
                'email' => $profile->email,
                'website' => $profile->website,
                'logo_url' => $profile->logo_url,
                'branch_name' => $profile->branch_name,
                'description' => $profile->description,
                'industry' => $profile->industry,
                'taxpayer_type' => $profile->taxpayer_type,
            ]
        ]);
    }
}
