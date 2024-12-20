'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export const NextAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider refetchInterval={1 * 60 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
};
