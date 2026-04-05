import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';
import Profile from './components/Profile';
import SavingsGoals from './components/SavingsGoals';
import TransactionModal from './components/TransactionModal';
import GoalModal from './components/GoalModal';
import ConfirmDialog from './components/ConfirmDialog';
import { Transaction, User, AuthState, SavingsGoal } from './types';
import { FAMILY_MEMBERS } from './constants';
import { login, register, listenAuth, logout } from "./services/authService";
import { pushToCloud, onSyncBroadcast, CloudData, pullFromCloud } from './services/syncService';

// --- HELPER: Nén ảnh để đảm bảo lưu trữ Firestore mượt mà ---
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; 
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  // State cho khoảng ngày
  const [startDate, setStartDate] = useState<string>(''); 
  const [endDate, setEndDate] = useState<string>('');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; id: string; type: 'transaction' | 'goal' | 'member'; title: string; message: string;
  }>({ isOpen: false, id: '', type: 'transaction', title: '', message: '' });

  const [isLoginView, setIsLoginView] = useState(true);
  const [regSuccess, setRegSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. Tính toán style động cho Background
  const bgStyle = useMemo(() => {
    if (auth.isAuthenticated && auth.user?.useImageAsBackground && auth.user?.profileImage) {
      return { 
        '--custom-bg': `url('${auth.user.profileImage}')`,
        '--bg-overlay': 'rgba(255, 255, 255, 0.82)' 
      } as React.CSSProperties;
    }
    return {} as React.CSSProperties;
  }, [auth.user?.profileImage, auth.user?.useImageAsBackground, auth.isAuthenticated]);

  const allExistingTags = useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach(tx => tx.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [transactions]);

  // Logic lọc giao dịch theo khoảng ngày
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!startDate || !endDate) return true;
      return tx.date >= startDate && tx.date <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate]);

  const dataRef = useRef({ transactions, savingsGoals, auth, lastUpdated });
  useEffect(() => {
    dataRef.current = { transactions, savingsGoals, auth, lastUpdated };
  }, [transactions, savingsGoals, auth, lastUpdated]);

  const applySyncData = useCallback((data: CloudData) => {
    if (data.lastUpdated > dataRef.current.lastUpdated) {
      setTransactions(data.transactions || []);
      setSavingsGoals(data.goals || []);
      setAuth(prev => ({ ...prev, user: data.user }));
      setLastUpdated(data.lastUpdated);
    }
  }, []);

  const syncToCloudAction = useCallback(async (user: User, txs: Transaction[], goals: SavingsGoal[]) => {
    setSyncStatus('syncing');
    const timestamp = Date.now();
    const success = await pushToCloud(user.id, {
      transactions: txs,
      goals: goals,
      user: user,
      lastUpdated: timestamp
    });
    setSyncStatus(success ? 'synced' : 'error');
    if (success) setLastUpdated(timestamp);
  }, []);

  useEffect(() => {
    let syncUnsub: (() => void) | undefined;
    const unsubAuth = listenAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        syncUnsub = onSyncBroadcast(uid, applySyncData);
        const cloudData = await pullFromCloud(uid);

        setAuth({
          user: cloudData?.user ?? {
            id: uid,
            email: firebaseUser.email!,
            name: 'Gia đình',
            currency: 'VND',
            monthlyBudget: 10000000,
            familyMembers: FAMILY_MEMBERS,
            reminderEnabled: false,
            reminderTime: '20:00',
            useImageAsBackground: false,
            profileImage: null
          },
          isAuthenticated: true
        });
      } else {
        syncUnsub?.();
        setAuth({ user: null, isAuthenticated: false });
      }
      setIsLoaded(true);
    });
    return () => { unsubAuth(); syncUnsub?.(); };
  }, [applySyncData]);

  const updateUser = async (data: Partial<User>) => {
    if (!auth.user) return;
    let updatedData = { ...data };
    if (data.profileImage && data.profileImage.startsWith('data:image')) {
      updatedData.profileImage = await compressImage(data.profileImage);
    }
    const updatedUser = { ...auth.user, ...updatedData };
    setAuth(prev => ({ ...prev, user: updatedUser }));
    syncToCloudAction(updatedUser, transactions, savingsGoals);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginView) { await login(email, password); } 
      else {
        await register(email, password);
        setRegSuccess(true);
        setTimeout(() => setRegSuccess(false), 3000);
        setIsLoginView(true);
      }
    } catch (err: any) { alert(err.message); }
  };

  const handleLogout = async () => {
    await logout();
    setAuth({ user: null, isAuthenticated: false });
    setActiveTab('dashboard');
  };

  const saveTransaction = (data: any) => {
    if (!auth.user) return;
    const newTxs = editingTransaction 
      ? transactions.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t)
      : [...transactions, { ...data, id: Date.now().toString(), userId: auth.user.id }];
    setTransactions(newTxs);
    syncToCloudAction(auth.user, newTxs, savingsGoals);
    setIsTxModalOpen(false);
  };

  const saveGoal = (data: any) => {
    if (!auth.user) return;
    const newGoals = editingGoal
      ? savingsGoals.map(g => g.id === editingGoal.id ? { ...g, ...data } : g)
      : [...savingsGoals, { ...data, id: Date.now().toString(), userId: auth.user.id }];
    setSavingsGoals(newGoals);
    syncToCloudAction(auth.user, transactions, newGoals);
    setIsGoalModalOpen(false);
  };

  const confirmDelete = () => {
    if (!auth.user) return;
    if (confirmState.type === 'transaction') {
      const newTxs = transactions.filter(t => t.id !== confirmState.id);
      setTransactions(newTxs);
      syncToCloudAction(auth.user, newTxs, savingsGoals);
    } else if (confirmState.type === 'goal') {
      const newGoals = savingsGoals.filter(g => g.id !== confirmState.id);
      setSavingsGoals(newGoals);
      syncToCloudAction(auth.user, transactions, newGoals);
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };

  if (!isLoaded) return <div className="h-screen flex items-center justify-center font-black text-indigo-600">Đang đồng bộ...</div>;

  return (
    <div style={bgStyle} className={auth.user?.useImageAsBackground ? 'app-custom-bg' : ''}>
      <style>{`
        .app-custom-bg .aurora-container {
          background-image: linear-gradient(var(--bg-overlay), var(--bg-overlay)), var(--custom-bg) !important;
          background-size: cover !important;
          background-position: center !important;
          background-attachment: fixed !important;
          background-color: transparent !important;
        }
        .app-custom-bg .glass-card, .app-custom-bg .bg-white {
          background-color: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        .app-custom-bg main, .app-custom-bg .min-h-screen { background-color: transparent !important; }
        .app-custom-bg .blob { opacity: 0.1 !important; }
      `}</style>

      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} user={auth.user}>
        <div className="min-h-screen transition-all duration-700">
          {!auth.isAuthenticated ? (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
               <div className="w-full max-w-md glass-card rounded-[3rem] p-10 text-center border border-white/40">
                  <h1 className="text-4xl font-bold text-blue-600 underline mb-2">Family Finance</h1>
                  <p className="text-slate-400 text-[10px] mb-8 font-black uppercase tracking-[0.2em]">Tài chính chung - Hạnh phúc vững</p>
                  <form onSubmit={handleAuth} className="space-y-5 text-left">
                    <input type="email" placeholder="Email gia đình" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-7 py-4 input-glass rounded-2xl outline-none font-bold" required />
                    <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-7 py-4 input-glass rounded-2xl outline-none font-bold" required />
                    <button type="submit" className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest btn-press">
                      {isLoginView ? 'Đăng Nhập' : 'Tạo Nhà Mới'}
                    </button>
                  </form>
                  {regSuccess && <p className="mt-4 text-emerald-600 font-bold text-xs uppercase">Đăng ký thành công!</p>}
                  <button onClick={() => setIsLoginView(!isLoginView)} className="mt-6 text-xs font-black text-indigo-600 uppercase italic underline">
                    {isLoginView ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có nhà? Quay lại đăng nhập'}
                  </button>
               </div>
            </div>
          ) : (
            <div className="pb-24">
              <div className="fixed top-4 right-4 z-[60]">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-xl border bg-white/90 backdrop-blur-sm ${syncStatus === 'synced' ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
                    <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
                    {syncStatus === 'synced' ? 'Trực tuyến' : 'Đang đồng bộ...'}
                 </div>
              </div>

              {/* Bộ chọn khoảng ngày mới */}
              {(activeTab === 'dashboard' || activeTab === 'transactions') && (
                <div className="max-w-4xl mx-auto px-6 mb-6">
                  <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 px-4 rounded-2xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Từ</span>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-indigo-600 font-bold text-sm outline-none cursor-pointer"
                      />
                    </div>
                    <div className="w-[1px] h-4 bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Đến</span>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-indigo-600 font-bold text-sm outline-none cursor-pointer"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <button 
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="ml-2 text-[10px] font-black uppercase text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div key={activeTab} className="view-transition">
                {activeTab === 'dashboard' && auth.user && <Dashboard transactions={filteredTransactions} user={auth.user} startDate={startDate} endDate={endDate} />}
                {activeTab === 'transactions' && <TransactionList transactions={filteredTransactions} onDeleteRequest={(id) => setConfirmState({ isOpen: true, id, type: 'transaction', title: 'Xóa giao dịch?', message: 'Lịch sử này sẽ bị xóa vĩnh viễn.' })} onEdit={(t) => { setEditingTransaction(t); setIsTxModalOpen(true); }} />}
                {activeTab === 'goals' && <SavingsGoals goals={savingsGoals} onDeleteRequest={(id) => setConfirmState({ isOpen: true, id, type: 'goal', title: 'Hủy mục tiêu?', message: 'Mục tiêu này sẽ bị gỡ bỏ.' })} onEdit={(g) => { setEditingGoal(g); setIsGoalModalOpen(true); }} onUpdateAmount={(id, val) => { const newGoals = savingsGoals.map(g => g.id === id ? {...g, currentAmount: val} : g); setSavingsGoals(newGoals); syncToCloudAction(auth.user!, transactions, newGoals); }} onAdd={() => { setEditingGoal(undefined); setIsGoalModalOpen(true); }} />}
                {activeTab === 'profile' && auth.user && <Profile user={auth.user} onUpdate={updateUser} onLogout={handleLogout} />}
                {activeTab === 'settings' && auth.user && <Settings user={auth.user} onUpdate={updateUser} onRenameMember={(oldN, newN) => { if(!auth.user) return; const updatedM = auth.user.familyMembers.map(m => m === oldN ? newN : m); updateUser({ familyMembers: updatedM }); }} onDeleteRequest={(name) => setConfirmState({ isOpen: true, id: name, type: 'member', title: 'Gỡ thành viên?', message: `Xóa "${name}" khỏi gia đình?` })} onLogout={handleLogout} />}
              </div>

              {(activeTab === 'dashboard' || activeTab === 'transactions') && (
                <button onClick={() => { setEditingTransaction(undefined); setIsTxModalOpen(true); }} className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all z-40">
                  +
                </button>
              )}

              <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSave={saveTransaction} initialData={editingTransaction} familyMembers={auth.user?.familyMembers || []} existingTags={allExistingTags} />
              <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={saveGoal} initialData={editingGoal} />
              <ConfirmDialog isOpen={confirmState.isOpen} onClose={() => setConfirmState({ ...confirmState, isOpen: false })} onConfirm={confirmDelete} title={confirmState.title} message={confirmState.message} />
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
};

export default App;
