// src/contexts/SettingsContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Tạo Context (Biến nội bộ, không export)
const SettingsContext = createContext();

// Cấu hình mặc định (Biến nội bộ, không export)
const defaultSettings = {
    theme: 'light',          
    language: 'vi',          
    compactMode: false,      
    publishing: {
        defaultPrivacy: 'public',
        autoHashtag: true,
        defaultTimezone: '+07:00'
    },
    notifications: {
        email: true,
        browser: true,
        weeklyReport: false
    }
};

// 1. Export Component Provider
export const SettingsProvider = ({ children }) => {
    // Lấy từ LocalStorage hoặc dùng mặc định
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    // Hàm cập nhật settings (tự động lưu vào LocalStorage)
    const updateSettings = (newSettings) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('app_settings', JSON.stringify(updated));
            return updated;
        });
    };

    // Hàm cập nhật từng phần nhỏ (nested update)
    const updateNestedSetting = (category, key, value) => {
        setSettings(prev => {
            const updated = {
                ...prev,
                [category]: key ? { ...prev[category], [key]: value } : value
            };
            localStorage.setItem('app_settings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateNestedSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

// 2. Export Custom Hook
// Dòng dưới đây để tắt cảnh báo Fast Refresh cho Hook này 👇
// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};