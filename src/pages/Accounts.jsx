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
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

const Accounts = () => {
  // --- PHẦN LOGIC (GIỮ NGUYÊN) ---
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL API Backend
  const API_URL = 'https://api-socialpro-753322230318.asia-southeast1.run.app/api/v1';

  // 1. Hàm lấy danh sách tài khoản
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const [youtubeRes, facebookRes] = await Promise.all([
        api.get('/youtube/accounts'),
        api.get('/facebook/pages')
      ]);
      // Sắp xếp để Youtube và FB xen kẽ hoặc theo thứ tự mới nhất
      const combinedAccounts = [...youtubeRes.data, ...facebookRes.data];
      setAccounts(combinedAccounts);
    } catch (error) {
      console.error("Lỗi tải danh sách tài khoản:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Callback sau khi Login
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const error = queryParams.get('error');

    if (success) {
      message.success('Kết nối tài khoản thành công!');
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

    if (platform === 'youtube') {
      window.location.href = `${API_URL}/youtube/authorize?token=${token}`;
    } else if (platform === 'facebook') {
      window.location.href = `${API_URL}/facebook/authorize?token=${token}`;
    }
  };

  // 4. Hàm ngắt kết nối
 const handleDisconnect = (id) => {
    // Sửa lỗi 1: Dùng biến id để in ra log
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
          // Giả lập call API xóa (Logic cũ của bạn)
          message.success('Đã ngắt kết nối thành công');
          fetchAccounts(); 
        } catch (error) {
          // Sửa lỗi 2: Dùng biến error để in ra log
          console.error("Lỗi xóa tài khoản:", error);
          message.error('Lỗi khi ngắt kết nối');
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
  const getPlatformIcon = (platform) => {
      if (platform === 'youtube') return <YoutubeFilled style={{ fontSize: 20, color: '#fff' }} />;
      if (platform === 'facebook') return <FacebookFilled style={{ fontSize: 20, color: '#fff' }} />;
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
                                        src={item.avatar_url} 
                                        size={80} 
                                        style={{ 
                                            border: `3px solid ${getPlatformColor(item.platform)}`, 
                                            marginBottom: 16,
                                            padding: 2,
                                            background: '#fff'
                                        }} 
                                        icon={getPlatformIcon(item.platform)}
                                    />
                                    
                                    {/* Tên tài khoản */}
                                    <Title level={4} style={{ marginBottom: 4, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.username || item.social_id}
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