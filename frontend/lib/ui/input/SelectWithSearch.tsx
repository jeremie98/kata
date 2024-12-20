'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../Command';
import { cn } from '@/utils';
import { useTranslations } from 'next-intl';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithSearchProps {
  className?: string;
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  searchLabel?: string;
  noItemsFoundLabel?: string;
}

const SelectWithSearch = ({
  className,
  value,
  options,
  onChange,
  placeholder,
  searchLabel,
  noItemsFoundLabel,
}: SelectWithSearchProps) => {
  const t = useTranslations('select-search');
  const [open, setOpen] = React.useState(false);

  const handleOnSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value
            ? options.find((o) => o.value === value)?.label
            : (placeholder ?? t('placeholder'))}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full w-full p-0">
        <Command>
          <CommandInput placeholder={searchLabel ?? t('search')} />
          <CommandList>
            <CommandEmpty>{noItemsFoundLabel ?? t('no-results')}</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  onSelect={handleOnSelect}
                  keywords={[o.label]}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === o.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

SelectWithSearch.displayName = 'SelectWithSearch';

export { SelectWithSearch };
