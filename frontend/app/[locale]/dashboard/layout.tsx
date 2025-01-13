import * as React from 'react';
import { MainNav } from './components/MainNav';
import { DashboardProvider } from '@/context';
import { fetchProfile } from './actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchProfile();

  return (
    <DashboardProvider user={user.data}>
      <div>
        <MainNav />
        {children}
      </div>
    </DashboardProvider>
  );
}
