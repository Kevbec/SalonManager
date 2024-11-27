import React, { useState, useEffect } from 'react';
import { Client, ClientType } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface ClientFormProps {
  client?: Client;
  onClose: () => void;
}

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'enfant', label: 'Enfant' }
];

export function ClientForm({ client, onClose }: ClientFormProps) {
  const { dispatch } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    type: client?.type || 'femme' as ClientType,
    notes: client?.notes || ''
  });
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Debug logs
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', {
        id: user.id,
        email: user.email
      });
    } else {
      console.log('No user authenticated');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Vous devez être connecté pour créer un client');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = new Date().toISOString();
      
      const clientData = {
        id: client?.id || `temp_${Date.now()}`,
        userId: user.id,
        name: formData.name.trim(),
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        lastVisit: client?.lastVisit || '',
        isFavorite: client?.isFavorite || false,
        createdAt: client?.createdAt || now,
        updatedAt: now
      };

      console.log('Saving client with data:', clientData);

      if (client) {
        await dispatch({
          type: 'UPDATE_CLIENT',
          payload: clientData
        });
      } else {
        await dispatch({
          type: 'ADD_CLIENT',
          payload: clientData
        });
      }
      
      console.log('Client saved successfully');
      onClose();
    } catch (err: any) {
      console.error('Error saving client:', err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
            >
              {CLIENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes ou commentaires..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
              disabled={saving || !user?.id}
            >
              {saving ? 'Enregistrement...' : (client ? 'Modifier' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}