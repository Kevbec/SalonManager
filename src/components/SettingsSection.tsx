import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Database, ChevronLeft } from 'lucide-react';
import { SalonSettings } from '../types';
import { DataManagement } from './settings/DataManagement';

export function SettingsSection() {
  const { state, dispatch } = useApp();
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const [activeSection, setActiveSection] = useState<'main' | 'user' | 'salon' | 'data'>('main');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // User Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Salon Settings State
  const [salonSettings, setSalonSettings] = useState<SalonSettings>({
    name: state.settings?.name || 'MonSalon',
    address: state.settings?.address || '',
    city: state.settings?.city || '',
    postalCode: state.settings?.postalCode || '',
    phone: state.settings?.phone || '',
    userId: user?.id || ''
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = e.target.value.replace(/\D/g, '');
    setSalonSettings({ ...salonSettings, phone: formattedPhone });
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPostalCode = e.target.value.replace(/\D/g, '');
    setSalonSettings({ ...salonSettings, postalCode: formattedPostalCode });
  };

  const handleUserProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateUserProfile(displayName);
      setActiveSection('main');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection('main');
    } catch (err: any) {
      setError(err.message || 'Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await dispatch({
        type: 'UPDATE_SETTINGS',
        payload: { ...salonSettings, userId: user?.id || '' }
      });
      setActiveSection('main');
    } catch (err: any) {
      setError(err.message || 'Error saving salon settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      {activeSection === 'main' ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Paramètres</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => setActiveSection('user')}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <User className="w-8 h-8 text-blue-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profil Utilisateur</h3>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </button>

            <button
              onClick={() => setActiveSection('salon')}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Settings className="w-8 h-8 text-blue-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Paramètres du Salon</h3>
              <p className="text-gray-600">Configurez les informations de votre salon</p>
            </button>

            <button
              onClick={() => setActiveSection('data')}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Database className="w-8 h-8 text-blue-900 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion des données</h3>
              <p className="text-gray-600">Importez et exportez vos données</p>
            </button>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setActiveSection('main')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </button>

          {activeSection === 'user' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Profil Utilisateur</h2>

              <form onSubmit={handleUserProfileSubmit} className="space-y-6 mb-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Mettre à jour le profil'}
                </button>
              </form>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h3 className="text-lg font-semibold">Changer le mot de passe</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'salon' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Paramètres du Salon</h2>

              <form onSubmit={handleSalonSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du salon
                  </label>
                  <input
                    type="text"
                    value={salonSettings.name}
                    onChange={(e) => setSalonSettings({ ...salonSettings, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={salonSettings.address}
                    onChange={(e) => setSalonSettings({ ...salonSettings, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={salonSettings.postalCode}
                      onChange={handlePostalCodeChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={salonSettings.city}
                      onChange={(e) => setSalonSettings({ ...salonSettings, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={salonSettings.phone}
                    onChange={handlePhoneChange}
                    placeholder="Numéro de téléphone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'data' && <DataManagement />}
        </div>
      )}
    </div>
  );
}