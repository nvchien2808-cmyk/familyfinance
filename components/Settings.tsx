
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onUpdate: (user: Partial<User>) => void;
  onRenameMember: (oldName: string, newName: string) => void;
  onDeleteRequest: (name: string) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ user, onUpdate, onRenameMember, onDeleteRequest, onLogout }) => {
  const [newMember, setNewMember] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const formatWithDots = (val: string) => {
    if (!val) return "";
    const num = val.toString().replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRawNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá lớn (vui lòng chọn ảnh < 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const familyId = btoa(user.email).replace(/[/+=]/g, '').substring(0, 12).toUpperCase();

  const addMember = () => {
    const trimmed = newMember.trim();
    if (!trimmed) return;
    if (user.familyMembers.includes(trimmed)) {
      alert("Thành viên này đã tồn tại!");
      return;
    }
    onUpdate({ familyMembers: [...user.familyMembers, trimmed] });
    setNewMember('');
  };

  const handleRename = (oldName: string) => {
    const newName = prompt(`Nhập tên mới thay thế cho "${oldName}":`, oldName);
    if (newName === null) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    
    if (user.familyMembers.includes(trimmed)) {
      alert("Tên này đã trùng với thành viên khác!");
      return;
    }

    onRenameMember(oldName, trimmed);
    alert(`Đã đổi tên và cập nhật lịch sử chi tiêu cho "${trimmed}"`);
  };

  const handleRemove = (name: string) => {
    if (user.familyMembers.length <= 1) {
      alert("Gia đình phải có nhất một thành viên!");
      return;
    }
    onDeleteRequest(name);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-16">
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Cài đặt gia đình</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-200">Đồng bộ đám mây</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Giao diện & Thành viên</span>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 border border-white/40 shadow-sm space-y-10">
        
        {/* Profile and Appearance Section */}
        <div className="space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh gia đình & Giao diện</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 overflow-hidden shadow-lg border-2 border-white flex items-center justify-center transition-all group-hover:scale-105">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-black">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-md border border-slate-100 text-xs">📸</div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Tải ảnh đại diện mới</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Ảnh này sẽ xuất hiện trên mọi thiết bị trong nhà.</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Cài đặt hình nền</p>
                <p className="text-[10px] text-slate-400 font-bold">Sử dụng ảnh đại diện làm nền mờ cho ứng dụng</p>
              </div>
              <button 
                onClick={() => onUpdate({ useImageAsBackground: !user.useImageAsBackground })}
                className={`w-12 h-6 rounded-full transition-all relative ${user.useImageAsBackground ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${user.useImageAsBackground ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Family Identity Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên ngôi nhà chung</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngân sách chi tiêu tháng</label>
            <div className="relative">
              <input
                type="text"
                value={formatWithDots(user.monthlyBudget.toString())}
                onChange={(e) => onUpdate({ monthlyBudget: parseInt(parseRawNumber(e.target.value)) || 0 })}
                className="w-full px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 text-xl shadow-inner"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">VND</span>
            </div>
          </div>
        </div>

        {/* Member Management Section */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quản lý thành viên</label>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Thêm người thân..."
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMember()}
              className="flex-1 px-5 py-4 bg-slate-50/50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner"
            />
            <button 
              onClick={addMember}
              className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              THÊM
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {user.familyMembers.map((m, idx) => (
              <div key={m} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
                    {m.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{m}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Thành viên #{idx + 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleRename(m)}
                    className="p-2.5 bg-slate-50 text-indigo-500 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-50 transition-all"
                    title="Đổi tên"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleRemove(m)}
                    className="p-2.5 bg-slate-50 text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Tài khoản</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onLogout}
              className="w-full py-5 rounded-[1.5rem] font-black text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              🚪 Đăng xuất khỏi gia đình
            </button>
            <p className="text-center text-[10px] text-slate-300 font-bold italic">Mọi dữ liệu sẽ được giữ lại an toàn trên đám mây của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
