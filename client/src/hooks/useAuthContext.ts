import { useState, useEffect, createContext, useContext } from 'react';
import { useClerk } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
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
  const { signOut } = useClerk();

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
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
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
    console.log('✅ Local state cleared');
    
    // Clear any Clerk-related session storage
    sessionStorage.clear(); // Clear all session storage to ensure clean state
    console.log('✅ Session storage cleared');
    
    try {
      // Sign out from Clerk
      await signOut();
      
      // Call server logout to clear cookies
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    // Force immediate redirect to landing page with a small delay to ensure state is cleared
    console.log('🔄 Redirecting to landing page...');
    setTimeout(() => {
      window.location.replace('/'); // Use replace instead of href for immediate redirect
    }, 100);
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
