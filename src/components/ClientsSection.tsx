import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, ClientType, SortField, SortDirection } from '../types';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClientForm } from './ClientForm';

interface ClientsSectionProps {
  onClientSelect: (client: Client) => void;
}

export function ClientsSection({ onClientSelect }: ClientsSectionProps) {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ClientType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const clientTypes: { value: ClientType; label: string }[] = [
    { value: 'homme', label: 'Homme' },
    { value: 'femme', label: 'Femme' },
    { value: 'enfant', label: 'Enfant' }
  ];

  // Calculer les dates de dernière visite pour chaque client
  const clientsWithLastVisit = useMemo(() => {
    return state.clients.map(client => {
      const clientServices = state.services
        .filter(service => service.clientId === client.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        ...client,
        lastVisit: clientServices.length > 0 ? clientServices[0].date : null
      };
    });
  }, [state.clients, state.services]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFavorite = (clientId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: clientId });
  };

  const handleEditClick = (client: Client) => {
    setSelectedClientForEdit(client);
  };

  const handleCloseForm = () => {
    setSelectedClientForEdit(null);
    setShowModal(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Aucune visite';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return 'Date invalide';
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  const sortedAndFilteredClients = useMemo(() => {
    let filtered = clientsWithLastVisit.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || client.type === filterType;
      const matchesFavorite = !showFavoritesOnly || client.isFavorite;
      return matchesSearch && matchesType && matchesFavorite;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'lastVisit':
          if (!a.lastVisit && !b.lastVisit) comparison = 0;
          else if (!a.lastVisit) comparison = 1;
          else if (!b.lastVisit) comparison = -1;
          else comparison = a.lastVisit.localeCompare(b.lastVisit);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [clientsWithLastVisit, searchTerm, filterType, showFavoritesOnly, sortField, sortDirection]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-64 right-0 bg-white z-20 border-b border-gray-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Liste des clients</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouveau Client
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ClientType | 'all')}
            >
              <option value="all">Tous les types</option>
              {clientTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
              Favoris
            </button>
          </div>
        </div>

        {/* Fixed Table Header */}
        <div className="px-8">
          <div className="bg-white rounded-t-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-6 py-3"></th>
                  <th className="px-6 py-3 text-left">
                    <button
                      className="flex items-center text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Nom
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      className="flex items-center text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                      onClick={() => handleSort('type')}
                    >
                      Type
                      {sortField === 'type' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      className="flex items-center text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                      onClick={() => handleSort('lastVisit')}
                    >
                      Dernière Visite
                      {sortField === 'lastVisit' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>

      {/* Table Content with top padding to account for fixed header */}
      <div className="pt-[232px]">
        <div className="px-8">
          <div className="bg-white rounded-b-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAndFilteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFavorite(client.id)}
                          className={`text-gray-400 hover:text-yellow-400 ${
                            client.isFavorite ? 'text-yellow-400' : ''
                          }`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              client.isFavorite ? 'fill-yellow-400' : 'fill-transparent'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onClientSelect(client)}
                          className="text-blue-900 hover:text-blue-700 font-medium"
                        >
                          {client.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {clientTypes.find(t => t.value === client.type)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.lastVisit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => onClientSelect(client)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
                                dispatch({ type: 'DELETE_CLIENT', payload: client.id });
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {(showModal || selectedClientForEdit) && (
        <ClientForm
          client={selectedClientForEdit || undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}