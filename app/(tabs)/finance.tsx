import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { colors } from '@/constants/theme';
import { getMonthlySummary, getTransactions } from '@/lib/db';
import { formatJapaneseMonth, formatShortDate, monthRange } from '@/lib/date';
import { formatMoney } from '@/lib/format';
import type { MonthlySummary, Transaction } from '@/types/models';
import { Card, EmptyState, Header, SectionHeader, Screen, StatCard } from '@/components/ui';
import { TransactionCard } from '@/components/records';

export default function FinanceScreen() {
  const db = useAppDatabase();
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [summary, setSummary] = useState<MonthlySummary>({ income: 0, expense: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const range = monthRange(month);
      const [nextSummary, nextTransactions] = await Promise.all([getMonthlySummary(db, range.start, range.end), getTransactions(db, range.start, range.end)]);
      setSummary(nextSummary);
      setTransactions(nextTransactions);
    } catch {
      setError('家計簿を読み込めませんでした。');
    }
  }, [db, month]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const groups = useMemo(() => {
    const result: Record<string, Transaction[]> = {};
    transactions.forEach((transaction) => { (result[transaction.date] ??= []).push(transaction); });
    return Object.entries(result);
  }, [transactions]);

  const moveMonth = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));

  return <Screen>
    <Header title="家計簿" subtitle="収支の流れを見える化" right={<Pressable onPress={() => router.push('/transaction/new?type=expense')} style={styles.add}><Text style={styles.addText}>＋記録</Text></Pressable>} />
    {error ? <Card style={styles.error}><Text style={styles.errorText}>{error}</Text></Card> : null}
    <Card style={styles.monthCard}><Pressable onPress={() => moveMonth(-1)}><Text style={styles.arrow}>‹</Text></Pressable><Text style={styles.monthTitle}>{formatJapaneseMonth(month)}</Text><Pressable onPress={() => moveMonth(1)}><Text style={styles.arrow}>›</Text></Pressable></Card>
    <View style={styles.statsRow}><StatCard label="収入" value={formatMoney(summary.income)} tone="positive" /><View style={styles.gap} /><StatCard label="支出" value={formatMoney(summary.expense)} tone="negative" /><View style={styles.gap} /><StatCard label="収支" value={formatMoney(summary.income - summary.expense)} tone={summary.income >= summary.expense ? 'positive' : 'negative'} /></View>
    <View style={styles.quickRow}><Pressable onPress={() => router.push('/transaction/new?type=income')} style={[styles.quick, { backgroundColor: colors.successSoft }]}><Text style={[styles.quickText, { color: colors.success }]}>＋ 収入</Text></Pressable><Pressable onPress={() => router.push('/transaction/new?type=expense')} style={[styles.quick, { backgroundColor: colors.dangerSoft }]}><Text style={[styles.quickText, { color: colors.danger }]}>－ 支出</Text></Pressable></View>
    <SectionHeader title="履歴" />
    {groups.length ? groups.map(([date, rows]) => <View key={date} style={styles.group}><Text style={styles.dateLabel}>{formatShortDate(date)}</Text>{rows.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction} onPress={() => router.push(`/transaction/edit/${transaction.id}`)} />)}</View>) : <Card><EmptyState icon="￥" title="この月の記録はありません" body="収入や支出を記録してみましょう" action="支出を追加" onAction={() => router.push('/transaction/new?type=expense')} /></Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  add: { backgroundColor: colors.primarySoft, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  addText: { color: colors.primary, fontWeight: '800' },
  error: { backgroundColor: colors.dangerSoft, marginBottom: 12 },
  errorText: { color: colors.danger, fontWeight: '700' },
  monthCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 14 },
  monthTitle: { fontSize: 19, color: colors.ink, fontWeight: '900' },
  arrow: { fontSize: 30, color: colors.ink, paddingHorizontal: 12 },
  statsRow: { flexDirection: 'row' },
  gap: { width: 8 },
  quickRow: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  quick: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 13 },
  quickText: { fontWeight: '900' },
  group: { marginBottom: 8 },
  dateLabel: { color: colors.ink, fontSize: 14, fontWeight: '900', marginBottom: 8, marginTop: 4 },
});
