import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, date TEXT NOT NULL, startTime TEXT, endTime TEXT, isAllDay INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'その他', location TEXT, memo TEXT, budget INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, dueDate TEXT, category TEXT, priority TEXT NOT NULL DEFAULT 'medium', memo TEXT, completed INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL CHECK(type IN ('income', 'expense')), amount INTEGER NOT NULL CHECK(amount >= 0), date TEXT NOT NULL, category TEXT NOT NULL, paymentMethod TEXT, shopName TEXT, memo TEXT, eventId INTEGER REFERENCES events(id) ON DELETE SET NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_event ON transactions(eventId);
  `);
}
