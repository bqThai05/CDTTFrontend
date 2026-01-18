// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, theme, Dropdown, Typography, message } from 'antd';
import { useTranslation } from '../hooks/useTranslation'; // <--- Thêm dòng này
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
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  RocketFilled,
  DownOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  // 🔥 LẤY TOKEN MÀU ĐỘNG (Thêm dòng này)
  const { token } = theme.useToken(); 

  const [userInfo] = useState(() => {
    const storedUser = localStorage.getItem('user_info');
    return storedUser ? JSON.parse(storedUser) : { name: 'Admin User', avatar: '' };
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const userMenu = {
  items: [
      { key: 'profile', label: t('profile'), icon: <UserOutlined />, onClick: () => navigate('/profile') }, // Dùng t('profile')
      { key: 'settings', label: t('settings'), icon: <SettingOutlined />, onClick: () => navigate('/settings') }, // Dùng t('settings')
      { type: 'divider' },
      { key: 'logout', label: t('logout'), icon: <LogoutOutlined />, danger: true, onClick: handleLogout }, // Dùng t('logout')
  ]
};

const menuItems = [
  { key: '/dashboard', icon: <AppstoreOutlined />, label: t('dashboard') }, // t('dashboard')
  { key: '/create-post', icon: <VideoCameraAddOutlined />, label: t('create_post') },
  { key: '/content', icon: <CloudUploadOutlined />, label: t('content') },
  { key: '/accounts', icon: <UsergroupAddOutlined />, label: t('accounts') },
  { key: '/feed', icon: <BarChartOutlined />, label: t('history') },
  { key: '/workspaces', icon: <TeamOutlined />, label: t('workspaces') },
];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={240} 
        style={{ 
            background: token.colorBgContainer, // 🔥 Sửa màu nền
            borderRight: `1px solid ${token.colorBorderSecondary}` // 🔥 Sửa màu viền
        }}
      >
        <div style={{ 
            height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            borderBottom: `1px solid ${token.colorBorderSecondary}` // 🔥 Sửa viền
        }}>
            {collapsed ? (
                <RocketFilled style={{ fontSize: '32px', color: '#d4145a' }} />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RocketFilled style={{ fontSize: '24px', color: '#d4145a' }} />
                    <h2 style={{ color: '#d4145a', margin: 0, fontWeight: 'bold', fontSize: '20px', fontFamily: 'sans-serif' }}>
                        SOCIAL PRO
                    </h2>
                </div>
            )}
        </div>

        <Menu
          theme={token.algorithm === theme.darkAlgorithm ? "dark" : "light"} // 🔥 Tự động đổi theme menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 0, marginTop: 10, background: 'transparent' }}
        />
      </Sider>
      
      <Layout style={{ background: token.colorBgLayout }}> {/* 🔥 Màu nền Layout */}
        <Header style={{ 
            padding: '0 24px', 
            background: token.colorBgContainer, // 🔥 Màu nền Header
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            boxShadow: token.boxShadowTertiary // 🔥 Bóng đổ nhẹ
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64, color: token.colorText }} // 🔥 Màu icon
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small">
                <Button shape="circle" icon={<BellOutlined />} />
            </Badge>

            <Dropdown menu={userMenu} trigger={['click']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 12px', borderRadius: 6, transition: 'background 0.3s' }}>
                    <Avatar 
                        src={userInfo.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                        style={{ backgroundColor: '#1677ff' }}
                    >
                        {userInfo.name.charAt(0)}
                    </Avatar>
                    <div style={{ lineHeight: 1.2, display: collapsed ? 'none' : 'block' }}>
                        <Text strong style={{ display: 'block', color: token.colorText }}>{userInfo.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Administrator</Text>
                    </div>
                    <DownOutlined style={{ fontSize: 12, color: token.colorTextDescription }} />
                </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer, // 🔥 Nền Content trắng/đen
            borderRadius: token.borderRadiusLG,
            overflowY: 'auto'
          }}
        >
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;