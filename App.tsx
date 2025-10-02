
import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Settlements from './pages/Settlements';
import { useAppData } from './hooks/useAppData';
import type { Page } from './types';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const appData = useAppData();
  const { isInitialized, error } = appData;

  const renderPage = () => {
    if (!isInitialized) {
      return <div className="flex items-center justify-center h-full text-lg">Ładowanie danych...</div>;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-lg text-red-500">
            <p>Wystąpił błąd podczas ładowania danych.</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
            <button
                onClick={() => appData.refetch()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
                Spróbuj ponownie
            </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...appData} />;
      case 'clients':
        return <Clients {...appData} />;
      case 'orders':
        return <Orders {...appData} />;
      case 'settlements':
        return <Settlements {...appData} />;
      default:
        return <Dashboard {...appData} />;
    }
  };

  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} appData={appData}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
};

export default App;