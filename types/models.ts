export type TransactionType = 'income' | 'expense';
export type TodoPriority = 'high' | 'medium' | 'low';

export type Event = {
  id: number;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  category: string;
  location: string | null;
  memo: string | null;
  budget: number;
  createdAt: string;
  updatedAt: string;
};

export type Todo = {
  id: number;
  title: string;
  dueDate: string | null;
  category: string | null;
  priority: TodoPriority;
  memo: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string | null;
  shopName: string | null;
  memo: string | null;
  eventId: number | null;
  createdAt: string;
  updatedAt: string;
  eventTitle?: string | null;
};

export type MonthlySummary = { income: number; expense: number };
export type CategoryTotal = { category: string; total: number };
