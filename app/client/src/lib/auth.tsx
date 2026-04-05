import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, setToken, clearToken } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Agency {
  id: string;
  name: string;
  plan?: string;
}

interface AuthState {
  user: User | null;
  agency: Agency | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, agencyName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hireflow_token");
    if (token) {
      api("/auth/me")
        .then((data) => {
          setUser(data.user);
          setAgency(data.agency);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    setAgency(data.agency);
  };

  const register = async (email: string, password: string, name: string, agencyName: string) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, agencyName }),
    });
    setToken(data.token);
    setUser(data.user);
    setAgency(data.agency);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setAgency(null);
  };

  return (
    <AuthContext.Provider value={{ user, agency, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
