'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoH4 = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <h4
    className={cn(
      'scroll-m-20 text-xl font-semibold tracking-tight',
      className
    )}
  >
    {children}
  </h4>
);
