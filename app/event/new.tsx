import { useLocalSearchParams } from 'expo-router';
import { EventForm } from '@/components/forms';

export default function NewEventScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <EventForm initialDate={date} />;
}
