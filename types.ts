export type TransactionType = 'income' | 'expense';
export type Priority = 'high' | 'medium' | 'low';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'e-wallet';
  balance: number;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  member: string;
  date: string;
  note: string;
  tags?: string[];
  receiptImage?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  priority: Priority;
  note?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  currency: string;
  monthlyBudget: number; // Đây là tổng ngân sách hàng tháng chung
  
  // ✅ THÊM MỚI: Ngân sách chi tiết cho từng hạng mục
  // Key là categoryId, Value là số tiền mục tiêu (Ví dụ: { "cat_house": 5000000 })
  categoryBudgets?: Record<string, number>; 

  familyMembers: string[];
  biometricCredentialId?: string;
  reminderEnabled: boolean;
  reminderTime: string;
  profileImage?: string;
  useImageAsBackground?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
