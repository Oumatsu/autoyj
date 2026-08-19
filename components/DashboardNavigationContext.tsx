"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type DashboardNavigationContextValue = {
  isDashboardNavigationOpen: boolean;
  openDashboardNavigation: () => void;
  setDashboardNavigationOpen: (open: boolean) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const [isDashboardNavigationOpen, setDashboardNavigationOpen] = useState(false);
  const openDashboardNavigation = useCallback(() => setDashboardNavigationOpen(true), []);
  const value = useMemo(
    () => ({ isDashboardNavigationOpen, openDashboardNavigation, setDashboardNavigationOpen }),
    [isDashboardNavigationOpen, openDashboardNavigation]
  );

  return <DashboardNavigationContext.Provider value={value}>{children}</DashboardNavigationContext.Provider>;
}

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);
  if (!context) throw new Error("useDashboardNavigation must be used within DashboardNavigationProvider");
  return context;
}
