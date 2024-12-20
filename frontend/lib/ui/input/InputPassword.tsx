'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
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
          'border-input ring-offset-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border bg-[#F3F7F9] px-3 py-2 text-sm text-black file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
          isFocused && 'outline outline-1 outline-[#FFB800]',
          className
        )}
        ref={divRef}
        onClick={handleClickInside}
      >
        <input
          type={showPassword ? 'text' : 'password'}
          className={`flex-1 bg-[#F3F7F9] focus:outline-none`}
          ref={ref}
          {...props}
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className="cursor-pointer"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>
    );
  }
);
InputPassword.displayName = 'InputPassword';

export { InputPassword };
