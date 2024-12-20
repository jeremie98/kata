'use client';

import * as React from 'react';
import { Calendar } from './components/Calendar';
import { EventReturn, UserReturn } from '@kata/typings';
import { Button, Toaster } from '@/lib';
import EventForm from './components/EventForm';
import { useTranslations } from 'next-intl';

interface DashboardPageProps {
  events: EventReturn[];
  potentialParticipants: UserReturn[]
}

export const DashboardPage = ({ events, potentialParticipants }: DashboardPageProps) => {
    const t = useTranslations('events');
  
  const [openForm, setOpenForm] = React.useState<boolean>(false);

  return (
    <div className="p-5">
      <div className="w-full">
        <Button onClick={() => setOpenForm(true)}>{t('add-event')}</Button>
      </div>
      <div className="w-full py-5">
        <Calendar dataEvents={events} onEventClick={() => {}} />
      </div>

      <EventForm open={openForm} onClose={() => setOpenForm(false)} potentialParticipants={potentialParticipants} />

      <Toaster />
    </div>
  );
};
