import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Card, Header, Screen } from '@/components/ui';

const actions = [
  { title: '予定を追加', description: '日時・場所・予算を登録', icon: '◷', color: colors.primary, path: '/event/new' },
  { title: '予定を一括追加', description: '曜日と期間を指定して授業などを登録', icon: '↻', color: colors.teal, path: '/event/recurring' },
  { title: 'Todoを追加', description: 'やることと期限を登録', icon: '✓', color: colors.purple, path: '/todo/new' },
  { title: '支出を追加', description: '使ったお金を予定と連携', icon: '↘', color: colors.danger, path: '/transaction/new?type=expense' },
  { title: '収入を追加', description: '給与などの収入を登録', icon: '↗', color: colors.success, path: '/transaction/new?type=income' },
] as const;

export default function AddScreen() {
  const router = useRouter();
  return <Screen><Header title="追加する" subtitle="暮らしの記録をすばやく登録" />{actions.map((action) => <Card key={action.title} onPress={() => router.push(action.path)} style={styles.actionCard}><View style={[styles.icon, { backgroundColor: `${action.color}18` }]}><Text style={[styles.iconText, { color: action.color }]}>{action.icon}</Text></View><View style={styles.copy}><Text style={styles.title}>{action.title}</Text><Text style={styles.description}>{action.description}</Text></View><Text style={styles.chevron}>›</Text></Card>)}</Screen>;
}

const styles = StyleSheet.create({
  actionCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 18 },
  icon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 24, fontWeight: '900' },
  copy: { flex: 1, marginLeft: 15 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  description: { color: colors.muted, marginTop: 5, fontSize: 13 },
  chevron: { color: colors.muted, fontSize: 30, fontWeight: '300' },
});
