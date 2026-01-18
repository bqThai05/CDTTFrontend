// src/hooks/useTranslation.js
import { useSettings } from '../contexts/SettingsContext';
import { resources } from '../utils/locales';

export const useTranslation = () => {
  const { settings } = useSettings();
  // Nếu settings chưa load kịp hoặc không có language thì mặc định là 'vi'
  const lang = settings?.language || 'vi';

  // Hàm dịch: Nhận vào key (ví dụ: 'dashboard'), trả về chữ tương ứng
  const t = (key) => {
    // Nếu tìm thấy từ trong từ điển thì trả về, không thì trả về chính cái key đó
    return resources[lang]?.[key] || key;
  };

  return { t, lang };
};