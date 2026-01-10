
import React, { useState, useEffect } from 'react';
import { Transaction, Category, User, Wallet } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_WALLETS } from '../constants.tsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getFinancialAdvice } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  user: User;
}

// Bảng màu sắc rực rỡ, tách biệt cho biểu đồ
const CHART_PALETTE = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#3b82f6', // blue
];

// Ánh xạ màu Tailwind sang Hex (để Recharts hiển thị đúng)
const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-orange-500': '#f97316',
  'bg-blue-500': '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-red-500': '#ef4444',
  'bg-indigo-500': '#6366f1',
  'bg-yellow-500': '#eab308',
  'bg-amber-600': '#d97706',
  'bg-green-500': '#22c55e',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-500': '#06b6d4',
  'bg-gray-500': '#6b7280',
};

const Dashboard: React.FC<Props> = ({ transactions, user }) => {
  const [aiAdvice, setAiAdvice] = useState<string>('Đang phân tích dữ liệu gia đình bạn...');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));

  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const walletBalances = INITIAL_WALLETS.map(w => {
    const totalTx = transactions.filter(t => t.walletId === w.id).reduce((sum, t) => 
      t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    return { ...w, balance: totalTx };
  });

  const totalBalance = walletBalances.reduce((sum, w) => sum + w.balance, 0);

  // Chi tiêu theo hạng mục
  const categoryData = DEFAULT_CATEGORIES
    .filter(c => c.type === 'expense')
    .map(cat => {
      const amount = monthTransactions.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
      return { 
        name: cat.name, 
        value: amount, 
        color: TAILWIND_TO_HEX[cat.color] || '#cbd5e1' 
      };
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Chi tiêu theo thành viên
  const memberData = user.familyMembers.map((member, index) => {
    const amount = monthTransactions.filter(t => t.member === member && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { 
      name: member, 
      value: amount,
      fill: CHART_PALETTE[index % CHART_PALETTE.length] 
    };
  }).filter(d => d.value > 0);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (monthTransactions.length >= 2) {
        setIsLoadingAdvice(true);
        const advice = await getFinancialAdvice(monthTransactions, DEFAULT_CATEGORIES);
        setAiAdvice(advice);
        setIsLoadingAdvice(false);
      } else {
        setAiAdvice("Hãy ghi chép thêm chi tiêu gia đình để tôi có thể tư vấn tài chính thông minh cho bạn!");
      }
    };
    fetchAdvice();
  }, [monthTransactions.length]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tài chính gia đình</h2>
          <h1 className="text-2xl font-black text-slate-800">Chào {user.name} ❤️</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Tháng {currentMonth}</p>
          <p className="text-sm font-black text-indigo-600">+{formatCurrency(monthIncome - monthExpense)}</p>
        </div>
      </div>

      {/* Main Total Balance */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Tổng tài sản gia đình</p>
          <h1 className="text-4xl font-black mb-6">{formatCurrency(totalBalance)}</h1>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
               <p className="text-[9px] uppercase font-bold text-indigo-200">Thu nhập tháng</p>
               <p className="font-black text-emerald-300">+{formatCurrency(monthIncome)}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
               <p className="text-[9px] uppercase font-bold text-indigo-200">Chi tiêu tháng</p>
               <p className="font-black text-rose-300">-{formatCurrency(monthExpense)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Wallets Summary */}
      <div className="grid grid-cols-3 gap-3">
        {walletBalances.map(w => (
          <div key={w.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-xl mb-1">{w.icon}</span>
            <p className="text-[9px] font-bold text-slate-400 uppercase truncate w-full">{w.name}</p>
            <p className="text-[10px] font-black text-slate-800 truncate w-full">{formatCurrency(w.balance)}</p>
          </div>
        ))}
      </div>

      {/* AI Advice Card */}
      <div className="bg-white border border-indigo-50 rounded-[2rem] p-6 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-100 rotate-3">🤖</div>
          <div>
            <h3 className="font-black text-slate-800">Trợ lý Tài chính AI</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phân tích chi tiêu gia đình</p>
          </div>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed min-h-[50px] italic">
          {isLoadingAdvice ? (
            <div className="flex items-center gap-2 py-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              <span className="text-slate-400 text-[10px] font-medium">Gemini đang nghiên cứu hóa đơn của bạn...</span>
            </div>
          ) : (
            `"${aiAdvice}"`
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800">Cơ cấu chi tiêu</h3>
            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">Tháng {currentMonth}</span>
          </div>
          {categoryData.length > 0 ? (
            <div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={75} 
                      paddingAngle={4} 
                      dataKey="value" 
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} 
                      formatter={(val: number) => formatCurrency(val)} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4 max-h-40 overflow-y-auto no-scrollbar px-2">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px] font-bold py-1 border-b border-slate-50 last:border-none">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-500 truncate">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-800">{formatCurrency(d.value)}</span>
                      <span className="text-slate-400 w-8 text-right">{Math.round((d.value / monthExpense) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic text-xs">Chưa có dữ liệu chi tiêu</div>
          )}
        </div>

        {/* Member Breakdown */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="font-black text-slate-800 mb-6">Chi tiêu theo thành viên</h3>
          {memberData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberData} layout="vertical" margin={{ left: -10, right: 30, top: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(val: number) => formatCurrency(val)} 
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {memberData.map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {memberData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }}></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic text-xs">Chưa có dữ liệu thành viên</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
