import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Clean up token if fetch fails
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    // Listen to token-expired events from Axios api client
    const handleAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfileState,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
