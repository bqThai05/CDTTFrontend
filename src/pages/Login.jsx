import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // <--- Thêm Link
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', values.email); 
      formData.append('password', values.password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      message.success('Đăng nhập thành công!');
      navigate('/dashboard');

    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        setErrorMsg(error.response.data.detail || 'Đăng nhập thất bại.');
      } else {
        setErrorMsg('Không thể kết nối đến Server Backend.');
      }
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
        title={<div style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold'}}>SOCIAL PRO ADMIN</div>} 
        style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      >
        {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 20 }} />}

        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
          
          {/* --- THÊM DÒNG NÀY ĐỂ CHUYỂN QUA TRANG ĐĂNG KÝ --- */}
          <div style={{textAlign: 'center'}}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;