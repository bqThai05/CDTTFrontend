// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Avatar, Form, Input, Button, Upload, 
  Tabs, message, Typography, Divider, Tag 
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  SafetyCertificateOutlined, 
  MailOutlined,
  SaveOutlined,
  LockOutlined
} from '@ant-design/icons';
import { changeUserPassword } from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@socialpro.com',
    avatar: '',
    role: 'Administrator'
  });

  // Load thông tin user (Từ API hoặc LocalStorage)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Ưu tiên lấy từ API nếu backend đã làm
        // const res = await getCurrentUser();
        // setUser(res.data);
        
        // Hiện tại dùng tạm LocalStorage cho chắc ăn
        const stored = JSON.parse(localStorage.getItem('user_info') || '{}');
        if (stored.name) {
            setUser(prev => ({ ...prev, ...stored }));
        }
      } catch (error) {
        console.error("Lỗi tải profile", error);
      }
    };
    fetchProfile();
  }, []);

  // Xử lý cập nhật thông tin chung
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      // await updateUserProfile(values); // Gọi API (nếu có)
      
      // Update tạm vào LocalStorage để thấy thay đổi liền
      const newUserInfo = { ...user, ...values };
      localStorage.setItem('user_info', JSON.stringify(newUserInfo));
      setUser(newUserInfo);
      
      message.success('Cập nhật hồ sơ thành công!');
      // Reload trang để Header cập nhật tên mới
      setTimeout(() => window.location.reload(), 1000);
    } catch  {
      message.error('Lỗi khi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
        return message.error('Mật khẩu xác nhận không khớp!');
    }
    setLoading(true);
    try {
        // Gọi API đổi mật khẩu (Endpoint /password-reset/change-password)
        await changeUserPassword({
            current_password: values.currentPassword,
            new_password: values.newPassword
        });
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        
        // Đăng xuất để user đăng nhập lại
        localStorage.clear();
        window.location.href = '/login';
    } catch (error) {
        message.error(error.response?.data?.detail || 'Mật khẩu cũ không đúng hoặc lỗi hệ thống.');
    } finally {
        setLoading(false);
    }
  };

  // Nội dung Tab 1: Thông tin chung
  const GeneralTab = () => (
    <Form layout="vertical" onFinish={handleUpdateProfile} initialValues={user}>
        <Row gutter={30}>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                    <Avatar 
                        size={120} 
                        src={user.avatar} 
                        icon={<UserOutlined />} 
                        style={{ border: '4px solid #f0f0f0' }} 
                    />
                    <Upload showUploadList={false} beforeUpload={() => false}>
                        <Button 
                            shape="circle" 
                            icon={<UploadOutlined />} 
                            style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#d4145a', color: '#fff', border: 'none' }} 
                        />
                    </Upload>
                </div>
                <div>
                    <Tag color="blue">{user.role}</Tag>
                </div>
            </Col>
            <Col xs={24} md={16}>
                <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
                <Form.Item label="Email (Không thể thay đổi)" name="email">
                    <Input prefix={<MailOutlined />} size="large" disabled />
                </Form.Item>
                <Form.Item label="Giới thiệu bản thân" name="bio">
                    <Input.TextArea rows={3} placeholder="Viết gì đó về bạn..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} style={{ marginTop: 10 }}>
                    Lưu thay đổi
                </Button>
            </Col>
        </Row>
    </Form>
  );

  // Nội dung Tab 2: Bảo mật
  const SecurityTab = () => (
    <Form layout="vertical" onFinish={handleChangePassword}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Title level={5}><LockOutlined /> Đổi mật khẩu</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
            </Text>

            <Form.Item 
                name="currentPassword" 
                label="Mật khẩu hiện tại" 
                rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}
            >
                <Input.Password size="large" />
            </Form.Item>

            <Divider />

            <Form.Item 
                name="newPassword" 
                label="Mật khẩu mới" 
                rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
            >
                <Input.Password size="large" />
            </Form.Item>

            <Form.Item 
                name="confirmPassword" 
                label="Nhập lại mật khẩu mới" 
                rules={[{ required: true, message: 'Xác nhận mật khẩu!' }]}
            >
                <Input.Password size="large" />
            </Form.Item>

            <Button type="primary" danger htmlType="submit" size="large" block loading={loading}>
                Cập nhật mật khẩu
            </Button>
        </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 30 }}>Cài đặt tài khoản</Title>
      
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
                    label: <span><SafetyCertificateOutlined /> Bảo mật & Mật khẩu</span>, 
                    children: <SecurityTab /> 
                },
            ]} 
        />
      </Card>
    </div>
  );
};

export default Profile;