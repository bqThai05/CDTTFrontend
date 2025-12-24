import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import Accounts from './pages/Accounts';
import MainLayout from './components/MainLayout'; // <-- Giữ nguyên file này của em
import ChannelContent from './pages/ChannelContent';
import YoutubeIntegration from './pages/YoutubeIntegration';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import AcceptInvitation from './pages/AcceptInvitation';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
        
        {/* --- CÁC ROUTE KHÁC GIỮ NGUYÊN --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />

        {}
        <Route element={<MainLayout />}> {/* <-- Bỏ path="/" ở đây đi cho đỡ trùng */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="feed" element={<PostHistory />} />
          <Route path="content" element={<ChannelContent />} />
          <Route path="youtube-integration" element={<YoutubeIntegration />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; 