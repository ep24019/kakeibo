import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryColors, colors } from '@/constants/theme';
import { displayTime, formatShortDate } from '@/lib/date';
import { formatMoney, formatSignedMoney } from '@/lib/format';
import type { Event, Todo, Transaction } from '@/types/models';
import { Card, Chip, IconCircle } from '@/components/ui';

export function EventCard({ event, onPress }: { event: Event; onPress?: () => void }) {
  return <Card onPress={onPress} style={styles.recordCard}><View style={styles.row}><IconCircle icon="◷" color={categoryColors[event.category] ?? colors.primary} /><View style={styles.flex}><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.muted}>{displayTime(event.startTime, event.endTime, event.isAllDay)}{event.location ? `  ·  ${event.location}` : ''}</Text></View>{event.budget > 0 ? <Text style={styles.budget}>{formatMoney(event.budget)}</Text> : null}</View><View style={styles.metaRow}><Chip label={event.category} color={categoryColors[event.category] ?? colors.primary} /></View></Card>;
}

export function TodoCard({ todo, onToggle, onPress }: { todo: Todo; onToggle: () => void; onPress?: () => void }) {
  return <Card style={styles.recordCard}><View style={styles.row}><Pressable onPress={onToggle} style={[styles.checkbox, todo.completed && styles.checkboxDone]}><Text style={styles.check}>{todo.completed ? '✓' : ''}</Text></Pressable><Pressable onPress={onPress} style={styles.flex}><Text style={[styles.cardTitle, todo.completed && styles.completed]}>{todo.title}</Text><Text style={styles.muted}>{todo.dueDate ? `期限 ${formatShortDate(todo.dueDate)}` : '期限なし'}  ·  {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}</Text></Pressable><Text style={[styles.priorityDot, { color: todo.priority === 'high' ? colors.danger : todo.priority === 'medium' ? colors.accent : colors.success }]}>●</Text></View></Card>;
}

export function TransactionCard({ transaction, onPress }: { transaction: Transaction; onPress?: () => void }) {
  const income = transaction.type === 'income';
  return <Card onPress={onPress} style={styles.recordCard}><View style={styles.row}><IconCircle icon={income ? '↗' : '↘'} color={income ? colors.success : colors.danger} /><View style={styles.flex}><Text style={styles.cardTitle}>{transaction.shopName || transaction.category}</Text><Text style={styles.muted}>{transaction.category}  ·  {formatShortDate(transaction.date)}{transaction.eventTitle ? `  ·  ${transaction.eventTitle}` : ''}</Text></View><Text style={[styles.amount, income ? styles.income : styles.expense]}>{formatSignedMoney(transaction.amount, transaction.type)}</Text></View></Card>;
}

const styles = StyleSheet.create({
  recordCard: { marginBottom: 10, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  muted: { color: colors.muted, fontSize: 12, marginTop: 5 },
  budget: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  metaRow: { marginTop: 11, flexDirection: 'row' },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  check: { color: '#fff', fontWeight: '900' },
  completed: { textDecorationLine: 'line-through', color: colors.muted },
  priorityDot: { fontSize: 14 },
  amount: { fontWeight: '900', fontSize: 14 },
  income: { color: colors.success },
  expense: { color: colors.danger },
});
