import type { DatabaseLike, DatabaseResult } from '@/lib/database';

type StoredEvent = { id: number; title: string; date: string; startTime: string | null; endTime: string | null; isAllDay: number; category: string; location: string | null; memo: string | null; budget: number; createdAt: string; updatedAt: string };
type StoredTodo = { id: number; title: string; dueDate: string | null; category: string | null; priority: string; memo: string | null; completed: number; createdAt: string; updatedAt: string };
type StoredTransaction = { id: number; type: 'income' | 'expense'; amount: number; date: string; category: string; paymentMethod: string | null; shopName: string | null; memo: string | null; eventId: number | null; createdAt: string; updatedAt: string };
type StoredState = { events: StoredEvent[]; todos: StoredTodo[]; transactions: StoredTransaction[]; settings: Record<string, string>; nextIds: { events: number; todos: number; transactions: number } };

const STORAGE_KEY = 'life-manager.web-db.v1';
const freshState = (): StoredState => ({ events: [], todos: [], transactions: [], settings: {}, nextIds: { events: 1, todos: 1, transactions: 1 } });

export class WebDatabase implements DatabaseLike {
  private state: StoredState;

  constructor() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      this.state = raw ? JSON.parse(raw) as StoredState : freshState();
    } catch { this.state = freshState(); }
  }

  private persist() {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch { /* localStorage is optional */ }
  }

  async execAsync(_sql: string) { return undefined; }

  async runAsync(sql: string, ...params: unknown[]): Promise<DatabaseResult> {
    const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
    if (normalized.startsWith('INSERT INTO EVENTS')) {
      const [title, date, startTime, endTime, isAllDay, category, location, memo, budget, createdAt, updatedAt] = params;
      const id = this.state.nextIds.events++;
      this.state.events.push({ id, title: String(title), date: String(date), startTime: (startTime as string | null) ?? null, endTime: (endTime as string | null) ?? null, isAllDay: Number(isAllDay), category: String(category), location: (location as string | null) ?? null, memo: (memo as string | null) ?? null, budget: Number(budget), createdAt: String(createdAt), updatedAt: String(updatedAt) });
      this.persist(); return { lastInsertRowId: id };
    }
    if (normalized.startsWith('UPDATE EVENTS')) {
      const [title, date, startTime, endTime, isAllDay, category, location, memo, budget, updatedAt, id] = params;
      const row = this.state.events.find((item) => item.id === Number(id));
      if (row) Object.assign(row, { title: String(title), date: String(date), startTime: (startTime as string | null) ?? null, endTime: (endTime as string | null) ?? null, isAllDay: Number(isAllDay), category: String(category), location: (location as string | null) ?? null, memo: (memo as string | null) ?? null, budget: Number(budget), updatedAt: String(updatedAt) });
      this.persist(); return { lastInsertRowId: Number(id) };
    }
    if (normalized.startsWith('DELETE FROM EVENTS')) { this.state.events = this.state.events.filter((item) => item.id !== Number(params[0])); this.persist(); return { lastInsertRowId: 0 }; }
    if (normalized.startsWith('INSERT INTO TODOS')) {
      const [title, dueDate, category, priority, memo, completed, createdAt, updatedAt] = params;
      const id = this.state.nextIds.todos++;
      this.state.todos.push({ id, title: String(title), dueDate: (dueDate as string | null) ?? null, category: (category as string | null) ?? null, priority: String(priority), memo: (memo as string | null) ?? null, completed: Number(completed), createdAt: String(createdAt), updatedAt: String(updatedAt) });
      this.persist(); return { lastInsertRowId: id };
    }
    if (normalized.startsWith('UPDATE TODOS SET COMPLETED')) { const [completed, updatedAt, id] = params; const row = this.state.todos.find((item) => item.id === Number(id)); if (row) Object.assign(row, { completed: Number(completed), updatedAt: String(updatedAt) }); this.persist(); return { lastInsertRowId: Number(id) }; }
    if (normalized.startsWith('UPDATE TODOS SET TITLE')) { const [title, dueDate, category, priority, memo, updatedAt, id] = params; const row = this.state.todos.find((item) => item.id === Number(id)); if (row) Object.assign(row, { title: String(title), dueDate: (dueDate as string | null) ?? null, category: (category as string | null) ?? null, priority: String(priority), memo: (memo as string | null) ?? null, updatedAt: String(updatedAt) }); this.persist(); return { lastInsertRowId: Number(id) }; }
    if (normalized.startsWith('DELETE FROM TODOS')) { this.state.todos = this.state.todos.filter((item) => item.id !== Number(params[0])); this.persist(); return { lastInsertRowId: 0 }; }
    if (normalized.startsWith('INSERT INTO TRANSACTIONS')) {
      const [type, amount, date, category, paymentMethod, shopName, memo, eventId, createdAt, updatedAt] = params;
      const id = this.state.nextIds.transactions++;
      this.state.transactions.push({ id, type: type as 'income' | 'expense', amount: Number(amount), date: String(date), category: String(category), paymentMethod: (paymentMethod as string | null) ?? null, shopName: (shopName as string | null) ?? null, memo: (memo as string | null) ?? null, eventId: eventId === null ? null : Number(eventId), createdAt: String(createdAt), updatedAt: String(updatedAt) });
      this.persist(); return { lastInsertRowId: id };
    }
    if (normalized.startsWith('UPDATE TRANSACTIONS')) { const [type, amount, date, category, paymentMethod, shopName, memo, eventId, updatedAt, id] = params; const row = this.state.transactions.find((item) => item.id === Number(id)); if (row) Object.assign(row, { type, amount: Number(amount), date: String(date), category: String(category), paymentMethod: (paymentMethod as string | null) ?? null, shopName: (shopName as string | null) ?? null, memo: (memo as string | null) ?? null, eventId: eventId === null ? null : Number(eventId), updatedAt: String(updatedAt) }); this.persist(); return { lastInsertRowId: Number(id) }; }
    if (normalized.startsWith('DELETE FROM TRANSACTIONS')) { this.state.transactions = this.state.transactions.filter((item) => item.id !== Number(params[0])); this.persist(); return { lastInsertRowId: 0 }; }
    if (normalized.startsWith('INSERT INTO SETTINGS')) { this.state.settings.monthlyBudget = String(params[0]); this.persist(); return { lastInsertRowId: 0 }; }
    return { lastInsertRowId: 0 };
  }

  async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
    if (normalized.includes('FROM EVENTS')) {
      const rows = params.length >= 2 ? this.state.events.filter((item) => item.date >= String(params[0]) && item.date <= String(params[1])) : [...this.state.events];
      rows.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '') || a.id - b.id);
      return rows as T[];
    }
    if (normalized.includes('FROM TODOS')) {
      const rows = normalized.includes('WHERE COMPLETED=0') ? this.state.todos.filter((item) => item.completed === 0) : [...this.state.todos];
      rows.sort((a, b) => a.completed - b.completed || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || b.id - a.id);
      return rows as T[];
    }
    if (normalized.includes('GROUP BY TYPE')) {
      const filtered = this.filterTransactions(params);
      return (['income', 'expense'] as const).filter((type) => filtered.some((item) => item.type === type)).map((type) => ({ type, total: filtered.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0) })) as T[];
    }
    if (normalized.includes('GROUP BY CATEGORY')) {
      const totals = new Map<string, number>();
      this.filterTransactions(params).filter((item) => item.type === 'expense').forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount));
      return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total) as T[];
    }
    if (normalized.includes('FROM TRANSACTIONS')) {
      const rows = this.filterTransactions(params).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map((item) => ({ ...item, eventTitle: this.state.events.find((event) => event.id === item.eventId)?.title ?? null }));
      return rows as T[];
    }
    return [];
  }

  private filterTransactions(params: unknown[]) { return params.length >= 2 ? this.state.transactions.filter((item) => item.date >= String(params[0]) && item.date <= String(params[1])) : [...this.state.transactions]; }

  async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
    const id = Number(params[0]);
    if (normalized.includes('FROM EVENTS') && normalized.includes('WHERE ID')) return (this.state.events.find((item) => item.id === id) as T | undefined) ?? null;
    if (normalized.includes('FROM TODOS') && normalized.includes('WHERE ID')) return (this.state.todos.find((item) => item.id === id) as T | undefined) ?? null;
    if (normalized.includes('SUM(AMOUNT)') && normalized.includes('EVENTID')) return ({ total: this.state.transactions.filter((item) => item.eventId === id && item.type === 'expense').reduce((sum, item) => sum + item.amount, 0) } as T);
    if (normalized.includes('FROM TRANSACTIONS') && normalized.includes('WHERE T.ID')) { const item = this.state.transactions.find((row) => row.id === id); return item ? ({ ...item, eventTitle: this.state.events.find((event) => event.id === item.eventId)?.title ?? null } as T) : null; }
    if (normalized.includes('FROM SETTINGS')) return (this.state.settings.monthlyBudget ? { value: this.state.settings.monthlyBudget } as T : null);
    return null;
  }
}
