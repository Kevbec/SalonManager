import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Client, Service } from '../types';
import { useApp } from '../context/AppContext';
import { ServiceForm } from './ServiceForm';

interface ClientDetailsPageProps {
  client: Client;
  onBack: () => void;
}

export function ClientDetailsPage({ client, onBack }: ClientDetailsPageProps) {
  const { state, dispatch } = useApp();
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  const clientServices = state.services
    .filter(service => service.clientId === client.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calculer la date de dernière visite
  const lastVisitDate = useMemo(() => {
    if (clientServices.length === 0) return null;
    return clientServices[0].date;
  }, [clientServices]);

  const toggleFavorite = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: client.id });
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
      dispatch({ type: 'DELETE_SERVICE', payload: serviceId });
    }
  };

  const handleCloseForm = () => {
    setSelectedService(undefined);
    setShowServiceForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{client.name}</h1>
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

        <div className="grid grid-cols-12 gap-6">
          {/* Informations client - 1/3 */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {client.type === 'homme' ? 'Homme' : client.type === 'femme' ? 'Femme' : 'Enfant'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client depuis</label>
                  <p className="text-gray-900">
                    {format(parseISO(client.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dernière visite</label>
                  <p className="text-gray-900">
                    {lastVisitDate 
                      ? format(parseISO(lastVisitDate), 'dd MMMM yyyy', { locale: fr })
                      : 'Aucune visite'}
                  </p>
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
          </div>

          {/* Historique des prestations - 2/3 */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Historique des prestations</h2>
                <button
                  onClick={() => setShowServiceForm(true)}
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
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group relative"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-bold text-gray-900">
                                  {format(parseISO(service.date), 'dd MMMM yyyy', { locale: fr })}
                                </div>
                                {service.duration && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {service.duration} min
                                  </div>
                                )}
                              </div>
                              <span className="text-blue-900 font-semibold text-lg">
                                {service.price.toFixed(2)} €
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {service.types.map(type => (
                                <span
                                  key={type}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>

                            {service.products && (
                              <div className="mb-2 text-sm">
                                <span className="font-medium text-gray-700">Produits utilisés : </span>
                                <span className="text-gray-600">{service.products}</span>
                              </div>
                            )}

                            {service.notes && (
                              <p className="text-sm text-gray-600">{service.notes}</p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showServiceForm && (
        <ServiceForm
          clientId={client.id}
          service={selectedService}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}