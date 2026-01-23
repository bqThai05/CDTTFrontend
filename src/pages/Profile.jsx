// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Avatar, Form, Input, Button, 
  Tabs, message, Typography, Tag, Spin, Upload, Tooltip, Space, Alert, Divider, Descriptions 
} from 'antd';
import { 
  UserOutlined, SaveOutlined, LockOutlined, 
  MailOutlined, PhoneOutlined, SafetyCertificateFilled,
  CheckCircleFilled, RocketFilled, CameraOutlined,
  EditOutlined, CloseOutlined, ProjectOutlined, 
  GlobalOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { 
    getCurrentUser, 
    updateUserProfile, 
    changeUserPassword,
    getWorkspaces,           // API lấy nhóm
    getAllSocialAccounts,    // API lấy tài khoản
    getRealYoutubeVideos     // API lấy video để tính KPI tháng
} from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
  // State cơ bản
  const [loading, setLoading] = useState(true); 
  const [updating, setUpdating] = useState(false); 
  const [user, setUser] = useState(null);
  
  // State chế độ Xem/Sửa
  const [isEditing, setIsEditing] = useState(false); 

  // State Thống kê (Realtime)
  const [stats, setStats] = useState({
      workspaces: 0,
      accounts: 0,
      postsThisMonth: 0
  });
  
  // State xử lý ảnh
  const [previewImage] = useState(null);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Load dữ liệu tổng hợp (User + Stats)
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Gọi song song các API để tiết kiệm thời gian
        const [userRes, wsRes, accRes, videoRes] = await Promise.allSettled([
            getCurrentUser(),
            getWorkspaces(),
            getAllSocialAccounts(),
            getRealYoutubeVideos() // Dùng API này đếm bài đăng
        ]);

        // Xử lý User
        if (userRes.status === 'fulfilled') {
            setUser(userRes.value.data);
            profileForm.setFieldsValue({
                username: userRes.value.data.username,
                email: userRes.value.data.email,
                phone_number: userRes.value.data.phone_number,
                avatar: userRes.value.data.avatar || userRes.value.data.avatar_url
            });
        }

        // Xử lý Thống kê
        let wsCount = 0, accCount = 0, postCount = 0;

        if (wsRes.status === 'fulfilled') wsCount = wsRes.value.data?.length || 0;
        if (accRes.status === 'fulfilled') accCount = accRes.value.data?.length || 0;
        
        // Tính bài đăng trong tháng hiện tại
        if (videoRes.status === 'fulfilled') {
            const currentMonth = dayjs().format('YYYY-MM');
            const videos = videoRes.value.data || [];
            // Lọc video có ngày tạo trùng tháng hiện tại
            postCount = videos.filter(v => dayjs(v.created_at || v.published_at).format('YYYY-MM') === currentMonth).length;
        }

        setStats({ workspaces: wsCount, accounts: accCount, postsThisMonth: postCount });

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        message.error("Có lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [profileForm]); // Thêm profileForm vào dependency

  // 2. Xử lý chọn ảnh (Tạm thời vô hiệu hóa upload trực tiếp nếu backend chỉ nhận URL)
  const handleAvatarChange = () => {
    message.info('Vui lòng nhập URL ảnh vào ô "URL Ảnh đại diện" bên dưới để cập nhật.');
    setIsEditing(true);
  };

  // 3. Xử lý cập nhật thông tin
  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
      const updateData = {
        username: values.username,
        phone_number: values.phone_number,
        avatar: values.avatar, // Gửi URL ảnh đại diện
      };

      await updateUserProfile(updateData);
      message.success('Cập nhật hồ sơ thành công!');
      
      // Cập nhật state local
      setUser(prev => ({ ...prev, ...updateData }));
      
      // Cập nhật localStorage để đồng bộ UI (ví dụ Avatar ở Sidebar/Header)
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      localStorage.setItem('user_info', JSON.stringify({
          ...userInfo,
          name: updateData.username,
          avatar: updateData.avatar
      }));

      setIsEditing(false); // Tắt chế độ sửa sau khi lưu thành công
      
    } catch (error) {
      message.error(error.response?.data?.detail || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setUpdating(false);
    }
  };

  // 4. Xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
        return message.error('Mật khẩu xác nhận không khớp!');
    }
    setUpdating(true);
    try {
        await changeUserPassword({
            current_password: values.currentPassword,
            new_password: values.newPassword
        });
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        passwordForm.resetFields();
        setTimeout(() => {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }, 1500);
    } catch (error) {
        message.error(error.response?.data?.detail || 'Mật khẩu cũ không đúng.');
    } finally {
        setUpdating(false);
    }
  };

  const avatarUrlInForm = Form.useWatch('avatar', profileForm);
  const displayAvatar = previewImage || avatarUrlInForm || (user?.avatar_url || user?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`;

  if (loading) return (
    <div style={{textAlign: 'center', padding: 100}}>
       <Spin size="large"><div style={{marginTop: 20}}>Đang tải dữ liệu...</div></Spin>
    </div>
  );

  // --- GIAO DIỆN XEM (READ-ONLY) ---
  const GeneralInfoView = () => (
      <div style={{ padding: '10px 0' }}>
          <Descriptions column={1} bordered size="middle" styles={{ label: { width: '180px', fontWeight: '600' } }}>
              <Descriptions.Item label="Tên hiển thị">
                  <span style={{fontSize: 16}}>{user?.username}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Email đăng nhập">
                  {user?.email} <Tag color="blue" style={{marginLeft: 8}}>Đã xác minh</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                  {user?.phone_number || <span style={{color: '#999', fontStyle: 'italic'}}>Chưa cập nhật</span>}
              </Descriptions.Item>
              <Descriptions.Item label="URL Avatar">
                  {user?.avatar || user?.avatar_url ? (
                      <a href={user?.avatar || user?.avatar_url} target="_blank" rel="noopener noreferrer" style={{wordBreak: 'break-all'}}>
                          {user?.avatar || user?.avatar_url}
                      </a>
                  ) : (
                      <span style={{color: '#999', fontStyle: 'italic'}}>Chưa cập nhật</span>
                  )}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                  <Tag color="purple">Administrator</Tag>
              </Descriptions.Item>
          </Descriptions>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  Chỉnh sửa thông tin
              </Button>
          </div>
      </div>
  );

  // --- GIAO DIỆN SỬA (EDIT FORM) ---
  const GeneralInfoEdit = () => (
    <Form 
        form={profileForm} 
        layout="vertical" 
        onFinish={handleUpdateProfile}
        size="large"
    >
        <Row gutter={24}>
            <Col span={12}>
                <Form.Item label="Tên hiển thị (Username)" name="username" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                    <Input prefix={<UserOutlined style={{color:'#1890ff'}}/>} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="Số điện thoại" name="phone_number">
                    <Input prefix={<PhoneOutlined style={{color:'#1890ff'}}/>} placeholder="Chưa cập nhật" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label="URL Ảnh đại diện" name="avatar">
                    <Input prefix={<CameraOutlined style={{color:'#1890ff'}}/>} placeholder="Nhập link URL ảnh (ví dụ: Cloud Storage, Google Drive...)" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label="Email đăng nhập (Không thể sửa)" name="email">
                    <Input prefix={<MailOutlined />} disabled style={{ color: '#666', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                </Form.Item>
            </Col>
        </Row>

        <div style={{ marginTop: 10, textAlign: 'right' }}>
             <Space>
                <Button icon={<CloseOutlined />} onClick={() => { setIsEditing(false); profileForm.resetFields(); }}>
                    Hủy bỏ
                </Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating}>
                    Lưu thay đổi
                </Button>
             </Space>
        </div>
    </Form>
  );

  // --- TAB BẢO MẬT ---
  const SecurityTab = () => (
    <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} size="large">
        <div style={{ background: '#fff1f0', padding: '12px 16px', borderRadius: 8, marginBottom: 24, border: '1px solid #ffccc7' }}>
            <Text type="danger" strong><SafetyCertificateFilled /> Khu vực nhạy cảm</Text>
            <div style={{fontSize: 13, color: '#666'}}>Đổi mật khẩu sẽ đăng xuất bạn khỏi tất cả các thiết bị.</div>
        </div>
        <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="confirmPassword" label="Nhập lại" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error('Không khớp!')); }, })]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận" />
                </Form.Item>
            </Col>
        </Row>
        <div style={{ textAlign: 'right' }}>
            <Button type="primary" danger htmlType="submit" size="large" loading={updating}>Đổi mật khẩu</Button>
        </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      
      {/* 1. HEADER & COVER */}
      <div style={{ marginBottom: 40, position: 'relative' }}>
          <div style={{ height: 200, background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', borderRadius: '16px 16px 0 0', position: 'relative' }}>
          </div>

          <Card variant="borderless" style={{ marginTop: -60, marginLeft: 24, marginRight: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <Row align="middle" gutter={24}>
                  <Col flex="140px" style={{ position: 'relative' }}>
                      <div style={{ marginTop: -80, padding: 4, background: '#fff', borderRadius: '50%', display: 'inline-block' }}>
                          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange} accept="image/*">
                              <Tooltip title="Nhấn để đổi Avatar">
                                <div style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', overflow: 'hidden', width: 128, height: 128 }}>
                                    <Avatar size={128} src={displayAvatar} style={{ border: '1px solid #f0f0f0', display: 'block' }} />
                                    <div className="avatar-overlay" style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s'
                                    }}>
                                        <CameraOutlined style={{ color: '#fff', fontSize: 24 }} />
                                    </div>
                                    <style>{`.avatar-overlay:hover { opacity: 1 !important; }`}</style>
                                </div>
                              </Tooltip>
                          </Upload>
                      </div>
                  </Col>
                  <Col flex="auto">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                          <div>
                              <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {user?.username}
                                  {user?.is_verified && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 20 }} />}
                              </Title>
                              <Text type="secondary" style={{ fontSize: 15 }}>{user?.email}</Text>
                              <div style={{ marginTop: 8 }}>
                                  <Tag color="purple">Thành viên Pro</Tag>
                                  <Tag color="default">Tham gia: {dayjs(user?.created_at).format('YYYY') || '2025'}</Tag>
                              </div>
                          </div>
                      </div>
                  </Col>
              </Row>
          </Card>
      </div>
      
      {/* 2. NỘI DUNG CHÍNH */}
      <Row gutter={24}>
        {/* CỘT TRÁI: THỐNG KÊ (ĐÃ KẾT NỐI API THẬT) */}
        <Col xs={24} md={8}>
            <Card title="Thống kê hoạt động" style={{ borderRadius: 12, marginBottom: 24 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems:'center' }}>
                    <Space><ProjectOutlined style={{color: '#faad14'}}/> <Text type="secondary">Workspace</Text></Space>
                    <Text strong style={{fontSize: 16}}>{stats.workspaces}</Text>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems:'center' }}>
                    <Space><GlobalOutlined style={{color: '#1890ff'}}/> <Text type="secondary">Tài khoản kết nối</Text></Space>
                    <Text strong style={{fontSize: 16}}>{stats.accounts}</Text>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                    <Space><VideoCameraOutlined style={{color: '#52c41a'}}/> <Text type="secondary">Video tháng này</Text></Space>
                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>+{stats.postsThisMonth}</Text>
                 </div>
                 <Divider />
                 <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>
                    ID Người dùng: <Tag>{user?.id}</Tag>
                 </div>
            </Card>
        </Col>

        {/* CỘT PHẢI: FORM THÔNG TIN (XEM / SỬA) */}
        <Col xs={24} md={16}>
             <Card 
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
             >
                <Tabs defaultActiveKey="1" items={[
                    { 
                        key: '1', 
                        label: <span><UserOutlined /> Thông tin cá nhân</span>, 
                        children: isEditing ? <GeneralInfoEdit /> : <GeneralInfoView /> // <-- SWITCH GIỮA XEM VÀ SỬA
                    },
                    { 
                        key: '2', 
                        label: <span><SafetyCertificateFilled /> Bảo mật</span>, 
                        children: <SecurityTab /> 
                    }
                ]} />
             </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;