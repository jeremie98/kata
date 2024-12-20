import { auth } from '@/auth';
import { redirect } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export default async function Page() {
  const session = await auth();
  const locale = await getLocale();

  if (session) {
    redirect({ href: '/dashboard', locale });
  } else {
    redirect({ href: '/login', locale });
  }
}
