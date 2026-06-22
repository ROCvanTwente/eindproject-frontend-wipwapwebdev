import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { authService } from '../services/authService';

interface AuthContextValue {
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  login: (identifier: string, password: string) => Promise<{ requiresPasswordChange: boolean; requiresAccountSetup: boolean; email?: string }>;
  completePasswordChange: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PASSWORD_CHANGE_REQUIRED_KEY = 'admin-requires-password-change';

export function AuthProvider({ children }: PropsWithChildren) {
  const initiallyAuthenticated = authService.isAuthenticated();
  const [isAuthenticated, setIsAuthenticated] = useState(initiallyAuthenticated);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(
    initiallyAuthenticated && sessionStorage.getItem(PASSWORD_CHANGE_REQUIRED_KEY) === 'true',
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      requiresPasswordChange,
      async login(identifier: string, password: string) {
        const result = await authService.login({ identifier, password });
        setIsAuthenticated(true);
        setRequiresPasswordChange(result.requiresPasswordChange);

        if (result.requiresPasswordChange) {
          sessionStorage.setItem(PASSWORD_CHANGE_REQUIRED_KEY, 'true');
        } else {
          sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
        }

        return {
          requiresPasswordChange: result.requiresPasswordChange,
          requiresAccountSetup: result.requiresAccountSetup,
          email: result.email,
        };
      },
      completePasswordChange() {
        setRequiresPasswordChange(false);
        sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
      },
      logout() {
        authService.logout();
        setIsAuthenticated(false);
        setRequiresPasswordChange(false);
        sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
      },
    }),
    [isAuthenticated, requiresPasswordChange],
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
