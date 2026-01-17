// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Tag, Typography, Row, Col, message, Spin, Modal, Badge, Tooltip, Empty } from 'antd';
import { 
  YoutubeFilled, 
  FacebookFilled, 
  PlusOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { BASE_URL, disconnectSocialAccount, getAllSocialAccounts, getYouTubeChannels } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const Accounts = () => {
  // --- PHẦN LOGIC (GIỮ NGUYÊN) ---
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL API Backend
  const API_URL = BASE_URL;

  // 1. Hàm lấy danh sách tài khoản
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAllSocialAccounts();
      const rawAccounts = response.data || [];
      console.log("Dữ liệu gốc từ /social:", rawAccounts);

      // Bổ sung thông tin chi tiết cho từng tài khoản
      const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
        // Nếu là YouTube và thiếu thông tin tên/ảnh
        if (acc.platform === 'youtube' && (!acc.name && !acc.username && !acc.title)) {
          try {
            // Ưu tiên dùng social_id (UC...) cho YouTube để tránh lỗi 500 trên cloud
            const targetId = acc.social_id || acc.id;
            const channelsRes = await getYouTubeChannels(targetId);
            if (channelsRes.data && channelsRes.data.length > 0) {
              const channel = channelsRes.data[0];
              return {
                ...acc,
                name: channel.title,
                avatar: channel.thumbnail,
                subscribers: channel.subscriber_count,
                views: channel.view_count
              };
            }
          } catch (e) {
            console.warn(`Không thể lấy chi tiết kênh cho ${acc.social_id}:`, e);
          }
        }
        return acc;
      }));

      console.log("Dữ liệu sau khi bổ sung (Enriched):", enrichedAccounts);
      setAccounts(enrichedAccounts);
    } catch (error) {
      console.error("Lỗi tải danh sách tài khoản:", error);
      // Fallback nếu endpoint /social chưa ổn định thì dùng lại logic cũ
      try {
        const [youtubeRes, facebookRes] = await Promise.all([
          api.get('/youtube/accounts'),
          api.get('/facebook/pages')
        ]);
        const combinedAccounts = [...(youtubeRes.data || []), ...(facebookRes.data || [])];
        setAccounts(combinedAccounts);
      } catch (innerError) {
        console.error("Lỗi fallback tải tài khoản:", innerError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Callback sau khi Login
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const error = queryParams.get('error');
    const token = queryParams.get('token');

    // Nếu có token trong URL (thường sau khi OAuth redirect), cập nhật vào localStorage
    if (token) {
      localStorage.setItem('access_token', token);
    }

    if (success) {
      message.success('Kết nối tài khoản thành công!');
      // Điều hướng về trang /accounts sạch (không có query params)
      navigate('/accounts', { replace: true });
      fetchAccounts();
    }

    if (error) {
      message.error('Kết nối thất bại. Vui lòng thử lại.');
      navigate('/accounts', { replace: true });
    }

    fetchAccounts();
  }, [location, navigate]);

  // 3. Hàm kết nối mới
  const handleConnect = (platform) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      message.error("Lỗi: Bạn chưa đăng nhập!");
      return;
    }

    // Sử dụng baseURL từ axios instance để đồng bộ
    const baseUrl = api.defaults.baseURL;
    
    if (platform === 'youtube') {
      window.location.href = `${baseUrl}/youtube/authorize/?token=${token}`;
    } else if (platform === 'facebook') {
      window.location.href = `${baseUrl}/facebook/authorize/?token=${token}`;
    }
  };

  // 4. Hàm ngắt kết nối
  const handleDisconnect = (id) => {
    console.log("Đang yêu cầu ngắt kết nối ID:", id);

    Modal.confirm({
      title: 'Ngắt kết nối tài khoản này?',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Các chiến dịch đang chạy trên tài khoản này có thể bị gián đoạn.',
      okText: 'Ngắt kết nối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await disconnectSocialAccount(id);
          message.success('Đã ngắt kết nối thành công');
          fetchAccounts(); 
        } catch (error) {
          console.error("Lỗi xóa tài khoản:", error);
          message.error('Lỗi khi ngắt kết nối: ' + (error.response?.data?.detail || 'Vui lòng thử lại sau.'));
        }
      },
    });
  };

  // --- PHẦN GIAO DIỆN MỚI (UPDATE) ---
  
  // Helper: Màu sắc theo nền tảng
  const getPlatformColor = (platform) => {
      if (platform === 'youtube') return '#ff0000';
      if (platform === 'facebook') return '#1877f2';
      return '#888';
  };

  // Helper: Icon theo nền tảng
  const getPlatformIcon = (platform, color = '#fff') => {
      if (platform === 'youtube') return <YoutubeFilled style={{ fontSize: 32, color }} />;
      if (platform === 'facebook') return <FacebookFilled style={{ fontSize: 32, color }} />;
      return null;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* HEADER: Tiêu đề & Nút thêm nhanh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Quản lý tài khoản</Title>
            <Text type="secondary">Kết nối các mạng xã hội để đăng bài tự động</Text>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
            <Button 
                size="large"
                icon={<YoutubeFilled />} 
                style={{ background: '#ff0000', color: '#fff', border: 'none' }}
                onClick={() => handleConnect('youtube')}
            >
                Thêm YouTube
            </Button>
            <Button 
                size="large"
                icon={<FacebookFilled />} 
                style={{ background: '#1877f2', color: '#fff', border: 'none' }}
                onClick={() => handleConnect('facebook')}
            >
                Thêm Facebook
            </Button>
        </div>
      </div>

      {/* BODY: Danh sách tài khoản dạng Lưới */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
          {accounts.length === 0 && !loading ? (
             <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có tài khoản nào được kết nối" 
                style={{ padding: 40, background: '#fff', borderRadius: 12 }}
             >
                <Text type="secondary">Hãy bấm nút thêm ở trên để bắt đầu</Text>
             </Empty>
          ) : (
             <Row gutter={[24, 24]}>
                {accounts.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Badge.Ribbon 
                            text={item.platform === 'youtube' ? 'YouTube' : 'Facebook'} 
                            color={getPlatformColor(item.platform)}
                        >
                            <Card
                                hoverable
                                style={{ borderRadius: 12, overflow: 'hidden', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                actions={[
                                    <Tooltip title="Làm mới trạng thái">
                                        <Button type="text" icon={<SyncOutlined />} onClick={fetchAccounts} />
                                    </Tooltip>,
                                    <Tooltip title="Ngắt kết nối">
                                        <Button type="text" danger icon={<DisconnectOutlined />} onClick={() => handleDisconnect(item.id)}>Ngắt kết nối</Button>
                                    </Tooltip>
                                ]}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                                    {/* Avatar to đẹp */}
                                    <Avatar 
                                        src={
                                            item.avatar_url || item.avatar || item.picture || 
                                            item.profile_image_url || item.thumbnail || 
                                            item.metadata?.avatar_url || item.metadata?.picture ||
                                            item.channel_thumbnail
                                        } 
                                        size={80} 
                                        style={{ 
                                            border: `3px solid ${getPlatformColor(item.platform)}`, 
                                            marginBottom: 16,
                                            padding: 2,
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }} 
                                        icon={getPlatformIcon(item.platform, getPlatformColor(item.platform))}
                                    />
                                    
                                    {/* Tên tài khoản */}
                                    <Title level={4} style={{ marginBottom: 4, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {
                                            item.name || item.username || item.title || 
                                            item.full_name || item.display_name || item.nickname || 
                                            item.metadata?.name || item.metadata?.username ||
                                            item.channel_title || item.social_id
                                        }
                                    </Title>
                                    
                                    {/* Trạng thái hoạt động */}
                                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: '8px 0' }}>
                                        Đang hoạt động
                                    </Tag>
                                    
                                    {/* Ngày hết hạn token */}
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Hết hạn: {new Date(item.expires_at).toLocaleDateString('vi-VN')}
                                    </Text>
                                </div>
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                ))}
             </Row>
          )}
      </Spin>
    </div>
  );
};

export default Accounts;