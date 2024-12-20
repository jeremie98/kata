import * as React from 'react';
import { auth } from '@/auth';
import { redirect } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();

  if (session) {
    redirect({ href: '/dashboard', locale });
  }

  return <div className="min-h-screen px-0.5">{children}</div>;
}
