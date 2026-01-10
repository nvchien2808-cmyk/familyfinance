
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[], categories: Category[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = transactions.reduce((acc: any, t) => {
    const category = categories.find(c => c.id === t.categoryId)?.name || 'Khác';
    if (!acc[category]) acc[category] = 0;
    acc[category] += t.amount;
    return acc;
  }, {});

  const prompt = `
    Dưới đây là tóm tắt chi tiêu của gia đình tôi:
    ${JSON.stringify(summary)}
    
    Hãy đóng vai một chuyên gia tài chính gia đình. Hãy phân tích dữ liệu này và đưa ra 3 lời khuyên ngắn gọn (khoảng 100 từ) để giúp gia đình tôi tiết kiệm và quản lý tiền tốt hơn. Hãy trả lời bằng tiếng Việt thân thiện.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Xin lỗi, tôi chưa thể phân tích dữ liệu lúc này.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Hãy thêm nhiều giao dịch hơn để tôi có thể đưa ra lời khuyên cho bạn!";
  }
};

export const parseTransactionFromVoice = async (text: string, categories: Category[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const categoryList = categories.map(c => `id: ${c.id}, name: ${c.name}, type: ${c.type}`).join('\n');
  
  const prompt = `
    Phân tích câu sau đây để trích xuất thông tin giao dịch tài chính: "${text}"
    
    Danh sách hạng mục hợp lệ:
    ${categoryList}
    
    Yêu cầu:
    1. Trích xuất: amount (số tiền, kiểu number), type ('income' hoặc 'expense'), categoryId (chọn ID phù hợp nhất từ danh sách trên), note (ghi chú ngắn gọn).
    2. Nếu không tìm thấy categoryId phù hợp, hãy dùng 'exp_food' cho chi tiêu hoặc 'inc_other' cho thu nhập.
    3. Trả về DUY NHẤT một đối tượng JSON hợp lệ.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            categoryId: { type: Type.STRING },
            note: { type: Type.STRING }
          },
          required: ["amount", "type", "categoryId", "note"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Voice Parse Error:", error);
    return null;
  }
};
