'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoH3 = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <h3
    className={cn(
      'scroll-m-20 text-2xl font-semibold tracking-tight',
      className
    )}
  >
    {children}
  </h3>
);
