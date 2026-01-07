"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* =======================
   Types
======================= */

interface User {
  internal_user_id: number;
  client_id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  location: string;
  is_active: boolean;
  created_at: string;
  department: string;
  twoFactorEnabled: boolean;
  lastPasswordChangeDate: string | null;
}

 interface AuthUser {
  id: string;
  username: string;
  role: string;
  clinicId: string;
}


interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}




/* =======================
   Context
======================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* =======================
   Provider
======================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from server cookie
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        setUser,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   Hook
======================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
