// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { MailOutlined, RocketFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import PageTransition from '../components/PageTransition';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Đang gửi email tới:", values.email); 
      await forgotPassword(values.email);
      message.success('🚀 Đã gửi mã xác nhận! Hãy kiểm tra hộp thư (bao gồm cả thư rác/Spam).');
      // Chuyển sang trang reset password và truyền email qua state
      navigate('/reset-password', { state: { email: values.email } });
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      
      // --- ĐOẠN CODE BẮT LỖI THÔNG MINH HƠN ---
      if (error.response) {
          // Lỗi từ Server trả về (404, 422, 400, 500...)
          const data = error.response.data;
          let serverMsg = data?.detail || data?.message;

          // Nếu detail là mảng (thường gặp ở lỗi 422 FastAPI)
          if (Array.isArray(serverMsg)) {
            serverMsg = serverMsg.map(err => `${err.loc.join('.')}: ${err.msg}`).join(' | ');
          }

          if (error.response.status === 404) {
              // Nếu Server trả 404 kèm message "User not found" -> Tức là email sai
              if (serverMsg === "User not found" || serverMsg?.includes("not found")) {
                   message.error('❌ Email này chưa được đăng ký trong hệ thống!');
              } else {
                   // Nếu 404 trơn -> Sai đường dẫn API
                   message.error('❌ Lỗi hệ thống: Sai đường dẫn API (404). Liên hệ Admin.');
              }
          } else {
              message.error(`❌ Lỗi: ${serverMsg || 'Có lỗi xảy ra'}`);
          }
      } else {
          // Lỗi mất mạng hoặc không kết nối được server
          message.error('❌ Không thể kết nối tới Server. Kiểm tra mạng!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{ 
          height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          background: '#fffcf5', padding: 20 
      }}>
        <Card style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 10px 30px rgba(212, 20, 90, 0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <RocketFilled style={{ fontSize: 40, color: '#d4145a', marginBottom: 15 }} />
                <Title level={2} style={{ color: '#d4145a', margin: 0 }}>Quên Mật Khẩu?</Title>
                <Text type="secondary">Đừng lo, nhập email để lấy lại mật khẩu nhé.</Text>
            </div>

            <Form name="forgot_password" onFinish={onFinish} layout="vertical" size="large">
                <Form.Item 
                    name="email" 
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' }, 
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined style={{color: '#d4145a'}}/>} placeholder="Nhập email của bạn" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} 
                        style={{ height: 45, borderRadius: 22, background: 'linear-gradient(90deg, #d4145a, #fbb03b)', border: 'none', fontWeight: 'bold' }}>
                        GỬI YÊU CẦU
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

export default ForgotPassword;