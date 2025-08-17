import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  auth_method: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  gmail_connected: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook d'authentification optimisé pour cookies httpOnly
 * Suit les recommandations de la documentation backend
 */
export function useHttpOnlyAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Vérifier le statut d'authentification
   * Le cookie httpOnly est automatiquement inclus avec credentials: 'include'
   */
  const checkAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔍 Vérification authentification avec cookie httpOnly...');
      
      // La requête inclut automatiquement le cookie httpOnly
      const response = await ApiService.getProfile();
      
      if (response.data) {
        console.log('✅ Authentification réussie:', response.data.email);
        setAuthState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Aucune donnée utilisateur reçue');
      }
    } catch (error: any) {
      console.log('❌ Échec authentification:', error.message);
      
      // Debug en cas d'erreur
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('🍪 Cookie httpOnly manquant ou invalide');
        ApiService.debugAuthState();
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
    }
  }, []);

  /**
   * Déconnexion avec suppression du cookie httpOnly côté serveur
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Déconnexion...');
      
      // Appel backend pour supprimer le cookie httpOnly
      await ApiService.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Déconnexion réussie');
      
      // Redirection vers login
      window.location.href = '/oauth2-login';
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
      
      // Déconnexion locale même si le serveur échoue
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      window.location.href = '/oauth2-login';
    }
  }, []);

  /**
   * Initier la connexion OAuth (redirection vers backend)
   */
  const initiateLogin = useCallback(() => {
    console.log('🔐 Redirection vers OAuth...');
    
    // Le backend gérera la définition du cookie httpOnly après OAuth
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google/init`;
  }, []);

  /**
   * Rafraîchir les données utilisateur
   */
  const refreshUser = useCallback(async () => {
    if (authState.isAuthenticated) {
      await checkAuth();
    }
  }, [authState.isAuthenticated, checkAuth]);

  // Vérification automatique au montage du composant
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Gestion globale des erreurs 401 (optionnel, peut être fait via intercepteur)
  useEffect(() => {
    const handleStorageChange = () => {
      // Les cookies httpOnly ne changent pas via localStorage
      // mais on peut écouter d'autres événements si nécessaire
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    // État d'authentification
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    checkAuth,
    logout,
    initiateLogin,
    refreshUser,
    
    // Debug (développement uniquement)
    debugAuth: () => {
      console.log('🔍 État authentification:', authState);
      ApiService.debugAuthState();
    },
  };
}

export default useHttpOnlyAuth;
