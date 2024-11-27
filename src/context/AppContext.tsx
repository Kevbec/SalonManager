import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Client, Service, SalonSettings } from '../types';
import { useAuth } from './AuthContext';
import { sanitizeServiceForFirestore, validateService, sanitizeClientForFirestore, validateClient, sanitizeSettingsForFirestore, validateSettings } from '../utils/firebase';

interface AppState {
  clients: Client[];
  services: Service[];
  settings: SalonSettings | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'SET_SETTINGS'; payload: SalonSettings }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'UPDATE_SERVICE'; payload: Service }
  | { type: 'DELETE_SERVICE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: SalonSettings }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

const initialState: AppState = {
  clients: [],
  services: [],
  settings: null,
  loading: true,
  error: null
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        )
      };

    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };

    case 'ADD_SERVICE': {
      const newServices = [...state.services, action.payload];
      const updatedClients = state.clients.map(client => {
        if (client.id === action.payload.clientId) {
          const clientServices = newServices
            .filter(service => service.clientId === client.id)
            .sort((a, b) => b.date.localeCompare(a.date));
          
          return {
            ...client,
            lastVisit: clientServices[0]?.date || client.lastVisit
          };
        }
        return client;
      });

      return {
        ...state,
        services: newServices,
        clients: updatedClients
      };
    }

    case 'UPDATE_SERVICE': {
      const updatedServices = state.services.map(service =>
        service.id === action.payload.id ? action.payload : service
      );

      const updatedClients = state.clients.map(client => {
        const clientServices = updatedServices
          .filter(service => service.clientId === client.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        
        return {
          ...client,
          lastVisit: clientServices[0]?.date || client.lastVisit
        };
      });

      return {
        ...state,
        services: updatedServices,
        clients: updatedClients
      };
    }

    case 'DELETE_SERVICE': {
      const remainingServices = state.services.filter(service => 
        service.id !== action.payload
      );

      const updatedClients = state.clients.map(client => {
        const clientServices = remainingServices
          .filter(service => service.clientId === client.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        
        return {
          ...client,
          lastVisit: clientServices[0]?.date || client.lastVisit
        };
      });

      return {
        ...state,
        services: remainingServices,
        clients: updatedClients
      };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload
            ? { ...client, isFavorite: !client.isFavorite }
            : client
        )
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Fetch settings
        const settingsQuery = query(
          collection(db, 'settings'),
          where('userId', '==', user.id)
        );
        const settingsSnapshot = await getDocs(settingsQuery);
        
        if (!settingsSnapshot.empty) {
          const settingsData = {
            id: settingsSnapshot.docs[0].id,
            ...settingsSnapshot.docs[0].data()
          } as SalonSettings;
          dispatch({ type: 'SET_SETTINGS', payload: settingsData });
        } else {
          const defaultSettings: Omit<SalonSettings, 'id'> = {
            userId: user.id,
            name: 'MonSalon',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            updatedAt: new Date().toISOString()
          };

          const settingsRef = await addDoc(collection(db, 'settings'), defaultSettings);
          dispatch({ 
            type: 'SET_SETTINGS', 
            payload: { ...defaultSettings, id: settingsRef.id } 
          });
        }

        // Fetch clients
        const clientsQuery = query(
          collection(db, 'clients'),
          where('userId', '==', user.id)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Client[];
        dispatch({ type: 'SET_CLIENTS', payload: clientsData });

        // Fetch services
        const servicesQuery = query(
          collection(db, 'services'),
          where('userId', '==', user.id)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        dispatch({ type: 'SET_SERVICES', payload: servicesData });

      } catch (error: any) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.message || 'Error loading data' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, [user]);

  const wrappedDispatch: React.Dispatch<Action> = async (action) => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    try {
      switch (action.type) {
        case 'ADD_CLIENT': {
          const sanitizedData = sanitizeClientForFirestore(action.payload, user.id);
          await validateClient(action.payload);
          
          const { id, ...clientWithoutId } = sanitizedData;
          const docRef = await addDoc(collection(db, 'clients'), clientWithoutId);
          
          dispatch({ 
            ...action, 
            payload: { ...action.payload, id: docRef.id } 
          });
          break;
        }

        case 'UPDATE_CLIENT': {
          const sanitizedData = sanitizeClientForFirestore(action.payload, user.id);
          await validateClient(action.payload);
          await updateDoc(doc(db, 'clients', action.payload.id), sanitizedData);
          dispatch(action);
          break;
        }

        case 'DELETE_CLIENT': {
          await deleteDoc(doc(db, 'clients', action.payload));
          dispatch(action);
          break;
        }

        case 'ADD_SERVICE': {
          const sanitizedData = sanitizeServiceForFirestore(action.payload, user.id);
          await validateService(action.payload);
          const docRef = await addDoc(collection(db, 'services'), sanitizedData);
          dispatch({ ...action, payload: { ...action.payload, id: docRef.id } });
          break;
        }

        case 'UPDATE_SERVICE': {
          const sanitizedData = sanitizeServiceForFirestore(action.payload, user.id);
          await validateService(action.payload);
          await updateDoc(doc(db, 'services', action.payload.id), sanitizedData);
          dispatch(action);
          break;
        }

        case 'DELETE_SERVICE': {
          await deleteDoc(doc(db, 'services', action.payload));
          dispatch(action);
          break;
        }

        case 'UPDATE_SETTINGS': {
          const sanitizedData = sanitizeSettingsForFirestore(action.payload, user.id);
          await validateSettings(action.payload);
          
          const settingsQuery = query(
            collection(db, 'settings'),
            where('userId', '==', user.id)
          );
          const settingsSnapshot = await getDocs(settingsQuery);
          
          if (!settingsSnapshot.empty) {
            await updateDoc(
              doc(db, 'settings', settingsSnapshot.docs[0].id), 
              sanitizedData
            );
            dispatch(action);
          } else {
            const docRef = await addDoc(collection(db, 'settings'), sanitizedData);
            dispatch({ 
              ...action, 
              payload: { ...action.payload, id: docRef.id } 
            });
          }
          break;
        }

        case 'TOGGLE_FAVORITE': {
          const client = state.clients.find(c => c.id === action.payload);
          if (client) {
            const updatedClient = { ...client, isFavorite: !client.isFavorite };
            const sanitizedData = sanitizeClientForFirestore(updatedClient, user.id);
            await updateDoc(doc(db, 'clients', action.payload), sanitizedData);
            dispatch(action);
          }
          break;
        }

        default:
          dispatch(action);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}