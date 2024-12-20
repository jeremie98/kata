import { fetchEvents, fetchParticipants } from './actions';
import { DashboardPage } from './DashboardPage';

export default async function Page() {
  const events = await fetchEvents();
  const potentialParticipants = await fetchParticipants()

  return <DashboardPage events={events.data} potentialParticipants={potentialParticipants.data} />;
}
