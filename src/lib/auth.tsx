import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  balance: number;
  referral_code: string;
  referral_earnings?: number;
  total_earnings?: number;
  profile_completed?: boolean;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  bio?: string;
  nin?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('si_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('si_token');
    if (stored) {
      setToken(stored);
      getMe()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('si_token');
          localStorage.removeItem('si_user');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tok: string, u: User) => {
    localStorage.setItem('si_token', tok);
    setToken(tok);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('si_token');
    localStorage.removeItem('si_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await getMe();
      setUser(u);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
