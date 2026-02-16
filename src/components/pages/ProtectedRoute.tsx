import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../../stores/authStore";

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { token, logout } = useAuthStore();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      logout();
      window.location.href = "https://ckarlosdev.github.io/login/";
    }
  }, [token, logout]);

  if (!token || isTokenExpired(token)) return null;

  return <>{children}</>;
}