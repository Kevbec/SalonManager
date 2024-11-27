import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Clock, Euro, ArrowLeft, Star } from 'lucide-react';
import { Client, Service } from '../types';
import { useApp } from '../context/AppContext';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsProps) {
  const { state, dispatch } = useApp();
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);

  // Récupérer et trier les services du client
  const clientServices = state.services
    .filter(service => service.clientId === client.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const toggleFavorite = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: client.id });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Fiche Client</h1>
              </div>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  client.isFavorite ? 'bg-yellow-50 text-yellow-400' : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <Star className={`w-6 h-6 ${client.isFavorite ? 'fill-yellow-400' : 'fill-transparent'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations client */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                  <p className="text-lg font-medium text-gray-900">{client.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {client.type === 'homme' ? 'Homme' : client.type === 'femme' ? 'Femme' : 'Enfant'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client depuis</label>
                  <p className="text-gray-900">
                    {format(parseISO(client.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dernière visite</label>
                  <p className="text-gray-900">
                    {client.lastVisit 
                      ? format(parseISO(client.lastVisit), 'dd MMMM yyyy', { locale: fr })
                      : 'Aucune visite'}
                  </p>
                </div>
              </div>

              {client.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Historique des prestations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Historique des prestations</h2>
              <button
                onClick={() => setShowNewServiceModal(true)}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle prestation
              </button>
            </div>

            <div className="space-y-4">
              {clientServices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Aucune prestation enregistrée</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {clientServices.map(service => (
                    <div
                      key={service.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <span className="text-blue-900 font-semibold text-lg">
                          {service.price.toFixed(2)} €
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div>
                          {format(parseISO(service.date), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      
                      {service.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-white rounded p-2">
                          {service.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNewServiceModal && (
        <NewServiceModal
          clientId={client.id}
          onClose={() => setShowNewServiceModal(false)}
        />
      )}
    </div>
  );
}

interface NewServiceModalProps {
  clientId: string;
  onClose: () => void;
}

function NewServiceModal({ clientId, onClose }: NewServiceModalProps) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: Service = {
      id: Date.now().toString(),
      clientId,
      name: formData.name,
      price: parseFloat(formData.price),
      date: formData.date,
      duration: parseInt(formData.duration),
      notes: formData.notes || undefined
    };

    dispatch({ type: 'ADD_SERVICE', payload: newService });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Nouvelle Prestation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestation
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Coupe et Brushing"
            />
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
                  required
                  min="0"
                  step="5"
                  className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
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
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}