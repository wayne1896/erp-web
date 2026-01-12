// resources/js/Pages/Proveedores/Edit.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Building, Globe, Phone, Mail, MapPin, User, CreditCard, Package } from 'lucide-react';

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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Editar Proveedor
                            </h2>
                            <p className="text-sm text-gray-600">{proveedor.codigo} - {proveedor.productos_count} productos</p>
                        </div>
                    </div>
                    <Link
                        href={route('proveedores.index')}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Editar: ${proveedor.nombre}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header del proveedor */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {proveedor.nombre}
                                    </h3>
                                    <div className="flex items-center mt-1 space-x-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            proveedor.activo 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {proveedor.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            proveedor.tipo_proveedor === 'LOCAL'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {proveedor.tipo_proveedor === 'LOCAL' ? 'LOCAL' : 'INTERNACIONAL'}
                                        </span>
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <Package className="w-4 h-4 mr-1" />
                                            {proveedor.productos_count} productos
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Creado: {new Date(proveedor.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Límite de Crédito</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        ${parseFloat(proveedor.limite_credito).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Días: {proveedor.dias_credito}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Información Básica */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Información del Proveedor
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.codigo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.codigo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Proveedor *
                                            </label>
                                            <select
                                                value={data.tipo_proveedor}
                                                onChange={(e) => setData('tipo_proveedor', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {tipos_proveedor.map((tipo) => (
                                                    <option key={tipo.value} value={tipo.value}>
                                                        {tipo.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre o Razón Social *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                RNC
                                            </label>
                                            <input
                                                type="text"
                                                value={formatRNC(data.rnc)}
                                                onChange={(e) => handleRNCChange(e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.rnc ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="1-01-23456-9"
                                                maxLength={11}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Formato: 1-01-23456-9
                                            </p>
                                            {errors.rnc && (
                                                <p className="mt-1 text-sm text-red-600">{errors.rnc}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Phone className="w-5 h-5 mr-2 text-gray-400" />
                                        Información de Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">+1</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.telefono}
                                                    onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, ''))}
                                                    className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                            {errors.telefono && (
                                                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contacto Principal
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.contacto_nombre}
                                                    onChange={(e) => setData('contacto_nombre', e.target.value)}
                                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono de Contacto
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.contacto_telefono}
                                                    onChange={(e) => setData('contacto_telefono', e.target.value.replace(/\D/g, ''))}
                                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                                        Dirección
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección Completa *
                                        </label>
                                        <textarea
                                            value={data.direccion}
                                            onChange={(e) => setData('direccion', e.target.value)}
                                            rows="3"
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.direccion ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                        {errors.direccion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Condiciones Comerciales */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                                        Condiciones Comerciales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Días de Crédito
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={data.dias_credito}
                                                    onChange={(e) => setData('dias_credito', parseInt(e.target.value) || 0)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">días</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Límite de Crédito ($)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.limite_credito}
                                                    onChange={(e) => setData('limite_credito', parseFloat(e.target.value) || 0)}
                                                    className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Proveedor activo
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Los proveedores inactivos no aparecerán en las listas de selección.
                                    </p>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('proveedores.show', proveedor.id)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Ver Detalles
                                    </Link>
                                    <Link
                                        href={route('proveedores.index')}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Actualizando...' : 'Actualizar Proveedor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}