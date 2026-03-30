import React from 'react';
import { Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function ConfigLayout({ children, title }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [inventarioOpen, setInventarioOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            {/* NAVEGACIÓN PRINCIPAL - ESCRITORIO */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                
                                {/* Clientes */}
                                <NavLink
                                    href={route('clientes.index')}
                                    active={route().current('clientes.*')}
                                >
                                    Clientes
                                </NavLink>
                                
                                {/* Inventario - Menú desplegable con Headless UI */}
                                <Menu as="div" className="relative flex items-center">
                                    <Menu.Button
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                            route().current('categorias.*') || 
                                            route().current('proveedores.*') || 
                                            route().current('productos.*')
                                                ? 'border-b-2 border-blue-500 text-gray-900 dark:text-gray-100'
                                                : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        Inventario
                                    </Menu.Button>
                                </Menu>
                            </div>
                        </div>

                        <div className="flex items-center">
                            {/* Theme Toggle */}
                            <ThemeToggle />
                            
                            {/* Notificaciones */}
                            <button className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative">
                                <svg className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path d="M14.857 17.272a1 1 0 00-.707.293l-10.586-10.586a1 1 0 00-1.414 1.414L10.586 17.272a1 1 0 001.414-1.414l10.586 10.586a1 1 0 00.707-.293l10.586 10.586a1 1 0 00.707.293z" />
                                </svg>
                            </button>
                            
                            {/* Profile dropdown */}
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm text-right hidden sm:block">
                                        <div className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</div>
                                        <div className="text-gray-500 dark:text-gray-400 capitalize">{user?.tipo_usuario}</div>
                                    </div>
                                    <div className="relative">
                                        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0v1a8 8 0 0016 0v-1a8 8 0 0016 0zm-3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293a1 1 0 00-1.414 0L2.586 9.172a1 1 0 00-1.414 1.414L7.293 13.414a1 1 0 001.414 1.414L10 11.586l2.293 2.293a1 1 0 001.414 1.414L12.414 13.414a1 1 0 001.414-1.414L10 11.586z" clipRule="evenodd" />
                                        </svg>
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1">
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            © {new Date().getFullYear()} ERP Dominicano. Todos los derechos reservados.
                        </p>
                        <div className="flex space-x-6 mt-2 sm:mt-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">v1.0.0</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Sucursal: {user?.sucursal?.nombre || 'Principal'}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
