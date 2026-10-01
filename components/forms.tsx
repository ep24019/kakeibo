import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { eventCategories, expenseCategories, incomeCategories, paymentMethods, colors } from '@/constants/theme';
import { getEvents, saveEvent, saveTodo, saveTransaction } from '@/lib/db';
import { todayKey } from '@/lib/date';
import { parseMoney } from '@/lib/format';
import type { Event, Todo, Transaction, TransactionType } from '@/types/models';
import { AppButton, ChoiceRow, Field, Header, MoneyInput, Screen } from '@/components/ui';

const isDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export function EventForm({ initial, initialDate }: { initial?: Event | null; initialDate?: string }) {
  const db = useSQLiteContext();
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate] = useState(initial?.date ?? initialDate ?? todayKey());
  const [startTime, setStartTime] = useState(initial?.startTime ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [isAllDay, setIsAllDay] = useState(initial?.isAllDay ?? false);
  const [category, setCategory] = useState(initial?.category ?? eventCategories[0]);
  const [location, setLocation] = useState(initial?.location ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [budget, setBudget] = useState(initial?.budget ? String(initial.budget) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title); setDate(initial.date); setStartTime(initial.startTime ?? ''); setEndTime(initial.endTime ?? ''); setIsAllDay(initial.isAllDay); setCategory(initial.category); setLocation(initial.location ?? ''); setMemo(initial.memo ?? ''); setBudget(initial.budget ? String(initial.budget) : '');
  }, [initial]);

  const submit = async () => {
    if (!title.trim()) return setError('タイトルを入力してください');
    if (!isDateKey(date)) return setError('日付はYYYY-MM-DD形式で入力してください');
    if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) return setError('開始時間はHH:mm形式で入力してください');
    if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return setError('終了時間はHH:mm形式で入力してください');
    try {
      setSaving(true); setError('');
      await saveEvent(db, { title: title.trim(), date, startTime: isAllDay || !startTime ? null : startTime, endTime: isAllDay || !endTime ? null : endTime, isAllDay, category, location: location.trim() || null, memo: memo.trim() || null, budget: parseMoney(budget) }, initial?.id);
      router.back();
    } catch { setError('予定を保存できませんでした。'); } finally { setSaving(false); }
  };

  return <Screen><Header title={initial ? '予定を編集' : '予定を追加'} subtitle="予定と予算を一緒に記録" /><Field label="タイトル *" value={title} onChangeText={setTitle} placeholder="例：友人と焼肉" error={error && !title.trim() ? error : undefined} /><Field label="日付 *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><View style={styles.switchRow}><View><Text style={styles.label}>終日</Text><Text style={styles.hint}>時間を指定しない予定</Text></View><Switch value={isAllDay} onValueChange={setIsAllDay} trackColor={{ false: '#DDE2EB', true: '#AFC1FF' }} thumbColor={isAllDay ? colors.primary : '#fff'} /></View>{!isAllDay ? <View style={styles.twoCol}><View style={styles.col}><Field label="開始時間" value={startTime} onChangeText={setStartTime} placeholder="09:30" /></View><View style={styles.col}><Field label="終了時間" value={endTime} onChangeText={setEndTime} placeholder="10:30" /></View></View> : null}<ChoiceRow label="カテゴリ" options={eventCategories} value={category} onChange={setCategory} /><Field label="場所" value={location} onChangeText={setLocation} placeholder="例：新宿駅" /><MoneyInput label="予定予算" value={budget} onChangeText={setBudget} /><Field label="メモ" value={memo} onChangeText={setMemo} placeholder="補足メモ" multiline numberOfLines={4} style={styles.multiline} /><AppButton title={saving ? '保存中…' : '保存する'} onPress={() => void submit()} disabled={saving} />{error && title.trim() && isDateKey(date) ? <Text style={styles.error}>{error}</Text> : null}</Screen>;
}

export function TodoForm({ initial, onDelete }: { initial?: Todo | null; onDelete?: () => void }) {
  const db = useSQLiteContext();
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [category, setCategory] = useState(initial?.category ?? '個人');
  const [priority, setPriority] = useState(initial?.priority === 'high' ? '高' : initial?.priority === 'low' ? '低' : '中');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (initial) { setTitle(initial.title); setDueDate(initial.dueDate ?? ''); setCategory(initial.category ?? '個人'); setPriority(initial.priority === 'high' ? '高' : initial.priority === 'low' ? '低' : '中'); setMemo(initial.memo ?? ''); } }, [initial]);

  const submit = async () => {
    if (!title.trim()) return setError('タイトルを入力してください');
    if (dueDate && !isDateKey(dueDate)) return setError('期限はYYYY-MM-DD形式で入力してください');
    try { setSaving(true); setError(''); await saveTodo(db, { title: title.trim(), dueDate: dueDate || null, category: category.trim() || null, priority: priority === '高' ? 'high' : priority === '低' ? 'low' : 'medium', memo: memo.trim() || null, completed: initial?.completed ?? false }, initial?.id); router.back(); } catch { setError('Todoを保存できませんでした。'); } finally { setSaving(false); }
  };
  return <Screen><Header title={initial ? 'Todoを編集' : 'Todoを追加'} subtitle="やることを整理して、頭を軽く" /><Field label="タイトル *" value={title} onChangeText={setTitle} placeholder="例：レポートを提出" /><Field label="期限" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" /><Field label="カテゴリ" value={category} onChangeText={setCategory} placeholder="例：大学" /><ChoiceRow label="優先度" options={['高', '中', '低']} value={priority} onChange={setPriority} /><Field label="メモ" value={memo} onChangeText={setMemo} placeholder="補足メモ" multiline numberOfLines={4} style={styles.multiline} /><AppButton title={saving ? '保存中…' : '保存する'} onPress={() => void submit()} disabled={saving} />{initial && onDelete ? <AppButton title="Todoを削除" onPress={onDelete} variant="danger" /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}</Screen>;
}

export function TransactionForm({ initial, initialType = 'expense', initialEventId, onDelete }: { initial?: Transaction | null; initialType?: TransactionType; initialEventId?: number | null; onDelete?: () => void }) {
  const db = useSQLiteContext();
  const router = useRouter();
  const [type, setType] = useState<TransactionType>(initial?.type ?? initialType);
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [category, setCategory] = useState(initial?.category ?? '食費');
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? '現金');
  const [shopName, setShopName] = useState(initial?.shopName ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [eventId, setEventId] = useState<number | null>(initial?.eventId ?? initialEventId ?? null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { void getEvents(db).then(setEvents).catch(() => setEvents([])); }, [db]);
  useEffect(() => { if (initial) { setType(initial.type); setAmount(String(initial.amount)); setDate(initial.date); setCategory(initial.category); setPaymentMethod(initial.paymentMethod ?? '現金'); setShopName(initial.shopName ?? ''); setMemo(initial.memo ?? ''); setEventId(initial.eventId); } }, [initial]);
  useEffect(() => { if (type === 'income' && !incomeCategories.includes(category as (typeof incomeCategories)[number])) setCategory(incomeCategories[0]); if (type === 'expense' && !expenseCategories.includes(category as (typeof expenseCategories)[number])) setCategory(expenseCategories[0]); }, [type]);

  const submit = async () => {
    if (!amount || parseMoney(amount) <= 0) return setError('金額を入力してください');
    if (!isDateKey(date)) return setError('日付はYYYY-MM-DD形式で入力してください');
    try { setSaving(true); setError(''); await saveTransaction(db, { type, amount: parseMoney(amount), date, category, paymentMethod: type === 'expense' ? paymentMethod : null, shopName: type === 'expense' ? shopName.trim() || null : null, memo: memo.trim() || null, eventId: type === 'expense' ? eventId : null }, initial?.id); router.back(); } catch { setError('収支を保存できませんでした。'); } finally { setSaving(false); }
  };

  const categoryOptions = type === 'expense' ? expenseCategories : incomeCategories;
  return <Screen><Header title={initial ? '収支を編集' : type === 'expense' ? '支出を追加' : '収入を追加'} subtitle="お金の動きを正確に記録" /><ChoiceRow label="種類" options={['支出', '収入']} value={type === 'expense' ? '支出' : '収入'} onChange={(value) => setType(value === '支出' ? 'expense' : 'income')} /><MoneyInput label="金額 *" value={amount} onChangeText={setAmount} /><Field label="日付 *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><ChoiceRow label="カテゴリ" options={categoryOptions} value={category} onChange={setCategory} />{type === 'expense' ? <><ChoiceRow label="支払い方法" options={paymentMethods} value={paymentMethod} onChange={setPaymentMethod} /><Field label="店名・サービス名" value={shopName} onChangeText={setShopName} placeholder="例：Amazon" /><View style={styles.choiceBlock}><Text style={styles.label}>関連予定</Text><Pressable onPress={() => setEventId(null)} style={[styles.eventSelect, eventId === null && styles.eventSelected]}><Text style={[styles.eventText, eventId === null && styles.eventSelectedText]}>関連なし</Text></Pressable>{events.slice(0, 30).map((event) => <Pressable key={event.id} onPress={() => setEventId(event.id)} style={[styles.eventSelect, eventId === event.id && styles.eventSelected]}><Text style={[styles.eventText, eventId === event.id && styles.eventSelectedText]}>{event.date}  {event.title}</Text></Pressable>)}</View></> : null}<Field label="メモ" value={memo} onChangeText={setMemo} placeholder="補足メモ" multiline numberOfLines={4} style={styles.multiline} /><AppButton title={saving ? '保存中…' : '保存する'} onPress={() => void submit()} disabled={saving} />{initial && onDelete ? <AppButton title="収支を削除" onPress={onDelete} variant="danger" /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}</Screen>;
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  hint: { color: colors.muted, fontSize: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 16 },
  twoCol: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  multiline: { minHeight: 105, textAlignVertical: 'top', paddingTop: 12 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700', marginTop: 9 },
  choiceBlock: { marginBottom: 14 },
  eventSelect: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 7 },
  eventSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  eventText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  eventSelectedText: { color: colors.primary, fontWeight: '800' },
});
