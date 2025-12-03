import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, Space, Badge, Tooltip, message, Spin } from 'antd';
import { 
  YoutubeFilled, FacebookFilled, AppstoreOutlined, UserOutlined,
  FormOutlined, CalendarOutlined, MessageOutlined, BarChartOutlined, 
  LogoutOutlined, BellOutlined, ArrowLeftOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const COLORS = {
  sidebarBg: '#001529',
  headerBg: '#fff',
  bgLayout: '#f0f2f5',
  youtube: '#ff0000',
  facebook: '#1877f2',
};

const { Sider, Content, Header } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [currentKey, setCurrentKey] = useState('global_dashboard');
  const [currentUser, setCurrentUser] = useState(null);

  // --- LOGIC KHỞI TẠO ---
  useEffect(() => {
    const initSystem = async () => {
        try {
            const userRes = await api.get('/users/me');
            setCurrentUser(userRes.data);

            if (!localStorage.getItem('workspace_id')) {
                localStorage.setItem('workspace_id', '1');
            }
        } catch (error) {
            console.error("Lỗi khởi tạo:", error);
            if (!error.response) message.error("Không thể kết nối Backend!");
        } finally {
            setLoading(false);
        }
    };
    initSystem();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('workspace_id');
    message.success("Đã đăng xuất thành công");
    navigate('/login');
  };

  // --- MENU ITEMS ---
  const channelToolItems = [
    { key: 'feed', icon: <AppstoreOutlined />, label: 'Bảng tin' },
    { key: 'create', icon: <FormOutlined />, label: 'Viết bài' },
    { key: 'schedule', icon: <CalendarOutlined />, label: 'Lịch đăng' },
    { key: 'inbox', icon: <MessageOutlined />, label: 'Hội thoại' },
    { key: 'reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  ];

  const renderAccountLabel = (name, email, avatarUrl) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, lineHeight: '1.2', padding: '5px 0' }}>
      <Avatar size={24} src={avatarUrl} icon={<UserOutlined />} style={{ flexShrink: 0 }} />
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: 13 }}>{name}</div>
        <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email}</div>
      </div>
    </div>
  );

  const globalTreeItems = [
    { key: 'create_post_global', icon: <EditOutlined />, label: 'Đăng bài mới', style: { fontWeight: 'bold', color: '#1890ff' } },
    { key: 'global_dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan hệ thống' },
    { key: 'global_accounts', icon: <UserOutlined />, label: 'Quản lý Tài khoản' },
    { type: 'divider' },
    {
      key: 'grp_youtube', label: 'YouTube Connected', icon: <YoutubeFilled style={{ color: COLORS.youtube, fontSize: 18 }} />,
      children: [
        {
          key: 'acc_google_1',
          label: renderAccountLabel('Trung Nhân', 'nhan@gmail.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nhan'),
          style: { height: 'auto' },
          children: [ { key: 'channel_ReviewXe', label: '• Kênh Review Xe' } ]
        }
      ],
    },
    {
        key: 'grp_facebook', label: 'Facebook Connected', icon: <FacebookFilled style={{ color: COLORS.facebook, fontSize: 18 }} />,
        children: [
          {
            key: 'acc_fb_1',
            label: renderAccountLabel('Admin Page', 'admin@fb.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminFB'),
            style: { height: 'auto' },
            children: [ { key: 'channel_ShopQuanAo', label: '• Shop Quần Áo' } ]
          },
        ],
      },
  ];

  const onMenuClick = (e) => {
    setCurrentKey(e.key);
    if (e.key === 'create_post_global' || e.key === 'create') { navigate('/create-post'); return; }
    if (e.key === 'global_accounts') { navigate('/accounts'); return; }
    if (e.key === 'feed') { navigate('/feed'); return; }
    if (e.key === 'global_dashboard') { setSelectedChannel(null); navigate('/dashboard'); return; }
    if (e.key.startsWith('channel_')) {
        const channelName = e.domEvent.target.innerText.replace('• ', ''); 
        setSelectedChannel({ id: e.key, name: channelName });
        navigate('/dashboard');
    }
  };

  if (loading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <Sider width={selectedChannel ? 200 : 260} style={{ background: COLORS.sidebarBg }}>
        <div style={{ height: 64, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {selectedChannel ? (
                <Tooltip title="Quay lại tổng quan">
                    <Button type="text" icon={<ArrowLeftOutlined style={{color:'white', fontSize: 18}}/>} onClick={() => setSelectedChannel(null)}/> 
                </Tooltip>
            ) : (
                <span style={{letterSpacing: 1}}>SOCIAL PRO</span>
            )}
        </div>

        <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            {selectedChannel ? (
                <div style={{padding: '15px 10px', textAlign:'center'}}>
                    <Avatar size={64} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style={{border: '2px solid #1890ff', marginBottom: 10}} />
                    <div style={{color:'white', fontWeight:'bold', marginBottom: 20}}>{selectedChannel.name}</div>
                    <Menu theme="dark" mode="vertical" selectedKeys={[currentKey]} onClick={onMenuClick} items={channelToolItems} style={{border: 'none'}} />
                </div>
            ) : (
                <Menu theme="dark" mode="inline" defaultOpenKeys={['grp_youtube', 'grp_facebook']} selectedKeys={[currentKey]} onClick={onMenuClick} items={globalTreeItems} style={{marginTop: 10, border: 'none'}} />
            )}
        </div>
      </Sider>

      {/* HEADER & CONTENT */}
      <Layout>
        <Header style={{ background: COLORS.headerBg, padding: '0 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f0f0f0' }}>
             <div style={{ fontWeight: 'bold', fontSize: 18 }}>
                {selectedChannel ? `Quản lý: ${selectedChannel.name}` : 'Tổng quan hệ thống'}
             </div>
             
             {/* --- NÚT ĐĂNG XUẤT ĐÃ QUAY TRỞ LẠI Ở ĐÂY --- */}
             <Space size="large">
                <Tooltip title="Thông báo">
                    <Badge count={5} size="small">
                        <Button type="text" shape="circle" icon={<BellOutlined style={{fontSize: 20}} />} />
                    </Badge>
                </Tooltip>
                
                <div style={{display:'flex', alignItems:'center', gap: 10, background: '#f5f5f5', padding: '5px 15px', borderRadius: 20}}>
                    <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" icon={<UserOutlined />} />
                    <span style={{fontWeight: 500}}>{currentUser?.email || 'Admin User'}</span>
                </div>

                <Button 
                    type="primary" 
                    danger 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                >
                   
                </Button>
             </Space>
        </Header>

        <Content style={{ padding: 24, background: COLORS.bgLayout, overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
            <Outlet context={[selectedChannel]} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;