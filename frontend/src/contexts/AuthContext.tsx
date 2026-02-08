"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface AuthContextType {
  userId: string | null;
  userRole: "jobseeker" | "recruiter" | null;
  user: {
    name?: string | null;
    email?: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  userRole: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authData, setAuthData] = useState<AuthContextType>({
    userId: null,
    userRole: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    if (status === "loading") {
      setAuthData((prev) => ({ ...prev, isLoading: true }));
    } else if (status === "authenticated" && session) {
      setAuthData({
        userId: session.user.id,
        userRole: session.user.role,
        user: {
          name: session.user.name,
          email: session.user.email,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthData({
        userId: null,
        userRole: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [session, status]);

  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
}
