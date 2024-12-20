'use client';

import { cn } from '@/utils';
import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isFieldInvalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isFieldInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border-input placeholder:text-muted-foreground flex h-10 w-full rounded-md border bg-[#F3F7F9] px-3 py-2 text-sm text-black file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-[#FFB800] disabled:cursor-not-allowed disabled:opacity-50',
          isFieldInvalid && 'outline outline-1 !outline-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
