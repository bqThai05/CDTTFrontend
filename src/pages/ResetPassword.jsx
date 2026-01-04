// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { LockOutlined, RocketFilled } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Dùng useSearchParams để lấy token từ URL
import { resetPassword } from '../services/api';
import PageTransition from '../components/PageTransition';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Lấy token từ URL (ví dụ: /reset-password?token=abcxyz)
  const token = searchParams.get('token'); 

  useEffect(() => {
    if (!token) {
      message.error('Đường dẫn không hợp lệ hoặc đã hết hạn!');
      navigate('/login');
    }
  }, [token, navigate]);

  const onFinish = async (values) => {
  setLoading(true);
  try {
    await resetPassword({
      token: token,
      new_password: values.password,
    });

    message.success('🎉 Đổi mật khẩu thành công! Hãy đăng nhập lại.');
    navigate('/login');
  } catch  {
    message.error('❌ Đổi mật khẩu thất bại. Token có thể đã hết hạn.');
  } finally {
    setLoading(false);
  }
};


  return (
    <PageTransition>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffcf5', padding: 20 }}>
        <Card style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 10px 30px rgba(212, 20, 90, 0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <RocketFilled style={{ fontSize: 40, color: '#d4145a', marginBottom: 15 }} />
                <Title level={2} style={{ color: '#d4145a', margin: 0 }}>Mật Khẩu Mới</Title>
                <Text type="secondary">Nhập mật khẩu mới thật mạnh vào nhé!</Text>
            </div>

            <Form name="reset_password" onFinish={onFinish} layout="vertical" size="large">
                <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải hơn 6 ký tự!' }]}>
                    <Input.Password prefix={<LockOutlined style={{color: '#d4145a'}}/>} placeholder="Mật khẩu mới" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item name="confirm" dependencies={['password']} rules={[{ required: true, message: 'Xác nhận lại!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Mật khẩu không khớp!')); }, })]}>
                    <Input.Password prefix={<LockOutlined style={{color: '#d4145a'}}/>} placeholder="Nhập lại mật khẩu mới" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} 
                        style={{ height: 45, borderRadius: 22, background: 'linear-gradient(90deg, #d4145a, #fbb03b)', border: 'none', fontWeight: 'bold' }}>
                        LƯU MẬT KHẨU
                    </Button>
                </Form.Item>
            </Form>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;