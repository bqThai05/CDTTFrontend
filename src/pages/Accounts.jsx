// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Tag, Typography, Row, Col, message, Spin, Modal, Badge, Tooltip, Empty } from 'antd';
import { 
  YoutubeFilled, FacebookFilled, SyncOutlined, DisconnectOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

// Import API
import { getAllSocialAccounts, disconnectSocialAccount } from '../services/api';

const { Title, Text } = Typography;

const Accounts = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL Backend
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 1. Lấy danh sách tài khoản từ API thật
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await getAllSocialAccounts();
      setAccounts(res.data); // Backend trả về mảng SocialAccountSchema
    } catch (error) {
      console.error("Lỗi tải tài khoản:", error);
      message.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check callback URL sau khi OAuth
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success')) {
      message.success('Kết nối thành công!');
      navigate('/accounts', { replace: true });
    }
    if (queryParams.get('error')) {
      message.error('Kết nối thất bại!');
      navigate('/accounts', { replace: true });
    }
    
    fetchAccounts();
  }, [location, navigate]);

  // 2. Chuyển hướng tới Backend để xác thực OAuth
  const handleConnect = (platform) => {
    const token = localStorage.getItem('access_token');
    if (!token) return message.error("Chưa đăng nhập!");
    window.location.href = `${API_URL}/api/v1/${platform}/authorize?token=${token}`;
  };

  // 3. Ngắt kết nối (Xóa khỏi DB)
  const handleDisconnect = (id) => {
    Modal.confirm({
      title: 'Ngắt kết nối tài khoản này?',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Bạn sẽ không thể đăng bài lên tài khoản này nữa.',
      okText: 'Ngắt kết nối',
      okType: 'danger',
      onOk: async () => {
        try {
          await disconnectSocialAccount(id);
          message.success('Đã ngắt kết nối');
          fetchAccounts(); // Load lại list
        } catch  {
          message.error('Lỗi khi ngắt kết nối');
        }
      },
    });
  };

  const getPlatformColor = (p) => p === 'youtube' ? '#ff0000' : '#1877f2';
  const getPlatformIcon = (p) => p === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Quản lý tài khoản</Title>
            <Text type="secondary">Kết nối YouTube & Facebook</Text>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
            <Button size="large" icon={<YoutubeFilled />} style={{ background: '#ff0000', color: '#fff' }} onClick={() => handleConnect('youtube')}>Thêm YouTube</Button>
            <Button size="large" icon={<FacebookFilled />} style={{ background: '#1877f2', color: '#fff' }} onClick={() => handleConnect('facebook')}>Thêm Facebook</Button>
        </div>
      </div>

      <Spin spinning={loading}>
          {accounts.length === 0 ? <Empty description="Chưa có tài khoản nào" /> : (
             <Row gutter={[24, 24]}>
                {accounts.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Badge.Ribbon text={item.platform.toUpperCase()} color={getPlatformColor(item.platform)}>
                            <Card
                                hoverable
                                actions={[
                                    <Tooltip title="Làm mới"><Button type="text" icon={<SyncOutlined />} onClick={fetchAccounts} /></Tooltip>,
                                    <Tooltip title="Ngắt kết nối"><Button type="text" danger icon={<DisconnectOutlined />} onClick={() => handleDisconnect(item.id)} /></Tooltip>
                                ]}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <Avatar size={64} style={{ backgroundColor: getPlatformColor(item.platform), fontSize: 32 }}
                                    icon={getPlatformIcon(item.platform)} >
                                        {item.name ? item.name.charAt(0) : <CheckCircleOutlined />}
                                    </Avatar>
                                    <Title level={4} style={{ marginTop: 10 }} ellipsis>{item.name || item.username || item.social_id}</Title>
                                    <Tag color="success">Đang hoạt động</Tag>
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