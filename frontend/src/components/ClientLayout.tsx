"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
