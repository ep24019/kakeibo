import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { colors } from '@/constants/theme';
import { deleteTodo, getTodo } from '@/lib/db';
import type { Todo } from '@/types/models';
import { TodoForm } from '@/components/forms';

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useAppDatabase();
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getTodo(db, Number(id)).then(setTodo).finally(() => setLoading(false)); }, [db, id]);
  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (!todo) return <Text>Todoが見つかりません。</Text>;
  const onDelete = () => Alert.alert('Todoを削除しますか？', undefined, [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: async () => { await deleteTodo(db, todo.id); router.replace('/todo'); } }]);
  return <TodoForm initial={todo} onDelete={onDelete} />;
}
