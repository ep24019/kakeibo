import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { colors } from '@/constants/theme';
import { getTodos, toggleTodo } from '@/lib/db';
import type { Todo } from '@/types/models';
import { Card, EmptyState, Header, Screen } from '@/components/ui';
import { TodoCard } from '@/components/records';

export default function TodoListScreen() {
  const db = useAppDatabase();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => { try { setError(''); setTodos(await getTodos(db)); } catch { setError('Todoを読み込めませんでした。'); } }, [db]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><Header title="Todo一覧" subtitle="やることを一か所にまとめる" right={<Pressable onPress={() => router.push('/todo/new')} style={styles.add}><Text style={styles.addText}>＋追加</Text></Pressable>} />{error ? <Card style={styles.error}><Text style={styles.errorText}>{error}</Text></Card> : null}{todos.length ? todos.map((todo) => <TodoCard key={todo.id} todo={todo} onToggle={async () => { await toggleTodo(db, todo.id, !todo.completed); await load(); }} onPress={() => router.push(`/todo/edit/${todo.id}`)} />) : <Card><EmptyState icon="✓" title="Todoはまだありません" body="頭の中のやることを登録しましょう" action="Todoを追加" onAction={() => router.push('/todo/new')} /></Card>}</Screen>;
}

const styles = StyleSheet.create({
  add: { backgroundColor: colors.primarySoft, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  addText: { color: colors.primary, fontWeight: '800' },
  error: { backgroundColor: colors.dangerSoft, marginBottom: 12 },
  errorText: { color: colors.danger, fontWeight: '700' },
});
