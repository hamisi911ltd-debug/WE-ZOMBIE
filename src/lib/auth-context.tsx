import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from './api-client';

export type AppRole = 'admin' | 'instructor' | 'student';

interface User {
  id: string;
  email: string;
  fullName: string | null;
}

interface AuthContextType {
  user: User | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const data = await authAPI.getSession();
      if (data && data.user) {
        setUser(data.user);
        setRoles(data.roles || []);
      } else {
        setUser(null);
        setRoles([]);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await authAPI.login(email, password);
      await checkSession();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRoles([]);
    }
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  useEffect(() => {
    checkSession();
  }, []);

  const value: AuthContextType = {
    user,
    roles,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    checkSession,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
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