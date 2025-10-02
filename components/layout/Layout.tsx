
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { Page } from '../../types';
import { useAppData } from '../../hooks/useAppData';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  appData: ReturnType<typeof useAppData>;
}

const MenuIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);


const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, appData }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} appData={appData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 focus:outline-none">
                <MenuIcon className="h-6 w-6"/>
            </button>
            <h1 className="text-xl font-semibold ml-4 capitalize">{currentPage}</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary dark:bg-black p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;