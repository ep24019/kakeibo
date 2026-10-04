import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, eventCategories } from '@/constants/theme';
import { saveEvent } from '@/lib/db';
import { parseDateKey, todayKey, toDateKey } from '@/lib/date';
import { parseMoney } from '@/lib/format';
import { useAppDatabase } from '@/lib/database-provider';
import { AppButton, Card, ChoiceRow, Chip, DateSelector, Field, Header, MoneyInput, Screen, TimeSelector } from '@/components/ui';

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'] as const;

const isDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

const datesForWeekdays = (startDate: string, endDate: string, weekdays: number[]) => {
  const dates: string[] = [];
  const cursor = parseDateKey(startDate);
  const lastDate = parseDateKey(endDate);
  while (cursor <= lastDate) {
    if (weekdays.includes(cursor.getDay())) dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export function RecurringEventForm() {
  const db = useAppDatabase();
  const router = useRouter();
  const today = todayKey();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(toDateKey(addMonths(new Date(), 3)));
  const [weekdays, setWeekdays] = useState<number[]>([parseDateKey(today).getDay()]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<(typeof eventCategories)[number]>(eventCategories[0]);
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const targetDates = useMemo(() => isDateKey(startDate) && isDateKey(endDate) && startDate <= endDate ? datesForWeekdays(startDate, endDate, weekdays) : [], [startDate, endDate, weekdays]);

  const toggleWeekday = (weekday: number) => {
    setWeekdays((current) => current.includes(weekday) ? current.filter((item) => item !== weekday) : [...current, weekday].sort((a, b) => a - b));
  };

  const submit = async () => {
    if (!title.trim()) return setError('タイトルを入力してください');
    if (!isDateKey(startDate) || !isDateKey(endDate)) return setError('開始日と終了日を正しく設定してください');
    if (startDate > endDate) return setError('終了日は開始日以降に設定してください');
    if (!weekdays.length) return setError('曜日を1つ以上選択してください');
    const start = parseDateKey(startDate);
    const end = parseDateKey(endDate);
    const dayRange = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    if (dayRange > 366) return setError('登録期間は1年以内にしてください');
    if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) return setError('開始時間はHH:mm形式で入力してください');
    if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return setError('終了時間はHH:mm形式で入力してください');
    if (startTime && endTime && startTime >= endTime) return setError('終了時間は開始時間より後に設定してください');
    if (!targetDates.length) return setError('指定期間に該当する曜日がありません');

    try {
      setSaving(true);
      setError('');
      const eventData = {
        title: title.trim(),
        startTime: isAllDay || !startTime ? null : startTime,
        endTime: isAllDay || !endTime ? null : endTime,
        isAllDay,
        category,
        location: location.trim() || null,
        memo: memo.trim() || null,
        budget: parseMoney(budget),
      };
      for (const date of targetDates) await saveEvent(db, { ...eventData, date });
      router.replace('/calendar');
    } catch {
      setError('予定を一括登録できませんでした。');
    } finally {
      setSaving(false);
    }
  };

  return <Screen>
    <Header title="予定を一括追加" subtitle="授業や定期予定をまとめて登録" />
    <Field label="タイトル *" value={title} onChangeText={setTitle} placeholder="例：数学の授業" error={error && !title.trim() ? error : undefined} />
    <DateSelector label="開始日 *" value={startDate} onChange={(value) => setStartDate(value ?? '')} error={error && !isDateKey(startDate) ? error : undefined} />
    <DateSelector label="終了日 *" value={endDate} onChange={(value) => setEndDate(value ?? '')} error={error && (!isDateKey(endDate) || startDate > endDate) ? error : undefined} />
    <View style={styles.choiceBlock}>
      <Text style={styles.label}>曜日 *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekdayRow}>
        {weekdayLabels.map((label, weekday) => <Chip key={label} label={label} selected={weekdays.includes(weekday)} onPress={() => toggleWeekday(weekday)} />)}
      </ScrollView>
      <Text style={styles.hint}>選択した曜日に予定を作成します</Text>
    </View>
    <View style={styles.switchRow}><View><Text style={styles.label}>終日</Text><Text style={styles.hint}>時間を指定しない予定</Text></View><Switch value={isAllDay} onValueChange={setIsAllDay} trackColor={{ false: '#DDE2EB', true: '#AFC1FF' }} thumbColor={isAllDay ? colors.primary : '#fff'} /></View>
    {!isAllDay ? <View style={styles.twoCol}><View style={styles.col}><TimeSelector label="開始時間" value={startTime || null} onChange={(value) => setStartTime(value ?? '')} /></View><View style={styles.col}><TimeSelector label="終了時間" value={endTime || null} onChange={(value) => setEndTime(value ?? '')} /></View></View> : null}
    <ChoiceRow label="カテゴリ" options={eventCategories} value={category} onChange={(value) => setCategory(value as (typeof eventCategories)[number])} />
    <Field label="場所" value={location} onChangeText={setLocation} placeholder="例：教室A" />
    <MoneyInput label="予定予算（1回あたり）" value={budget} onChangeText={setBudget} />
    <Field label="メモ" value={memo} onChangeText={setMemo} placeholder="補足メモ" multiline numberOfLines={4} style={styles.multiline} />
    <Card style={styles.preview}><Text style={styles.previewLabel}>登録予定数</Text><Text style={styles.previewValue}>{targetDates.length}件</Text><Text style={styles.previewHint}>{startDate}〜{endDate}の選択曜日に作成</Text></Card>
    <AppButton title={saving ? '登録中…' : `${targetDates.length}件を一括登録`} onPress={() => void submit()} disabled={saving || !targetDates.length} />
    {error && title.trim() && isDateKey(startDate) && isDateKey(endDate) ? <Text style={styles.error}>{error}</Text> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 5 },
  choiceBlock: { marginBottom: 14 },
  weekdayRow: { paddingBottom: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 16 },
  twoCol: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  multiline: { minHeight: 105, textAlignVertical: 'top', paddingTop: 12 },
  preview: { marginTop: 3, marginBottom: 8, backgroundColor: colors.primarySoft },
  previewLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  previewValue: { color: colors.primary, fontSize: 25, fontWeight: '900', marginTop: 5 },
  previewHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700', marginTop: 9 },
});
