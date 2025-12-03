import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Backend thường dùng endpoint này để tạo user mới
      // Payload phải khớp với UserCreate schema trong backend
      const payload = {
        email: values.email,
        username: values.username, // Hoặc lấy email làm username tùy logic
        password: values.password
      };

      // Gọi API: POST /api/v1/users/
      // (Nếu backend bạn đặt endpoint khác thì sửa lại ở đây)
      await api.post('/users/', payload);

      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Đăng ký thất bại. Có thể email đã tồn tại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
      background: 'linear-gradient(135deg, #001529 0%, #00417a 100%)' 
    }}>
      <Card 
        title={<div style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold'}}>ĐĂNG KÝ TÀI KHOẢN</div>} 
        style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      >
        <Form name="register_form" onFinish={onFinish} layout="vertical" size="large">
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập (Username)" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              ĐĂNG KÝ
            </Button>
          </Form.Item>
          
          <div style={{textAlign: 'center'}}>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;