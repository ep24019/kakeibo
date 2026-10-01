import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { colors, shadow } from '@/constants/theme';
import { getEvents, getMonthlyBudget, getMonthlySummary, getTodos, toggleTodo } from '@/lib/db';
import { formatHeaderDate, monthRange, todayKey } from '@/lib/date';
import { formatMoney, percentage } from '@/lib/format';
import type { Event, MonthlySummary, Todo } from '@/types/models';
import { Card, EmptyState, Header, SectionHeader, Screen, StatCard } from '@/components/ui';
import { EventCard, TodoCard } from '@/components/records';

export default function HomeScreen() {
  const db = useAppDatabase();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [summary, setSummary] = useState<MonthlySummary>({ income: 0, expense: 0 });
  const [budget, setBudget] = useState(0);
  const [error, setError] = useState('');
  const today = todayKey();

  const load = useCallback(async () => {
    try {
      setError('');
      const range = monthRange(new Date());
      const [todayEvents, openTodos, monthlySummary, monthlyBudget] = await Promise.all([getEvents(db, today, today), getTodos(db, true), getMonthlySummary(db, range.start, range.end), getMonthlyBudget(db)]);
      setEvents(todayEvents);
      setTodos(openTodos.slice(0, 5));
      setSummary(monthlySummary);
      setBudget(monthlyBudget);
    } catch {
      setError('データを読み込めませんでした。もう一度お試しください。');
    }
  }, [db, today]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const remaining = budget - summary.expense;
  const usage = percentage(summary.expense, budget);

  return <Screen>
    <Header title="おかえりなさい" subtitle={formatHeaderDate()} right={<Pressable onPress={() => router.push('/settings')} style={styles.settings}><Text style={styles.settingsIcon}>⚙</Text></Pressable>} />
    {error ? <Card style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></Card> : null}

    <SectionHeader title="今日の予定" action="カレンダー" onAction={() => router.push('/calendar')} />
    {events.length ? events.map((event) => <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.id}`)} />) : <Card><EmptyState icon="☀" title="今日の予定はありません" body="余白のある一日を楽しみましょう" /></Card>}

    <SectionHeader title="今日のTodo" action="すべて見る" onAction={() => router.push('/todo')} />
    {todos.length ? todos.map((todo) => <TodoCard key={todo.id} todo={todo} onToggle={async () => { await toggleTodo(db, todo.id, !todo.completed); await load(); }} onPress={() => router.push(`/todo/edit/${todo.id}`)} />) : <Card><EmptyState icon="✓" title="未完了のTodoはありません" action="Todoを追加" onAction={() => router.push('/todo/new')} /></Card>}

    <SectionHeader title="今月の家計情報" />
    <View style={styles.statsRow}><StatCard label="収入" value={formatMoney(summary.income)} tone="positive" /><View style={styles.statGap} /><StatCard label="支出" value={formatMoney(summary.expense)} tone="negative" /><View style={styles.statGap} /><StatCard label="収支" value={formatMoney(summary.income - summary.expense)} tone={summary.income - summary.expense >= 0 ? 'positive' : 'negative'} /></View>

    <SectionHeader title="今月の予算" action="設定" onAction={() => router.push('/settings')} />
    <Card style={styles.budgetCard}>
      {budget > 0 ? <>
        <View style={styles.budgetTop}><View><Text style={styles.budgetLabel}>月間予算</Text><Text style={styles.budgetValue}>{formatMoney(budget)}</Text></View><View style={styles.percentBadge}><Text style={styles.percentText}>{usage}%</Text><Text style={styles.percentCaption}>使用率</Text></View></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(usage, 100)}%`, backgroundColor: usage > 100 ? colors.danger : colors.primary }]} /></View>
        <View style={styles.budgetBottom}><Text style={styles.muted}>使用済み {formatMoney(summary.expense)}</Text><Text style={[styles.remaining, remaining < 0 && { color: colors.danger }]}>{remaining >= 0 ? '残り ' : '超過 '}{formatMoney(Math.abs(remaining))}</Text></View>
      </> : <EmptyState icon="￥" title="月間予算を設定しましょう" body="使いすぎ防止の目安を作れます" action="予算を設定" onAction={() => router.push('/settings')} />}
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  settings: { backgroundColor: colors.surface, borderRadius: 18, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', ...shadow },
  settingsIcon: { fontSize: 20, color: colors.ink },
  errorCard: { marginBottom: 15, backgroundColor: colors.dangerSoft },
  errorText: { color: colors.danger, lineHeight: 20, fontWeight: '600' },
  statsRow: { flexDirection: 'row' },
  statGap: { width: 8 },
  budgetCard: { marginBottom: 18 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  budgetValue: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 5 },
  percentBadge: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 14 },
  percentText: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  percentCaption: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  progressTrack: { height: 10, backgroundColor: '#EEF1F6', borderRadius: 10, marginTop: 18, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  budgetBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  muted: { color: colors.muted, fontSize: 12 },
  remaining: { color: colors.success, fontWeight: '800', fontSize: 12 },
});
