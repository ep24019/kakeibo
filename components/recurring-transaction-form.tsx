import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, expenseCategories, paymentMethods } from '@/constants/theme';
import { useAppDatabase } from '@/lib/database-provider';
import { saveTransaction } from '@/lib/db';
import { parseDateKey, todayKey, toDateKey } from '@/lib/date';
import { parseMoney } from '@/lib/format';
import type { ExpenseCategory } from '@/constants/theme';
import { AppButton, Card, ChoiceRow, DateSelector, Field, Header, MoneyInput, Screen } from '@/components/ui';

const isDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

const monthlyDates = (startDate: string, endDate: string) => {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  const paymentDay = start.getDate();
  const dates: string[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const paymentDate = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(paymentDay, lastDay));
    if (paymentDate >= start && paymentDate <= end) dates.push(toDateKey(paymentDate));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return dates;
};

export function RecurringTransactionForm() {
  const db = useAppDatabase();
  const router = useRouter();
  const today = todayKey();
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(toDateKey(addMonths(new Date(), 11)));
  const [category, setCategory] = useState<ExpenseCategory>('サブスク');
  const [paymentMethod, setPaymentMethod] = useState('クレジットカード');
  const [shopName, setShopName] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const targetDates = useMemo(() => isDateKey(startDate) && isDateKey(endDate) && startDate <= endDate ? monthlyDates(startDate, endDate) : [], [startDate, endDate]);

  const submit = async () => {
    if (savingRef.current) return;
    if (!amount || parseMoney(amount) <= 0) return setError('金額を入力してください');
    if (!isDateKey(startDate) || !isDateKey(endDate)) return setError('開始日と最終支払日を正しく設定してください');
    if (startDate > endDate) return setError('最終支払日は開始日以降に設定してください');
    const start = parseDateKey(startDate);
    const end = parseDateKey(endDate);
    const monthRange = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
    if (monthRange > 60) return setError('登録期間は60か月以内にしてください');
    if (!targetDates.length) return setError('指定期間に支払日がありません');

    try {
      savingRef.current = true;
      setSaving(true);
      setError('');
      for (const date of targetDates) {
        await saveTransaction(db, { type: 'expense', amount: parseMoney(amount), date, category, paymentMethod, shopName: shopName.trim() || null, memo: memo.trim() || null, eventId: null });
      }
      router.replace('/finance');
    } catch {
      setError('定期支出を登録できませんでした。');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <Screen>
    <Header title="定期支出を追加" subtitle="サブスクや分割払いをまとめて登録" />
    <MoneyInput label="毎月の金額 *" value={amount} onChangeText={setAmount} error={error && (!amount || parseMoney(amount) <= 0) ? error : undefined} />
    <DateSelector label="開始日 *" value={startDate} onChange={(value) => setStartDate(value ?? '')} error={error && !isDateKey(startDate) ? error : undefined} />
    <DateSelector label="最終支払日 *" value={endDate} onChange={(value) => setEndDate(value ?? '')} error={error && (!isDateKey(endDate) || startDate > endDate) ? error : undefined} />
    <ChoiceRow label="カテゴリ" options={expenseCategories} value={category} onChange={(value) => setCategory(value as ExpenseCategory)} />
    <ChoiceRow label="支払い方法" options={paymentMethods} value={paymentMethod} onChange={setPaymentMethod} />
    <Field label="サービス名・支払先" value={shopName} onChangeText={setShopName} placeholder="例：動画配信サービス" />
    <Field label="メモ" value={memo} onChangeText={setMemo} placeholder="例：12回払い" multiline numberOfLines={4} style={styles.multiline} />
    <Card style={styles.preview}><Text style={styles.previewLabel}>作成される支出</Text><Text style={styles.previewValue}>{targetDates.length}件</Text><Text style={styles.previewHint}>{startDate}〜{endDate}の毎月{isDateKey(startDate) ? parseDateKey(startDate).getDate() : '--'}日ごろに登録</Text></Card>
    <AppButton title={saving ? '登録中…' : `${targetDates.length}件を登録`} onPress={() => void submit()} disabled={saving || !targetDates.length} />
    {error && amount && isDateKey(startDate) && isDateKey(endDate) ? <Text style={styles.error}>{error}</Text> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  multiline: { minHeight: 105, textAlignVertical: 'top', paddingTop: 12 },
  preview: { marginTop: 3, marginBottom: 8, backgroundColor: colors.primarySoft },
  previewLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  previewValue: { color: colors.primary, fontSize: 25, fontWeight: '900', marginTop: 5 },
  previewHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700', marginTop: 9 },
});
