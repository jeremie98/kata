import { createNavigation } from 'next-intl/navigation';
import { defineRouting, Pathnames } from 'next-intl/routing';
import { SupportedLocale } from './locales';

export const locales = [SupportedLocale.FR] as string[];

const pathnames = {
  '/': '/',
  '/login': '/auth/login',
  '/dashboard': '/dashboard',
  '/players': '/dashboard/administration/players',
  '/players/[id]': '/dashboard/administration/players/[id]',
  '/faqs': '/dashboard/administration/faqs',
  '/faqs/[id]': '/dashboard/administration/faqs/[id]',
  '/kpis-games': '/dashboard/kpis/games',
  '/kpis-operations': '/dashboard/kpis/operations',
  '/kpis-players': '/dashboard/kpis/players',
  '/account': '/dashboard/account',

  '[...rest]': '[...rest]',
} satisfies Pathnames<typeof locales>;

export const routing = defineRouting({
  defaultLocale: SupportedLocale.FR,
  locales,
  localePrefix: 'as-needed',
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export type AppPathnames = keyof typeof pathnames;
