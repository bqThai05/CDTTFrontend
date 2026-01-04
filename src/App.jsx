// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import các trang
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import Accounts from './pages/Accounts';
import ChannelContent from './pages/ChannelContent';
import YoutubeIntegration from './pages/YoutubeIntegration';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import AcceptInvitation from './pages/AcceptInvitation';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword'; // <--- Thêm dòng này
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import FacebookIntegration from './pages/FacebookIntegration';
// ĐÃ XÓA: import NotFound ...

// Import Layout
import MainLayout from './components/MainLayout';

// Component bảo vệ
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// --- TÁCH RIÊNG PHẦN ROUTES ĐỂ DÙNG ĐƯỢC useLocation ---
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 1. TRANG LANDING */}
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="feed" element={<PostHistory />} />
          <Route path="content" element={<ChannelContent />} />
          <Route path="youtube-integration" element={<YoutubeIntegration />} />
          <Route path="/facebook-integration" element={<FacebookIntegration />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
        </Route>

        {/* ĐÃ XÓA: Route NotFound (Trang lỗi 404) */}
        {/* Nếu người dùng gõ linh tinh, tạm thời cho nó về Login luôn */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;