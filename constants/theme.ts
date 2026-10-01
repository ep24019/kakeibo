import { Platform } from 'react-native';

export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  ink: '#1C2430',
  muted: '#7A8492',
  line: '#E8EBEF',
  primary: '#3A6FF7',
  primarySoft: '#EAF0FF',
  accent: '#FFB547',
  success: '#26A269',
  successSoft: '#E6F6EE',
  danger: '#E05252',
  dangerSoft: '#FDECEC',
  purple: '#845EF7',
  teal: '#18A999',
  pink: '#E56B9F',
  navy: '#23395D',
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#15233B',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  default: {},
});

export const categoryColors: Record<string, string> = {
  大学: '#4778F0',
  バイト: '#F08C46',
  就活: '#845EF7',
  プライベート: '#E56B9F',
  旅行: '#18A999',
  支払い: '#D9A441',
  その他: '#8993A4',
  食費: '#F08C46',
  外食: '#E56B9F',
  日用品: '#4778F0',
  交通費: '#18A999',
  娯楽: '#845EF7',
  サブスク: '#9B6BCE',
  衣服: '#D77A61',
  美容: '#D45087',
  医療: '#52A46A',
  給料: '#26A269',
  アルバイト: '#4778F0',
  臨時収入: '#F08C46',
};

export const eventCategories = ['大学', 'バイト', '就活', 'プライベート', '旅行', '支払い', 'その他'] as const;
export const expenseCategories = ['食費', '外食', '日用品', '交通費', '娯楽', 'サブスク', '衣服', '美容', '医療', '旅行', 'その他'] as const;
export const incomeCategories = ['給料', 'アルバイト', '臨時収入', 'その他'] as const;
export const paymentMethods = ['現金', 'クレジットカード', 'PayPay', '楽天Pay', 'Suica', '銀行', 'その他'] as const;

export type EventCategory = (typeof eventCategories)[number];
export type ExpenseCategory = (typeof expenseCategories)[number];
export type IncomeCategory = (typeof incomeCategories)[number];
