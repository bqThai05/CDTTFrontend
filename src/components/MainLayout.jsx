// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, theme } from 'antd';
import { 
  AppstoreOutlined, 
  BarChartOutlined, 
  CloudUploadOutlined, 
  TeamOutlined, 
  VideoCameraAddOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại để highlight menu
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Cấu hình Menu bên trái
  const menuItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
    { key: '/create-post', icon: <VideoCameraAddOutlined />, label: 'Tạo bài đăng' },
    { key: '/content', icon: <CloudUploadOutlined />, label: 'Nội dung' },
    { key: '/youtube-integration', icon: <YoutubeOutlined />, label: 'YouTube' },
    { key: '/feed', icon: <BarChartOutlined />, label: 'Lịch sử tin' },
    { key: '/workspaces', icon: <TeamOutlined />, label: 'Nhóm làm việc' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 1. SIDEBAR (CỘT TRÁI) */}
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
            {/* Logo thay đổi khi đóng/mở menu */}
            <h2 style={{ color: '#1677ff', margin: 0, fontWeight: 'bold', fontSize: collapsed ? '18px' : '24px' }}>
                {collapsed ? 'SP' : 'SOCIAL PRO'}
            </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]} // Tự động sáng menu đang chọn
          items={menuItems}
          onClick={(e) => navigate(e.key)} // Bấm vào menu thì chuyển trang
          style={{ borderRight: 0, marginTop: 10 }}
        />
      </Sider>
      
      {/* 2. PHẦN NỘI DUNG BÊN PHẢI */}
      <Layout>
        {/* Header (Thanh trên cùng) */}
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small">
                <Button shape="circle" icon={<BellOutlined />} />
            </Badge>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                <span style={{ fontWeight: 500 }}>Admin User</span>
            </div>
          </div>
        </Header>

        {/* Content (Nơi hiển thị Dashboard, CreatePost...) */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f5f5f5',
            borderRadius: borderRadiusLG,
            overflowY: 'auto'
          }}
        >
          {/* QUAN TRỌNG: Đây là chỗ nội dung con sẽ hiện ra */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;