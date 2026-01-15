import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Edit, Building, Globe, Phone, Mail, MapPin, 
    User, CreditCard, Package, DollarSign, Calendar, FileText, Truck,
    PlusCircle, AlertTriangle, CheckCircle, TrendingUp, Database, Shield,
    BarChart3, Activity, Layers, ShoppingBag, Tag
} from 'lucide-react';

export default function Show({ auth, proveedor, productos, estadisticas }) {
    
    const formatRNC = (rnc) => {
        if (!rnc || rnc.length !== 9) return rnc || 'No registrado';
        return `${rnc.substring(0, 1)}-${rnc.substring(1, 3)}-${rnc.substring(3, 8)}-${rnc.substring(8, 9)}`;
    };

    // Función para formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    // Calcular porcentaje de uso del límite de crédito
    const calcularPorcentajeCredito = () => {
        const limite = proveedor.limite_credito || 0;
        if (limite <= 0) return 0;
        return Math.min((estadisticas?.saldo_pendiente || 0) / limite * 100, 100);
    };

    const porcentajeCredito = calcularPorcentajeCredito();

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
                                {proveedor.nombre}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Detalles completos del proveedor
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('proveedores.edit', proveedor.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Proveedor
                        </Link>
                        <Link
                            href={route('proveedores.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Proveedor: ${proveedor.nombre}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado con estadísticas */}
                    <div className="mb-6 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <h3 className="text-2xl font-bold text-white truncate">
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
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
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
                                            <span className="px-3 py-1 bg-black/40 text-white text-xs font-semibold rounded-full flex items-center">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {proveedor.codigo}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center text-gray-300">
                                            <Package className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm">{estadisticas?.total_productos || 0} productos</span>
                                                <span className="text-xs text-gray-400 block">
                                                    ({estadisticas?.productos_activos || 0} activos)
                                                </span>
                                            </div>
                                        </div>
                                        {proveedor.rnc && (
                                            <div className="flex items-center text-gray-300">
                                                <FileText className="w-4 h-4 mr-2" />
                                                <div>
                                                    <span className="text-sm">RNC: {formatRNC(proveedor.rnc)}</span>
                                                </div>
                                            </div>
                                        )}
                                        {proveedor.email && (
                                            <div className="flex items-center text-gray-300">
                                                <Mail className="w-4 h-4 mr-2" />
                                                <div>
                                                    <span className="text-sm truncate">{proveedor.email}</span>
                                                    <span className="text-xs text-gray-400 block">Correo principal</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-black/30 rounded-lg p-4 min-w-[250px]">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <CreditCard className="w-5 h-5 text-blue-400 mr-2" />
                                            <p className="text-sm text-gray-300">Límite de Crédito</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white mb-2">
                                            {formatCurrency(proveedor.limite_credito)}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                                            <span>Uso: {porcentajeCredito.toFixed(1)}%</span>
                                            <span>{proveedor.dias_credito} días</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    porcentajeCredito > 80 ? 'bg-red-500' : 
                                                    porcentajeCredito > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${porcentajeCredito}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna izquierda - Información principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tarjeta de información de contacto */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Información del Proveedor
                                        </h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Registrado: {new Date(proveedor.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Información de identificación */}
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Código</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">{proveedor.codigo}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                                                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">RNC</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {formatRNC(proveedor.rnc) || 'No registrado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                                                        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {proveedor.direccion || 'No especificada'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información de contacto */}
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono Principal</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {proveedor.telefono || 'No especificado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                                                        <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Correo Electrónico</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {proveedor.email || 'No especificado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                                <div className="flex items-start mb-2">
                                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                                                        <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Contacto Principal</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {proveedor.contacto_nombre || 'No especificado'}
                                                        </p>
                                                        {proveedor.contacto_telefono && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                Tel: {proveedor.contacto_telefono}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas en tarjetas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Total Productos</p>
                                            <p className="text-3xl font-bold text-white">{estadisticas?.total_productos || 0}</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-white/80">
                                        <span className="flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {estadisticas?.productos_activos || 0} activos
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Valor Inventario</p>
                                            <p className="text-3xl font-bold text-white">
                                                {formatCurrency(estadisticas?.valor_inventario || 0)}
                                            </p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <DollarSign className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-white/80">
                                        <span className="flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Valor promedio por producto
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/90 mb-1">Compras Recientes</p>
                                            <p className="text-3xl font-bold text-white">{estadisticas?.compras_30dias || 0}</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <ShoppingBag className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-white/80">
                                        <span className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Últimos 30 días
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de productos */}
                            {productos && productos.length > 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Productos del Proveedor
                                            </h3>
                                            <Link
                                                href={`/productos/crear?proveedor_id=${proveedor.id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                            >
                                                <PlusCircle className="w-4 h-4 mr-1" />
                                                Nuevo Producto
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-900/30">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Código
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Producto
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Precio Compra
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Stock
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {productos.slice(0, 5).map((producto) => (
                                                    <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                                {producto.codigo}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {producto.nombre}
                                                            </div>
                                                            {producto.descripcion && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                    {producto.descripcion.substring(0, 60)}...
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(producto.precio_compra)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className={`text-sm font-medium ${
                                                                (producto.stock_actual || 0) <= (producto.stock_minimo || 0)
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                                {producto.stock_actual || 0}
                                                                {(producto.stock_minimo || 0) > 0 && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                        (mín: {producto.stock_minimo})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                producto.activo
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                            }`}>
                                                                {producto.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {productos.length > 5 && (
                                            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                                <Link
                                                    href={route('productos.index', { proveedor_id: proveedor.id })}
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                >
                                                    Ver todos los productos ({productos.length})
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                                    <div className="max-w-sm mx-auto">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Sin productos
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Este proveedor aún no tiene productos registrados.
                                        </p>
                                        <Link
                                            href={`/productos/crear?proveedor_id=${proveedor.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Agregar primer producto
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Información adicional */}
                        <div className="space-y-6">
                            {/* Condiciones comerciales */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Condiciones Comerciales
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Límite de Crédito</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(proveedor.limite_credito)}
                                                    </p>
                                                </div>
                                                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                    <span>Uso actual</span>
                                                    <span>{porcentajeCredito.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            porcentajeCredito > 80 ? 'bg-red-500' : 
                                                            porcentajeCredito > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${porcentajeCredito}%` }}
                                                    ></div>
                                                </div>
                                                {estadisticas?.saldo_pendiente > 0 && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Saldo pendiente: {formatCurrency(estadisticas.saldo_pendiente)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Días de Crédito</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {proveedor.dias_credito || 0} días
                                                    </p>
                                                </div>
                                                <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {proveedor.dias_credito > 0 
                                                    ? `Crédito otorgado a ${proveedor.dias_credito} días` 
                                                    : 'Pago al contado'}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Condiciones de pago:</span>
                                                <span className="font-medium">
                                                    {proveedor.dias_credito > 0 ? 'A crédito' : 'Contado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Términos:</span>
                                                <span className="font-medium">
                                                    {proveedor.dias_credito} días neto
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información del sistema */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Database className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                        Información del Sistema
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Registrado</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(proveedor.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Última actualización</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(proveedor.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                                <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Acciones Rápidas
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/productos/crear?proveedor_id=${proveedor.id}`}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <PlusCircle className="w-4 h-4 inline mr-2" />
                                            Nuevo Producto
                                        </Link>
                                        <Link
                                            href={route('proveedores.edit', proveedor.id)}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <Edit className="w-4 h-4 inline mr-2" />
                                            Editar Proveedor
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (proveedor.productos_count > 0) {
                                                    alert('No se puede eliminar porque tiene productos asociados');
                                                    return;
                                                }
                                                if (confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
                                                    router.delete(route('proveedores.destroy', proveedor.id));
                                                }
                                            }}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            Eliminar Proveedor
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Información técnica */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Shield className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                                        Información Técnica
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID del Proveedor</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {proveedor.id}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Código interno</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {proveedor.codigo}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo interno</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {proveedor.tipo_proveedor}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}