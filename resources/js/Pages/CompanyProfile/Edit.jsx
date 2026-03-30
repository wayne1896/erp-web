import React, { useState, useRef } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ArrowLeft, Save, Building2, Phone, Mail, Globe, MapPin, 
    FileText, User, Shield, Database, Upload, AlertCircle,
    CheckCircle, Info, HelpCircle, CreditCard
} from 'lucide-react';

export default function Edit({ profile }) {
    const fileInputRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    const { data, setData, post, put, processing: formProcessing, errors } = useForm({
        company_name: profile?.company_name || '',
        legal_name: profile?.legal_name || '',
        rnc: profile?.rnc || '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        website: profile?.website || '',
        branch_name: profile?.branch_name || '',
        description: profile?.description || '',
        industry: profile?.industry || '',
        taxpayer_type: profile?.taxpayer_type || 'REGULAR',
        logo: null,
        logo_preview: profile?.logo_url || null,
    });

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setData('logo_preview', e.target.result);
                setData('logo', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Debug: Log current data
        console.log('Form data to submit:', data);

        // For updates, we need to use POST with _method=PUT for FormData
        if (profile) {
            const formData = new FormData();
            
            // Add _method first
            formData.append('_method', 'PUT');
            
            // Add all form fields except logo and logo_preview
            Object.keys(data).forEach(key => {
                if (key !== 'logo' && key !== 'logo_preview') {
                    formData.append(key, data[key]);
                    console.log(`Adding ${key}:`, data[key]);
                }
            });

            // Add logo file if it exists
            if (data.logo) {
                formData.append('logo', data.logo);
            }

            post(route('company-profile.update', profile.id), formData, {
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setProcessing(false);
                }
            });
        } else {
            // For new profiles
            const formData = new FormData();
            
            // Add all form fields except logo and logo_preview
            Object.keys(data).forEach(key => {
                if (key !== 'logo' && key !== 'logo_preview') {
                    formData.append(key, data[key]);
                }
            });

            // Add logo file if it exists
            if (data.logo) {
                formData.append('logo', data.logo);
            }

            post(route('company-profile.store'), formData, {
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setProcessing(false);
                }
            });
        }
    };

    const header = (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3.5 rounded-xl shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                        {profile ? 'Editar Perfil de Empresa' : 'Configurar Perfil de Empresa'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {profile ? 'Actualiza la información de tu empresa' : 'Configura los datos de tu empresa para las facturas'}
                    </p>
                </div>
            </div>
            
            <Link
                href={route('company-profile.index')}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al perfil
            </Link>
        </div>
    );

    return (
        <AuthenticatedLayout header={header}>
            <Head title={profile ? 'Editar Perfil de Empresa' : 'Configurar Perfil de Empresa'} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header del formulario */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            Información de la Empresa
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {profile ? 'Modifica los datos de tu empresa' : 'Completa los datos para configurar tu empresa'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    Campos obligatorios *
                                </span>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            <div className="p-6 space-y-8">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Building2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Información Básica
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Identificación fiscal
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre Comercial *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building2 className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.company_name 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                    placeholder="Ej: Mi Empresa SRL"
                                                />
                                            </div>
                                            {errors.company_name && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.company_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Razón Social
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.legal_name}
                                                    onChange={(e) => setData('legal_name', e.target.value)}
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.legal_name 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                    placeholder="Ej: Mi Empresa Sociedad de Responsabilidad Limitada"
                                                />
                                            </div>
                                            {errors.legal_name && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.legal_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                RNC *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.rnc}
                                                    onChange={(e) => setData('rnc', e.target.value)}
                                                    placeholder="Ej: 1-23-45678-9"
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono ${
                                                        errors.rnc 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                />
                                            </div>
                                            {errors.rnc && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.rnc}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo Contribuyente *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Shield className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <select
                                                    value={data.taxpayer_type}
                                                    onChange={(e) => setData('taxpayer_type', e.target.value)}
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none ${
                                                        errors.taxpayer_type 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                >
                                                    <option value="REGULAR">REGULAR</option>
                                                    <option value="PEQUEÑO CONTRIBUYENTE">PEQUEÑO CONTRIBUYENTE</option>
                                                    <option value="MEDIANO CONTRIBUYENTE">MEDIANO CONTRIBUYENTE</option>
                                                    <option value="GRANDE CONTRIBUYENTE">GRANDE CONTRIBUYENTE</option>
                                                </select>
                                            </div>
                                            {errors.taxpayer_type && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.taxpayer_type}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Industria/Giro
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Database className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.industry}
                                                onChange={(e) => setData('industry', e.target.value)}
                                                placeholder="Ej: Comercio, Servicios, Manufactura"
                                                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                    errors.industry 
                                                        ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                }`}
                                            />
                                        </div>
                                        {errors.industry && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.industry}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Información de Contacto
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Datos de comunicación
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Teléfono *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="Ej: (809) 555-1234"
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.phone 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="empresa@ejemplo.com"
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.email 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Website
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Globe className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                    placeholder="https://www.ejemplo.com"
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.website 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                />
                                            </div>
                                            {errors.website && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.website}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre de Sucursal
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building2 className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.branch_name}
                                                    onChange={(e) => setData('branch_name', e.target.value)}
                                                    placeholder="Ej: Sucursal Principal"
                                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.branch_name 
                                                            ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                    }`}
                                                />
                                            </div>
                                            {errors.branch_name && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.branch_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Dirección y Logo */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Ubicación y Branding
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Dirección e imagen corporativa
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Dirección *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                            </div>
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                rows="3"
                                                placeholder="Calle Principal #123, Santo Domingo"
                                                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                                                    errors.address 
                                                        ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                }`}
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Descripción
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                            </div>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows="4"
                                                placeholder="Descripción breve de la empresa..."
                                                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                                                    errors.description 
                                                        ? 'border-red-500 text-red-900 placeholder-red-700 dark:text-red-100 dark:placeholder-red-400 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-700'
                                                }`}
                                            />
                                        </div>
                                        {errors.description && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Logo de la Empresa
                                        </label>
                                        <div className="flex items-start space-x-6">
                                            <div className="flex flex-col items-center">
                                                {data.logo_preview ? (
                                                    <div className="relative group">
                                                        <img
                                                            className="h-32 w-32 rounded-xl object-cover shadow-lg border-4 border-white dark:border-gray-700 transition-transform group-hover:scale-105"
                                                            src={data.logo_preview}
                                                            alt="Logo preview"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('logo_preview', null);
                                                                setData('logo', null);
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = '';
                                                                }
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                                        >
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600 shadow-lg">
                                                        <div className="text-center">
                                                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Sin logo
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-3 text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {data.logo_preview ? 'Logo cargado' : 'Sube un logo'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        JPG, PNG, GIF • Máx. 2MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="logo"
                                                    onChange={handleLogoUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                />
                                                <div className="space-y-3">
                                                    <label
                                                        htmlFor="logo"
                                                        className="cursor-pointer inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm hover:shadow-md"
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {data.logo_preview ? 'Cambiar Logo' : 'Subir Logo'}
                                                    </label>
                                                    {data.logo_preview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('logo_preview', null);
                                                                setData('logo', null);
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = '';
                                                                }
                                                            }}
                                                            className="inline-flex items-center px-4 py-2.5 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm hover:shadow-md"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Eliminar Logo
                                                        </button>
                                                    )}
                                                </div>
                                                {errors.logo && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.logo}
                                                    </p>
                                                )}
                                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-start">
                                                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                                Recomendaciones para el logo
                                                            </h4>
                                                            <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                                                <li>• Tamaño mínimo: 200x200px</li>
                                                                <li>• Formato cuadrado para mejor visualización</li>
                                                                <li>• Fondo transparente o blanco</li>
                                                                <li>• Alta calidad y buena resolución</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('company-profile.index')}
                                        className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || formProcessing}
                                        className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        {processing || formProcessing ? (
                                            <>
                                                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {profile ? 'Actualizar' : 'Guardar'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
