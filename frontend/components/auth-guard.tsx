'use client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Direct Entry Mode: Always allow access
  return <>{children}</>;
}

