
import React, { useState } from 'react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface Props {
  transactions: Transaction[];
  onDeleteRequest: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDeleteRequest, onEdit }) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => {
      // Lọc theo ngày
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Lọc theo tìm kiếm
      const searchLower = search.toLowerCase();
      const matchNote = (t.note || '').toLowerCase().includes(searchLower);
      const matchMember = (t.member || '').toLowerCase().includes(searchLower);
      const matchTags = (t.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      return matchNote || matchMember || matchTags;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const getCategory = (id: string) => DEFAULT_CATEGORIES.find(c => c.id === id);

  const resetFilters = () => {
    setFilterType('all');
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = filterType !== 'all' || search !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-black text-slate-800">Sổ thu chi gia đình</h2>
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search and Type Row */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Tìm tên, ghi chú hoặc #thẻ..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="flex-1 px-5 py-3 bg-white rounded-2xl border border-slate-100 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
            />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)} 
              className="px-4 py-3 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>

          {/* Date Range Row */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <span className="absolute -top-2 left-3 px-1 bg-white text-[8px] font-black text-slate-400 uppercase z-10">Từ ngày</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-100 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute -top-2 left-3 px-1 bg-white text-[8px] font-black text-slate-400 uppercase z-10">Đến ngày</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-100 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        {filtered.length > 0 ? filtered.map(t => {
          const cat = getCategory(t.categoryId);
          return (
            <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm group hover:shadow-md transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${cat?.color || 'bg-slate-100'} rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner`}>
                  {cat?.icon || '❓'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-800 truncate">{cat?.name}</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-full uppercase shrink-0 border border-indigo-100">{t.member}</span>
                    {t.receiptImage && (
                      <span className="text-xs" title="Có đính kèm hóa đơn">📸</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.date}</p>
                  
                  <div className="mt-1 space-y-1.5">
                    {t.note && <p className="text-xs text-slate-500 truncate italic">{t.note}</p>}
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.tags.map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-slate-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <p className={`text-lg font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(t.id); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
            <span className="text-4xl grayscale">🔍</span>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-4">Không tìm thấy giao dịch nào</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-2 text-indigo-600 text-[10px] font-black uppercase hover:underline">Xóa tất cả bộ lọc</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
