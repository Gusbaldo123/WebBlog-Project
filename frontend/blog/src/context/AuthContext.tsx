import { createContext, useContext, useEffect, useState } from "react";
import type { Author } from "../models/Author";
import { decode } from "../utils/SessionDecoder";

interface AuthContextType {
  author: Author | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (token) {
      const payload = decode(token);
      if (payload) {
        setAuthor({
          ...payload.user,
          session: token
        });
      }
    }
    setLoading(false);
  }, []);

  // Login
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API || '/api';
      const url = `${apiUrl}/author/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) return false;

      const token = await response.text(); // backend retorna string pura

      localStorage.setItem("session_token", token);
      const payload = decode(token);

      if (payload) {
        setAuthor({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          session: token
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem("session_token");
    setAuthor(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ author, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
