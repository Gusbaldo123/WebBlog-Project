import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactElement } from "react";

export function PrivateRoute({ children }: { children: ReactElement }) {
  const { author, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;
  if (!author) return <Navigate to="/login" replace />;

  return children;
}
