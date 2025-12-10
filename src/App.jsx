import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login';
import Register from './pages/Register'; // <--- Import Register
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import Accounts from './pages/Accounts';
import MainLayout from './components/MainLayout';
import ChannelContent from './pages/ChannelContent';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Route Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />  {/* <--- Thêm dòng này */}

        {/* Route Admin (Cần đăng nhập) */}
        <Route path="/" element={<MainLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="feed" element={<PostHistory />} />
          <Route path="content" element={<ChannelContent />} />
          {/* ... các route khác */}
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;