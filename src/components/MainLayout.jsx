import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Space, Spin } from 'antd';
import { 
  YoutubeFilled, AppstoreOutlined, UserOutlined,
  LogoutOutlined, EditOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom'; // Thêm useLocation
import api from '../services/api';

const { Sider, Content, Header } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [currentKey, setCurrentKey] = useState('global_dashboard');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initSystem = async () => {
        try {
            const userRes = await api.get('/users/me');
            setCurrentUser(userRes.data);
            if (!localStorage.getItem('workspace_id')) localStorage.setItem('workspace_id', '1');
        } catch (error) { console.error("Lỗi khởi tạo", error); } 
        finally { setLoading(false); }
    };
    initSystem();
  }, []);

  // Hàm tự động đổi tiêu đề dựa trên URL
  const getPageTitle = () => {
    if (selectedChannel) return selectedChannel.name;
    switch (location.pathname) {
        case '/create-post': return 'Đăng bài mới';
        case '/accounts': return 'Quản lý tài khoản';
        case '/feed': return 'Lịch sử bài đăng';
        case '/dashboard': return 'Tổng quan hệ thống';
        default: return 'Social Pro Dashboard';
    }
  };

  // Cập nhật menu active dựa trên URL
  useEffect(() => {
    if (location.pathname === '/create-post') setCurrentKey('create_post_global');
    else if (location.pathname === '/accounts') setCurrentKey('global_accounts');
    else if (location.pathname === '/feed') setCurrentKey('feed');
    else if (location.pathname === '/dashboard') setCurrentKey('global_dashboard');
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('workspace_id');
    navigate('/login');
  };

  const onMenuClick = (e) => {
    setCurrentKey(e.key);
    if (e.key === 'create_post_global') return navigate('/create-post');
    if (e.key === 'global_accounts') return navigate('/accounts');
    if (e.key === 'feed') return navigate('/feed');
    if (e.key === 'global_dashboard') { setSelectedChannel(null); return navigate('/dashboard'); }
    
    // Demo chuyển kênh (nếu có logic danh sách kênh ở đây)
    if (e.key.startsWith('channel_')) {
        setSelectedChannel({ id: e.key, name: e.domEvent.target.innerText.replace('• ', '') });
        navigate('/dashboard');
    }
  };

  if (loading) return <Spin size="large" style={{marginTop: 50}} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#001529' }}>
        <div style={{ height: 64, color: 'white', textAlign: 'center', lineHeight: '64px', fontWeight: 'bold', fontSize: '18px', background: '#002140' }}>
            SOCIAL PRO
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[currentKey]} onClick={onMenuClick} 
          items={[
            { key: 'create_post_global', icon: <EditOutlined />, label: 'Đăng bài mới' },
            { key: 'global_dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
            { key: 'feed', icon: <CalendarOutlined />, label: 'Lịch sử bài đăng' }, // Đã thêm icon lịch sử
            { key: 'global_accounts', icon: <UserOutlined />, label: 'Quản lý Tài khoản' },
            { type: 'divider' },
            { key: 'grp_youtube', label: 'Kênh đã nối', icon: <YoutubeFilled />, children: [] } // Để trống chờ API list kênh sau này
          ]} 
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display:'flex', justifyContent:'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)', zIndex: 1 }}>
             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{getPageTitle()}</div>
             <Space>
                <span>Xin chào, <b>{currentUser?.username || currentUser?.email}</b></span>
                <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>Thoát</Button>
             </Space>
        </Header>
        
        {/* ĐÃ SỬA: Bỏ background trắng và padding cứng để hết bị viền */}
        <Content style={{ margin: '24px', overflowY: 'auto' }}>
            <Outlet context={[selectedChannel]} />
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;