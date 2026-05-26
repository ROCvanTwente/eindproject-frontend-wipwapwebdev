import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { authService } from '../services/authService';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      async login(email: string, password: string) {
        await authService.login({ email, password });
        setIsAuthenticated(true);
      },
      logout() {
        authService.logout();
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
