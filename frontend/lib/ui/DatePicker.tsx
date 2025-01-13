'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './Calendar';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { cn } from '@/utils';
import { Button } from './input/button/Button';
import dayjs from '@kata/day';
import { SupportedLocale } from '@/i18n/locales';

interface DatePickerProps {
  placeholder?: string;
  placeholderClassname?: string;
  value?: Date;
  disabled?: React.ButtonHTMLAttributes<HTMLButtonElement>['disabled'];
  fromDate?: Date;
  toDate?: Date;
  locale: SupportedLocale;
  onChange?: (date: Date | undefined) => void;
  classname?: string;
}

export const DatePicker = ({
  placeholder,
  placeholderClassname,
  value,
  disabled,
  fromDate,
  toDate,
  locale,
  onChange,
  classname,
}: DatePickerProps) => {
  const hiddenMatcher = React.useMemo(() => {
    if (!fromDate && !toDate) return undefined;

    return (date: Date) => {
      const isBefore = fromDate ? date < fromDate : false;
      const isAfter = toDate ? date > toDate : false;
      return isBefore || isAfter;
    };
  }, [fromDate, toDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            classname
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className={placeholderClassname}>
            {value ? format(value, 'dd/MM/yyyy') : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          currentLocale={locale}
          selected={value}
          defaultMonth={value ? dayjs(value).toDate() : undefined}
          onSelect={onChange}
          hidden={hiddenMatcher}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};
