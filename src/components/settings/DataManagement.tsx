import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Client, Service } from '../../types';
import { parseCSV } from '../../utils/csv';

interface ImportStatus {
  total: number;
  current: number;
  success: number;
  errors: string[];
}

export function DataManagement() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const clientFileRef = useRef<HTMLInputElement>(null);
  const servicesFileRef = useRef<HTMLInputElement>(null);

  const handleClientImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setImporting(true);
    setStatus({ total: 0, current: 0, success: 0, errors: [] });

    try {
      const content = await file.text();
      const { data, errors } = await parseCSV<Client>(content, [
        { header: 'nom', key: 'name', required: true },
        { header: 'type', key: 'type', required: true, validate: (value) => ['homme', 'femme', 'enfant'].includes(value) },
        { header: 'notes', key: 'notes', required: false }
      ]);

      if (errors.length > 0) {
        setStatus(prev => prev ? { ...prev, errors: [...prev.errors, ...errors] } : null);
        return;
      }

      const now = new Date().toISOString();
      const clients = data.map(row => ({
        id: `temp_${Date.now()}_${Math.random()}`,
        userId: user.id,
        name: row.name,
        type: row.type as 'homme' | 'femme' | 'enfant',
        notes: row.notes,
        lastVisit: '',
        isFavorite: false,
        createdAt: now,
        updatedAt: now
      }));

      setStatus(prev => prev ? { ...prev, total: clients.length } : null);

      for (let i = 0; i < clients.length; i++) {
        try {
          await dispatch({ type: 'ADD_CLIENT', payload: clients[i] });
          setStatus(prev => prev ? {
            ...prev,
            current: i + 1,
            success: prev.success + 1
          } : null);
        } catch (error: any) {
          setStatus(prev => prev ? {
            ...prev,
            current: i + 1,
            errors: [...prev.errors, `Erreur ligne ${i + 2}: ${error.message}`]
          } : null);
        }
      }
    } catch (error: any) {
      setStatus(prev => prev ? {
        ...prev,
        errors: [...prev.errors, `Erreur: ${error.message}`]
      } : null);
    } finally {
      setImporting(false);
      if (clientFileRef.current) {
        clientFileRef.current.value = '';
      }
    }
  };

  const handleServiceImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setImporting(true);
    setStatus({ total: 0, current: 0, success: 0, errors: [] });

    try {
      const content = await file.text();
      const { data, errors } = await parseCSV<Service>(content, [
        { header: 'client_id', key: 'clientId', required: true },
        { header: 'types', key: 'types', required: true },
        { header: 'prix', key: 'price', required: true, transform: (value) => parseFloat(value) },
        { header: 'date', key: 'date', required: true },
        { header: 'duree', key: 'duration', required: false, transform: (value) => value ? parseInt(value) : undefined },
        { header: 'produits', key: 'products', required: false },
        { header: 'notes', key: 'notes', required: false }
      ]);

      if (errors.length > 0) {
        setStatus(prev => prev ? { ...prev, errors: [...prev.errors, ...errors] } : null);
        return;
      }

      const now = new Date().toISOString();
      const services = data.map(row => ({
        id: `temp_${Date.now()}_${Math.random()}`,
        userId: user.id,
        clientId: row.clientId,
        name: row.types,
        types: row.types.split(',').map(t => t.trim()),
        price: row.price,
        date: row.date,
        duration: row.duration,
        products: row.products,
        notes: row.notes,
        createdAt: now,
        updatedAt: now
      }));

      setStatus(prev => prev ? { ...prev, total: services.length } : null);

      for (let i = 0; i < services.length; i++) {
        try {
          await dispatch({ type: 'ADD_SERVICE', payload: services[i] });
          setStatus(prev => prev ? {
            ...prev,
            current: i + 1,
            success: prev.success + 1
          } : null);
        } catch (error: any) {
          setStatus(prev => prev ? {
            ...prev,
            current: i + 1,
            errors: [...prev.errors, `Erreur ligne ${i + 2}: ${error.message}`]
          } : null);
        }
      }
    } catch (error: any) {
      setStatus(prev => prev ? {
        ...prev,
        errors: [...prev.errors, `Erreur: ${error.message}`]
      } : null);
    } finally {
      setImporting(false);
      if (servicesFileRef.current) {
        servicesFileRef.current.value = '';
      }
    }
  };

  const exportClients = () => {
    const headers = ['id', 'nom', 'type', 'notes', 'derniere_visite', 'favori'];
    const rows = state.clients.map(client => [
      client.id,
      client.name,
      client.type,
      client.notes || '',
      client.lastVisit || '',
      client.isFavorite ? 'oui' : 'non'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clients.csv';
    link.click();
  };

  const exportServices = () => {
    const headers = ['id', 'client_id', 'types', 'prix', 'date', 'duree', 'produits', 'notes'];
    const rows = state.services.map(service => [
      service.id,
      service.clientId,
      service.types.join(', '),
      service.price,
      service.date,
      service.duration || '',
      service.products || '',
      service.notes || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prestations.csv';
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Gestion des données</h2>

      <div className="space-y-8">
        {/* Clients Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Clients</h3>
          <div className="space-y-4">
            {/* Import Section */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Format d'import (CSV) :</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4 mb-4">
                <li>nom (obligatoire)</li>
                <li>type (obligatoire : homme, femme, ou enfant)</li>
                <li>notes (optionnel)</li>
              </ul>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={clientFileRef}
                  accept=".csv"
                  onChange={handleClientImport}
                  disabled={importing}
                  className="hidden"
                  id="client-file"
                />
                <label
                  htmlFor="client-file"
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    importing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-900 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Importer des clients
                </label>
                <button
                  onClick={exportClients}
                  className="flex items-center px-4 py-2 rounded-lg border bg-white text-blue-900 hover:bg-blue-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exporter les clients
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Prestations</h3>
          <div className="space-y-4">
            {/* Import Section */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Format d'import (CSV) :</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4 mb-4">
                <li>client_id (obligatoire)</li>
                <li>types (obligatoire, séparés par des virgules)</li>
                <li>prix (obligatoire)</li>
                <li>date (obligatoire, format YYYY-MM-DD)</li>
                <li>duree (optionnel, en minutes)</li>
                <li>produits (optionnel)</li>
                <li>notes (optionnel)</li>
              </ul>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={servicesFileRef}
                  accept=".csv"
                  onChange={handleServiceImport}
                  disabled={importing}
                  className="hidden"
                  id="service-file"
                />
                <label
                  htmlFor="service-file"
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    importing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-900 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Importer des prestations
                </label>
                <button
                  onClick={exportServices}
                  className="flex items-center px-4 py-2 rounded-lg border bg-white text-blue-900 hover:bg-blue-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exporter les prestations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Status */}
        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">État de l'import</h4>
            
            {/* Progress */}
            {status.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{Math.round((status.current / status.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-900 rounded-full h-2 transition-all"
                    style={{ width: `${(status.current / status.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Count */}
            {status.success > 0 && (
              <div className="flex items-center text-green-600 mb-2">
                <Check className="w-4 h-4 mr-2" />
                <span>{status.success} éléments importés avec succès</span>
              </div>
            )}

            {/* Errors */}
            {status.errors.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{status.errors.length} erreurs détectées</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1 mt-2">
                  {status.errors.map((error, index) => (
                    <li key={index} className="ml-6">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}