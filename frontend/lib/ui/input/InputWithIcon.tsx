'use client';

import * as React from 'react';
import { cn } from '@/utils';

export interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  focusClassName?: string;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, focusClassName, icon, ...props }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleClickInside = () => {
      setIsFocused(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    React.useEffect(() => {
      const handleMouseDown = (event: MouseEvent) => handleClickOutside(event);

      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }, []);

    return (
      <div
        className={cn(
          'border-input ring-offset-background flex h-10 w-full rounded-md border bg-white px-3 py-2 text-black file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
          isFocused && focusClassName,
          className
        )}
        ref={divRef}
        onClick={handleClickInside}
      >
        <input
          type="text"
          className={cn('flex-1 bg-white focus:outline-none', className)}
          ref={ref}
          {...props}
        />
        {icon}
      </div>
    );
  }
);
InputWithIcon.displayName = 'InputWithIcon';

export { InputWithIcon };
