// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, theme, Dropdown, Typography, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined, 
  BarChartOutlined, 
  CloudUploadOutlined, 
  TeamOutlined, 
  VideoCameraAddOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  YoutubeOutlined,
  FacebookFilled, // Vẫn giữ icon Facebook
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined,
  RocketFilled 
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [userInfo] = useState(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            return {
                name: parsedUser.full_name || parsedUser.username || 'Admin User',
                avatar: parsedUser.avatar_url || ''
            };
        } catch {
            return { name: 'Admin User', avatar: '' };
        }
    }
    return { name: 'Admin User', avatar: '' };
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const userMenu = {
    items: [
        { key: 'profile', label: 'Thông tin tài khoản', icon: <UserOutlined />, onClick: () => navigate('/profile') },
        { key: 'settings', label: 'Cài đặt hệ thống', icon: <SettingOutlined /> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ]
  };

  // MENU ITEMS
  const menuItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
    { key: '/create-post', icon: <VideoCameraAddOutlined />, label: 'Tạo bài đăng' },
    { key: '/content', icon: <CloudUploadOutlined />, label: 'Nội dung' },
    { key: '/youtube-integration', icon: <YoutubeOutlined />, label: 'YouTube' },
    
    // 👇👇👇 MỤC FACEBOOK 👇👇👇
    { key: '/facebook-integration', icon: <FacebookFilled />, label: 'Facebook' }, 

    { key: '/feed', icon: <BarChartOutlined />, label: 'Lịch sử tin' },
    { key: '/workspaces', icon: <TeamOutlined />, label: 'Nhóm làm việc' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        
        {/* --- PHẦN LOGO --- */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
            {collapsed ? (
                <RocketFilled 
                    style={{ 
                        fontSize: '32px', 
                        color: '#d4145a' 
                    }} 
                />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RocketFilled style={{ fontSize: '24px', color: '#d4145a' }} />
                    <h2 style={{ 
                        color: '#d4145a', 
                        margin: 0, 
                        fontWeight: 'bold', 
                        fontSize: '20px',
                        fontFamily: 'sans-serif'
                    }}>
                        SOCIAL PRO
                    </h2>
                </div>
            )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 0, marginTop: 10 }}
        />
      </Sider>
      
      <Layout>
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

            <Dropdown menu={userMenu} trigger={['click']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 12px', borderRadius: 6, transition: 'background 0.3s' }} className="user-dropdown">
                    <Avatar 
                        src={userInfo.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                        style={{ backgroundColor: '#1677ff' }}
                    >
                        {userInfo.name.charAt(0)}
                    </Avatar>
                    <div style={{ lineHeight: 1.2, display: collapsed ? 'none' : 'block' }}>
                        <Text strong style={{ display: 'block' }}>{userInfo.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Administrator</Text>
                    </div>
                    <DownOutlined style={{ fontSize: 12, color: '#999' }} />
                </div>
            </Dropdown>
          </div>
        </Header>

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
          <Outlet /> 
        </Content>

        {/* Đã xóa ChatBoxAI ở đây */}

      </Layout>
    </Layout>
  );
};

export default MainLayout;