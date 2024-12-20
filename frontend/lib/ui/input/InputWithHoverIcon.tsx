'use client';

import * as React from 'react';
import { cn } from '@/utils';

export interface InputWithHoverIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  focusClassName?: string;
  isFieldInvalid?: boolean;
}

const InputWithHoverIcon = React.forwardRef<
  HTMLInputElement,
  InputWithHoverIconProps
>(({ className, focusClassName, icon, isFieldInvalid, ...props }, ref) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClickInside = () => {
    setIsFocused(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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
        'ring-offset-background flex h-10 w-full bg-white px-3 py-2 text-sm text-black file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
        isFocused && focusClassName,
        isFieldInvalid && 'border-b border-b-red-500',
        className
      )}
      ref={divRef}
      onClick={handleClickInside}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input
        type="text"
        className={cn('flex-1 bg-white focus:outline-none')}
        ref={ref}
        {...props}
      />
      {(isFocused || isHovered) && icon}
    </div>
  );
});
InputWithHoverIcon.displayName = 'InputWithHoverIcon';

export { InputWithHoverIcon };
