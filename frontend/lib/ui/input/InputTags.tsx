'use client';

import * as React from 'react';
import { Badge, Button, Input, InputProps, TypoLabel } from '@/lib/ui';
import { Pencil, X } from 'lucide-react';
import { cn } from '@/utils';

type InputTagsProps = InputProps & {
  value: string[];
  addLabel?: string;
  onChange: (data: string[] | React.ChangeEvent<HTMLInputElement>) => void;
  onError?: (error: string) => void;
  validator?: (value: string) => boolean;
  validatorMessage?: string;
  badgeClassName?: string;
};

export const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  (
    {
      value,
      addLabel = 'Add',
      onChange,
      onError,
      validator = () => true,
      validatorMessage = 'Incorrect format',
      badgeClassName,
      ...props
    },
    ref
  ) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    const addPendingDataPoint = () => {
      if (pendingDataPoint && validator(pendingDataPoint)) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
        if (onError) onError(''); // Clear any previous error
      } else if (!validator(pendingDataPoint)) {
        if (onError) onError('Invalid input: ' + pendingDataPoint);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <Input
            value={pendingDataPoint}
            onChange={(e) => setPendingDataPoint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPendingDataPoint();
              } else if (e.key === ',' || e.key === ' ') {
                e.preventDefault();
                addPendingDataPoint();
              }
            }}
            className={cn(
              'rounded-r-none',
              pendingDataPoint &&
                !validator(pendingDataPoint) &&
                'outline outline-1 !outline-red-500'
            )}
            {...props}
            ref={inputRef}
          />
          <Button
            type="button"
            variant="secondary"
            className={cn(
              'rounded-l-none border border-l-0 text-[#516f90]',
              !validator(pendingDataPoint) && 'cursor-not-allowed'
            )}
            onClick={addPendingDataPoint}
            disabled={!validator(pendingDataPoint)}
          >
            {addLabel}
          </Button>
        </div>
        {pendingDataPoint && !validator(pendingDataPoint) && (
          <TypoLabel className="text-xs text-red-500">
            {validatorMessage}
          </TypoLabel>
        )}
        {value.length > 0 && (
          <div className=" flex min-h-[2.5rem] flex-wrap items-center gap-2 overflow-y-auto rounded-md py-2">
            {value.map((item, idx) => (
              <Badge key={idx} variant="secondary" className={badgeClassName}>
                {item}
                <button
                  type="button"
                  className="ml-2 w-3"
                  onClick={() => {
                    onChange(value.filter((i) => i !== item));
                  }}
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  className="ml-2 w-3"
                  onClick={() => {
                    setPendingDataPoint(item);
                    onChange(value.filter((i) => i !== item));
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <Pencil size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }
);
