export type ServiceType = 'coupe' | 'brushing' | 'meches' | 'coloration' | 'supplements' | 'coulage' | 'soin' | 'chignon';

export interface Service {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  types: ServiceType[];
  products?: string;
  price: number;
  date: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientType = 'homme' | 'femme' | 'enfant';

export interface Client {
  id: string;
  userId: string;
  name: string;
  type: ClientType;
  notes?: string;
  lastVisit: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalonSettings {
  userId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  updatedAt?: string;
}

export type TimeRange = 'week' | 'month' | 'year' | 'global';
export type ComparisonPeriod = 'week' | 'month' | 'year';
export type SortField = 'name' | 'type' | 'lastVisit';
export type SortDirection = 'asc' | 'desc';