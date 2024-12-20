import { getRequestConfig } from 'next-intl/server';
import { locales, routing } from '@/i18n/routing';
import { SupportedLocale } from './locales';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as unknown as SupportedLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
