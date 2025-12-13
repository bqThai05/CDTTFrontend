import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, verifyEmail } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);
  const [verifyForm] = Form.useForm();

  useEffect(() => {
    if (showVerificationForm && registeredEmail) {
      verifyForm.setFieldsValue({ email: registeredEmail });
    }
  }, [showVerificationForm, registeredEmail, verifyForm]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Backend thường dùng endpoint này để tạo user mới
      // Payload phải khớp với UserCreate schema trong backend
      const payload = {
        email: values.email,
        username: values.username,
        phone_number: values.phone_number,
        password: values.password
      };

      await registerUser(payload);

      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.');
      setRegisteredEmail(values.email);
      setShowVerificationForm(true);

    } catch (error) {
      console.error(error);
      let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          if (Array.isArray(error.response.data.detail)) {
            errorMsg = error.response.data.detail.map(err => err.msg).join('; ');
          } else {
            errorMsg = error.response.data.detail;
          }
        } else if (typeof error.response.data.message === 'string') {
          errorMsg = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        }
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
      if (!email) {
        message.error('Không tìm thấy email để xác minh. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      const verificationCode = submittedOtp; // Sử dụng OTP được truyền vào
      if (verificationCode.length !== 6) {
        message.error('Vui lòng nhập đủ 6 chữ số mã xác minh!');
        setLoading(false);
        return;
      }

      const payload = {
        email: email,
        code: verificationCode,
      };
      await verifyEmail(payload);
      message.success('Xác minh email thành công! Bạn có thể đăng nhập ngay bây giờ.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      let errorMsg = 'Xác minh email thất bại. Vui lòng thử lại.';
      if (error.response && error.response.data) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(err => err.msg).join('; ');
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (typeof error.response.data.message === 'string') {
          errorMsg = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        }
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return; // Chỉ chấp nhận số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển focus
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Tự động gửi khi nhập đủ 6 số
    if (newOtp.join('').length === 6) {
      handleVerifyEmail(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Di chuyển focus về ô trước đó khi nhấn Backspace và ô hiện tại trống
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
      background: 'linear-gradient(135deg, #001529 0%, #00417a 100%)' 
    }}>
      <Card 
        title={<div style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold'}}>{showVerificationForm ? 'XÁC MINH EMAIL' : 'ĐĂNG KÝ TÀI KHOẢN'}</div>} 
        style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      >
        {!showVerificationForm ? (
          <Form name="register_form" onFinish={onFinish} layout="vertical" size="large">
            
            <Form.Item
              name="email"
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="phone_number"
              rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Số điện thoại" />
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
        ) : (
          <Form name="verify_form" form={verifyForm} layout="vertical" size="large">
            <Alert
              title="Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam)."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            <Form.Item
              name="email"
            >
              <Input prefix={<MailOutlined />} placeholder="Email" disabled />
            </Form.Item>
            <Form.Item label="Mã xác minh (6 chữ số)">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    value={digit}
                    maxLength={1}
                    onChange={e => handleChange(e, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    style={{ width: '40px', textAlign: 'center', fontSize: '18px' }}
                  />
                ))}
              </div>
            </Form.Item>

            <div style={{textAlign: 'center'}}>
              <Button type="link" onClick={() => setShowVerificationForm(false)}>Quay lại đăng ký</Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Register;