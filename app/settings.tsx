import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDatabase } from '@/lib/database-provider';
import { AppButton, Card, Header, MoneyInput, Screen } from '@/components/ui';
import { getMonthlyBudget, setMonthlyBudget } from '@/lib/db';
import { parseMoney } from '@/lib/format';
import { colors } from '@/constants/theme';

export default function SettingsScreen() {
  const db = useAppDatabase();
  const router = useRouter();
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { void getMonthlyBudget(db).then((value) => setBudget(value ? String(value) : '')); }, [db]);
  const save = async () => { try { setError(''); await setMonthlyBudget(db, parseMoney(budget)); router.back(); } catch { setError('設定を保存できませんでした。'); } };
  return <Screen><Header title="設定" subtitle="アプリの基本設定" /><Card><Text style={{ color: colors.ink, fontWeight: '900', fontSize: 17, marginBottom: 5 }}>月間予算</Text><Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 15 }}>毎月の支出目安を設定すると、ホーム画面で使用率と残り予算を確認できます。</Text><MoneyInput label="月間予算" value={budget} onChangeText={setBudget} /><AppButton title="保存する" onPress={() => void save()} />{error ? <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text> : null}</Card></Screen>;
}
