'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoLarge = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <div className={cn('text-lg font-semibold', className)}>{children}</div>
);
