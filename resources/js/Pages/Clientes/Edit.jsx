import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User } from 'lucide-react';

export default function Edit({ auth, cliente, tipos_cliente, tipos_contribuyente, provincias }) {
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Editar Cliente
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cliente.codigo} - {cliente.cedula_rnc}</p>
                        </div>
                    </div>
                    <Link
                        href={route('clientes.index')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Editar ${cliente.nombre_completo}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header del cliente */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {cliente.nombre_completo}
                                    </h3>
                                    <div className="flex items-center mt-1 space-x-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            cliente.activo 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {cliente.tipo_cliente === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Creado: {new Date(cliente.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Límite de Crédito</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        ${parseFloat(cliente.limite_credito).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Días crédito: {cliente.dias_credito}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información Básica */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                                        Información Básica
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Código *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={e => setData('codigo', e.target.value)}
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tipo de Cliente *
                                            </label>
                                            <select
                                                value={data.tipo_cliente}
                                                onChange={e => setData('tipo_cliente', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {tipos_cliente.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo === 'NATURAL' ? 'Natural' : 'Jurídico'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nombre Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre_completo}
                                                onChange={e => setData('nombre_completo', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.nombre_completo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.nombre_completo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nombre_completo}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Cédula/RNC *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.cedula_rnc}
                                                onChange={e => setData('cedula_rnc', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.cedula_rnc ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.cedula_rnc && (
                                                <p className="mt-1 text-sm text-red-600">{errors.cedula_rnc}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tipo Contribuyente *
                                            </label>
                                            <select
                                                value={data.tipo_contribuyente}
                                                onChange={e => setData('tipo_contribuyente', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {tipos_contribuyente.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo === 'CONSUMIDOR_FINAL' ? 'Consumidor Final' : 
                                                         tipo === 'CREDITO_FISCAL' ? 'Crédito Fiscal' : 
                                                         'Gubernamental'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                                        Información de Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Teléfono *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.telefono}
                                                onChange={e => setData('telefono', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.telefono && (
                                                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Teléfono Alternativo
                                            </label>
                                            <input
                                                type="text"
                                                value={data.telefono_alternativo}
                                                onChange={e => setData('telefono_alternativo', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                                        Dirección
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Provincia *
                                            </label>
                                            <select
                                                value={data.provincia}
                                                onChange={e => setData('provincia', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {provincias.map((prov) => (
                                                    <option key={prov} value={prov}>{prov}</option>
                                                ))}
                                            </select>
                                            {errors.provincia && (
                                                <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Municipio *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.municipio}
                                                onChange={e => setData('municipio', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.municipio ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.municipio && (
                                                <p className="mt-1 text-sm text-red-600">{errors.municipio}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Sector *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sector}
                                                onChange={e => setData('sector', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.sector ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.sector && (
                                                <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Dirección Completa *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.direccion}
                                                onChange={e => setData('direccion', e.target.value)}
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
                                </div>

                                {/* Información Comercial */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                                        Información Comercial
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Límite de Crédito ($)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.limite_credito}
                                                    onChange={e => setData('limite_credito', parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Días de Crédito
                                            </label>
                                            <input
                                                type="number"
                                                value={data.dias_credito}
                                                onChange={e => setData('dias_credito', parseInt(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Descuento (%)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.descuento}
                                                    onChange={e => setData('descuento', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                    %
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.activo}
                                                onChange={e => setData('activo', e.target.checked)}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-3 block text-sm text-gray-700">
                                                Cliente activo en el sistema
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('clientes.show', cliente.id)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Ver Detalles
                                    </Link>
                                    <Link
                                        href={route('clientes.index')}
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
                                        {processing ? 'Actualizando...' : 'Actualizar Cliente'}
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