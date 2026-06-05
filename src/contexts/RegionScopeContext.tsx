import { createContext, useContext, type ReactNode } from "react";

export interface RegionScope {
  basePath: string;
  region: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
}

const defaultScope: RegionScope = {
  basePath: "/regional",
  region: "",
  dashboardTitle: "Regional Dashboard",
  dashboardSubtitle: "Regional health intelligence across municipalities",
};

const RegionScopeContext = createContext<RegionScope>(defaultScope);

export function RegionScopeProvider({
  value,
  children,
}: {
  value: RegionScope;
  children: ReactNode;
}) {
  return (
    <RegionScopeContext.Provider value={value}>
      {children}
    </RegionScopeContext.Provider>
  );
}

export function useRegionScope(): RegionScope {
  return useContext(RegionScopeContext);
}
