// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Avatar, Form, Input, Button, 
  Tabs, message, Typography, Tag, Spin, Alert 
} from 'antd';
import { 
  UserOutlined, SaveOutlined, LockOutlined, 
  MailOutlined, PhoneOutlined, SafetyCertificateFilled,
  CheckCircleFilled, RocketFilled
} from '@ant-design/icons';

// Import API
import { getCurrentUser, updateUserProfile, changeUserPassword } from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(true); // Loading lúc mới vào trang
  const [updating, setUpdating] = useState(false); // Loading khi bấm nút lưu
  const [user, setUser] = useState(null);
  
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Load thông tin user khi vào trang
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      
      // Điền dữ liệu vào form
      profileForm.setFieldsValue({
        username: res.data.username,
        email: res.data.email,
        phone_number: res.data.phone_number
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      message.error("Không thể tải thông tin cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý cập nhật thông tin (Tên, SĐT)
  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
      // Backend cho phép update: username, email, phone_number
      await updateUserProfile({
        username: values.username,
        phone_number: values.phone_number,
        // Email thường không cho đổi lung tung, nên mình chỉ gửi nếu cần
      });
      
      message.success('Cập nhật hồ sơ thành công!');
      fetchUserData(); // Load lại dữ liệu mới
    } catch (error) {
      message.error(error.response?.data?.detail || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setUpdating(false);
    }
  };

  // 3. Xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
        return message.error('Mật khẩu xác nhận không khớp!');
    }
    
    setUpdating(true);
    try {
        await changeUserPassword({
            current_password: values.currentPassword,
            new_password: values.newPassword
        });
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        passwordForm.resetFields();
        
        // Logout user để họ đăng nhập lại với pass mới
        setTimeout(() => {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }, 1500);
        
    } catch (error) {
        message.error(error.response?.data?.detail || 'Mật khẩu cũ không đúng.');
    } finally {
        setUpdating(false);
    }
  };

  // Avatar tự động theo tên
  const avatarUrl = user?.username 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` 
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin';

  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" tip="Đang tải hồ sơ..." /></div>;

  // Nội dung Tab 1: Thông tin chung
  const GeneralTab = () => (
    <Form 
        form={profileForm} 
        layout="vertical" 
        onFinish={handleUpdateProfile}
    >
        <Row gutter={30}>
            {/* Cột Avatar */}
            <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar 
                        size={120} 
                        src={avatarUrl}
                        style={{ border: '4px solid #f0f0f0', backgroundColor: '#fff' }} 
                    />
                    <div style={{ marginTop: 15 }}>
                        <Title level={4} style={{ margin: 0 }}>{user?.username}</Title>
                        <Text type="secondary">Thành viên SocialPro</Text>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        {user?.is_verified ? (
                            <Tag icon={<CheckCircleFilled />} color="success">Đã xác minh</Tag>
                        ) : (
                            <Tag color="warning">Chưa xác minh</Tag>
                        )}
                    </div>
                </div>
            </Col>

            {/* Cột Form */}
            <Col xs={24} md={16}>
                <Form.Item label="Tên đăng nhập / Username" name="username" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
                
                <Form.Item label="Email (Không thể thay đổi)" name="email">
                    <Input prefix={<MailOutlined />} size="large" disabled style={{ color: '#888', backgroundColor: '#f5f5f5' }} />
                </Form.Item>
                
                <Form.Item label="Số điện thoại" name="phone_number">
                    <Input prefix={<PhoneOutlined />} size="large" placeholder="Cập nhật SĐT..." />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating} size="large">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Col>
        </Row>
    </Form>
  );

  // Nội dung Tab 2: Bảo mật
  const SecurityTab = () => (
    <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Alert 
                message="Lưu ý bảo mật"
                description="Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Form.Item 
                name="currentPassword" 
                label="Mật khẩu hiện tại" 
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
            >
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu đang dùng" />
            </Form.Item>

            <Form.Item 
                name="newPassword" 
                label="Mật khẩu mới" 
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
            >
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item 
                name="confirmPassword" 
                label="Xác nhận mật khẩu mới" 
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
            >
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <Button type="primary" danger htmlType="submit" size="large" block loading={updating}>
                Đổi mật khẩu
            </Button>
        </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <RocketFilled style={{ fontSize: 24, color: '#d4145a' }} />
          <Title level={2} style={{ margin: 0 }}>Hồ sơ của tôi</Title>
      </div>
      
      <Card 
        style={{ 
            borderRadius: 16, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: 'none'
        }}
      >
        <Tabs 
            defaultActiveKey="1" 
            items={[
                { 
                    key: '1', 
                    label: <span><UserOutlined /> Thông tin cá nhân</span>, 
                    children: <GeneralTab /> 
                },
                { 
                    key: '2', 
                    label: <span><SafetyCertificateFilled /> Bảo mật & Mật khẩu</span>, 
                    children: <SecurityTab /> 
                },
            ]} 
        />
      </Card>
    </div>
  );
};

export default Profile;