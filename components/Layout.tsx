
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, user }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-20">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 py-8 items-center justify-between z-50 shadow-sm">
        <div className="flex flex-col gap-8 items-center">
          {/* Logo / Profile Quick Access */}
          <div 
            onClick={() => setActiveTab('profile')}
            className={`w-12 h-12 rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-indigo-100 transition-all shadow-md flex items-center justify-center border-2 ${activeTab === 'profile' ? 'border-indigo-600 ring-4' : 'border-white'}`}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="bg-indigo-600 w-full h-full flex items-center justify-center text-white font-black text-xl">
                {user?.name?.charAt(0) || 'F'}
              </div>
            )}
          </div>

          <button title="Dashboard" onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            📊
          </button>
          <button title="Giao dịch" onClick={() => setActiveTab('transactions')} className={`p-3 rounded-xl transition-colors ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            📝
          </button>
          <button title="Mục tiêu" onClick={() => setActiveTab('goals')} className={`p-3 rounded-xl transition-colors ${activeTab === 'goals' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            🎯
          </button>
          <button title="Cài đặt gia đình" onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            ⚙️
          </button>
        </div>
        <button onClick={onLogout} title="Đăng xuất" className="p-3 text-red-400 hover:text-red-600 transition-colors">
          🚪
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-3 px-2 z-50 shadow-[0_-4px_12px_-1px rgba(0,0,0,0.08)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <span className="text-xl">📊</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Tổng quan</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <span className="text-xl">📝</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Sổ thu chi</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'goals' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <span className="text-xl">🎯</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Mục tiêu</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
          {user?.profileImage ? (
            <div className={`w-6 h-6 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-indigo-600' : 'border-slate-200'}`}>
              <img src={user.profileImage} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-xl">👤</span>
          )}
          <span className="text-[9px] font-black uppercase tracking-tighter">Hồ sơ</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <span className="text-xl">⚙️</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
