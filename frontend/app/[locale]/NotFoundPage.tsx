'use client';

import Image from 'next/image';
import NotFound404 from '@/public/images/404.jpg';
import { Button, TypoBody } from '@/lib';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';

export const NotFoundPage = () => {
  const t = useTranslations('404');

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5">
      <Image src={NotFound404} width={400} alt="404 not found" />
      <TypoBody className="text-white">{t('page-not-exists')}...</TypoBody>
      <Link href="/dashboard" passHref>
        <Button>{t('return-home')}</Button>
      </Link>
    </div>
  );
};
