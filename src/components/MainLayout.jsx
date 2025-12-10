import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Space, Spin, Avatar, Typography, Tooltip } from 'antd';
import { 
  AppstoreOutlined, UserOutlined, YoutubeFilled, EditOutlined, CalendarOutlined, PlusCircleOutlined,
  ArrowLeftOutlined, DashboardOutlined, VideoCameraOutlined, BarChartOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null); 

  useEffect(() => {
    const initSystem = async () => {
        try {
            const userRes = await api.get('/users/me');
            setCurrentUser(userRes.data);
            const channelRes = await api.get('/youtube/accounts');
            setChannels(channelRes.data);
            if (!localStorage.getItem('workspace_id')) localStorage.setItem('workspace_id', '1');
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    initSystem();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- HÀM QUAN TRỌNG: Tự động tính xem đang ở đâu để tô màu Menu ---
  const getActiveMenuKey = () => {
    const path = location.pathname;

    // 1. Nếu đang ở trong Kênh (Channel Mode)
    if (activeChannel) {
        if (path === '/dashboard') return 'channel_dashboard';
        if (path === '/content') return 'channel_content';
        if (path === '/create-post') return 'channel_create';
        if (path === '/feed') return 'channel_feed';
        // Mặc định về dashboard nếu ko khớp
        return 'channel_dashboard';
    } 
    
    // 2. Nếu đang ở ngoài (Global Mode)
    else {
        if (path === '/dashboard') return 'dashboard';
        if (path === '/create-post') return 'create_global';
        if (path === '/feed') return 'feed';
        if (path === '/accounts') return 'accounts';
        // Mặc định
        return 'dashboard';
    }
  };

  // --- MENU CHÍNH ---
  const globalMenuItems = [
    { key: 'create_global', icon: <EditOutlined />, label: 'Đăng bài hàng loạt' },
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan hệ thống' },
    { key: 'feed', icon: <CalendarOutlined />, label: 'Lịch sử bài đăng' },
    { key: 'accounts', icon: <UserOutlined />, label: 'Quản lý Tài khoản' },
    { type: 'divider' },
    { 
        key: 'grp_channels', 
        label: 'DANH SÁCH KÊNH', 
        type: 'group',
        children: channels.map(acc => ({
            key: `select_channel_${acc.id}`,
            icon: <Avatar src={acc.avatar_url} size="small" icon={<YoutubeFilled style={{color: 'red'}}/>} />,
            label: acc.username || acc.social_id
        }))
    },
    { key: 'add_new', icon: <PlusCircleOutlined />, label: 'Thêm kênh mới' }
  ];

  // --- MENU KÊNH ---
  const channelMenuItems = [
    { key: 'channel_dashboard', icon: <DashboardOutlined />, label: 'Tổng quan kênh' },
    { key: 'channel_content', icon: <VideoCameraOutlined />, label: 'Nội dung (Video)' },
    { key: 'channel_create', icon: <EditOutlined />, label: 'Đăng lên kênh này' },
    { key: 'channel_analytics', icon: <BarChartOutlined />, label: 'Số liệu phân tích' },
  ];

  const onMenuClick = (e) => {
    const key = e.key;
    if (key.startsWith('select_channel_')) {
        const channelId = key.split('_')[2];
        const channel = channels.find(c => c.id.toString() === channelId);
        setActiveChannel(channel);
        navigate('/dashboard'); 
        return;
    }
    
    // Điều hướng
    if (!activeChannel) {
        if (key === 'create_global') navigate('/create-post');
        if (key === 'dashboard') navigate('/dashboard');
        if (key === 'feed') navigate('/feed');
        if (key === 'accounts' || key === 'add_new') navigate('/accounts');
    } else {
        if (key === 'channel_dashboard') navigate('/dashboard');
        if (key === 'channel_content') navigate('/content');
        if (key === 'channel_create') navigate('/create-post', { state: { preSelectedChannelId: activeChannel.id } });
        if (key === 'channel_analytics') navigate('/dashboard');
    }
  };

  const handleBack = () => {
      setActiveChannel(null);
      navigate('/dashboard');
  };

  if (loading) return <Spin size="large" style={{marginTop: 50, display: 'block', textAlign: 'center'}} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} style={{ background: '#001529' }}>
        
        {/* HEADER SIDEBAR */}
        <div style={{ padding: '15px', background: '#002140', borderBottom: '1px solid #001529' }}>
            {activeChannel ? (
                <div>
                    <div style={{ marginBottom: 15 }}>
                        <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined style={{ color: '#fff', fontSize: '18px' }} />} 
                            onClick={handleBack}
                            style={{ padding: 0, height: 'auto' }}
                        >
                            <span style={{ color: '#aaa', marginLeft: 5, fontSize: 12 }}>Quay lại</span>
                        </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <Avatar 
                            size={72} 
                            src={activeChannel.avatar_url} 
                            icon={<YoutubeFilled style={{ fontSize: 32, color: 'red' }} />} 
                            style={{ border: '2px solid #fff' }} 
                        />
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ color: 'white', fontSize: 16, display: 'block' }}>{activeChannel.username}</Text>
                            <Text type="secondary" style={{ color: '#aaa', fontSize: 12 }}>Kênh của bạn</Text>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ lineHeight: '32px', textAlign: 'center', fontWeight: 'bold', fontSize: '20px', color: 'white', padding: '10px 0' }}>
                    SOCIAL PRO
                </div>
            )}
        </div>

        <Menu 
            theme="dark" 
            mode="inline" 
            // QUAN TRỌNG: Dùng hàm getActiveMenuKey để xác định nút nào cần sáng
            selectedKeys={[getActiveMenuKey()]} 
            items={activeChannel ? channelMenuItems : globalMenuItems} 
            onClick={onMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display:'flex', justifyContent:'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {activeChannel ? `Quản lý: ${activeChannel.username}` : 'Hệ thống quản lý tập trung'}
             </div>
             <Space>
                <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`} />
                <Text>{currentUser?.username || currentUser?.email}</Text>
                <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>Thoát</Button>
             </Space>
        </Header>
        <Content style={{ margin: '24px' }}>
            <Outlet context={[activeChannel]} />
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;