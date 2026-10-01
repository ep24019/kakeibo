import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '@/constants/theme';
import { deleteTransaction, getTransaction } from '@/lib/db';
import type { Transaction } from '@/types/models';
import { TransactionForm } from '@/components/forms';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getTransaction(db, Number(id)).then(setTransaction).finally(() => setLoading(false)); }, [db, id]);
  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!transaction) return <Text>収支が見つかりません。</Text>;
  const onDelete = () => Alert.alert('この収支を削除しますか？', undefined, [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: async () => { await deleteTransaction(db, transaction.id); router.replace('/finance'); } }]);
  return <TransactionForm initial={transaction} onDelete={onDelete} />;
}
