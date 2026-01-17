// src/pages/Register.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined, RocketFilled } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, verifyEmail, acceptWorkspaceInvitation } from '../services/api';
import PageTransition from '../components/PageTransition';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);
  const [verifyForm] = Form.useForm();
  const [pendingInvitationToken, setPendingInvitationToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('pendingInvitationToken');
    if (token) setPendingInvitationToken(token);
    if (showVerificationForm && registeredEmail) {
      verifyForm.setFieldsValue({ email: registeredEmail });
    }
  }, [showVerificationForm, registeredEmail, verifyForm]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        username: values.username,
        full_name: values.username, 
        phone_number: values.phone_number,
        password: values.password
      };
      await registerUser(payload);
      message.success('🧧 Đăng ký thành công! Nhập OTP để nhận lì xì nhé.');
      setRegisteredEmail(values.email);
      setShowVerificationForm(true);

      if (pendingInvitationToken) {
        try {
          await acceptWorkspaceInvitation(pendingInvitationToken);
          localStorage.removeItem('pendingInvitationToken');
        } catch (e) { console.error(e); }
      }
    } catch (error) {
      let errorMsg = 'Đăng ký thất bại.';
      if (error.response?.data?.detail) {
         errorMsg = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map(err => err.msg).join('; ')
          : error.response.data.detail;
      } else if (error.response?.status === 500) {
        errorMsg = 'Lỗi hệ thống (500). Vui lòng thử lại sau hoặc liên hệ Admin.';
      } else if (typeof error.response?.data?.message === 'string') {
        errorMsg = error.response.data.message;
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (submittedOtp) => {
    setLoading(true);
    try {
      const email = verifyForm.getFieldValue('email');
      await verifyEmail({ email, code: submittedOtp });
      message.success('🎉 Xác minh thành công! Đăng nhập ngay.');
      navigate('/login');
    } catch {
      message.error('Mã xác minh không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
    if (newOtp.join('').length === 6) handleVerifyEmail(newOtp.join(''));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1].focus();
  };

  return (
    <PageTransition>
      <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#fffcf5' }}>
        
        {/* CỘT TRÁI (Giữ nguyên) */}
        <div style={{ 
            flex: 1, 
            background: 'url(https://images.unsplash.com/photo-1516013069176-79c88554236a?q=80&w=1887&auto=format&fit=crop) center/cover no-repeat',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
        }} className="hidden-mobile">
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(200, 0, 0, 0.5), rgba(255, 215, 0, 0.1))' }}></div>
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: 40 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 50, fontFamily: "serif", marginBottom: 10 }}>
                    Gia Nhập Social Pro
                </Title>
                <div style={{ fontSize: 18, fontStyle: 'italic', maxWidth: 400 }}>
                    "Khởi đầu năm mới với công cụ quản lý mạng xã hội đỉnh cao"
                </div>
            </div>
            <div className="petal"></div><div className="petal"></div><div className="petal"></div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG KÝ */}
        <div style={{ flex: '0 0 550px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflowY: 'auto' }}>
          
          <div style={{ position: 'absolute', top: 0, right: 30, animation: 'swing 3s infinite ease-in-out', transformOrigin: 'top center', zIndex: 10 }}>
              <svg width="60" height="100" viewBox="0 0 100 180" fill="none">
                  <line x1="50" y1="0" x2="50" y2="40" stroke="#d4145a" strokeWidth="3"/>
                  <rect x="20" y="40" width="60" height="70" rx="15" fill="#d4145a" stroke="#fbb03b" strokeWidth="3"/>
                  <circle cx="50" cy="75" r="15" fill="#fbb03b" />
                  <text x="50" y="80" textAnchor="middle" fill="#d4145a" fontSize="14" fontWeight="bold">LỘC</text>
                  <line x1="35" y1="110" x2="35" y2="150" stroke="#d4145a" strokeWidth="3"/>
                  <line x1="50" y1="110" x2="50" y2="170" stroke="#d4145a" strokeWidth="3"/>
                  <line x1="65" y1="110" x2="65" y2="150" stroke="#d4145a" strokeWidth="3"/>
              </svg>
          </div>

          <div style={{ width: '100%', maxWidth: 420, padding: '40px 25px' }}>
              <div style={{ textAlign: 'center', marginBottom: 25 }}>
                  <RocketFilled style={{ fontSize: '50px', color: '#d4145a', marginBottom: 15 }} />
                  <Title level={2} className="text-gradient-tet" style={{margin: 0}}>
                      {showVerificationForm ? 'Xác Minh OTP' : 'Đăng Ký Tài Khoản'}
                  </Title>
                  <Text type="secondary">{showVerificationForm ? 'Nhập mã 6 số gửi về Email' : 'Điền thông tin để nhận ưu đãi Tết'}</Text>
              </div>

              {!showVerificationForm ? (
                  <Form name="register_form" onFinish={onFinish} layout="vertical" size="large">
                      <Form.Item name="email" rules={[{ required: true, message: 'Nhập email!' }, { type: 'email', message: 'Email sai rồi!' }]} style={{marginBottom: 15}}>
                          <Input prefix={<MailOutlined style={{color:'#d4145a'}}/>} placeholder="Email" style={{borderRadius: 8}}/>
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 10 }}>
                          <Form.Item name="username" rules={[{ required: true, message: 'Nhập username!' }]} style={{flex: 1, marginBottom: 15}}>
                              <Input prefix={<UserOutlined style={{color:'#d4145a'}}/>} placeholder="Username" style={{borderRadius: 8}}/>
                          </Form.Item>
                          <Form.Item name="phone_number" rules={[{ required: true, message: 'Nhập SĐT!' }]} style={{flex: 1, marginBottom: 15}}>
                              <Input prefix={<PhoneOutlined style={{color:'#d4145a'}}/>} placeholder="Số ĐT" style={{borderRadius: 8}}/>
                          </Form.Item>
                      </div>

                      {/* --- PHẦN BẮT LỖI MẬT KHẨU MỚI --- */}
                      <Form.Item 
                        name="password" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 10, message: 'Mật khẩu phải từ 10 ký tự trở lên!' },
                            { 
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/,
                                message: 'Mật khẩu phải có chữ Hoa, chữ thường và ký tự đặc biệt!' 
                            }
                        ]} 
                        style={{marginBottom: 15}}
                        hasFeedback
                      >
                          <Input.Password prefix={<LockOutlined style={{color:'#d4145a'}}/>} placeholder="Mật khẩu" style={{borderRadius: 8}}/>
                      </Form.Item>

                      <Form.Item 
                        name="confirm" 
                        dependencies={['password']} 
                        hasFeedback 
                        rules={[
                            { required: true, message: 'Xác nhận lại!' }, 
                            ({ getFieldValue }) => ({ validator(_, value) { 
                                if (!value || getFieldValue('password') === value) return Promise.resolve(); 
                                return Promise.reject(new Error('Mật khẩu không khớp!')); 
                            }, })
                        ]} 
                        style={{marginBottom: 25}}
                      >
                          <Input.Password prefix={<LockOutlined style={{color:'#d4145a'}}/>} placeholder="Nhập lại mật khẩu" style={{borderRadius: 8}}/>
                      </Form.Item>

                      <Form.Item>
                          <Button type="primary" htmlType="submit" block loading={loading} icon={<RocketFilled />}
                              style={{ 
                                  height: 48, borderRadius: 24, fontSize: 16, fontWeight: 'bold',
                                  background: 'linear-gradient(90deg, #d4145a, #fbb03b)', border: 'none'
                              }}>
                              ĐĂNG KÝ NGAY
                          </Button>
                      </Form.Item>
                      
                      <div style={{textAlign: 'center'}}>
                          Đã có tài khoản? <Link to="/login" style={{color:'#d4145a', fontWeight:'bold'}}>Đăng nhập ngay</Link>
                      </div>
                  </Form>
              ) : (
                  <div style={{ animation: 'fadeIn 0.5s' }}>
                      <Alert message="Đã gửi mã OTP! Kiểm tra cả mục Spam nhé." type="success" showIcon style={{ marginBottom: 20 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 30 }}>
                          {otp.map((digit, index) => (
                          <Input key={index} ref={el => inputRefs.current[index] = el} value={digit} maxLength={1} onChange={e => handleChange(e, index)} onKeyDown={e => handleKeyDown(e, index)}
                              style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#d4145a', border: '2px solid #ffecb3', borderRadius: 10 }} />
                          ))}
                      </div>
                      <Button type="link" onClick={() => setShowVerificationForm(false)} icon={<ArrowLeftOutlined />} style={{ display: 'block', margin: '0 auto', color: '#666' }}>
                          Quay lại sửa Email
                      </Button>
                  </div>
              )}
          </div>
        </div>
        
        <style>{`
          @keyframes swing { 0% { transform: rotate(5deg); } 50% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) {
              .hidden-mobile { display: none !important; }
              div[style*="flex: 0 0 550px"] { flex: 1 !important; }
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default Register;