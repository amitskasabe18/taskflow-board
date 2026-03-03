import { useState, useEffect } from 'react';

interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  organisation_id: number;
  profile_photo_path: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: true,
    isAuthenticated: false,
  });

  // Fetch user profile
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User profile response:', result); // Debug log
        if (result.success && result.data) {
          // Backend returns data as array, take first user
          if (Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0];
          }
          return result.data;
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
    return null;
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const user = await fetchUserProfile(token);
        if (user) {
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (token: string): Promise<boolean> => {
    localStorage.setItem('auth_token', token);
    const user = await fetchUserProfile(token);
    
    if (user) {
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    } else {
      // Invalid token
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (authState.token) {
        await fetch('http://localhost:8000/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Refresh user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (authState.token) {
      const user = await fetchUserProfile(authState.token);
      if (user) {
        setAuthState(prev => ({
          ...prev,
          user,
        }));
      }
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshUserProfile,
  };
};

export type { User, AuthState, AuthContextType };
