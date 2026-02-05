
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-slate-100">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner animate-float">
            <span className="text-4xl">🗑️</span>
          </div>
          
          <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{title}</h3>
          <p className="text-slate-400 text-xs font-bold leading-relaxed px-2 uppercase tracking-tight">
            {message}
          </p>
        </div>

        <div className="flex border-t border-slate-50 p-4 gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-4 rounded-2xl font-black text-xs text-slate-400 bg-white border border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 px-4 rounded-2xl font-black text-xs text-white bg-rose-500 shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 uppercase tracking-widest"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
