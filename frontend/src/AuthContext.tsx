import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from './api';

interface User {
  id: number;
  email: string;
  credits: number;
  created_at: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const newToken = response.data.access_token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      await updateUser();
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authAPI.register(email, password);
      const newToken = response.data.access_token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      await updateUser();
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback(async () => {
    try {
      const [userResponse, adminResponse] = await Promise.all([
        authAPI.getMe(),
        authAPI.getAdminStatus()
      ]);
      
      setUser({
        ...userResponse.data,
        isAdmin: adminResponse.data.is_admin
      });
    } catch (error) {
      logout();
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await updateUser();
      }
      setLoading(false);
    };

    initAuth();
  }, [token, updateUser]);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
