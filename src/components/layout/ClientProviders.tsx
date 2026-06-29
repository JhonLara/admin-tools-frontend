"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import AppShell from "./AppShell";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
