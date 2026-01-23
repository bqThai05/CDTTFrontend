// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { LockOutlined, RocketFilled, MailOutlined, NumberOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { resetPassword } from '../services/api';
import PageTransition from '../components/PageTransition';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Lấy email từ state nếu được chuyển từ trang ForgotPassword
  const initialEmail = location.state?.email || '';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await resetPassword({
        email: values.email,
        code: values.code,
        new_password: values.password,
      });

      message.success('🎉 Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Mã xác nhận không chính xác hoặc đã hết hạn.';
      message.error(`❌ Thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffcf5', padding: 20 }}>
        <Card style={{ width: '100%', maxWidth: 450, borderRadius: 16, boxShadow: '0 10px 30px rgba(212, 20, 90, 0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <RocketFilled style={{ fontSize: 40, color: '#d4145a', marginBottom: 15 }} />
                <Title level={2} style={{ color: '#d4145a', margin: 0 }}>Đặt Lại Mật Khẩu</Title>
                <Text type="secondary">Nhập mã xác nhận đã được gửi tới email của bạn.</Text>
            </div>

            <Form 
              name="reset_password" 
              onFinish={onFinish} 
              layout="vertical" 
              size="large"
              initialValues={{ email: initialEmail }}
            >
                <Form.Item 
                  name="email" 
                  label="Email"
                  rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                >
                    <Input prefix={<MailOutlined style={{color: '#d4145a'}}/>} placeholder="Email của bạn" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item 
                  name="code" 
                  label="Mã xác nhận"
                  rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }, { len: 6, message: 'Mã xác nhận gồm 6 chữ số!' }]}
                >
                    <Input prefix={<NumberOutlined style={{color: '#d4145a'}}/>} placeholder="123456" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item 
                  name="password" 
                  label="Mật khẩu mới"
                  rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }]}
                >
                    <Input.Password prefix={<LockOutlined style={{color: '#d4145a'}}/>} placeholder="Mật khẩu mới" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item 
                  name="confirm" 
                  label="Xác nhận mật khẩu"
                  dependencies={['password']} 
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' }, 
                    ({ getFieldValue }) => ({ 
                      validator(_, value) { 
                        if (!value || getFieldValue('password') === value) return Promise.resolve(); 
                        return Promise.reject(new Error('Mật khẩu không khớp!')); 
                      }, 
                    })
                  ]}
                >
                    <Input.Password prefix={<LockOutlined style={{color: '#d4145a'}}/>} placeholder="Nhập lại mật khẩu mới" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} 
                        style={{ height: 45, borderRadius: 22, background: 'linear-gradient(90deg, #d4145a, #fbb03b)', border: 'none', fontWeight: 'bold' }}>
                        ĐẶT LẠI MẬT KHẨU
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Button type="link" onClick={() => navigate('/login')} icon={<ArrowLeftOutlined />} style={{ color: '#666' }}>
                        Quay lại Đăng nhập
                    </Button>
                </div>
            </Form>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;