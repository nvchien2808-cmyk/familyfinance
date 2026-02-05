
import React, { useRef, useState } from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onUpdate: (user: Partial<User>) => void;
  onLogout: () => void;
}

const Profile: React.FC<Props> = ({ user, onUpdate, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRegisteringBio, setIsRegisteringBio] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Ảnh quá lớn (vui lòng chọn ảnh < 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const setupBiometrics = async () => {
    if (!window.PublicKeyCredential) {
      alert("Thiết bị này không hỗ trợ Passkeys/Sinh trắc học.");
      return;
    }

    setIsRegisteringBio(true);
    try {
      const challenge = new Uint8Array([1,2,3,4,5,6,7,8]); 
      const userID = Uint8Array.from(user.id, c => c.charCodeAt(0));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Family Finance", id: window.location.hostname },
          user: { id: userID, name: user.email, displayName: user.name },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { userVerification: "required" },
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (credential) {
        const idString = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        onUpdate({ biometricCredentialId: idString });
        alert("Kích hoạt đăng nhập vân tay/Face ID thành công!");
      }
    } catch (err) {
      console.error("WebAuthn Error:", err);
    } finally {
      setIsRegisteringBio(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-16">
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Thông tin định danh của bạn</p>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-10">
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-36 h-36 p-1 rounded-full bg-indigo-600 shadow-2xl overflow-hidden border-4 border-white flex items-center justify-center">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-white text-5xl font-black">{user.name?.charAt(0) || 'F'}</div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
              📸
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <div className="mt-6 text-center">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{user.name}</h3>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 transition-all"
              placeholder="Nhập tên của bạn..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email đăng nhập</label>
            <div className="w-full px-6 py-4 bg-slate-100 rounded-2xl font-bold text-slate-400 border border-slate-200 cursor-not-allowed">
              {user.email}
            </div>
            <p className="text-[9px] text-slate-400 font-medium px-1">Email này dùng để đồng bộ dữ liệu với các thiết bị khác trong gia đình.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bảo mật</label>
          <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border border-slate-100 hover:border-indigo-100 transition-colors">
            <div>
              <p className="text-sm font-black text-slate-800">Đăng nhập vân tay / Face ID</p>
              <p className="text-[10px] text-slate-400 font-bold">Bảo vệ ứng dụng trên thiết bị này</p>
            </div>
            <button 
              onClick={setupBiometrics}
              disabled={isRegisteringBio}
              className={`w-14 h-7 rounded-full transition-all relative ${user.biometricCredentialId ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${user.biometricCredentialId ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={onLogout}
            className="w-full py-5 rounded-[1.5rem] font-black text-rose-500 bg-rose-50 border border-rose-100 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚪</span> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
