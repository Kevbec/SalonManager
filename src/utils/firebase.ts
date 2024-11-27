import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Client, Service, SalonSettings } from '../types';

export async function checkDocumentExists(collectionName: string, documentId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking document ${documentId}:`, error);
    return false;
  }
}

export function sanitizeClientForFirestore(client: Partial<Client>, userId: string) {
  const now = new Date().toISOString();
  
  const sanitized = {
    userId,
    name: client.name?.trim(),
    type: client.type,
    notes: client.notes?.trim() || null,
    lastVisit: client.lastVisit || null,
    isFavorite: Boolean(client.isFavorite),
    createdAt: client.createdAt || now,
    updatedAt: now
  };

  return Object.entries(sanitized).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

export async function validateClient(client: Partial<Client>): Promise<boolean> {
  if (!client.name?.trim()) {
    throw new Error('Le nom du client est requis');
  }

  if (!client.type) {
    throw new Error('Le type du client est requis');
  }

  const validTypes = ['homme', 'femme', 'enfant'];
  if (!validTypes.includes(client.type)) {
    throw new Error('Type de client invalide');
  }

  if (client.id && !client.id.startsWith('temp_')) {
    const exists = await checkDocumentExists('clients', client.id);
    if (!exists) {
      throw new Error('Client introuvable');
    }
  }

  return true;
}

export function sanitizeServiceForFirestore(service: Service, userId: string) {
  const now = new Date().toISOString();
  
  const sanitized = {
    userId,
    clientId: service.clientId,
    name: service.name.trim(),
    types: service.types,
    products: service.products?.trim() || null,
    price: Number(service.price),
    duration: service.duration !== undefined && service.duration !== '' ? Number(service.duration) : null,
    date: service.date,
    notes: service.notes?.trim() || null,
    createdAt: service.createdAt || now,
    updatedAt: now
  };

  return sanitized;
}

export async function validateService(service: Partial<Service>): Promise<boolean> {
  if (!service.clientId || !service.types?.length || !service.date) {
    throw new Error('Tous les champs requis doivent être remplis');
  }

  if (typeof service.price !== 'number' || service.price < 0) {
    throw new Error('Le prix doit être un nombre positif');
  }

  if (service.duration !== undefined && service.duration !== null && 
      (typeof service.duration !== 'number' || service.duration < 0)) {
    throw new Error('La durée doit être un nombre positif');
  }

  const validTypes = ['coupe', 'brushing', 'meches', 'coloration', 'supplements', 'coulage', 'soin', 'chignon'];
  if (!service.types.every(type => validTypes.includes(type))) {
    throw new Error('Types de service invalides');
  }

  if (service.id && !service.id.startsWith('temp_')) {
    const exists = await checkDocumentExists('services', service.id);
    if (!exists) {
      throw new Error('Service introuvable');
    }
  }

  return true;
}

export function sanitizeSettingsForFirestore(settings: SalonSettings, userId: string) {
  return {
    userId,
    name: settings.name.trim(),
    address: settings.address?.trim() || '',
    city: settings.city?.trim() || '',
    postalCode: settings.postalCode?.trim() || '',
    phone: settings.phone?.trim() || '',
    updatedAt: new Date().toISOString()
  };
}

export function validateSettings(settings: SalonSettings): boolean {
  if (!settings.name?.trim()) {
    throw new Error('Le nom du salon est requis');
  }

  if (settings.phone && !/^[0-9]+$/.test(settings.phone.trim())) {
    throw new Error('Le numéro de téléphone doit contenir uniquement des chiffres');
  }

  return true;
}