import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { colors, categoryColors, shadow } from '@/constants/theme';
import { getEvents } from '@/lib/db';
import { formatJapaneseMonth, monthDays, monthRange, parseDateKey, toDateKey, todayKey } from '@/lib/date';
import type { Event } from '@/types/models';
import { AppButton, Card, EmptyState, Header, Screen } from '@/components/ui';
import { EventCard } from '@/components/records';

export default function CalendarScreen() {
  const db = useAppDatabase();
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(todayKey());
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const range = monthRange(month);
      setEvents(await getEvents(db, range.start, range.end));
    } catch {
      setError('カレンダーを読み込めませんでした。');
    }
  }, [db, month]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const eventDates = useMemo(() => new Set(events.map((event) => event.date)), [events]);
  const selectedEvents = events.filter((event) => event.date === selected);
  const days = monthDays(month);

  const moveMonth = (amount: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + amount, 1);
    setMonth(next);
    setSelected(toDateKey(next));
  };

  return <Screen>
    <Header title="カレンダー" subtitle="予定と予算をひと目で確認" right={<Pressable onPress={() => router.push('/event/new')} style={styles.add}><Text style={styles.addText}>＋ 予定</Text></Pressable>} />
    {error ? <Card style={styles.error}><Text style={styles.errorText}>{error}</Text></Card> : null}
    <Card style={styles.calendarCard}>
      <View style={styles.monthHeader}><Pressable onPress={() => moveMonth(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable><Text style={styles.monthTitle}>{formatJapaneseMonth(month)}</Text><Pressable onPress={() => moveMonth(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable></View>
      <View style={styles.weekRow}>{['日', '月', '火', '水', '木', '金', '土'].map((day, index) => <Text key={day} style={[styles.weekText, index === 0 && { color: colors.danger }, index === 6 && { color: colors.primary }]}>{day}</Text>)}</View>
      <View style={styles.grid}>{days.map((day, index) => {
        if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
        const key = toDateKey(day);
        const isSelected = key === selected;
        const isToday = key === todayKey();
        const marked = eventDates.has(key);
        return <Pressable key={key} onPress={() => setSelected(key)} style={[styles.dayCell, isSelected && styles.selectedCell]}><Text style={[styles.dayText, index % 7 === 0 && { color: colors.danger }, index % 7 === 6 && { color: colors.primary }, isSelected && styles.selectedDayText, isToday && !isSelected && styles.todayText]}>{day.getDate()}</Text>{marked ? <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : colors.primary }]} /> : <View style={styles.dotPlaceholder} />}</Pressable>;
      })}</View>
    </Card>

    <View style={styles.selectedHeader}><View><Text style={styles.selectedTitle}>{parseDateKey(selected).getMonth() + 1}月{parseDateKey(selected).getDate()}日の予定</Text><Text style={styles.selectedSubtitle}>{selectedEvents.length ? `${selectedEvents.length}件` : '予定はありません'}</Text></View><Pressable onPress={() => router.push(`/event/new?date=${selected}`)}><Text style={styles.link}>＋追加</Text></Pressable></View>
    {selectedEvents.length ? selectedEvents.map((event) => <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.id}`)} />) : <Card><EmptyState icon="◷" title="この日の予定はありません" body="予定を追加して一日の流れを整えましょう" action="予定を追加" onAction={() => router.push(`/event/new?date=${selected}`)} /></Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  add: { backgroundColor: colors.primarySoft, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  addText: { color: colors.primary, fontWeight: '800' },
  error: { backgroundColor: colors.dangerSoft, marginBottom: 12 },
  errorText: { color: colors.danger, fontWeight: '700' },
  calendarCard: { padding: 16, marginBottom: 20 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  monthTitle: { fontSize: 19, fontWeight: '900', color: colors.ink },
  arrow: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 30, color: colors.ink, lineHeight: 32 },
  weekRow: { flexDirection: 'row', marginBottom: 7 },
  weekText: { width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 49, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  selectedCell: { backgroundColor: colors.primary, ...shadow },
  dayText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  selectedDayText: { color: '#fff' },
  todayText: { color: colors.primary, fontWeight: '900' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  dotPlaceholder: { width: 5, height: 5, marginTop: 4 },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectedTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  selectedSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  link: { color: colors.primary, fontWeight: '800' },
});
