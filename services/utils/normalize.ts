/**
 * ❌ Hàm hỗ trợ loại bỏ các giá trị undefined trong object hoặc array một cách đệ quy.
 * Firestore không chấp nhận giá trị undefined, nên hàm này sẽ chuyển chúng về null hoặc xóa bỏ.
 */
export function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const clean: any = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== undefined) {
        clean[key] = removeUndefined(value);
      }
    });
    return clean;
  }

  return obj;
}

/**
 * ✅ Chuẩn hóa dữ liệu người dùng trước khi lưu Cloud.
 * Đảm bảo các trường quan trọng như profileImage và settings luôn tồn tại.
 */
export const normalizeUser = (user: any) =>
  removeUndefined({
    id: user.id ?? "",
    email: user.email ?? "",
    name: user.name ?? "Gia đình",
    currency: user.currency ?? "VND",
    monthlyBudget: user.monthlyBudget ?? 0,
    familyMembers: user.familyMembers ?? [],
    reminderEnabled: user.reminderEnabled ?? false,
    reminderTime: user.reminderTime ?? "20:00",
    useImageAsBackground: user.useImageAsBackground ?? false,
    profileImage: user.profileImage ?? null // Giữ lại ảnh đại diện/nền
  });

/**
 * ✅ Chuẩn hóa danh sách giao dịch
 */
export const normalizeTransactions = (txs: any[]) =>
  removeUndefined(txs ?? []);

/**
 * ✅ Chuẩn hóa danh sách mục tiêu tiết kiệm
 */
export const normalizeGoals = (goals: any[]) =>
  removeUndefined(goals ?? []);