'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoBlockquote = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)}>
    {children}
  </blockquote>
);
