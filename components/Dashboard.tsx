import React, { useMemo } from 'react';
import { Transaction, User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transactions: Transaction[];
  user: User;
  startDate?: string; // Nhận từ App.tsx
  endDate?: string;   // Nhận từ App.tsx
}

const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-orange-500': '#f97316', 'bg-blue-500': '#3b82f6', 'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899', 'bg-red-500': '#ef4444', 'bg-indigo-500': '#6366f1',
  'bg-yellow-500': '#eab308', 'bg-amber-600': '#d97706', 'bg-green-500': '#22c55e',
  'bg-teal-500': '#14b8a6', 'bg-cyan-500': '#06b6d4', 'bg-gray-500': '#6b7280',
};

const Dashboard: React.FC<Props> = ({ transactions = [], user, startDate, endDate }) => {
  const [chartView, setChartView] = React.useState<'summary' | 'expense' | 'income'>('summary');

  // Tính toán số liệu dựa trên danh sách transactions đã được lọc từ App.tsx
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 
    [transactions]
  );

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), 
    [transactions]
  );

  const expenseData = useMemo(() => 
    DEFAULT_CATEGORIES.filter(c => c.type === 'expense').map(cat => ({
        name: cat.name,
        value: transactions.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0),
        color: TAILWIND_TO_HEX[cat.color] || '#6366f1'
    })).filter(d => d.value > 0), [transactions]);

  const incomeData = useMemo(() => 
    DEFAULT_CATEGORIES.filter(c => c.type === 'income').map(cat => ({
        name: cat.name,
        value: transactions.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0),
        color: TAILWIND_TO_HEX[cat.color] || '#10b981'
    })).filter(d => d.value > 0), [transactions]);

  const summaryData = [
    { name: 'Thu nhập', amount: totalIncome, fill: '#10b981' },
    { name: 'Chi tiêu', amount: totalExpense, fill: '#ef4444' }
  ];

  const formatVND = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-6">
      
      {/* 1. Header hiển thị khoảng ngày đang lọc */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[2.5rem] bg-white shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-lg">🏠</div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Gia đình {user?.name}</p>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">
                {startDate && endDate ? `Từ ${startDate} đến ${endDate}` : "Tổng Quan Tất Cả"}
            </h1>
          </div>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-indigo-600 uppercase">
                ⚡ {transactions.length} giao dịch
            </span>
        </div>
      </div>

      {/* 2. Wallet Card */}
      <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Số dư trong khoảng này</p>
          <h1 className="text-4xl font-black mb-8 tracking-tighter">{formatVND(totalIncome - totalExpense)}</h1>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-[8px] font-black opacity-70 uppercase tracking-tighter">Tổng Thu</p>
                <p className="text-lg font-black text-emerald-300">+{formatVND(totalIncome)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-[8px] font-black opacity-70 uppercase tracking-tighter">Tổng Chi</p>
                <p className="text-lg font-black text-rose-300">-{formatVND(totalExpense)}</p>
              </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Charts Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button onClick={() => setChartView('summary')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${chartView === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Tổng hợp</button>
          <button onClick={() => setChartView('expense')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${chartView === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>Chi tiêu</button>
          <button onClick={() => setChartView('income')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${chartView === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}>Thu nhập</button>
        </div>

        <div className="h-80 w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={chartView} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'summary' ? (
                  <BarChart data={summaryData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Bar dataKey="amount" radius={[12, 12, 12, 12]} barSize={55} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie 
                      data={chartView === 'expense' ? expenseData : incomeData} 
                      cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={6} dataKey="value"
                      label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {(chartView === 'expense' ? expenseData : incomeData).map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '20px'}} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
