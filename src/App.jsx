// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// 1. Import ConfigProvider của Antd và Hook settings
import { ConfigProvider, theme } from 'antd'; 
import { useSettings } from './contexts/SettingsContext';

// Import các trang
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost/index';
import PostHistory from './pages/PostHistory';
import Accounts from './pages/Accounts';
import ChannelContent from './pages/ChannelContent';
import YoutubeIntegration from './pages/YoutubeIntegration';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import AcceptInvitation from './pages/AcceptInvitation';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import FacebookIntegration from './pages/FacebookIntegration';
import Settings from './pages/Settings'; // Đã có trang Settings

// Import Layout
import MainLayout from './components/MainLayout';

// Component bảo vệ (Giữ nguyên)
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const urlParams = new URLSearchParams(location.search);
  const urlToken = urlParams.get('token');

  if (!token && !urlToken) return <Navigate to="/login" replace />;
  
  return children;
};

// --- TÁCH RIÊNG PHẦN ROUTES ---
const AnimatedRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      console.log('Token đã được cập nhật từ URL');
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 1. TRANG LANDING (Trang chủ) */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. CÁC TRANG AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 3. CÁC TRANG QUẢN TRỊ */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/social-accounts" element={<Accounts />} />
          <Route path="/feed" element={<PostHistory />} />
          <Route path="/content" element={<ChannelContent />} />
          <Route path="/youtube-integration" element={<YoutubeIntegration />} />
          <Route path="/facebook-integration" element={<FacebookIntegration />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
          
          {/* Route cho trang Cài đặt */}
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  // 2. Lấy settings từ Context
  const { settings } = useSettings();

  return (
    // 3. Cấu hình Theme động dựa trên settings.theme
    <ConfigProvider
      theme={{
        // Nếu settings.theme là 'dark' thì dùng thuật toán tối, ngược lại dùng mặc định
        algorithm: settings.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff', // Màu chủ đạo vẫn giữ xanh
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;