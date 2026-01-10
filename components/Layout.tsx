
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-20">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 py-8 items-center justify-between z-50">
        <div className="flex flex-col gap-8 items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">F</div>
          <button title="Dashboard" onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            📊
          </button>
          <button title="Giao dịch" onClick={() => setActiveTab('transactions')} className={`p-3 rounded-xl transition-colors ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            📝
          </button>
          <button title="Mục tiêu" onClick={() => setActiveTab('goals')} className={`p-3 rounded-xl transition-colors ${activeTab === 'goals' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            🎯
          </button>
          <button title="Cài đặt" onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            ⚙️
          </button>
        </div>
        <button onClick={onLogout} className="p-3 text-red-400 hover:text-red-600 transition-colors">
          🚪
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-3 px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
          <span className="text-xl">📊</span>
          <span className="text-[10px]">Tổng quan</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
          <span className="text-xl">📝</span>
          <span className="text-[10px]">Sổ thu chi</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1 ${activeTab === 'goals' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
          <span className="text-xl">🎯</span>
          <span className="text-[10px]">Mục tiêu</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
          <span className="text-xl">⚙️</span>
          <span className="text-[10px]">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
