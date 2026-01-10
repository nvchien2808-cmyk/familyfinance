
import React from 'react';
import { SavingsGoal } from '../types';

interface Props {
  goals: SavingsGoal[];
  onDeleteRequest: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
  onAdd: () => void;
}

const SavingsGoals: React.FC<Props> = ({ goals, onDeleteRequest, onEdit, onUpdateAmount, onAdd }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const calculateMonthly = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;
    const today = new Date();
    const targetDate = new Date(goal.deadline);
    const diffMonths = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths > 0 ? Math.ceil(remaining / diffMonths) : remaining;
  };

  const getPriorityLabel = (p: string) => {
    switch(p) {
      case 'high': return { text: 'ƯU TIÊN CAO 🔥', color: 'text-rose-500 bg-rose-50' };
      case 'low': return { text: 'THẤP 🍃', color: 'text-emerald-500 bg-emerald-50' };
      default: return { text: 'TRUNG BÌNH ⚡', color: 'text-indigo-500 bg-indigo-50' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-slate-800">Mục tiêu tài chính</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length > 0 ? (
          goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const monthly = calculateMonthly(goal);
            const priority = getPriorityLabel(goal.priority || 'medium');
            
            return (
              <div key={goal.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-5 group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`absolute top-0 left-0 w-2 h-full ${goal.color}`}></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl p-4 bg-slate-50 rounded-[1.5rem] shadow-inner">{goal.icon}</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${priority.color}`}>
                        {priority.text}
                      </span>
                      <h3 className="font-black text-slate-800 text-lg mt-1">{goal.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Đến hạn: {goal.deadline}</p>
                    </div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(goal)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl">✏️</button>
                    <button onClick={() => onDeleteRequest(goal.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">🗑️</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tiến độ</p>
                      <p className="text-sm font-black text-slate-800">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                    </div>
                    <span className="text-xl font-black text-indigo-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${goal.color}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cần tiết kiệm tháng này</p>
                      <p className="font-black text-indigo-600">{formatCurrency(monthly)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian còn lại</p>
                       <p className="font-bold text-slate-700 text-xs">
                         {Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)))} tháng
                       </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => onUpdateAmount(goal.id, goal.currentAmount + 500000)}
                    className="flex-1 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    +500K
                  </button>
                  <button 
                    onClick={() => onUpdateAmount(goal.id, goal.currentAmount + 2000000)}
                    className="flex-1 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    +2 TRIỆU
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <span className="text-6xl block mb-4 animate-pulse">🏔️</span>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Chưa có mục tiêu tài chính</p>
            <p className="text-slate-300 text-xs mt-2 italic">Hãy tạo kế hoạch ngay hôm nay!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Savings Goals */}
      <button 
        onClick={onAdd} 
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center text-4xl font-light hover:scale-110 active:scale-95 transition-all z-[60]"
        title="Thêm mục tiêu mới"
      >
        +
      </button>
    </div>
  );
};

export default SavingsGoals;
