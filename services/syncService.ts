import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

import {
  normalizeUser,
  normalizeTransactions,
  normalizeGoals
} from "./utils/normalize";

/* =======================
   TYPES
======================= */
export interface CloudData {
  transactions: any[];
  goals: any[];
  user: any;
  lastUpdated: number;
}

/* =======================
   PUSH DATA
======================= */
const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
};

export const pushToCloud = async (uid: string, data: CloudData): Promise<boolean> => {
  if (!uid) return false;
  try {
    // 1. Chuẩn hóa dữ liệu trước khi đẩy lên
    const safeData = {
      transactions: normalizeTransactions(data.transactions ?? []),
      goals: normalizeGoals(data.goals ?? []),
      user: normalizeUser(data.user ?? {}), // Đảm bảo profileImage được giữ lại ở đây
      lastUpdated: data.lastUpdated || Date.now(),
      updatedAt: serverTimestamp() 
    };

    const finalData = removeUndefined(safeData);

    // 2. Ghi đè có chọn lọc vào Firestore
    await setDoc(doc(db, "families", uid), finalData, { merge: true });
    return true;
  } catch (error: any) {
    // Bắt lỗi dung lượng của Firestore (thường là 1MB)
    if (error.code === 'permission-denied' || error.message.includes('too large')) {
      console.error("❌ Lỗi: Dữ liệu quá lớn (có thể do ảnh nền quá nặng)");
    }
    console.error("❌ pushToCloud error:", error);
    return false;
  }
};

/* =======================
   PULL DATA
======================= */
export const pullFromCloud = async (uid: string): Promise<CloudData | null> => {
  try {
    const snap = await getDoc(doc(db, "families", uid));
    if (!snap.exists()) return null;

    const data = snap.data();

    return {
      transactions: data.transactions || [],
      goals: data.goals || [],
      user: data.user || null,
      lastUpdated: data.lastUpdated || Date.now()
    };
  } catch (error) {
    console.error("❌ pullFromCloud error:", error);
    return null;
  }
};

/* =======================
   REALTIME SYNC
======================= */
export const onSyncBroadcast = (
  uid: string,
  callback: (data: CloudData) => void
) => {
  if (!uid) return () => {};

  return onSnapshot(
    doc(db, "families", uid),
    (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      callback({
        transactions: data.transactions || [],
        goals: data.goals || [],
        user: data.user || null,
        lastUpdated: data.lastUpdated || Date.now()
      });
    },
    (error) => {
      console.error("❌ Firestore realtime error:", error);
    }
  );
};