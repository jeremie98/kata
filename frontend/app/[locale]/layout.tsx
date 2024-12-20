import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { NextAuthProvider } from '@/context';
import { SupportedLocale } from '@/i18n/locales';
import { getMessages } from 'next-intl/server';
import { cn } from '@/utils';

interface RootProps {
  children: React.ReactNode;
  params: Promise<{ locale: SupportedLocale }>;
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Kata',
};

export default async function RootLayout(props: RootProps) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <NextAuthProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
