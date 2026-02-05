
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_WALLETS } from '../constants';
import { parseTransactionFromVoice, parseTransactionFromImage } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  initialData?: Transaction;
  familyMembers: string[];
  existingTags: string[];
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, familyMembers, existingTags }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialData?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || '');
  const [walletId, setWalletId] = useState<string>(initialData?.walletId || INITIAL_WALLETS[0].id);
  const [member, setMember] = useState<string>(initialData?.member || familyMembers[0] || '');
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(initialData?.receiptImage);
  const [tagInput, setTagInput] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setWalletId(initialData.walletId);
      setMember(initialData.member);
      setDate(initialData.date);
      setNote(initialData.note);
      setSelectedTags(initialData.tags || []);
      setReceiptImage(initialData.receiptImage);
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setWalletId(INITIAL_WALLETS[0].id);
      setMember(familyMembers[0] || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setSelectedTags([]);
      setReceiptImage(undefined);
    }
  }, [initialData, isOpen, familyMembers]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setIsProcessing(true);
        try {
          const result = await parseTransactionFromVoice(text, DEFAULT_CATEGORIES);
          if (result) {
            if (result.type) setType(result.type as TransactionType);
            if (result.amount) setAmount(result.amount.toString());
            if (result.categoryId) setCategoryId(result.categoryId);
            if (result.note) setNote(result.note);
            if (result.tags) setSelectedTags(prev => Array.from(new Set([...prev, ...result.tags])));
          }
        } finally {
          setIsProcessing(false);
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleCaptureReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setReceiptImage(base64);
        setIsProcessing(true);
        try {
          const result = await parseTransactionFromImage(base64, DEFAULT_CATEGORIES);
          if (result) {
            if (result.amount) setAmount(result.amount.toString());
            if (result.categoryId) setCategoryId(result.categoryId);
            if (result.note) setNote(result.note);
            if (result.date) setDate(result.date);
            if (result.tags) setSelectedTags(prev => Array.from(new Set([...prev, ...result.tags])));
          }
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  const formatWithDots = (val: string) => val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const parseRawNumber = (val: string) => val.replace(/\./g, "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-backdrop">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-modal">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">{initialData ? 'Sửa giao dịch' : 'Nhập thu chi'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 btn-press">✕</button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ 
            amount: parseFloat(parseRawNumber(amount)) || 0, 
            type, 
            categoryId, 
            walletId, 
            member, 
            date, 
            note,
            tags: selectedTags,
            receiptImage
          });
          onClose();
        }} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          <div className="flex gap-2">
            <button type="button" onClick={() => recognitionRef.current?.start()} className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all btn-press ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              {isListening ? '🛑 ĐANG NGHE...' : '🎤 GIỌNG NÓI'}
            </button>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all btn-press ${isProcessing ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}
            >
              {isProcessing ? '⌛ ĐANG QUÉT...' : '📸 QUÉT HÓA ĐƠN'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCaptureReceipt} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />
          </div>

          {receiptImage && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 group">
              <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setReceiptImage(undefined)}
                className="absolute top-2 right-2 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 px-4 text-white text-[10px] font-bold">
                ✨ Đã đính kèm ảnh hóa đơn
              </div>
            </div>
          )}

          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>CHI TIÊU</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}>THU NHẬP</button>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Số tiền (VND)</label>
            <input type="text" inputMode="numeric" value={formatWithDots(amount)} onChange={(e) => setAmount(parseRawNumber(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-2xl font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="0" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none outline-none">
              {INITIAL_WALLETS.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
            </select>
            <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none outline-none">
              {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hạng mục</label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_CATEGORIES.filter(c => c.type === type).map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all btn-press ${categoryId === cat.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-slate-50 opacity-60'}`}>
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-bold truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày tháng</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none outline-none" placeholder="Mô tả..." />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Thẻ phân loại (Tags)</label>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-indigo-200 shadow-sm animate-in zoom-in duration-200">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-indigo-800">✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <input 
                type="text" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                placeholder="Nhập thẻ mới..." 
              />
              <button 
                type="button" 
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-lg disabled:opacity-30 transition-all btn-press"
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" disabled={isProcessing} className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all btn-press ${isProcessing ? 'bg-slate-300' : (type === 'expense' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200')}`}>
            {isProcessing ? 'ĐANG XỬ LÝ...' : 'LƯU GIAO DỊCH'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
