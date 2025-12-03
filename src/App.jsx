import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // <--- Import Register
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import Accounts from './pages/Accounts';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
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
          {/* ... các route khác */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;