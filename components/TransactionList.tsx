
import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_WALLETS, FAMILY_MEMBERS } from '../constants.tsx';

interface Props {
  transactions: Transaction[];
  onDeleteRequest: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDeleteRequest, onEdit }) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedMember('');
    setFilterType('all');
    setSearch('');
  };

  const isFilterActive = startDate || endDate || minAmount || maxAmount || selectedMember || filterType !== 'all' || search;

  const filtered = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => (t.note + t.member).toLowerCase().includes(search.toLowerCase()))
    .filter(t => !startDate || t.date >= startDate)
    .filter(t => !endDate || t.date <= endDate)
    .filter(t => !minAmount || t.amount >= parseFloat(minAmount))
    .filter(t => !maxAmount || t.amount <= parseFloat(maxAmount))
    .filter(t => !selectedMember || t.member === selectedMember)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getCategory = (id: string) => DEFAULT_CATEGORIES.find(c => c.id === id);
  const getWallet = (id: string) => INITIAL_WALLETS.find(w => w.id === id);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">Sổ thu chi gia đình</h2>
          {isFilterActive && (
            <button 
              onClick={clearFilters}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              Làm mới bộ lọc
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm người chi, ghi chú..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full px-5 py-3 bg-white rounded-2xl border border-slate-100 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 rounded-2xl border transition-all text-sm font-black flex items-center gap-2 ${showAdvanced ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 shadow-sm'}`}
          >
            <span>{showAdvanced ? '✕' : '⚙️'}</span>
            <span className="hidden sm:inline">BỘ LỌC</span>
            {(startDate || endDate || minAmount || maxAmount || selectedMember) && !showAdvanced && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {showAdvanced && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-300 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Loại giao dịch</label>
                <div className="flex p-1 bg-slate-50 rounded-xl">
                  <button onClick={() => setFilterType('all')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>TẤT CẢ</button>
                  <button onClick={() => setFilterType('income')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filterType === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}>THU</button>
                  <button onClick={() => setFilterType('expense')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filterType === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>CHI</button>
                </div>
              </div>

              {/* Member Filter */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Thành viên</label>
                <select 
                  value={selectedMember} 
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tất cả thành viên</option>
                  {FAMILY_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Date Filter */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Từ ngày</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Đến ngày</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" />
                </div>
              </div>

              {/* Amount Filter */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Giá thấp nhất</label>
                  <input 
                    type="number" 
                    placeholder="Min VND" 
                    value={minAmount} 
                    onChange={(e) => setMinAmount(e.target.value)} 
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Giá cao nhất</label>
                  <input 
                    type="number" 
                    placeholder="Max VND" 
                    value={maxAmount} 
                    onChange={(e) => setMaxAmount(e.target.value)} 
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pb-20">
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filtered.length} kết quả tìm thấy
          </p>
        </div>
        
        {filtered.length > 0 ? (
          filtered.map(t => {
            const cat = getCategory(t.categoryId);
            const wallet = getWallet(t.walletId);
            return (
              <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 ${cat?.color || 'bg-slate-100'} rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner`}>
                    {cat?.icon || '❓'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 truncate">{cat?.name}</h4>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-full uppercase">{t.member}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.date} • {wallet?.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-1 italic">{t.note}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className={`text-lg font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-all scale-90">
                    <button onClick={() => onEdit(t)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full">✏️</button>
                    <button onClick={() => onDeleteRequest(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
             <p className="text-slate-300 font-bold italic">Không tìm thấy giao dịch nào phù hợp với bộ lọc.</p>
             {isFilterActive && (
               <button onClick={clearFilters} className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest">Xóa tất cả bộ lọc</button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
