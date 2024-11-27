import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { ClientsSection } from './components/ClientsSection';
import { SettingsSection } from './components/SettingsSection';
import { ClientDetailsPage } from './components/ClientDetailsPage';
import { Sidebar } from './components/Sidebar';

function PrivateLayout() {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [selectedClient, setSelectedClient] = React.useState(null);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 ml-64">
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'clients' && !selectedClient && (
          <ClientsSection onClientSelect={handleClientSelect} />
        )}
        {activeSection === 'clients' && selectedClient && (
          <ClientDetailsPage
            client={selectedClient}
            onBack={handleBackToClients}
          />
        )}
        {activeSection === 'settings' && <SettingsSection />}
      </main>
    </div>
  );
}

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <PrivateLayout />,
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;