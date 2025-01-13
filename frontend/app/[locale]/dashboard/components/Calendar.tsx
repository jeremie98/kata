'use client';

import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SupportedLocale } from '@/i18n/locales';
import { EventReturn, EventType } from '@kata/typings';
import timeGridPlugin from '@fullcalendar/timegrid';
import { DatesSetArg } from '@fullcalendar/core';
import { useDashboard } from '@/context/DashboardProvider';

interface CalendarProps {
  dataEvents: EventReturn[];
  onEventClick: (idEvent: string) => void;
  onDatesChange: (dates: DatesSetArg) => void;
}

export const Calendar = ({
  dataEvents,
  onEventClick,
  onDatesChange,
}: CalendarProps) => {
  const { user } = useDashboard();

  const getStylesEventCalendar = (event: EventReturn) => {
    if (event.participants.find((p) => p.user_id === user.user_id)) {
      switch (event.type) {
        case EventType.PERSONAL:
          return 'personal-event';
        case EventType.PROJECT:
          return 'project-event';
        case EventType.TEAM:
          return 'team-event';
        default:
          return 'others-event';
      }
    }

    return 'others-event';
  };

  const events = dataEvents.map((e) => {
    return {
      id: e.event_id,
      title: e.title,
      start: e.date_start,
      end: e.date_end,
      classNames: getStylesEventCalendar(e),
    };
  });

  return (
    <div className="w-full">
      <FullCalendar
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridWeek,dayGridMonth',
        }}
        titleFormat={{
          month: 'long',
          year: 'numeric',
        }}
        weekends={false}
        plugins={[interactionPlugin, timeGridPlugin, dayGridPlugin]}
        initialView="dayGridWeek"
        selectable
        events={events}
        buttonText={{ today: "Aujourd'hui" }}
        locale={SupportedLocale.FR}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: 'short',
        }}
        dayHeaderFormat={{
          weekday: 'long',
          day: 'numeric',
        }}
        eventClick={(info) => onEventClick(info.event.id)}
        datesSet={onDatesChange}
        selectAllow={(selectInfo) => selectInfo.start > new Date()}
      />
    </div>
  );
};
