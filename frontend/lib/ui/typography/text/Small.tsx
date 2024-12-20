'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoSmall = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <small className={cn('text-xs font-medium leading-5', className)}>
    {children}
  </small>
);
