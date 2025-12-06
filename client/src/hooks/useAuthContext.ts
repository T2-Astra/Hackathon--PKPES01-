import { useState, useEffect, createContext, useContext } from 'react';
import { authService, useAuthActions } from '@/services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuthActions();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        setToken(storedToken);
        
        // Try to get user info using the stored token
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Update auth service
          authService.setUser({
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isAdmin: userData.isAdmin
          }, storedToken);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          localStorage.removeItem('learnflow_auth_user');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('learnflow_auth_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User, userToken: string) => {
    // Store token first
    localStorage.setItem('authToken', userToken);
    
    // Update state
    setToken(userToken);
    setUser(userData);
    
    // Update auth service
    authService.setUser({
      id: userData.id,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: userData.isAdmin
    }, userToken);
    
    // Sync onboarding data from localStorage to MongoDB if exists
    const savedOnboardingData = localStorage.getItem('learnflow_onboarding_data');
    const onboardingCompleted = localStorage.getItem('learnflow_onboarding_completed');
    
    if (savedOnboardingData && onboardingCompleted === 'true') {
      try {
        const data = JSON.parse(savedOnboardingData);
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            ...data,
            onboardingCompleted: true,
          }),
        });
        console.log('✅ Synced onboarding preferences to MongoDB');
      } catch (error) {
        console.error('Failed to sync onboarding data:', error);
      }
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process...');
    
    // Clear client state immediately first
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('learnflow_auth_user');
    console.log('✅ Local state cleared');
    
    // Clear session storage
    sessionStorage.clear();
    console.log('✅ Session storage cleared');
    
    // Use the signOut from auth service
    await signOut();
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    checkAuth,
  };
}
