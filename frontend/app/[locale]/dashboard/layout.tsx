import * as React from 'react';
import { MainNav } from './components/MainNav';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainNav />
      {children}
    </div>
  );
}
