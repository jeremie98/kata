'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import kataLogo from '@/public/logo/logo-kata.jpeg';

export const MainNav = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-[#FFB800] px-1">
      <Link href="/dashboard" passHref>
        <Image priority src={kataLogo} width={50} alt={`Logo Kata`} />
      </Link>
    </header>
  );
};
