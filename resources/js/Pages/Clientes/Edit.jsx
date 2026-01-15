import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    CreditCard,
    Building,
    CheckCircle,
    AlertCircle,
    Tag,
    FileText,
    DollarSign,
    Clock,
    Percent,
    Edit as EditIcon, // Renombrar Edit para evitar conflicto
    Shield,
    Globe,
    Eye
} from 'lucide-react';

export default function ClientesEdit({ auth, cliente, tipos_cliente, tipos_contribuyente, provincias }) {
    const [activeTab, setActiveTab] = useState('basico');
    
    const { data, setData, put, processing, errors } = useForm({
        codigo: cliente.codigo || '',
        tipo_cliente: cliente.tipo_cliente || 'NATURAL',
        nombre_completo: cliente.nombre_completo || '',
        cedula_rnc: cliente.cedula_rnc || '',
        telefono: cliente.telefono || '',
        telefono_alternativo: cliente.telefono_alternativo || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        provincia: cliente.provincia || '',
        municipio: cliente.municipio || '',
        sector: cliente.sector || '',
        tipo_contribuyente: cliente.tipo_contribuyente || 'CONSUMIDOR_FINAL',
        limite_credito: cliente.limite_credito || 0,
        dias_credito: cliente.dias_credito || 0,
        descuento: cliente.descuento || 0,
        activo: cliente.activo ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('clientes.update', cliente.id));
    };

    // Formateador de moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(amount || 0);
    };

    // Formateador de fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-3.5 rounded-xl shadow-lg">
                            <EditIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Editar Cliente
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Actualice la información de {cliente.nombre_completo}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('clientes.show', cliente.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                        </Link>
                        <Link
                            href={route('clientes.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${cliente.nombre_completo}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Resumen del cliente */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {cliente.nombre_completo?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {cliente.nombre_completo}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                cliente.activo 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {cliente.activo ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Activo
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Inactivo
                                                    </>
                                                )}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                cliente.tipo_cliente === 'NATURAL' 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                            }`}>
                                                {cliente.tipo_cliente === 'NATURAL' ? (
                                                    <User className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <Building className="w-3 h-3 mr-1" />
                                                )}
                                                {cliente.tipo_cliente === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}
                                            </span>
                                            <span className="text-xs text-gray-300">
                                                Código: {cliente.codigo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm font-medium mb-1">Límite Crédito</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(cliente.limite_credito || 0)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm font-medium mb-1">Días Crédito</p>
                                        <p className="text-xl font-bold text-white">
                                            {cliente.dias_credito || 0} días
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm font-medium mb-1">Registrado</p>
                                        <p className="text-sm text-gray-300">
                                            {formatDate(cliente.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pestañas de navegación */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basico')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'basico'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Información Básica
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('contacto')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                                    onClick={() => setActiveTab('direccion')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'direccion'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Dirección
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('comercial')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Información Básica */}
                            <div className={`space-y-6 ${activeTab !== 'basico' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Información Básica
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        Campos obligatorios *
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Código del Cliente *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400">CL-</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={e => setData('codigo', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.codigo 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder="001"
                                                required
                                            />
                                        </div>
                                        {errors.codigo && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.codigo}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Cliente *
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {tipos_cliente.map((tipo) => (
                                                <button
                                                    key={tipo}
                                                    type="button"
                                                    onClick={() => setData('tipo_cliente', tipo)}
                                                    className={`px-4 py-3 rounded-lg border transition-all ${
                                                        data.tipo_cliente === tipo
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {tipo === 'NATURAL' ? (
                                                            <User className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <Building className="w-4 h-4 mr-2" />
                                                        )}
                                                        {tipo === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombre Completo o Razón Social *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.nombre_completo}
                                                onChange={e => setData('nombre_completo', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.nombre_completo 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder={data.tipo_cliente === 'NATURAL' ? 'Ej: Juan Pérez' : 'Ej: Empresa SRL'}
                                                required
                                            />
                                        </div>
                                        {errors.nombre_completo && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.nombre_completo}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Cédula o RNC *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FileText className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.cedula_rnc}
                                                onChange={e => setData('cedula_rnc', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.cedula_rnc 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder={data.tipo_cliente === 'NATURAL' ? '001-1234567-8' : '1-01-12345-6'}
                                                required
                                            />
                                        </div>
                                        {errors.cedula_rnc && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.cedula_rnc}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Contribuyente *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Shield className="text-gray-400" />
                                            </div>
                                            <select
                                                value={data.tipo_contribuyente}
                                                onChange={e => setData('tipo_contribuyente', e.target.value)}
                                                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                {tipos_contribuyente.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo === 'CONSUMIDOR_FINAL' ? '👤 Consumidor Final' : 
                                                         tipo === 'CREDITO_FISCAL' ? '🏢 Crédito Fiscal' : 
                                                         '🏛️ Gubernamental'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
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
                                                type="text"
                                                value={data.telefono}
                                                onChange={e => setData('telefono', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.telefono 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder="(809) 555-1234"
                                                required
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
                                            Teléfono Alternativo
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.telefono_alternativo}
                                                onChange={e => setData('telefono_alternativo', e.target.value)}
                                                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="(809) 555-5678"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
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
                                                onChange={e => setData('email', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.email 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder="cliente@empresa.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className={`space-y-6 ${activeTab !== 'direccion' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Dirección del Cliente
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Provincia *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Globe className="text-gray-400" />
                                            </div>
                                            <select
                                                value={data.provincia}
                                                onChange={e => setData('provincia', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.provincia 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                required
                                            >
                                                <option value="">Seleccionar provincia...</option>
                                                {provincias.map((prov) => (
                                                    <option key={prov} value={prov}>{prov}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.provincia && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.provincia}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Municipio *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.municipio}
                                            onChange={e => setData('municipio', e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors.municipio 
                                                    ? 'border-red-500 dark:border-red-500' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                            placeholder="Ej: Santo Domingo Este"
                                            required
                                        />
                                        {errors.municipio && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.municipio}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Sector/Barrio *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sector}
                                            onChange={e => setData('sector', e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors.sector 
                                                    ? 'border-red-500 dark:border-red-500' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                            placeholder="Ej: Los Prados"
                                            required
                                        />
                                        {errors.sector && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.sector}
                                            </div>
                                        )}
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
                                                onChange={e => setData('direccion', e.target.value)}
                                                className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.direccion 
                                                        ? 'border-red-500 dark:border-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                                                placeholder="Ej: Calle Principal #123, Edificio A, Apartamento 4B"
                                                rows="3"
                                                required
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
                                        Información Comercial
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Límite de Crédito (DOP)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.limite_credito}
                                                onChange={e => setData('limite_credito', parseFloat(e.target.value) || 0)}
                                                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Días de Crédito
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <Clock className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.dias_credito}
                                                onChange={e => setData('dias_credito', parseInt(e.target.value) || 0)}
                                                className="pr-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="30"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Descuento (%)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <Percent className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.descuento}
                                                onChange={e => setData('descuento', parseFloat(e.target.value) || 0)}
                                                className="pr-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={data.activo}
                                                    onChange={e => setData('activo', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Cliente Activo
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    El cliente podrá realizar compras y transacciones en el sistema
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navegación y botones */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                {activeTab !== 'basico' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(
                                            activeTab === 'comercial' ? 'direccion' :
                                            activeTab === 'direccion' ? 'contacto' : 'basico'
                                        )}
                                        className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Anterior
                                    </button>
                                )}
                                
                                <div className="ml-auto space-x-3">
                                    {activeTab !== 'comercial' ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'basico' ? 'contacto' :
                                                activeTab === 'contacto' ? 'direccion' : 'comercial'
                                            )}
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Siguiente
                                            <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
                                        </button>
                                    ) : (
                                        <>
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
                                                        Actualizar Cliente
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}