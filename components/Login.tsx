import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030014]">
      {/* Aurora Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-1 px-1 rounded-[3.5rem] bg-gradient-to-b from-white/20 to-transparent shadow-2xl">
        <div className="w-full h-full bg-[#030014]/80 backdrop-blur-3xl rounded-[3.4rem] p-10 py-12 border border-white/10">
          
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-12">
              <span className="text-3xl">💎</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Family Finance</h1>
            <p className="text-indigo-300/50 text-[10px] font-black uppercase tracking-[0.3em]">Hạnh phúc từ sự minh bạch</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-white/40 text-[9px] font-black uppercase ml-4 tracking-widest">Tài khoản Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                placeholder="email@vidu.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-[9px] font-black uppercase ml-4 tracking-widest">Mật mã bảo mật</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] transition-all active:scale-95 text-sm tracking-widest uppercase mt-4">
              Đăng nhập ngay
            </button>
          </form>

          <div className="mt-12 text-center space-y-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Hoặc kết nối qua</p>
            <div className="flex justify-center gap-4">
              <button className="w-full py-4 bg-white/5 rounded-2xl border border-white/5 text-white text-xs font-black hover:bg-white/10 transition-all">GOOGLE</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
        Family Finance v2.0
      </div>
    </div>
  );
};

export default Login;