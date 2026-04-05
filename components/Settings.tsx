import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: User;
  onUpdate: (user: Partial<User>) => Promise<void>; // Chuyển thành Promise để đợi lưu xong
  onRenameMember: (oldName: string, newName: string) => void;
  onDeleteRequest: (name: string) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ user, onUpdate, onRenameMember, onDeleteRequest, onLogout }) => {
  // 1. State cục bộ để lưu trữ thay đổi trước khi nhấn "Lưu"
  const [localState, setLocalState] = useState({
    name: user.name,
    monthlyBudget: user.monthlyBudget,
    categoryBudgets: user.categoryBudgets || {},
    useImageAsBackground: user.useImageAsBackground,
    profileImage: user.profileImage,
    familyMembers: [...user.familyMembers]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newMember, setNewMember] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cập nhật localState khi user props thay đổi (ví dụ khi mới load app)
  useEffect(() => {
    setLocalState({
      name: user.name,
      monthlyBudget: user.monthlyBudget,
      categoryBudgets: user.categoryBudgets || {},
      useImageAsBackground: user.useImageAsBackground,
      profileImage: user.profileImage,
      familyMembers: [...user.familyMembers]
    });
  }, [user]);

  // Hàm helper cập nhật từng field và đánh dấu có thay đổi
  const updateField = (fields: Partial<typeof localState>) => {
    setLocalState(prev => ({ ...prev, ...fields }));
    setHasChanges(true);
  };

  const formatWithDots = (val: string | number) => {
    if (val === undefined || val === null || val === "") return "";
    const num = val.toString().replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRawNumber = (val: string) => val.replace(/\./g, "");

  // Xử lý lưu tổng thể
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localState);
      setHasChanges(false);
      alert("🎉 Đã lưu tất cả thay đổi thành công!");
    } catch (error) {
      alert("❌ Lỗi khi lưu, vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategoryBudget = (categoryId: string, value: string) => {
    const amount = parseInt(parseRawNumber(value)) || 0;
    updateField({
      categoryBudgets: {
        ...localState.categoryBudgets,
        [categoryId]: amount
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Nén xuống 1MB để tránh lỗi Firebase Quota
        alert("Ảnh quá lớn (vui lòng chọn ảnh < 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addMember = () => {
    const trimmed = newMember.trim();
    if (!trimmed) return;
    if (localState.familyMembers.includes(trimmed)) {
      alert("Thành viên này đã tồn tại!");
      return;
    }
    updateField({ familyMembers: [...localState.familyMembers, trimmed] });
    setNewMember('');
  };

  const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Cài đặt gia đình</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-200">Chế độ chỉnh sửa</span>
          {hasChanges && <span className="text-[10px] text-rose-500 font-bold animate-pulse">● Có thay đổi chưa lưu</span>}
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 border border-white/40 shadow-sm space-y-10">
        
        {/* Section 1: Profile */}
        <div className="space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh gia đình & Giao diện</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 overflow-hidden shadow-lg border-2 border-white flex items-center justify-center transition-all group-hover:scale-105">
                  {localState.profileImage ? (
                    <img src={localState.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-black">{localState.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-md border border-slate-100 text-xs">📸</div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Tải ảnh mới</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 italic">Lưu ý: Ảnh dưới 1MB để đồng bộ nhanh hơn.</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Cài đặt hình nền</p>
                <p className="text-[10px] text-slate-400 font-bold">Sử dụng ảnh đại diện làm nền mờ</p>
              </div>
              <button 
                onClick={() => updateField({ useImageAsBackground: !localState.useImageAsBackground })}
                className={`w-12 h-6 rounded-full transition-all relative ${localState.useImageAsBackground ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${localState.useImageAsBackground ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Budgets */}
        <div className="space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngân sách & Mục tiêu</label>
          
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-500 uppercase ml-1">Tổng hạn mức tháng</p>
            <div className="relative">
              <input
                type="text"
                value={formatWithDots(localState.monthlyBudget)}
                onChange={(e) => updateField({ monthlyBudget: parseInt(parseRawNumber(e.target.value)) || 0 })}
                className="w-full px-6 py-4 bg-indigo-50/50 rounded-2xl font-black text-indigo-600 outline-none border-2 border-transparent focus:border-indigo-200 text-xl shadow-inner"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-indigo-200">VND</span>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hạn mức theo hạng mục</p>
            <div className="grid grid-cols-1 gap-3">
              {expenseCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100/50 shadow-sm">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">{cat.icon}</div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{cat.name}</p>
                    <input 
                      type="text"
                      placeholder="Chưa cài đặt"
                      value={formatWithDots(localState.categoryBudgets?.[cat.id] || "")}
                      onChange={(e) => handleUpdateCategoryBudget(cat.id, e.target.value)}
                      className="w-full text-xs font-black text-slate-700 outline-none bg-transparent"
                    />
                  </div>
                  <span className="text-[8px] font-black text-slate-300">VNĐ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Logout */}
        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full py-5 rounded-[1.5rem] font-black text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center justify-center gap-2"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* 4. Nút LƯU CỐ ĐỊNH (Chỉ hiện khi có thay đổi) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 px-4 z-50 flex justify-center"
          >
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`
                flex items-center gap-3 px-10 py-4 rounded-3xl font-black text-white shadow-2xl transition-all active:scale-95
                ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'}
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ĐANG LƯU...
                </>
              ) : (
                <>💾 LƯU THAY ĐỔI</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
