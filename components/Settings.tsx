
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onUpdate: (user: Partial<User>) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ user, onUpdate, onLogout }) => {
  const [isActivatingBio, setIsActivatingBio] = useState(false);
  
  const formatWithDots = (val: string) => {
    if (!val) return "";
    const num = val.toString().replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRawNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const enableBiometric = async () => {
    setIsActivatingBio(true);
    try {
      if (!window.PublicKeyCredential) {
        alert("Thiết bị của bạn không hỗ trợ tính năng này.");
        return;
      }

      const confirmSetup = confirm("Bạn có muốn bật Face ID để đăng nhập nhanh cho lần sau không?");
      
      if (confirmSetup) {
        const mockCredentialId = "bio_" + Math.random().toString(36).substr(2, 9);
        onUpdate({ biometricCredentialId: mockCredentialId });
        alert("Đã kích hoạt Face ID thành công! Bạn có thể sử dụng nó từ lần đăng nhập sau.");
      }
    } catch (err) {
      console.error("Bio Setup Error:", err);
      alert("Không thể thiết lập Face ID lúc này.");
    } finally {
      setIsActivatingBio(false);
    }
  };

  const handleToggleReminder = async () => {
    const newValue = !user.reminderEnabled;
    
    if (newValue) {
      // Yêu cầu quyền thông báo
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Bạn cần cấp quyền thông báo để ứng dụng có thể nhắc nhở chi tiêu.");
          return;
        }
      }
    }
    
    onUpdate({ reminderEnabled: newValue });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <h2 className="text-2xl font-black text-slate-800">Cài đặt cá nhân</h2>
      
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-lg shadow-indigo-50/50">
            👤
          </div>
          <h3 className="font-black text-lg text-slate-800">{user.name}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên hiển thị gia đình</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ngân sách hàng tháng (VND)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatWithDots(user.monthlyBudget.toString())}
                onChange={(e) => onUpdate({ monthlyBudget: parseInt(parseRawNumber(e.target.value)) || 0 })}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none pr-12"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">₫</span>
            </div>
          </div>

          {/* Biometrics Section */}
          <div className="pt-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bảo mật & Đăng nhập</h4>
            
            <button
              onClick={enableBiometric}
              disabled={isActivatingBio}
              className={`w-full py-4 px-6 rounded-2xl font-black flex items-center justify-between transition-all active:scale-95 ${user.biometricCredentialId ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{user.biometricCredentialId ? '✅' : '📸'}</span>
                <span className="text-xs uppercase tracking-wider">{user.biometricCredentialId ? 'Đã bật Face ID' : 'Bật đăng nhập Face ID'}</span>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-all ${user.biometricCredentialId ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.biometricCredentialId ? 'right-1' : 'left-1'}`}></div>
              </div>
            </button>
          </div>

          {/* Daily Reminder Section */}
          <div className="pt-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thông báo & Nhắc nhở</h4>
            
            <div className={`p-6 rounded-[2rem] border transition-all ${user.reminderEnabled ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Nhắc nhở hàng ngày</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Đừng bỏ lỡ việc ghi chép</span>
                  </div>
                </div>
                <button 
                  onClick={handleToggleReminder}
                  className={`w-12 h-7 rounded-full relative transition-all ${user.reminderEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${user.reminderEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {user.reminderEnabled && (
                <div className="flex items-center justify-between pt-4 border-t border-blue-100 animate-in fade-in zoom-in duration-300">
                  <span className="text-[10px] font-black text-blue-900 uppercase">Thời gian nhắc</span>
                  <input 
                    type="time" 
                    value={user.reminderTime} 
                    onChange={(e) => onUpdate({ reminderTime: e.target.value })}
                    className="bg-white border-none rounded-xl px-4 py-2 font-black text-blue-600 text-sm shadow-inner outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button
              onClick={onLogout}
              className="w-full py-5 rounded-[1.5rem] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              🚪 Đăng xuất khỏi hệ thống
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
        <h4 className="font-black text-indigo-900 mb-2">Về FamilyFinance</h4>
        <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
          Phiên bản 1.0.4 (Daily Reminders). Chúng tôi sẽ giúp gia đình bạn duy trì thói quen quản lý tài chính tốt bằng các thông báo nhắc nhở thông minh.
        </p>
      </div>
    </div>
  );
};

export default Settings;
