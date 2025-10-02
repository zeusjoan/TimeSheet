
import React from 'react';
import type { Page } from '../../types';
import DashboardIcon from '../icons/DashboardIcon';
import ClientsIcon from '../icons/ClientsIcon';
import OrdersIcon from '../icons/OrdersIcon';
import SettlementsIcon from '../icons/SettlementsIcon';
import ThemeToggle from '../ThemeToggle';
import { useAppData } from '../../hooks/useAppData';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appData: ReturnType<typeof useAppData>;
}

const NavItem: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ page, currentPage, setCurrentPage, icon, label }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      currentPage === page
        ? 'bg-primary text-primary-foreground'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const navItems = [
    { page: 'dashboard' as Page, icon: <DashboardIcon />, label: 'Dashboard' },
    { page: 'clients' as Page, icon: <ClientsIcon />, label: 'Klienci' },
    { page: 'orders' as Page, icon: <OrdersIcon />, label: 'Zamówienia' },
    { page: 'settlements' as Page, icon: <SettlementsIcon />, label: 'Rozliczenia' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-primary dark:text-white">Time<span className="text-blue-500">Sheet</span></h1>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              page={item.page}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;