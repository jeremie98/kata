import dayjs from '@kata/day';
import { fetchEventsPlanning, fetchParticipants } from './actions';
import { DashboardPage } from './DashboardPage';

interface DashboardProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Dashboard(props: DashboardProps) {
  const { start, end } = await props.searchParams;

  const defaultStart = start
    ? dayjs(start, 'YYYY-MM-DD')
    : dayjs().startOf('week');
  const defaultEnd = end ? dayjs(end, 'YYYY-MM-DD') : dayjs().endOf('week');

  const events = await fetchEventsPlanning({
    dateStart: defaultStart.format('YYYY-MM-DD'),
    dateEnd: defaultEnd.format('YYYY-MM-DD'),
  });
  const potentialParticipants = await fetchParticipants();

  return (
    <DashboardPage
      events={events.data}
      potentialParticipants={potentialParticipants.data}
    />
  );
}
