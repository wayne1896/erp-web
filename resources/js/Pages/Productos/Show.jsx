import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, DollarSign, Percent, Tag, 
    Edit, Trash2, ArrowLeft, BarChart3,
    Truck, Calendar, Barcode, CheckCircle, XCircle
} from 'lucide-react';

export default function Show({ auth, producto, movimientos = [], sucursales = [], sucursal_actual }) {
    
    console.log('Producto recibido en Show:', producto);
    console.log('Categoría del producto:', producto?.categoria);
    console.log('Inventarios del producto:', producto?.inventarios);
    console.log('Primer inventario:', producto?.inventarios?.[0]);
    console.log('Costo promedio del primer inventario:', producto?.inventarios?.[0]?.costo_promedio);
    console.log('Tipo de costo promedio:', typeof producto?.inventarios?.[0]?.costo_promedio);

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar este producto?\n\nEsta acción no se puede deshacer.')) {
            router.delete(route('productos.destroy', producto.id), {
                onSuccess: () => {
                    router.visit(route('productos.index'));
                }
            });
        }
    };

    // Función segura para formatear números
    const formatNumber = (value, decimals = 2) => {
        try {
            // Convertir a número
            const num = parseFloat(value);
            // Verificar si es un número válido
            if (isNaN(num)) return '0.00';
            // Formatear con decimales
            return num.toFixed(decimals);
        } catch (error) {
            console.error('Error formateando número:', error, 'Valor:', value);
            return '0.00';
        }
    };

    // Función segura para obtener un número
    const safeNumber = (value, defaultValue = 0) => {
        try {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        } catch (error) {
            return defaultValue;
        }
    };

    // Calcular estadísticas con manejo seguro
    const calcularEstadisticas = () => {
        try {
            const precioCompra = safeNumber(producto?.precio_compra);
            const precioVenta = safeNumber(producto?.precio_venta);
            const margenGanancia = precioCompra > 0 
                ? ((precioVenta - precioCompra) / precioCompra) * 100 
                : 0;
            
            // Determinar porcentaje ITBIS
            let itbisPorcentaje = 18; // Valor por defecto
            if (producto?.tasa_itbis === 'ITBIS1') itbisPorcentaje = 18;
            if (producto?.tasa_itbis === 'ITBIS2') itbisPorcentaje = 16;
            if (producto?.tasa_itbis === 'ITBIS3' || producto?.tasa_itbis === 'EXENTO') itbisPorcentaje = 0;
            
            const precioConItbis = producto?.exento_itbis 
                ? precioVenta 
                : precioVenta * (1 + (itbisPorcentaje / 100));
            
            // Obtener inventario de la sucursal actual
            const inventarioActual = Array.isArray(producto?.inventarios) 
                ? producto.inventarios.find(inv => inv.sucursal_id === sucursal_actual?.id)
                : null;
            
            const valorInventario = safeNumber(inventarioActual?.valor_inventario);
            const stockActual = safeNumber(inventarioActual?.stock_disponible);

            return {
                margen_ganancia: margenGanancia,
                precio_con_itbis: precioConItbis,
                valor_inventario: valorInventario,
                stock_actual: stockActual,
                stock_minimo_alcanzado: stockActual <= safeNumber(producto?.stock_minimo),
            };
        } catch (error) {
            console.error('Error calculando estadísticas:', error);
            return {
                margen_ganancia: 0,
                precio_con_itbis: 0,
                valor_inventario: 0,
                stock_actual: 0,
                stock_minimo_alcanzado: false,
            };
        }
    };

    const estadisticas = calcularEstadisticas();

    // Funciones auxiliares seguras
    const getDescripcionItbis = () => {
        if (!producto?.tasa_itbis) return 'ITBIS 18%';
        
        const descripciones = {
            'ITBIS1': 'ITBIS 18%',
            'ITBIS2': 'ITBIS 16%',
            'ITBIS3': 'ITBIS 0%',
            'EXENTO': 'Exento'
        };
        
        return descripciones[producto.tasa_itbis] || 'ITBIS 18%';
    };

    const getUnidadMedidaTexto = () => {
        if (!producto?.unidad_medida) return 'Unidad';
        
        const unidades = {
            'UNIDAD': 'Unidad',
            'KILO': 'Kilogramo',
            'LITRO': 'Litro',
            'METRO': 'Metro',
            'CAJA': 'Caja',
            'PAQUETE': 'Paquete',
            'SACO': 'Saco'
        };
        
        return unidades[producto.unidad_medida] || producto.unidad_medida;
    };

    // Verificar si el producto existe
    if (!producto) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Producto no encontrado" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Producto no encontrado</h2>
                            <Link href={route('productos.index')} className="text-blue-600 hover:text-blue-800">
                                ← Volver a la lista de productos
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                {producto.nombre || 'Producto'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Código: {producto.codigo || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('productos.index')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Producto: ${producto.nombre || 'N/A'}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Acciones rápidas */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex space-x-3">
                            <Link
                                href={route('productos.edit', producto.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </button>
                            <Link
                                href={route('productos.stock', producto.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Tag className="w-4 h-4 mr-2" />
                                Gestionar Stock
                            </Link>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Percent className="w-5 h-5 text-blue-600 mr-2" />
                                <div className="text-sm text-blue-600">Margen de Ganancia</div>
                            </div>
                            <div className="text-2xl font-bold mt-2">
                                {formatNumber(estadisticas.margen_ganancia)}%
                            </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                                <div className="text-sm text-green-600">Precio con ITBIS</div>
                            </div>
                            <div className="text-2xl font-bold mt-2">
                                ${formatNumber(estadisticas.precio_con_itbis)}
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                                <div className="text-sm text-purple-600">Valor Inventario</div>
                            </div>
                            <div className="text-2xl font-bold mt-2">
                                ${formatNumber(estadisticas.valor_inventario)}
                            </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${estadisticas.stock_minimo_alcanzado ? 'bg-red-50' : 'bg-yellow-50'}`}>
                            <div className="flex items-center">
                                <Tag className={`w-5 h-5 mr-2 ${estadisticas.stock_minimo_alcanzado ? 'text-red-600' : 'text-yellow-600'}`} />
                                <div className={`text-sm ${estadisticas.stock_minimo_alcanzado ? 'text-red-600' : 'text-yellow-600'}`}>
                                    Stock Actual
                                </div>
                            </div>
                            <div className="text-2xl font-bold mt-2">
                                {formatNumber(estadisticas.stock_actual)}
                            </div>
                            <div className="text-xs mt-1">
                                Mínimo: {formatNumber(producto.stock_minimo)}
                            </div>
                        </div>
                    </div>

                    {/* Información principal */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Columna izquierda - Información básica */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-gray-400" />
                                            Información Básica
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Descripción
                                                </label>
                                                <p className="text-gray-900 dark:text-gray-200">
                                                    {producto.descripcion || 'Sin descripción'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Categoría
                                                </label>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                        {producto.categoria?.nombre || 'Sin categoría'}
                                                    </span>
                                                    {producto.categoria?.codigo && (
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            ({producto.categoria.codigo})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Unidad de Medida
                                                </label>
                                                <p className="text-gray-900 dark:text-gray-200">
                                                    {getUnidadMedidaTexto()}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Código de Barras
                                                </label>
                                                <div className="flex items-center">
                                                    <Barcode className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono text-gray-900 dark:text-gray-200">
                                                        {producto.codigo_barras || 'No asignado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                                            <Tag className="w-5 h-5 mr-2 text-gray-400" />
                                            Configuración de Stock
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Control de Stock:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    producto.control_stock 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                }`}>
                                                    {producto.control_stock ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {producto.control_stock ? 'Activado' : 'Desactivado'}
                                                </span>
                                            </div>
                                            
                                            {producto.control_stock && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Stock Mínimo:</span>
                                                        <span className="font-medium">{formatNumber(producto.stock_minimo)}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Estado Stock:</span>
                                                        <span className={`font-medium ${
                                                            estadisticas.stock_minimo_alcanzado 
                                                                ? 'text-red-600' 
                                                                : 'text-green-600'
                                                        }`}>
                                                            {estadisticas.stock_minimo_alcanzado 
                                                                ? '⚠️ Por debajo del mínimo' 
                                                                : '✅ Normal'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Columna derecha - Precios e impuestos */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                                            <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                                            Precios
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <div className="text-sm text-gray-600">Precio Compra</div>
                                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-200">
                                                        ${formatNumber(producto.precio_compra)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">Costo unitario</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                                <div>
                                                    <div className="text-sm text-green-600">Precio Venta</div>
                                                    <div className="text-lg font-medium text-green-700">
                                                        ${formatNumber(producto.precio_venta)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-green-600">Público general</div>
                                                </div>
                                            </div>
                                            
                                            {producto.precio_mayor && (
                                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                    <div>
                                                        <div className="text-sm text-blue-600">Precio Mayorista</div>
                                                        <div className="text-lg font-medium text-blue-700">
                                                            ${formatNumber(producto.precio_mayor)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-blue-600">Venta al por mayor</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-gray-400" />
                                            Impuestos (ITBIS)
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Tasa ITBIS:</span>
                                                <span className="font-medium">{getDescripcionItbis()}</span>
                                            </div>
                                            
                                            {!producto.exento_itbis && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Porcentaje:</span>
                                                    <span className="font-medium">{formatNumber(producto.itbis_porcentaje)}%</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Estado:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    producto.exento_itbis 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {producto.exento_itbis ? 'Exento' : 'Aplica ITBIS'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Precio con ITBIS:</span>
                                                <span className="font-medium text-green-600">
                                                    ${formatNumber(estadisticas.precio_con_itbis)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                                            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                            Información Técnica
                                        </h3>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Creado:</span>
                                                <span className="font-medium">
                                                    {producto.created_at ? new Date(producto.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Última actualización:</span>
                                                <span className="font-medium">
                                                    {producto.updated_at ? new Date(producto.updated_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Estado:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    producto.activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {producto.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventario por sucursal - Solo si hay inventarios */}
                    {Array.isArray(producto.inventarios) && producto.inventarios.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-gray-400" />
                                    Inventario por Sucursal
                                </h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Sucursal
                                                </th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock Actual
                                                </th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock Disponible
                                                </th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Costo Promedio
                                                </th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Valor Inventario
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {producto.inventarios.map((inventario, index) => (
                                                <tr key={inventario.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                            {inventario.sucursal?.nombre || 'Sucursal'}
                                                            {sucursal_actual?.id === inventario.sucursal_id && (
                                                                <span className="ml-2 text-xs text-blue-600">(Actual)</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-200">
                                                            {formatNumber(inventario.stock_actual)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className={`text-sm font-medium ${
                                                            safeNumber(inventario.stock_disponible) <= safeNumber(producto.stock_minimo)
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}>
                                                            {formatNumber(inventario.stock_disponible)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-200">
                                                            ${formatNumber(inventario.costo_promedio)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-purple-600">
                                                            ${formatNumber(inventario.valor_inventario)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Movimientos recientes - Solo si hay movimientos */}
                    {Array.isArray(movimientos) && movimientos.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
                                        Movimientos Recientes
                                    </h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {movimientos.slice(0, 5).map((movimiento, index) => (
                                        <div key={movimiento.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {movimiento.motivo || 'Movimiento'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {movimiento.sucursal?.nombre || 'Sucursal'} • 
                                                        {movimiento.usuario?.name || 'Usuario'} • 
                                                        {movimiento.created_at ? new Date(movimiento.created_at).toLocaleDateString() : 'Fecha desconocida'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-medium ${
                                                        movimiento.tipo === 'entrada' 
                                                            ? 'text-green-600' 
                                                            : 'text-red-600'
                                                    }`}>
                                                        {movimiento.tipo === 'entrada' ? '+' : '-'}{formatNumber(movimiento.cantidad)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        De {formatNumber(movimiento.cantidad_anterior)} a {formatNumber(movimiento.cantidad_nueva)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}