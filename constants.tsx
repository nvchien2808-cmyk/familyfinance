
import { Category, Wallet } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'exp_food', name: 'Ăn uống', icon: '🍔', color: 'bg-orange-500', type: 'expense' },
  { id: 'exp_rent', name: 'Nhà cửa', icon: '🏠', color: 'bg-blue-500', type: 'expense' },
  { id: 'exp_transport', name: 'Di chuyển', icon: '🚗', color: 'bg-purple-500', type: 'expense' },
  { id: 'exp_shopping', name: 'Mua sắm', icon: '🛍️', color: 'bg-pink-500', type: 'expense' },
  { id: 'exp_health', name: 'Y tế', icon: '💊', color: 'bg-red-500', type: 'expense' },
  { id: 'exp_education', name: 'Giáo dục', icon: '📚', color: 'bg-indigo-500', type: 'expense' },
  { id: 'exp_fun', name: 'Giải trí', icon: '🎮', color: 'bg-yellow-500', type: 'expense' },
  { id: 'exp_bills', name: 'Điện nước', icon: '⚡', color: 'bg-amber-600', type: 'expense' },
  
  // Income
  { id: 'inc_salary', name: 'Lương', icon: '💰', color: 'bg-green-500', type: 'income' },
  { id: 'inc_bonus', name: 'Thưởng', icon: '🎁', color: 'bg-teal-500', type: 'income' },
  { id: 'inc_invest', name: 'Đầu tư', icon: '📈', color: 'bg-cyan-500', type: 'income' },
  { id: 'inc_other', name: 'Khác', icon: '✨', color: 'bg-gray-500', type: 'income' },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w_cash', name: 'Tiền mặt', type: 'cash', balance: 0, icon: '💵' },
  { id: 'w_bank', name: 'Ngân hàng', type: 'bank', balance: 0, icon: '💳' },
  { id: 'w_momo', name: 'Ví MoMo', type: 'e-wallet', balance: 0, icon: '📱' },
];

export const FAMILY_MEMBERS = ['Bố', 'Mẹ', 'Con Trai', 'Con Gái'];

export const CURRENCIES = [
  { code: 'VND', symbol: '₫' },
  { code: 'USD', symbol: '$' }
];
