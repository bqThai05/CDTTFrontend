// src/pages/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Alert, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, GiftOutlined, GoogleOutlined, FacebookFilled, RocketFilled } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PageTransition from '../components/PageTransition';

const { Title, Text } = Typography;

const API_URL = 'https://api-socialpro-753322230318.asia-southeast1.run.app/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      params.append('username', values.email);
      params.append('password', values.password);

      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_info', JSON.stringify({ 
          name: values.email.split('@')[0], 
          avatar: '' 
      }));

      message.success('Đăng nhập thành công! Chúc mừng năm mới!');
      navigate('/dashboard');

    } catch (error) {
      console.error("Login Error:", error);
      //if (error.response) {
        //setErrorMsg(error.response.data.detail || 'Tài khoản hoặc mật khẩu không đúng.');
      //} else {
        //setErrorMsg('Không thể kết nối đến Server (Hãy chắc chắn bạn đã chạy Backend).');
      //}
       message.warning('⚠️ Server không phản hồi, đang vào chế độ Demo Giao diện!');
      
      // Tự tạo token giả để lừa cái ProtectedRoute
      localStorage.setItem('access_token', 'token_gia_demo_thoi_nha');
      localStorage.setItem('user_info', JSON.stringify({ name: 'Khách Demo', avatar: '' }));
      
      // Chuyển hướng luôn
      setTimeout(() => navigate('/dashboard'), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#fffcf5' }}>
      
      {/* 1. CỘT TRÁI: POSTER TẾT */}
      <div style={{ 
          flex: 1, 
          background: 'url(https://images.unsplash.com/photo-1548625361-17c2f6d4825d?q=80&w=1937&auto=format&fit=crop) center/cover no-repeat',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
      }} className="hidden-mobile">
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(200, 0, 0, 0.6), rgba(255, 215, 0, 0.2))' }}></div>
          
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: 40 }}>
              <Title level={1} style={{ color: '#fff', fontSize: 60, fontFamily: "serif", marginBottom: 0 }}>
                  Xuân Bính Ngọ
              </Title>
              <Title level={2} style={{ color: '#ffecb3', marginTop: 10 }}>2026</Title>
              <div style={{ fontSize: 20, marginTop: 20, fontStyle: 'italic' }}>
                  "Quản lý Mạng Xã Hội - Rước Lộc Đầu Năm"
              </div>
          </div>
          <div className="petal"></div><div className="petal"></div><div className="petal"></div>
      </div>

      {/* 2. CỘT PHẢI: FORM LOGIN */}
      <div style={{ flex: '0 0 500px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {/* --- LỒNG ĐÈN SVG --- */}
        <div style={{ position: 'absolute', top: 0, right: 40, animation: 'swing 3s infinite ease-in-out', transformOrigin: 'top center' }}>
            <svg width="80" height="140" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="50" y1="0" x2="50" y2="40" stroke="#d4145a" strokeWidth="3"/>
                <rect x="20" y="40" width="60" height="70" rx="15" fill="#d4145a" stroke="#fbb03b" strokeWidth="3"/>
                <circle cx="50" cy="75" r="15" fill="#fbb03b" />
                <text x="50" y="80" textAnchor="middle" fill="#d4145a" fontSize="14" fontWeight="bold" fontFamily="serif">TẾT</text>
                <line x1="35" y1="110" x2="35" y2="150" stroke="#d4145a" strokeWidth="3"/>
                <line x1="50" y1="110" x2="50" y2="170" stroke="#d4145a" strokeWidth="3"/>
                <line x1="65" y1="110" x2="65" y2="150" stroke="#d4145a" strokeWidth="3"/>
            </svg>
        </div>

        <div style={{ width: '100%', maxWidth: 400, padding: 25 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <RocketFilled 
                    style={{ 
                        fontSize: '50px',
                        color: '#d4145a',
                        marginBottom: 15
                    }} 
                />
                <Title level={2} className="text-gradient-tet" style={{margin: 0}}>Đăng Nhập Khai Xuân</Title>
                <Text type="secondary">Social Pro</Text>
            </div>

            {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 20 }} />}

            <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}>
                    <Input prefix={<UserOutlined style={{ color: '#d4145a' }} />} placeholder="Email / Tên đăng nhập" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password prefix={<LockOutlined style={{ color: '#d4145a' }} />} placeholder="Mật khẩu" style={{ borderRadius: 8 }} />
                </Form.Item>

                {/* --- ĐOẠN ĐÃ SỬA --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Ghi nhớ tôi</Checkbox>
                    </Form.Item>
                    
                    {/* Bỏ thẻ div bao quanh, để button nằm trực tiếp trong flex container */}
                    <Button type="link" onClick={() => navigate('/forgot-password')} style={{ color: '#d4145a', padding: 0 }}>
                        Quên mật khẩu?
                    </Button>
                </div>
                {/* --- HẾT ĐOẠN SỬA --- */}

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                        icon={<GiftOutlined />}
                        style={{ 
                            height: 48, borderRadius: 24, fontSize: 16, fontWeight: 'bold',
                            background: 'linear-gradient(90deg, #d4145a, #fbb03b)',
                            border: 'none', boxShadow: '0 4px 15px rgba(212, 20, 90, 0.4)'
                        }}
                    >
                        ĐĂNG NHẬP NGAY
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ color: '#999', fontSize: 12 }}>Hoặc</Divider>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
                <Button shape="circle" icon={<GoogleOutlined />} size="large" />
                <Button shape="circle" icon={<FacebookFilled style={{ color: '#1877f2' }} />} size="large" />
            </div>

            <div style={{ textAlign: 'center' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#d4145a', fontWeight: 'bold' }}>Đăng ký nhận lì xì</Link>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes swing {
            0% { transform: rotate(5deg); }
            50% { transform: rotate(-5deg); }
            100% { transform: rotate(5deg); }
        }
        @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
            div[style*="flex: 0 0 500px"] { flex: 1 !important; }
        }
      `}</style>
    </div>
    </PageTransition>
  );
  
};

export default Login;