
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_WALLETS, FAMILY_MEMBERS } from '../constants.tsx';
import { parseTransactionFromVoice } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  initialData?: Transaction;
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialData?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || '');
  const [walletId, setWalletId] = useState<string>(initialData?.walletId || INITIAL_WALLETS[0].id);
  const [member, setMember] = useState<string>(initialData?.member || FAMILY_MEMBERS[0]);
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(initialData?.receiptImage);
  
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingNote, setIsAnalyzingNote] = useState(false);
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
      setReceiptImage(initialData.receiptImage);
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setWalletId(INITIAL_WALLETS[0].id);
      setMember(FAMILY_MEMBERS[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setReceiptImage(undefined);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = async (event: any) => {
        handleVoiceTranscript(event.results[0][0].transcript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const formatWithDots = (val: string) => {
    if (!val) return "";
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRawNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const handleVoiceTranscript = async (text: string) => {
    setIsAnalyzingNote(true);
    try {
      const result = await parseTransactionFromVoice(text, DEFAULT_CATEGORIES);
      if (result) {
        if (result.type) setType(result.type as TransactionType);
        if (result.amount) setAmount(result.amount.toString());
        if (result.categoryId) setCategoryId(result.categoryId);
        if (result.note) setNote(result.note);
      }
    } finally {
      setIsAnalyzingNote(false);
    }
  };

  const handleNoteAnalysis = async () => {
    if (!note || note.length < 3) return;
    
    setIsAnalyzingNote(true);
    try {
      // Sử dụng Gemini AI để đoán hạng mục từ ghi chú
      const result = await parseTransactionFromVoice(`${type === 'expense' ? 'chi' : 'thu'} ${note}`, DEFAULT_CATEGORIES);
      if (result && result.categoryId) {
        setCategoryId(result.categoryId);
      }
    } catch (error) {
      console.error("Lỗi phân tích ghi chú:", error);
    } finally {
      setIsAnalyzingNote(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-2xl font-black text-slate-800">{initialData ? 'Sửa giao dịch' : 'Nhập thu chi'}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">✕</button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ amount: parseFloat(parseRawNumber(amount)), type, categoryId, walletId, member, date, note, receiptImage });
          onClose();
        }} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          <div className="flex justify-center gap-4">
            <button type="button" onClick={() => recognitionRef.current?.start()} className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
              {isListening ? '🛑 ĐANG NGHE...' : '🎤 NHẬP GIỌNG NÓI'}
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 rounded-full bg-slate-50 text-slate-600 font-black text-xs">📸 QUÉT HÓA ĐƠN</button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>CHI TIÊU</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}>THU NHẬP</button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Số tiền (VND)</label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={formatWithDots(amount)} 
                  onChange={(e) => setAmount(parseRawNumber(e.target.value))} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-2xl font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none pr-12" 
                  placeholder="0" 
                  required 
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">₫</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Từ Ví / Tài khoản</label>
                <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500">
                  {INITIAL_WALLETS.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thành viên chi</label>
                <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500">
                  {FAMILY_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hạng mục</label>
              {isAnalyzingNote && (
                <span className="text-[8px] font-black text-indigo-500 animate-pulse uppercase">AI đang gợi ý...</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_CATEGORIES.filter(c => c.type === type).map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${categoryId === cat.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-slate-50 opacity-60'}`}>
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-bold truncate w-full text-center uppercase">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none" />
            <div className="relative">
              <input 
                type="text" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                onBlur={handleNoteAnalysis}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold border-none transition-all ${isAnalyzingNote ? 'opacity-50 ring-1 ring-indigo-200' : ''}`} 
                placeholder="Ghi chú (AI gợi ý loại)" 
              />
              {note && !isAnalyzingNote && (
                <button 
                  type="button" 
                  onClick={handleNoteAnalysis}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  title="Gợi ý lại"
                >
                  🪄
                </button>
              )}
            </div>
          </div>

          {receiptImage && (
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-100">
              <img src={receiptImage} className="w-full h-full object-cover" alt="Receipt" />
              <button type="button" onClick={() => setReceiptImage(undefined)} className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full text-xs">✕</button>
            </div>
          )}

          <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 ${type === 'expense' ? 'bg-rose-500 shadow-rose-100' : 'bg-emerald-500 shadow-emerald-100'}`}>
            LƯU GIAO DỊCH
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
