import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  phone: string;
  nickname: string;
  isPro: boolean;
  proExpireDate?: string;
}

interface AuthContextType {
  user: User | null;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (phone: string) => void;
  logout: () => void;
  upgradeToPro: (plan: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const login = useCallback((phone: string) => {
    setUser({
      id: 'user-demo',
      phone,
      nickname: `用户${phone.slice(-4)}`,
      isPro: false,
    });
    setIsLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const upgradeToPro = useCallback((plan: string) => {
    const days = plan === 'year' ? 365 : plan === 'quarter' ? 90 : 30;
    const expire = new Date();
    expire.setDate(expire.getDate() + days);
    setUser((prev) =>
      prev
        ? { ...prev, isPro: true, proExpireDate: expire.toISOString() }
        : prev,
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoginOpen, openLogin, closeLogin, login, logout, upgradeToPro }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
