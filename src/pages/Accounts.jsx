import React, { useState, useEffect } from 'react';
import { Card, Button, List, Avatar, Tag, Typography, Row, Col, message, Spin, Modal } from 'antd';
import { YoutubeFilled, FacebookFilled, PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const Accounts = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL API Backend (Hardcode cho localhost để đảm bảo chạy)
  // Lưu ý: Đảm bảo Backend đang chạy ở port 8000
  const API_URL = 'http://127.0.0.1:8000/api/v1';

  // 1. Hàm lấy danh sách tài khoản đã kết nối
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách tài khoản YouTube (Dựa trên code backend bạn cung cấp)
      // Nếu bạn muốn lấy cả FB, cần đảm bảo Backend có API tương ứng hoặc gộp chung
      const [youtubeRes, facebookRes] = await Promise.all([
        api.get('/youtube/accounts'),
        api.get('/facebook/pages')
      ]);
      const combinedAccounts = [...youtubeRes.data, ...facebookRes.data];
      setAccounts(combinedAccounts);
    } catch (error) {
      console.error("Lỗi tải danh sách tài khoản:", error);
      // Không show error message quá gắt để tránh spam khi chưa có acc nào
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý khi Backend redirect về sau khi Login thành công
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const error = queryParams.get('error');

    if (success) {
      message.success('Kết nối tài khoản thành công!');
      // Xóa query param trên URL để nhìn cho sạch
      navigate('/accounts', { replace: true });
      fetchAccounts();
    }

    if (error) {
      message.error('Kết nối thất bại. Vui lòng thử lại.');
      navigate('/accounts', { replace: true });
    }

    // Load danh sách lần đầu
    fetchAccounts();
  }, [location, navigate]);

  // 3. Hàm xử lý click nút "Kết nối mới"
  const handleConnect = (platform) => {
    // Lấy token từ bộ nhớ trình duyệt
    const token = localStorage.getItem('access_token');
    
    // Kiểm tra xem có token chưa
    console.log("Token hiện tại:", token); 

    if (!token) {
      message.error("Lỗi: Bạn chưa đăng nhập, không tìm thấy token!");
      return;
    }

    if (platform === 'youtube') {
      // QUAN TRỌNG: Phải có đoạn ?token=${token} ở cuối
      window.location.href = `${API_URL}/youtube/authorize?token=${token}`;
    } else if (platform === 'facebook') {
      window.location.href = `${API_URL}/facebook/authorize?token=${token}`;
    }
  };

  // 4. Hàm ngắt kết nối (Xóa tài khoản)
  const handleDisconnect = (id) => {
    console.log("Đang yêu cầu xóa tài khoản ID:", id);
    Modal.confirm({
      title: 'Bạn có chắc muốn ngắt kết nối?',
      content: 'Các bài viết đã lên lịch cho kênh này có thể bị lỗi.',
      okText: 'Ngắt kết nối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.success('Đã ngắt kết nối (Demo UI)');
          fetchAccounts(); // Load lại list
        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
          message.error('Lỗi khi ngắt kết nối');
        }
      },
    });
  };

  // Helper render icon
  const getIcon = (platform) => {
    if (platform === 'youtube') return <YoutubeFilled style={{ fontSize: '24px', color: '#ff0000' }} />;
    if (platform === 'facebook') return <FacebookFilled style={{ fontSize: '24px', color: '#1877f2' }} />;
    return null;
  };

  return (
    <div className="accounts-page">
      <Row gutter={[24, 24]}>
        {/* Cột Trái: Danh sách đã kết nối */}
        <Col xs={24} md={16}>
          <Card title="Tài khoản đã liên kết" bordered={false}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={accounts}
                locale={{ emptyText: 'Chưa có tài khoản nào được kết nối' }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDisconnect(item.id)}>
                        Gỡ bỏ
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar_url} icon={getIcon(item.platform)} size="large" />}
                    title={<span style={{ fontWeight: 'bold' }}>{item.username || item.social_id}</span>} 
                      description={
                        <div>
                          <Tag color="blue">{item.platform.toUpperCase()}</Tag>
                          <Text type="secondary">Hết hạn token: {new Date(item.expires_at).toLocaleDateString()}</Text>
                        </div>
                      }
                    />
                    <div><CheckCircleOutlined style={{ color: '#52c41a' }} /> Đang hoạt động</div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Cột Phải: Thêm mới */}
        <Col xs={24} md={8}>
          <Card title="Thêm liên kết mới" bordered={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<YoutubeFilled />} 
                style={{ background: '#ff0000', borderColor: '#ff0000' }}
                onClick={() => handleConnect('youtube')}
              >
                Kết nối YouTube Channel
              </Button>
              
              <Button 
                type="primary" 
                size="large" 
                icon={<FacebookFilled />} 
                style={{ background: '#1877f2', borderColor: '#1877f2' }}
                onClick={() => handleConnect('facebook')}
              >
                Kết nối Facebook Page
              </Button>
            </div>
            <div style={{ marginTop: 20 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Lưu ý: Bạn sẽ được chuyển hướng đến trang đăng nhập của Google/Facebook để cấp quyền.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Accounts;