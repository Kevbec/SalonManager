import React from 'react';
import { LayoutDashboard, Users, Settings, Scissors, LogOut, User, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { state } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfileClick = () => {
    onSectionChange('settings');
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-900 p-2 rounded-lg">
            <Scissors className="w-6 h-6 text-white transform rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">SalonManager</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {state.settings?.name || 'Gestion professionnelle'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 pt-6">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
          { id: 'clients', icon: Users, label: 'Clients & Services' },
          { id: 'settings', icon: Settings, label: 'Paramètres' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-200">
        <button
          onClick={handleProfileClick}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-900" />
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}