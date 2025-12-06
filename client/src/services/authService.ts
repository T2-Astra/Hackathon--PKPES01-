import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  provider?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1062498852888-abf61mkqm0fja011bfpdjmf1couv9gfh.apps.googleusercontent.com';
const STORAGE_KEY = 'learnflow_auth_user';

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const storeUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export function useGoogleAuth(): AuthState {
  const storedUser = getStoredUser();
  const [authState, setAuthState] = useState<AuthState>({
    user: storedUser,
    isLoading: false,
    isAuthenticated: !!storedUser
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return authState;
}

export function useAuthActions() {
  const signInWithGoogle = useCallback(async () => {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = 'openid email profile';
    
    sessionStorage.setItem('oauth_redirect_path', window.location.pathname);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('prompt', 'select_account');

    window.location.href = authUrl.toString();
  }, []);

  const signOut = useCallback(async () => {
    storeUser(null);
    localStorage.removeItem('authToken');
    
    // Call server logout
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Server logout failed:', error);
    }
    
    authService.updateAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Redirect to home
    window.location.replace('/');
  }, []);

  return { signInWithGoogle, signOut };
}

class AuthService {
  private static instance: AuthService;
  private subscribers: ((authState: AuthState) => void)[] = [];
  private currentAuthState: AuthState = {
    user: getStoredUser(),
    isLoading: false,
    isAuthenticated: !!getStoredUser()
  };

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public updateAuthState(authState: AuthState) {
    this.currentAuthState = authState;
    this.subscribers.forEach(cb => cb(authState));
  }

  public subscribe(callback: (authState: AuthState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.currentAuthState);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public setUser(user: User | null, token?: string) {
    storeUser(user);
    if (token) {
      localStorage.setItem('authToken', token);
    }
    this.updateAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user
    });
  }
}

export const authService = AuthService.getInstance();
