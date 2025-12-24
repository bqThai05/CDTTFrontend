import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, message, Result, Button } from 'antd';
import { acceptWorkspaceInvitation } from '../services/api';

const AcceptInvitation = () => {
  console.log('AcceptInvitation component function executed.');
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalledApi = useRef(false); // Thêm useRef để theo dõi cuộc gọi API

  useEffect(() => {
    console.log('AcceptInvitation component mounted.');
    if (hasCalledApi.current) {
      console.log('API call already initiated, skipping.');
      return; // Nếu API đã được gọi, bỏ qua
    }
    hasCalledApi.current = true; // Đánh dấu là API sắp được gọi
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token found, setting status to error.');
      setStatus('error');
      setErrorMessage('Không tìm thấy token lời mời.');
      setLoading(false);
      return;
    }

    const acceptInvitation = async () => {
      console.log('Calling acceptWorkspaceInvitation API with token...');
      try {
        await acceptWorkspaceInvitation(token);
        console.log('API call successful, setting status to success.');
        message.success('Bạn đã chấp nhận lời mời vào không gian làm việc thành công!');
        setStatus('success');
      } catch (error) {
        console.error('API call failed:', JSON.stringify(error.response?.data || error, null, 2));
        setStatus('error');
        let msg = 'Không thể chấp nhận lời mời.';
        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            msg = error.response.data.detail;
            // Check for "User not found" message
            if (msg.includes("User not found")) {
              localStorage.setItem('pendingInvitationToken', token); // Store the token
              message.info('Bạn cần đăng ký tài khoản với email đã nhận lời mời để chấp nhận lời mời này.');
              navigate('/register'); // Redirect to register page
              setLoading(false); // Stop loading
              return; // Exit early
            }
          } else if (Array.isArray(error.response.data.detail)) {
            msg = error.response.data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join('; ');
          } else {
            msg = JSON.stringify(error.response.data.detail);
          }
        }
        setErrorMessage(msg);
        message.error(msg);
      } finally {
        console.log('API call finished, setting loading to false.');
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [location, navigate]);

  const handleGoToWorkspaces = () => {
    navigate('/workspaces');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang chấp nhận lời mời...">
          <div style={{ height: '100%', width: '100%' }} /> {/* Placeholder content */}
        </Spin>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <Result
        status="success"
        title="Chấp nhận lời mời thành công!"
        subTitle="Bạn đã được thêm vào không gian làm việc."
        extra={[
          <Button type="primary" key="workspaces" onClick={handleGoToWorkspaces}>
            Đi đến Không gian làm việc
          </Button>,
        ]}
      />
    );
  }

  if (status === 'error') {
    return (
      <Result
        status="error"
        title="Chấp nhận lời mời thất bại"
        subTitle={errorMessage}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    );
  }

  return null;
};

export default AcceptInvitation;
