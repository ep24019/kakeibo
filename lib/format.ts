export const formatMoney = (value: number) => `¥${Math.round(value).toLocaleString('ja-JP')}`;
export const formatSignedMoney = (value: number, type?: 'income' | 'expense') => { const signed = type === 'expense' ? -Math.abs(value) : type === 'income' ? Math.abs(value) : value; return `${signed >= 0 ? '+' : '-'}¥${Math.abs(Math.round(signed)).toLocaleString('ja-JP')}`; };
export const parseMoney = (value: string) => { const normalized = value.replace(/[^0-9]/g, ''); return normalized ? Number(normalized) : 0; };
export const percentage = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;
