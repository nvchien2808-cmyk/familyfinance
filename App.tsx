
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';
import SavingsGoals from './components/SavingsGoals';
import TransactionModal from './components/TransactionModal';
import GoalModal from './components/GoalModal';
import ConfirmDialog from './components/ConfirmDialog';
import { Transaction, User, AuthState, SavingsGoal } from './types';
import { FAMILY_MEMBERS } from './constants.tsx';

const STORAGE_KEYS = {
  USERS: 'ff_users_v2',
  TRANSACTIONS: 'ff_transactions_v2',
  GOALS: 'ff_goals_v2',
  SESSION: 'ff_session_v2'
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    type: 'transaction' | 'goal';
  }>({ isOpen: false, id: '', type: 'transaction' });

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
      const user = JSON.parse(savedSession);
      setAuth({ user, isAuthenticated: true });
      loadUserData(user.id);
    }
  }, []);

  // Logic nhắc nhở đơn giản khi app đang mở
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.reminderEnabled) {
      const interval = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === auth.user?.reminderTime) {
          // Hiển thị thông báo nếu trình duyệt cho phép
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("FamilyFinance Nhắc Nhở", {
              body: "Đã đến giờ nhập chi tiêu hôm nay rồi, đừng quên nhé! ❤️",
              icon: "https://cdn-icons-png.flaticon.com/512/2845/2845914.png"
            });
          } else {
            alert("🔔 Đã đến giờ nhập chi tiêu hôm nay rồi gia đình mình ơi!");
          }
        }
      }, 60000); // Kiểm tra mỗi phút
      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, auth.user?.reminderEnabled, auth.user?.reminderTime]);

  const loadUserData = (userId: string) => {
    const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    setTransactions(allTransactions.filter((t: Transaction) => t.userId === userId));
    const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    setSavingsGoals(allGoals.filter((g: SavingsGoal) => g.userId === userId));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (isLoginView) {
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      if (foundUser) {
        setAuth({ user: foundUser, isAuthenticated: true });
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(foundUser));
        loadUserData(foundUser.id);
      } else alert('Sai email hoặc mật khẩu');
    } else {
      // Corrected User object to include password field defined in types.ts
      const newUser: User = { 
        id: Date.now().toString(), 
        email, 
        password, 
        name, 
        currency: 'VND', 
        monthlyBudget: 10000000, 
        familyMembers: FAMILY_MEMBERS,
        reminderEnabled: false,
        reminderTime: '20:00'
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      setIsLoginView(true);
      alert('Đăng ký thành công!');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        alert("Thiết bị này không hỗ trợ xác thực sinh trắc học.");
        return;
      }

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const userWithBio = users.find((u: User) => u.biometricCredentialId);

      if (!userWithBio) {
        alert("Bạn chưa thiết lập Face ID. Vui lòng đăng nhập bằng mật khẩu và bật nó trong Cài đặt.");
        return;
      }

      const confirmBio = confirm(`Sử dụng Face ID để đăng nhập tài khoản: ${userWithBio.name}?`);
      
      if (confirmBio) {
        setAuth({ user: userWithBio, isAuthenticated: true });
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userWithBio));
        loadUserData(userWithBio.id);
      }
    } catch (err) {
      console.error("Biometric Login Error:", err);
      alert("Xác thực Face ID thất bại.");
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (!auth.user) return;
    const updatedUser = { ...auth.user, ...data };
    setAuth({ ...auth, user: updatedUser });
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  };

  const saveTransaction = (data: any) => {
    if (!auth.user) return;
    let updated;
    if (editingTransaction) updated = transactions.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t);
    else updated = [...transactions, { ...data, id: Date.now().toString(), userId: auth.user.id }];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const saveGoal = (data: Omit<SavingsGoal, 'id' | 'userId'>) => {
    if (!auth.user) return;
    let updated;
    if (editingGoal) updated = savingsGoals.map(g => g.id === editingGoal.id ? { ...g, ...data } : g);
    else updated = [...savingsGoals, { ...data, id: Date.now().toString(), userId: auth.user.id }];
    setSavingsGoals(updated);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const deleteGoal = (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(updated);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const updateGoalAmount = (id: string, newAmount: number) => {
    const updated = savingsGoals.map(g => g.id === id ? { ...g, currentAmount: newAmount } : g);
    setSavingsGoals(updated);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const confirmDelete = () => {
    if (confirmState.type === 'transaction') deleteTransaction(confirmState.id);
    else deleteGoal(confirmState.id);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { localStorage.removeItem(STORAGE_KEYS.SESSION); setAuth({ user: null, isAuthenticated: false }); }}>
      {!auth.isAuthenticated ? (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-100 mx-auto mb-8 rotate-3">F</div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">FamilyFinance</h1>
            <p className="text-slate-400 text-sm mb-8 font-bold uppercase tracking-widest">Tài chính chung - Hạnh phúc vững</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginView && <input type="text" placeholder="Tên gia đình bạn" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
              <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
              <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">Đăng nhập</button>
            </form>

            {isLoginView && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Hoặc đăng nhập nhanh</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                
                <button 
                  onClick={handleBiometricLogin}
                  className="w-full py-4 bg-slate-50 text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-3 border border-indigo-50 hover:bg-indigo-50 transition-all active:scale-95"
                >
                  <span className="text-2xl">📸</span>
                  SỬ DỤNG FACE ID / VÂN TAY
                </button>
              </div>
            )}

            <button onClick={() => setIsLoginView(!isLoginView)} className="mt-8 text-xs font-black text-indigo-600 uppercase tracking-widest">{isLoginView ? 'Đăng ký tài khoản mới' : 'Quay lại đăng nhập'}</button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && auth.user && <Dashboard transactions={transactions} user={auth.user} />}
          {activeTab === 'transactions' && <TransactionList transactions={transactions} onDeleteRequest={(id) => setConfirmState({ isOpen: true, id, type: 'transaction' })} onEdit={(t) => { setEditingTransaction(t); setIsTxModalOpen(true); }} />}
          {activeTab === 'goals' && (
            <SavingsGoals 
              goals={savingsGoals} 
              onDeleteRequest={(id) => setConfirmState({ isOpen: true, id, type: 'goal' })} 
              onEdit={(g) => { setEditingGoal(g); setIsGoalModalOpen(true); }} 
              onUpdateAmount={updateGoalAmount}
              onAdd={() => { setEditingGoal(undefined); setIsGoalModalOpen(true); }}
            />
          )}
          {activeTab === 'settings' && auth.user && <Settings user={auth.user} onUpdate={updateUser} onLogout={() => { localStorage.removeItem(STORAGE_KEYS.SESSION); setAuth({ user: null, isAuthenticated: false }); }} />}

          {/* Global FAB: Chỉ hiển thị cho Giao dịch khi không ở tab Mục tiêu (vì tab đó đã có FAB riêng) */}
          {activeTab !== 'goals' && (
            <button 
              onClick={() => { setEditingTransaction(undefined); setIsTxModalOpen(true); }} 
              className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center text-4xl font-light hover:scale-110 active:scale-95 transition-all z-[60]"
              title="Thêm giao dịch mới"
            >
              +
            </button>
          )}

          <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSave={saveTransaction} initialData={editingTransaction} />
          <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={saveGoal} initialData={editingGoal} />
          <ConfirmDialog isOpen={confirmState.isOpen} onClose={() => setConfirmState({ ...confirmState, isOpen: false })} onConfirm={confirmDelete} title="Xác nhận xóa?" message="Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác." />
        </>
      )}
    </Layout>
  );
};

export default App;
