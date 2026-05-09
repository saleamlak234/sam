
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { env } from '../config/env';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  phoneNumber: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  level: number;
  directReferrals: number;
  totalTeamSize: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  referralCode?: string;
  paymentMethods?: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use Vite environment variables
const API_BASE_URL = env.API_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;

// Log environment info in development
if (env.IS_DEVELOPMENT) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: env.API_BASE_URL,
    ENVIRONMENT: env.ENVIRONMENT,
    DOMAIN: env.DOMAIN,
    APP_VERSION: env.APP_VERSION
  });
}

// Add request interceptor to handle file uploads
axios.interceptors.request.use((config) => {
  // For file uploads, don't set content-type header (let browser set it)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const register = async (userData: RegisterData) => {
    const response = await axios.post('/auth/register', userData);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

