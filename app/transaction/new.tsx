import { useLocalSearchParams } from 'expo-router';
import { TransactionForm } from '@/components/forms';

export default function NewTransactionScreen() {
  const { type, eventId } = useLocalSearchParams<{ type?: string; eventId?: string }>();
  return <TransactionForm initialType={type === 'income' ? 'income' : 'expense'} initialEventId={eventId ? Number(eventId) : null} />;
}
