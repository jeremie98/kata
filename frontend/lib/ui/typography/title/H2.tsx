'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoH2 = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <h2
    className={cn(
      'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      className
    )}
  >
    {children}
  </h2>
);
