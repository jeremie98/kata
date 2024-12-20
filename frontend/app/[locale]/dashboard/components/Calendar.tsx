'use client';

import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SupportedLocale } from '@/i18n/locales';
import dayjs from '@kata/day';
import { EventReturn, EventType } from '@kata/typings';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg } from '@fullcalendar/core/index.js';

interface CalendarProps {
  dataEvents: EventReturn[];
  onEventClick: (arg: EventClickArg) => void;
}

export const Calendar = ({ dataEvents, onEventClick }: CalendarProps) => {
  const getStylesEventCalendar = (event: EventReturn) => {
    switch (event.type) {
      case EventType.PERSONAL:
        return 'personal-event';
      case EventType.PROJECT:
        return 'project-event';
      case EventType.TEAM:
        return 'team-event';
      default:
        return '';
    }
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
        timeZone="Europe/Paris"
        weekends={false}
        plugins={[interactionPlugin, timeGridPlugin, dayGridPlugin]}
        initialView="dayGridWeek"
        selectable
        // select={onSelectSlot}
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
        eventClick={onEventClick}
        // datesSet={handleChangeView}
        selectAllow={(selectInfo) => dayjs(selectInfo.startStr) > dayjs()}
      />
    </div>
  );
};
