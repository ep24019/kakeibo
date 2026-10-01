import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/database/migrations';

export default function RootLayout() {
  return <SQLiteProvider databaseName="life-manager.db" onInit={migrateDbIfNeeded} useSuspense={false}><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F8FA' } }} /></SQLiteProvider>;
}
