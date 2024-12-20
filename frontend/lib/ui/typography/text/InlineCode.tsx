'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoInlineCode = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <code
    className={cn(
      'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
      className
    )}
  >
    {children}
  </code>
);
