import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, categoryColors } from '@/constants/theme';
import { deleteEvent, getEvent, getEventSpent, getTransactions } from '@/lib/db';
import { displayTime, formatJapaneseDate } from '@/lib/date';
import { formatMoney, formatSignedMoney } from '@/lib/format';
import type { Event, Transaction } from '@/types/models';
import { AppButton, Card, Header, Screen } from '@/components/ui';
import { TransactionCard } from '@/components/records';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const eventId = Number(id);
  const [event, setEvent] = useState<Event | null>(null);
  const [spent, setSpent] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const [nextEvent, nextSpent, allTransactions] = await Promise.all([getEvent(db, eventId), getEventSpent(db, eventId), getTransactions(db)]);
    setEvent(nextEvent); setSpent(nextSpent); setTransactions(allTransactions.filter((transaction) => transaction.eventId === eventId));
  }, [db, eventId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!event) return <Screen><Header title="予定詳細" /><Text style={styles.notFound}>予定が見つかりません。</Text></Screen>;
  const difference = event.budget - spent;
  const confirmDelete = () => Alert.alert('予定を削除しますか？', 'この予定と関連付けられた支出は残ります。', [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: async () => { await deleteEvent(db, event.id); router.replace('/calendar'); } }]);

  return <Screen><Header title="予定詳細" right={<Pressable onPress={() => router.back()}><Text style={styles.back}>閉じる</Text></Pressable>} /><Card style={styles.titleCard}><View style={[styles.categoryDot, { backgroundColor: categoryColors[event.category] ?? colors.primary }]} /><Text style={styles.title}>{event.title}</Text><Text style={styles.category}>{event.category}</Text></Card><Card style={styles.detailCard}><DetailRow label="日付" value={formatJapaneseDate(event.date)} /><DetailRow label="時間" value={displayTime(event.startTime, event.endTime, event.isAllDay)} />{event.location ? <DetailRow label="場所" value={event.location} /> : null}{event.memo ? <DetailRow label="メモ" value={event.memo} /> : null}</Card><View style={styles.moneyGrid}><Card style={styles.moneyCard}><Text style={styles.moneyLabel}>予定予算</Text><Text style={styles.moneyValue}>{event.budget > 0 ? formatMoney(event.budget) : '未設定'}</Text></Card><Card style={styles.moneyCard}><Text style={styles.moneyLabel}>実際の支出</Text><Text style={[styles.moneyValue, spent > event.budget && { color: colors.danger }]}>{formatMoney(spent)}</Text></Card></View><Card style={styles.differenceCard}><Text style={styles.moneyLabel}>差額（予算 − 実績）</Text><Text style={[styles.difference, { color: difference >= 0 ? colors.success : colors.danger }]}>{formatSignedMoney(difference)}</Text></Card><View style={styles.actions}><AppButton title="この予定に支出を追加" icon="＋" onPress={() => router.push(`/transaction/new?type=expense&eventId=${event.id}`)} /><AppButton title="予定を編集" onPress={() => router.push(`/event/edit/${event.id}`)} variant="secondary" /><AppButton title="予定を削除" onPress={confirmDelete} variant="danger" /></View><Text style={styles.relatedTitle}>関連する支出</Text>{transactions.length ? transactions.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction} onPress={() => router.push(`/transaction/edit/${transaction.id}`)} />) : <Card><Text style={styles.noRelated}>まだ関連する支出はありません。</Text></Card>}</Screen>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800' },
  notFound: { color: colors.muted },
  titleCard: { alignItems: 'center', paddingVertical: 25, marginBottom: 12 },
  categoryDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 12 },
  title: { color: colors.ink, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  category: { color: colors.muted, fontSize: 13, marginTop: 6 },
  detailCard: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailLabel: { color: colors.muted, fontSize: 13 },
  detailValue: { color: colors.ink, fontWeight: '700', maxWidth: '68%', textAlign: 'right' },
  moneyGrid: { flexDirection: 'row', gap: 10 },
  moneyCard: { flex: 1, padding: 14 },
  moneyLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  moneyValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 8 },
  differenceCard: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  difference: { fontSize: 22, fontWeight: '900' },
  actions: { marginTop: 5, marginBottom: 23 },
  relatedTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 12 },
  noRelated: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
});
