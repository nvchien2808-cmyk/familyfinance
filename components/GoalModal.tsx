
import React, { useState, useEffect } from 'react';
import { SavingsGoal, Priority } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => void;
  initialData?: SavingsGoal;
}

const GOAL_ICONS = ['🏠', '🚗', '🏖️', '🎓', '💍', '💻', '🚲', '💰', '🎁', '🏥', '🛫'];
const GOAL_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-purple-500', 'bg-sky-500', 'bg-rose-500'
];

const GoalModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setDeadline(initialData.deadline);
      setIcon(initialData.icon);
      setColor(initialData.color);
      setPriority(initialData.priority || 'medium');
      setNote(initialData.note || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setIcon(GOAL_ICONS[0]);
      setColor(GOAL_COLORS[0]);
      setPriority('medium');
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const formatWithDots = (val: string) => {
    if (!val) return "";
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRawNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const calculateMonthlySaving = () => {
    if (!targetAmount || !deadline) return 0;
    const remaining = parseFloat(targetAmount) - parseFloat(currentAmount);
    if (remaining <= 0) return 0;

    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    return diffMonths > 0 ? Math.ceil(remaining / diffMonths) : remaining;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;
    onSave({
      name,
      targetAmount: parseFloat(parseRawNumber(targetAmount)),
      currentAmount: parseFloat(parseRawNumber(currentAmount)),
      deadline,
      icon,
      color,
      priority,
      note
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-backdrop">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-modal">
        
        {/* Lộ trình Panel (Desktop only or scrollable) */}
        <div className="hidden md:flex md:w-1/3 bg-slate-50 p-8 flex-col justify-between border-r border-slate-100">
          <div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Lộ trình dự kiến</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400">Cần tiết kiệm mỗi tháng</p>
                <p className="text-xl font-black text-indigo-600">{formatCurrency(calculateMonthlySaving())}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">Số tiền còn thiếu</p>
                <p className="text-sm font-bold text-slate-700">{formatCurrency(Math.max(0, parseFloat(parseRawNumber(targetAmount || '0')) - parseFloat(parseRawNumber(currentAmount || '0'))))}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
             <p className="text-[9px] font-bold text-slate-400 leading-tight italic">
               "Kế hoạch tốt là chìa khóa của sự giàu có. Hãy kiên trì với mục tiêu của gia đình bạn!"
             </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">{initialData ? 'Thiết lập mục tiêu' : 'Mục tiêu mới'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 btn-press">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tên mục tiêu</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ví dụ: Mua nhà, Mua xe, Quỹ học tập..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mục tiêu (VND)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatWithDots(targetAmount)}
                  onChange={(e) => setTargetAmount(parseRawNumber(e.target.value))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Đã có sẵn (VND)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatWithDots(currentAmount)}
                  onChange={(e) => setCurrentAmount(parseRawNumber(e.target.value))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Hạn hoàn thành</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Độ ưu tiên</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                >
                  <option value="high">🔥 Cao</option>
                  <option value="medium">⚡ Trung bình</option>
                  <option value="low">🌱 Thấp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ghi chú lộ trình</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-xs h-16 resize-none transition-all"
                placeholder="Ví dụ: Mỗi tháng trích lương 5 triệu..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Icon & Màu sắc</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {GOAL_ICONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl border-2 transition-all btn-press ${icon === i ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-sm' : 'border-transparent bg-slate-50 opacity-60'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all btn-press ${c} ${color === c ? 'border-slate-800 scale-125' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <div className="md:hidden bg-indigo-50 p-4 rounded-2xl mb-4">
               <p className="text-[10px] font-bold text-slate-500">Tiết kiệm dự kiến:</p>
               <p className="text-lg font-black text-indigo-600">{formatCurrency(calculateMonthlySaving())} / tháng</p>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all btn-press uppercase tracking-widest"
            >
              Lưu thiết lập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
