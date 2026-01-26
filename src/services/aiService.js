// src/services/aiService.js
import axios from 'axios';

// Nếu bạn gọi trực tiếp từ Frontend (Lưu ý: Lộ API Key nếu không cẩn thận, tốt nhất nên qua Backend)
// Nhưng để demo nhanh đồ án, có thể gọi trực tiếp hoặc qua 1 proxy free
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Thay bằng key của bạn

export const generateContentAI = async (topic) => {
  try {
    // Ví dụ dùng Google Gemini (Free tier khá ngon)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Hãy viết một bài đăng mạng xã hội hấp dẫn, chuyên nghiệp về chủ đề: "${topic}". Bao gồm cả tiêu đề, nội dung chính và các hashtag phù hợp.`
          }]
        }]
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};