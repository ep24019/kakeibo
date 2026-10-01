import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '@/constants/theme';
import { getEvent } from '@/lib/db';
import type { Event } from '@/types/models';
import { EventForm } from '@/components/forms';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getEvent(db, Number(id)).then(setEvent).finally(() => setLoading(false)); }, [db, id]);
  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!event) return <Text>予定が見つかりません。</Text>;
  return <EventForm initial={event} />;
}
