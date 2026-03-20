'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  balance: number;
  referral_code: string;
  referral_earnings?: number;
  total_earnings?: number;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('si_token');
    if (stored) {
      setToken(stored);
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.json())
        .then(u => { if (!u.error) setUser(u); else { localStorage.removeItem('si_token'); setToken(null); } })
        .catch(() => { localStorage.removeItem('si_token'); setToken(null); })
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
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const tok = localStorage.getItem('si_token');
    if (!tok) return;
    try {
      const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${tok}` } });
      const u = await r.json();
      if (!u.error) setUser(u);
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
