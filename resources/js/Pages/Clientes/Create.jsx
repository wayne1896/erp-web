// resources/js/Pages/Clientes/Create.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create({ auth, tipos_cliente, tipos_contribuyente, provincias }) {
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        tipo_cliente: 'NATURAL',
        nombre_completo: '',
        cedula_rnc: '',
        telefono: '',
        telefono_alternativo: '',
        email: '',
        direccion: '',
        provincia: '',
        municipio: '',
        sector: '',
        tipo_contribuyente: 'CONSUMIDOR_FINAL',
        limite_credito: 0,
        dias_credito: 0,
        descuento: 0,
        activo: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('clientes.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Crear Nuevo Cliente
                    </h2>
                    <Link
                        href={route('clientes.index')}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title="Crear Cliente" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-6">
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.limite_credito}
                                                onChange={e => setData('limite_credito', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Días de Crédito
                                            </label>
                                            <input
                                                type="number"
                                                value={data.dias_credito}
                                                onChange={e => setData('dias_credito', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Descuento (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.descuento}
                                                onChange={e => setData('descuento', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.activo}
                                                onChange={e => setData('activo', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Cliente Activo
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('clientes.index')}
                                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Guardando...' : 'Guardar Cliente'}
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