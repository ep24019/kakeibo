import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import type { DatabaseLike } from '@/lib/database';
import { WebDatabase } from '@/lib/web-database';
import { migrateDbIfNeeded } from '@/database/migrations';

const AppDatabaseContext = createContext<DatabaseLike | null>(null);
const nativeSqlite = Platform.OS === 'web' ? null : require('expo-sqlite') as typeof import('expo-sqlite');

function NativeBridge({ children }: PropsWithChildren) {
  const db = nativeSqlite!.useSQLiteContext() as DatabaseLike;
  return <AppDatabaseContext.Provider value={db}>{children}</AppDatabaseContext.Provider>;
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  const webDb = useMemo(() => Platform.OS === 'web' ? new WebDatabase() : null, []);
  useEffect(() => { if (webDb) void migrateDbIfNeeded(webDb); }, [webDb]);
  if (Platform.OS === 'web') return <AppDatabaseContext.Provider value={webDb}>{children}</AppDatabaseContext.Provider>;
  const NativeProvider = nativeSqlite!.SQLiteProvider;
  return <NativeProvider databaseName="life-manager.db" onInit={migrateDbIfNeeded} useSuspense={false}><NativeBridge>{children}</NativeBridge></NativeProvider>;
}

export function useAppDatabase() {
  const db = useContext(AppDatabaseContext);
  if (!db) throw new Error('データベースが初期化されていません。');
  return db;
}
