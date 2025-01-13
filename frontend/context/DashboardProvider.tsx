'use client';

import * as React from 'react';
import { UserReturn } from '@kata/typings';

interface DashboardContextType {
  user: UserReturn;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(
  undefined
);

interface DashboardProviderProps {
  user: UserReturn;
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  user,
  children,
}) => {
  return (
    <DashboardContext.Provider value={{ user }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
