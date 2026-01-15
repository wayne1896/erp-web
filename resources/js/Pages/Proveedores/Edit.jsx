import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    Building, 
    Globe, 
    Phone, 
    Mail, 
    MapPin, 
    User, 
    CreditCard,
    CheckCircle,
    AlertCircle,
    Truck,
    Shield,
    FileText,
    Package
} from 'lucide-react';

export default function Edit({ auth, proveedor, tipos_proveedor }) {
    const { data, setData, put, processing, errors } = useForm({
        codigo: proveedor.codigo || '',
        nombre: proveedor.nombre || '',
        rnc: proveedor.rnc || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || '',
        contacto_nombre: proveedor.contacto_nombre || '',
        contacto_telefono: proveedor.contacto_telefono || '',
        tipo_proveedor: proveedor.tipo_proveedor || 'LOCAL',
        dias_credito: proveedor.dias_credito || 0,
        limite_credito: proveedor.limite_credito || 0,
        activo: proveedor.activo ?? true,
    });

    const [activeTab, setActiveTab] = useState('basico');

    const submit = (e) => {
        e.preventDefault();
        put(route('proveedores.update', proveedor.id));
    };

    const formatRNC = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 1) return cleaned;
        if (cleaned.length <= 3) return `${cleaned[0]}-${cleaned.substring(1)}`;
        if (cleaned.length <= 8) return `${cleaned[0]}-${cleaned.substring(1, 3)}-${cleaned.substring(3)}`;
        return `${cleaned[0]}-${cleaned.substring(1, 3)}-${cleaned.substring(3, 8)}-${cleaned.substring(8, 9)}`;
    };

    const handleRNCChange = (value) => {
        const cleaned = value.replace(/\D/g, '');
        setData('rnc', cleaned);
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-orange-600 to-amber-700 p-3.5 rounded-xl shadow-lg">
                            <Truck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Editar Proveedor
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {proveedor.codigo} - {proveedor.productos_count} productos - Creado: {new Date(proveedor.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href={route('proveedores.index')}
                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </Link>
                </div>
            }
        >
            <Head title={`Editar: ${proveedor.nombre}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado del proveedor */}
                    <div className="mb-6 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-white truncate">
                                            {proveedor.nombre}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                                                proveedor.activo 
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                                    : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                                            }`}>
                                                {proveedor.activo ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        ACTIVO
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        INACTIVO
                                                    </>
                                                )}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                                                proveedor.tipo_proveedor === 'LOCAL'
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                            }`}>
                                                {proveedor.tipo_proveedor === 'LOCAL' ? (
                                                    <>
                                                        <Building className="w-3 h-3 mr-1" />
                                                        LOCAL
                                                    </>
                                                ) : (
                                                    <>
                                                        <Globe className="w-3 h-3 mr-1" />
                                                        INTERNACIONAL
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center text-gray-300">
                                            <Package className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{proveedor.productos_count} productos</span>
                                        </div>
                                        {proveedor.rnc && (
                                            <div className="flex items-center text-gray-300">
                                                <FileText className="w-4 h-4 mr-2" />
                                                <span className="text-sm">RNC: {proveedor.rnc}</span>
                                            </div>
                                        )}
                                        {proveedor.email && (
                                            <div className="flex items-center text-gray-300">
                                                <Mail className="w-4 h-4 mr-2" />
                                                <span className="text-sm truncate">{proveedor.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-black/30 rounded-lg p-4 min-w-[200px]">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-300 mb-1">Límite de Crédito</p>
                                        <p className="text-2xl font-bold text-white mb-2">
                                            {formatCurrency(proveedor.limite_credito)}
                                        </p>
                                        <div className="flex items-center justify-center text-sm text-gray-300">
                                            <CreditCard className="w-4 h-4 mr-1" />
                                            <span>{proveedor.dias_credito} días de crédito</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pestañas de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basico')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'basico'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2" />
                                        Información Básica
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('contacto')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'contacto'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Contacto
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('comercial')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'comercial'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Comercial
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Indicador de progreso */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'basico' 
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <Building className="w-4 h-4" />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${
                                            activeTab !== 'basico' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'contacto' 
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${
                                            activeTab === 'comercial' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'comercial' 
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Paso {activeTab === 'basico' ? '1' : activeTab === 'contacto' ? '2' : '3'} de 3
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Información Básica */}
                                <div className={`space-y-6 ${activeTab !== 'basico' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Información Básica del Proveedor
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Campos obligatorios *
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Código del Proveedor *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400 font-medium">PROV-</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.codigo}
                                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                                    className={`pl-14 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.codigo 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="001"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.codigo && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.codigo}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Código único de identificación
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tipo de Proveedor *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {tipos_proveedor.map((tipo) => (
                                                    <button
                                                        key={tipo.value}
                                                        type="button"
                                                        onClick={() => setData('tipo_proveedor', tipo.value)}
                                                        className={`px-4 py-3 rounded-lg border transition-all ${
                                                            data.tipo_proveedor === tipo.value
                                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300'
                                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                        }`}
                                                        disabled={processing}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {tipo.value === 'LOCAL' ? (
                                                                <Building className="w-4 h-4 mr-2" />
                                                            ) : (
                                                                <Globe className="w-4 h-4 mr-2" />
                                                            )}
                                                            {tipo.label}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nombre o Razón Social *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.nombre}
                                                    onChange={(e) => setData('nombre', e.target.value)}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.nombre 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="Ej: Distribuidora ABC, S.A."
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.nombre && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.nombre}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                RNC (Registro Nacional de Contribuyentes)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formatRNC(data.rnc)}
                                                    onChange={(e) => handleRNCChange(e.target.value)}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.rnc 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="1-01-23456-9"
                                                    maxLength={11}
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.rnc && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.rnc}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Formato: 1-01-23456-9
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div className={`space-y-6 ${activeTab !== 'contacto' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Información de Contacto
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Recomendado para comunicación
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Teléfono Principal *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.telefono}
                                                    onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, ''))}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.telefono 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="8091234567"
                                                    maxLength={10}
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.telefono && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.telefono}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Correo Electrónico
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.email 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="proveedor@ejemplo.com"
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.email}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Contacto Principal
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.contacto_nombre}
                                                    onChange={(e) => setData('contacto_nombre', e.target.value)}
                                                    className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Nombre del contacto"
                                                    disabled={processing}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Teléfono de Contacto
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.contacto_telefono}
                                                    onChange={(e) => setData('contacto_telefono', e.target.value.replace(/\D/g, ''))}
                                                    className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="8099876543"
                                                    maxLength={10}
                                                    disabled={processing}
                                                />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Dirección Completa *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-3">
                                                    <MapPin className="text-gray-400" />
                                                </div>
                                                <textarea
                                                    value={data.direccion}
                                                    onChange={(e) => setData('direccion', e.target.value)}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                        errors.direccion 
                                                            ? 'border-red-500 dark:border-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="Ej: Calle Principal #123, Edificio A, Santo Domingo"
                                                    rows="3"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.direccion && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.direccion}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Información Comercial */}
                                <div className={`space-y-6 ${activeTab !== 'comercial' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Condiciones Comerciales
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Configuración de crédito y términos
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Días de Crédito
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">días</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={data.dias_credito}
                                                    onChange={(e) => setData('dias_credito', parseInt(e.target.value) || 0)}
                                                    className="pr-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    min="0"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Plazo para pagos a crédito
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Límite de Crédito (DOP)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">RD$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.limite_credito}
                                                    onChange={(e) => setData('limite_credito', parseFloat(e.target.value) || 0)}
                                                    className="pl-12 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Máximo {formatCurrency(data.limite_credito || 0)}
                                            </p>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                                <div className="flex items-center">
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.activo}
                                                            onChange={(e) => setData('activo', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                            disabled={processing}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Proveedor Activo
                                                        </label>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            El proveedor estará disponible para compras y transacciones
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        {data.activo ? (
                                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300">
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                <span className="text-sm font-medium">Activo</span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300">
                                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                                <span className="text-sm font-medium">Inactivo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navegación entre pestañas */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {activeTab !== 'basico' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'comercial' ? 'contacto' : 'basico'
                                            )}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior
                                        </button>
                                    )}
                                    
                                    {activeTab !== 'comercial' ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'basico' ? 'contacto' : 'comercial'
                                            )}
                                            className="ml-auto inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Siguiente
                                            <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
                                        </button>
                                    ) : (
                                        <div className="ml-auto space-x-3">
                                            <Link
                                                href={route('proveedores.show', proveedor.id)}
                                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            >
                                                Ver Detalles
                                            </Link>
                                            <Link
                                                href={route('proveedores.index')}
                                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Actualizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Actualizar Proveedor
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}