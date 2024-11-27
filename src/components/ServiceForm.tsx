import React, { useState } from 'react';
import { Clock, Euro } from 'lucide-react';
import { Service, ServiceType } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface ServiceFormProps {
  clientId: string;
  service?: Service;
  onClose: () => void;
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'coupe', label: 'Coupe' },
  { value: 'brushing', label: 'Brushing' },
  { value: 'meches', label: 'Mèches' },
  { value: 'coloration', label: 'Coloration' },
  { value: 'supplements', label: 'Suppléments' },
  { value: 'coulage', label: 'Coulage' },
  { value: 'soin', label: 'Soin' },
  { value: 'chignon', label: 'Chignon' }
];

export function ServiceForm({ clientId, service, onClose }: ServiceFormProps) {
  const { dispatch } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    types: service?.types || [],
    products: service?.products || '',
    price: service?.price?.toString() || '',
    date: service?.date || new Date().toISOString().split('T')[0],
    duration: service?.duration?.toString() || '',
    notes: service?.notes || ''
  });
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Vous devez être connecté pour créer une prestation');
      return;
    }

    if (formData.types.length === 0) {
      setError('Veuillez sélectionner au moins un type de service');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = new Date().toISOString();
      const serviceData: Service = {
        ...service, // Garder toutes les propriétés existantes pour une modification
        id: service?.id || `temp_${Date.now()}`,
        userId: user.id,
        clientId,
        name: formData.types.map(type => 
          SERVICE_TYPES.find(t => t.value === type)?.label || type
        ).join(', '),
        types: formData.types,
        products: formData.products || undefined,
        price: parseFloat(formData.price),
        date: formData.date,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        notes: formData.notes || undefined,
        createdAt: service?.createdAt || now,
        updatedAt: now
      };

      if (service) {
        await dispatch({
          type: 'UPDATE_SERVICE',
          payload: serviceData
        });
      } else {
        await dispatch({
          type: 'ADD_SERVICE',
          payload: serviceData
        });
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeToggle = (type: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {service ? 'Modifier la prestation' : 'Nouvelle prestation'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de prestation
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeToggle(value)}
                  disabled={saving}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.types.includes(value)
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  disabled={saving}
                />
                <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (min)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5"
                  className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  disabled={saving}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produits utilisés
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              value={formData.products}
              onChange={(e) => setFormData({ ...formData, products: e.target.value })}
              placeholder="Liste des produits utilisés..."
              disabled={saving}
            />
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
              placeholder="Détails ou instructions particulières..."
              disabled={saving}
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
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : (service ? 'Modifier' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}