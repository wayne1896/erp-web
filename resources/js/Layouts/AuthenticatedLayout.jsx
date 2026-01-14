import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function AuthenticatedLayout({ header, children }) {
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
                                        <svg
                                            className="-mr-1 ml-1 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </Menu.Button>
                                    
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute left-0 top-full mt-0 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('productos.index')}
                                                            className={`block px-4 py-2 text-sm ${
                                                                route().current('productos.*')
                                                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                                                    : active
                                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            Productos
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('categorias.index')}
                                                            className={`block px-4 py-2 text-sm ${
                                                                route().current('categorias.*')
                                                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                                                    : active
                                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            Categorías
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('proveedores.index')}
                                                            className={`block px-4 py-2 text-sm ${
                                                                route().current('proveedores.*')
                                                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                                                    : active
                                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            Proveedores
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                                
                                {/* Ventas */}
                                <NavLink
                                    href={route('ventas.index')}
                                    active={route().current('ventas.*')}
                                >
                                    Ventas
                                </NavLink>
                            </div>
                        </div>

                        {/* DROPDOWN USUARIO - ESCRITORIO */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <ThemeToggle />
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-gray-500 dark:text-gray-400 transition duration-150 ease-in-out hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                                            >
                                                {user.name}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* BOTÓN MENÚ MÓVIL */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* NAVEGACIÓN MÓVIL */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink
                            href={route('clientes.index')}
                            active={route().current('clientes.*')}
                        >
                            Clientes
                        </ResponsiveNavLink>
                        
                        {/* Inventario - Móvil */}
                        <div className="border-l-4 border-transparent">
                            <button
                                onClick={() => setInventarioOpen(!inventarioOpen)}
                                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium ${
                                    route().current('categorias.*') || 
                                    route().current('proveedores.*') || 
                                    route().current('productos.*')
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <span>Inventario</span>
                                <svg
                                    className={`h-4 w-4 transition-transform ${
                                        inventarioOpen ? 'rotate-180' : ''
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            
                            {inventarioOpen && (
                                <div className="pl-6 space-y-1">
                                    <ResponsiveNavLink
                                        href={route('productos.index')}
                                        active={route().current('productos.*')}
                                        className="pl-4"
                                    >
                                        Productos
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('categorias.index')}
                                        active={route().current('categorias.*')}
                                        className="pl-4"
                                    >
                                        Categorías
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('proveedores.index')}
                                        active={route().current('proveedores.*')}
                                        className="pl-4"
                                    >
                                        Proveedores
                                    </ResponsiveNavLink>
                                </div>
                            )}
                        </div>
                        
                        {/* Ventas - Móvil */}
                        <ResponsiveNavLink
                            href={route('ventas.index')}
                            active={route().current('ventas.*')}
                        >
                            Ventas
                        </ResponsiveNavLink>
                    </div>

                    {/* USUARIO MÓVIL */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="px-4 py-2">
                                <ThemeToggle />
                            </div>
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}