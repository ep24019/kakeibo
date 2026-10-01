import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { categoryColors, colors } from '@/constants/theme';
import { getCategoryTotals, getMonthlySummary } from '@/lib/db';
import { formatJapaneseMonth, monthRange } from '@/lib/date';
import { formatMoney, percentage } from '@/lib/format';
import type { CategoryTotal, MonthlySummary } from '@/types/models';
import { Card, EmptyState, Header, SectionHeader, Screen } from '@/components/ui';

type MonthlyTotal = { label: string; total: number };

export default function AnalyticsScreen() {
  const db = useSQLiteContext();
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [currentSummary, setCurrentSummary] = useState<MonthlySummary>({ income: 0, expense: 0 });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const now = new Date();
      const currentRange = monthRange(now);
      const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
      const [categories, current, ...histories] = await Promise.all([getCategoryTotals(db, currentRange.start, currentRange.end), getMonthlySummary(db, currentRange.start, currentRange.end), ...months.map((month) => { const range = monthRange(month); return getMonthlySummary(db, range.start, range.end); })]);
      setCategoryTotals(categories);
      setCurrentSummary(current);
      setMonthlyTotals(months.map((month, index) => ({ label: `${month.getMonth() + 1}月`, total: histories[index].expense })));
    } catch {
      setError('分析データを読み込めませんでした。');
    }
  }, [db]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const maxCategory = Math.max(...categoryTotals.map((item) => item.total), 1);
  const maxMonth = Math.max(...monthlyTotals.map((item) => item.total), 1);

  return <Screen>
    <Header title="分析" subtitle={`${formatJapaneseMonth(new Date())}の家計を振り返る`} />
    {error ? <Card style={styles.error}><Text style={styles.errorText}>{error}</Text></Card> : null}
    <Card style={styles.hero}><Text style={styles.heroLabel}>今月の支出</Text><Text style={styles.heroValue}>{formatMoney(currentSummary.expense)}</Text><Text style={styles.heroCaption}>収入 {formatMoney(currentSummary.income)}  ·  収支 {formatMoney(currentSummary.income - currentSummary.expense)}</Text></Card>
    <SectionHeader title="カテゴリ別支出" />
    <Card>{categoryTotals.length ? categoryTotals.map((item) => <View key={item.category} style={styles.categoryRow}><View style={styles.categoryTop}><View style={styles.categoryName}><View style={[styles.swatch, { backgroundColor: categoryColors[item.category] ?? colors.primary }]} /><Text style={styles.categoryLabel}>{item.category}</Text></View><Text style={styles.categoryMoney}>{formatMoney(item.total)} <Text style={styles.categoryPercent}>{percentage(item.total, currentSummary.expense)}%</Text></Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width: `${(item.total / maxCategory) * 100}%`, backgroundColor: categoryColors[item.category] ?? colors.primary }]} /></View></View>) : <EmptyState icon="◔" title="支出データがありません" body="支出を登録するとカテゴリ別に表示されます" />}</Card>
    <SectionHeader title="月別支出" />
    <Card>{monthlyTotals.some((item) => item.total > 0) ? <View style={styles.chart}>{monthlyTotals.map((item) => <View key={item.label} style={styles.barColumn}><Text style={styles.barAmount}>{item.total ? `${Math.round(item.total / 1000)}k` : ''}</Text><View style={styles.columnTrack}><View style={[styles.columnFill, { height: `${(item.total / maxMonth) * 100}%` }]} /></View><Text style={styles.monthLabel}>{item.label}</Text></View>)}</View> : <EmptyState icon="▥" title="まだ推移がありません" body="6か月分の支出がここに蓄積されます" />}</Card>
  </Screen>;
}

const styles = StyleSheet.create({
  error: { backgroundColor: colors.dangerSoft, marginBottom: 12 },
  errorText: { color: colors.danger, fontWeight: '700' },
  hero: { backgroundColor: colors.navy, marginBottom: 20 },
  heroLabel: { color: '#B7C6E4', fontWeight: '700', fontSize: 13 },
  heroValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 10 },
  heroCaption: { color: '#D7E1F6', marginTop: 10, fontSize: 12 },
  categoryRow: { marginBottom: 17 },
  categoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryName: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  categoryLabel: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  categoryMoney: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  categoryPercent: { color: colors.muted, fontWeight: '600' },
  barTrack: { height: 9, backgroundColor: '#EEF1F6', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  chart: { height: 205, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 14 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  barAmount: { color: colors.muted, fontSize: 10, height: 16 },
  columnTrack: { height: 145, width: 24, backgroundColor: '#F0F2F6', borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  columnFill: { backgroundColor: colors.primary, width: '100%', borderRadius: 12, minHeight: 3 },
  monthLabel: { color: colors.muted, fontSize: 11, marginTop: 8 },
});
