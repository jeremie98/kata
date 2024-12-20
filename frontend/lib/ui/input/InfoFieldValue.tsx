'use client';

import * as React from 'react';

import { CircleCheck } from 'lucide-react';
import { TypoBody } from '../typography';

type Status = 'success' | 'error';

interface Props {
  status: Status;
  icon?: boolean;
  value: string;
}
export const InfoFieldValue = ({
  status,
  icon = true,
  value,
}: React.PropsWithChildren<Props>) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      {icon === true && (
        <>
          {status === 'success' ? (
            <CircleCheck size={14} className="text-[#00cc36]" />
          ) : (
            <CircleCheck size={14} className="text-gray-400" />
          )}
        </>
      )}
      <TypoBody className="text-xs font-light">{value}</TypoBody>
    </div>
  );
};
