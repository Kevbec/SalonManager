import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthState, UserProfile } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          // Synchroniser le nom d'affichage entre Firestore et Firebase Auth
          if (userData?.displayName && userData.displayName !== firebaseUser.displayName) {
            await updateProfile(firebaseUser, { displayName: userData.displayName });
          } else if (firebaseUser.displayName && (!userData?.displayName || userData.displayName !== firebaseUser.displayName)) {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              displayName: firebaseUser.displayName,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          const userProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: userData?.displayName || firebaseUser.displayName || undefined,
            photoURL: userData?.photoURL || firebaseUser.photoURL || undefined,
            createdAt: userData?.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };

          setState({
            user: userProfile,
            loading: false,
            error: null
          });

          await setDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (error: any) {
          setState({ user: null, loading: false, error: 'Error fetching user data' });
        }
      } else {
        setState({ user: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during login'
      }));
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });

      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during registration'
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during logout'
      }));
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      // Mettre à jour Firebase Auth
      await updateProfile(auth.currentUser, { displayName, photoURL });
      
      // Mettre à jour Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setState(prev => ({
        ...prev,
        loading: false,
        user: prev.user ? { ...prev.user, displayName, photoURL } : null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred updating profile'
      }));
      throw error;
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred updating password'
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateUserProfile,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}