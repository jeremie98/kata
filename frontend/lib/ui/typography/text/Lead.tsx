'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoLead = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <p className={cn('text-muted-foreground text-xl', className)}>{children}</p>
);
