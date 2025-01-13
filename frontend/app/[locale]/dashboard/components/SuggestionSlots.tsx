'use client';

import * as React from 'react';
import { SuggestFreeCalendarSlotsResponse } from '@kata/typings';
import { useTranslations } from 'next-intl';
import { Button, TypoSmall } from '@/lib';
import dayjs from '@kata/day';

interface SuggestionSlotsProps {
  suggestions: SuggestFreeCalendarSlotsResponse[];
  onSuggestionClick: (suggestion: SuggestFreeCalendarSlotsResponse) => void;
}

export const SuggestionSlots = ({
  suggestions,
  onSuggestionClick,
}: SuggestionSlotsProps) => {
  const t = useTranslations('events.form');

  return (
    <div className="mt-4 flex w-full flex-col space-y-2">
      <TypoSmall className="underline">{t('suggestions')}</TypoSmall>

      {suggestions.map((s, i) => (
        <Button
          key={i}
          className="w-full text-white"
          onClick={() => onSuggestionClick(s)}
        >
          {`${dayjs(s.dateStart).format('HH:mm:ss')} - ${dayjs(s.dateEnd).format('HH:mm:ss')}`}
        </Button>
      ))}
    </div>
  );
};
