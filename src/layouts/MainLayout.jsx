// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, theme } from 'antd';
import { 
  AppstoreOutlined, 
  BarChartOutlined, 
  CloudUploadOutlined, 
  TeamOutlined, 
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan (Dashboard)' },
    { key: '/content', icon: <CloudUploadOutlined />, label: 'Nội dung (Content)' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Số liệu (Analytics)' },
    { key: '/workspaces', icon: <TeamOutlined />, label: 'Workspaces' }, // Feature từ API
    { key: '/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={240}
        style={{ 
            background: '#fff', 
            borderRight: '1px solid #f0f0f0',
            position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
            {/* Logo Social Pro */}
            <h2 style={{ color: '#1677ff', margin: 0, display: collapsed ? 'none' : 'block' }}>SOCIAL PRO</h2>
            {collapsed && <h2 style={{ color: '#1677ff', margin: 0 }}>SP</h2>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={items}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 0, marginTop: 10 }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px #f0f1f2' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Nút Tạo mới nhanh (Đặc trưng YouTube) */}
            <Button type="primary" icon={<VideoCameraAddOutlined />} danger style={{ fontWeight: 600 }}>
                TẠO MỚI
            </Button>
            
            <Badge count={5} size="small">
                <Button shape="circle" icon={<BellOutlined />} />
            </Badge>
            
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style={{ cursor: 'pointer' }} />
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f9f9f9', // Nền xám nhạt chuẩn Studio
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Nơi nội dung các trang con sẽ hiện ra */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;