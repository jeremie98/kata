'use client';

import { cn } from '@/utils';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

export const TypoBody = ({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) => (
  <p
    className={cn(
      'className="leading-7 [&:not(:first-child)]:mt-6"',
      className
    )}
  >
    {children}
  </p>
);
