// resources/js/Layouts/AppLayout.jsx
import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    HomeIcon, 
    ShoppingCartIcon, 
    UsersIcon, 
    CubeIcon, 
    CurrencyDollarIcon,
    ChartBarIcon,
    BellIcon,
    CogIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const AppLayout = ({ children, title }) => {
    const { auth, notificaciones } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
        { name: 'Ventas', href: '/ventas', icon: CurrencyDollarIcon, current: false },
        { name: 'Clientes', href: '/clientes', icon: UsersIcon, current: false },
        { name: 'Productos', href: '/productos', icon: CubeIcon, current: false },
        { name: 'Inventario', href: '/inventario', icon: ShoppingCartIcon, current: false },
        { name: 'Reportes', href: '/reportes', icon: ChartBarIcon, current: false },
    ];
    
    const handleLogout = () => {
        router.post('/logout');
    };
    
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`lg:hidden ${sidebarOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-0 z-40 flex">
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700 pt-5 pb-4">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex flex-shrink-0 items-center px-4">
                            <div className="text-white text-2xl font-bold">ERP Dominicano</div>
                        </div>
                        <div className="mt-8 h-0 flex-1 overflow-y-auto">
                            <nav className="space-y-1 px-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${
                                            item.current
                                                ? 'bg-indigo-800 text-white'
                                                : 'text-indigo-100 hover:bg-indigo-600'
                                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon
                                            className={`${
                                                item.current ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                                            } mr-4 h-6 w-6 flex-shrink-0`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-indigo-700 pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <div className="text-white text-2xl font-bold">ERP Dominicano</div>
                    </div>
                    <nav className="mt-8 flex-1 flex flex-col space-y-1 px-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${
                                    item.current
                                        ? 'bg-indigo-800 text-white'
                                        : 'text-indigo-100 hover:bg-indigo-600'
                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                                <item.icon
                                    className={`${
                                        item.current ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                                    } mr-3 flex-shrink-0 h-6 w-6`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            
            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top navbar */}
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                        </div>
                        <div className="ml-4 flex items-center lg:ml-6">
                            {/* Notificaciones */}
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative">
                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                                {notificaciones?.count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {notificaciones.count}
                                    </span>
                                )}
                            </button>
                            
                            {/* Profile dropdown */}
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm text-right hidden sm:block">
                                        <div className="font-medium text-gray-700">{auth.user?.name}</div>
                                        <div className="text-gray-500 capitalize">{auth.user?.tipo_usuario}</div>
                                    </div>
                                    <div className="relative">
                                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span className="hidden sm:inline ml-2">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Main content area */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="bg-white shadow mt-auto">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-sm text-gray-500">
                                © {new Date().getFullYear()} ERP Dominicano. Todos los derechos reservados.
                            </p>
                            <div className="flex space-x-6 mt-2 sm:mt-0">
                                <span className="text-sm text-gray-500">v1.0.0</span>
                                <span className="text-sm text-gray-500">Sucursal: {auth.user?.sucursal?.nombre || 'Principal'}</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AppLayout;