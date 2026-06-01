"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { useStore } from "zustand";

import {
  type DashboardStore,
  createDashboardStore,
} from "@/stores/dashboard-store";

export type DashboardStoreApi = ReturnType<typeof createDashboardStore>;

export const DashboardStoreContext = createContext<
  DashboardStoreApi | undefined
>(undefined);

export interface DashboardStoreProviderProps {
  children: ReactNode;
}

export const DashboardStoreProvider = ({
  children,
}: DashboardStoreProviderProps) => {
  const [store] = useState(createDashboardStore);

  return (
    <DashboardStoreContext.Provider value={store}>
      {children}
    </DashboardStoreContext.Provider>
  );
};

export const useDashboardStore = <T,>(
  selector: (store: DashboardStore) => T,
): T => {
  const dashboardStoreContext = useContext(DashboardStoreContext);

  if (!dashboardStoreContext) {
    throw new Error(
      `useDashboardStore must be used within DashboardStoreProvider`,
    );
  }

  return useStore(dashboardStoreContext, selector);
};
