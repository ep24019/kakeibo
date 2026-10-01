import { Stack } from 'expo-router';
import { DatabaseProvider } from '@/lib/database-provider';

export default function RootLayout() {
  return <DatabaseProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F8FA' } }} /></DatabaseProvider>;
}
