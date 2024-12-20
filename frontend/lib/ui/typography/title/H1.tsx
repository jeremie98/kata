'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoH1 = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <h1
    className={cn(
      'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      className
    )}
  >
    {children}
  </h1>
);
