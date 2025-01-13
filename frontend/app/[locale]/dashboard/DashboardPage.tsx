'use client';

import * as React from 'react';
import { Calendar } from './components/Calendar';
import { EventReturn, UserReturn } from '@kata/typings';
import { Button, Toaster } from '@/lib';
import { EventForm } from './components/EventForm';
import { useTranslations } from 'next-intl';
import { DatesSetArg } from '@fullcalendar/core';
import dayjs from '@kata/day';
import { EventDetails } from './components/EventDetails';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboard } from '@/context/DashboardProvider';

interface DashboardPageProps {
  events: EventReturn[];
  potentialParticipants: UserReturn[];
}

export const DashboardPage = ({
  events,
  potentialParticipants,
}: DashboardPageProps) => {
  const t = useTranslations('events');

  const { user } = useDashboard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());

  const [eventsPlanning, setEventsPlanning] =
    React.useState<EventReturn[]>(events);
  const [openForm, setOpenForm] = React.useState<boolean>(false);
  const [eventViewable, setEventViewable] = React.useState<EventReturn | null>(
    null
  );

  const onEventCalendarClick = (idEvent: string) => {
    const event = eventsPlanning.find((e) => e.event_id == idEvent);

    if (event && event.participants.find((p) => p.user_id === user.user_id)) {
      setEventViewable(event);
    }
  };

  const onChangesDatesViewCalendar = async (dates: DatesSetArg) => {
    const start = dayjs(dates.startStr).format('YYYY-MM-DD');
    const end = dayjs(dates.endStr).format('YYYY-MM-DD');

    params.set('start', start);
    params.set('end', end);
    router.push(`?${params.toString()}`);
  };

  React.useEffect(() => {
    setEventsPlanning(events);
  }, [events]);

  return (
    <div className="p-5">
      <div className="w-full">
        <Button onClick={() => setOpenForm(true)}>{t('add-event')}</Button>
      </div>
      <div className="w-full py-5">
        <Calendar
          dataEvents={eventsPlanning}
          onEventClick={onEventCalendarClick}
          onDatesChange={onChangesDatesViewCalendar}
        />
      </div>

      <EventForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        potentialParticipants={potentialParticipants}
      />

      <EventDetails
        open={eventViewable != null}
        onClose={() => setEventViewable(null)}
        event={eventViewable}
        potentialParticipants={potentialParticipants}
      />

      <Toaster />
    </div>
  );
};
