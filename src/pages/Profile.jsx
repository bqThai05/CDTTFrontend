// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Avatar, Form, Input, Button, 
  Tabs, message, Typography, Tag, Spin, Upload, Tooltip, Space, Divider, Descriptions, theme 
} from 'antd';
import { 
  UserOutlined, SaveOutlined, LockOutlined, 
  MailOutlined, PhoneOutlined, SafetyCertificateFilled,
  CheckCircleFilled, CameraOutlined,
  EditOutlined, CloseOutlined, ProjectOutlined, 
  GlobalOutlined, VideoCameraOutlined, UploadOutlined, LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { 
    getCurrentUser, 
    updateUserProfile, 
    changeUserPassword,
    getWorkspaces,           
    getAllSocialAccounts,    
    getRealYoutubeVideos,
} from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
  const { token } = theme.useToken(); // Lấy token màu cho Dark Mode
  const [loading, setLoading] = useState(true); 
  const [updating, setUpdating] = useState(false); 
  
  // State upload ảnh
  const [avatarLoading, setAvatarLoading] = useState(false); 

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 

  const [stats, setStats] = useState({
      workspaces: 0,
      accounts: 0,
      postsThisMonth: 0
  });
  
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Load dữ liệu
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [userRes, wsRes, accRes, videoRes] = await Promise.allSettled([
            getCurrentUser(),
            getWorkspaces(),
            getAllSocialAccounts(),
            getRealYoutubeVideos()
        ]);

        if (userRes.status === 'fulfilled') {
            setUser(userRes.value.data);
            profileForm.setFieldsValue({
                username: userRes.value.data.username,
                email: userRes.value.data.email,
                phone_number: userRes.value.data.phone_number,
                avatar: userRes.value.data.avatar || userRes.value.data.avatar_url
            });
        }

        let wsCount = 0, accCount = 0, postCount = 0;
        if (wsRes.status === 'fulfilled') wsCount = wsRes.value.data?.length || 0;
        if (accRes.status === 'fulfilled') accCount = accRes.value.data?.length || 0;
        if (videoRes.status === 'fulfilled') {
            const currentMonth = dayjs().format('YYYY-MM');
            const videos = videoRes.value.data || [];
            postCount = videos.filter(v => dayjs(v.created_at || v.published_at).format('YYYY-MM') === currentMonth).length;
        }

        setStats({ workspaces: wsCount, accounts: accCount, postsThisMonth: postCount });

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [profileForm]);

  // --- HÀM XỬ LÝ UPLOAD ẢNH (Hiển thị ngay lập tức) ---
  const handleFakeUpload = async ({ file, onSuccess }) => {
    setAvatarLoading(true);
    setTimeout(() => {
        // 1. Tạo URL giả từ file trong máy để hiển thị preview
        const fakeUrl = URL.createObjectURL(file);
        
        // 2. Điền vào ô Input
        profileForm.setFieldsValue({ avatar: fakeUrl });
        
        // 3. Cập nhật Avatar hiển thị ngay lập tức
        setUser(prev => ({ ...prev, avatar: fakeUrl }));
        
        // 4. Bật chế độ edit để người dùng thấy thay đổi
        setIsEditing(true);

        message.success('Đã tải ảnh lên thành công!');
        setAvatarLoading(false);
        onSuccess("Ok");
    }, 1000);
  };

  // Cập nhật thông tin
  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
      const updateData = {
        username: values.username,
        phone_number: values.phone_number,
        avatar: values.avatar, 
      };

      await updateUserProfile(updateData);
      message.success('Cập nhật hồ sơ thành công!');
      
      setUser(prev => ({ ...prev, ...updateData }));
      
      // Lưu vào localStorage
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      localStorage.setItem('user_info', JSON.stringify({
          ...userInfo,
          name: updateData.username,
          avatar: updateData.avatar
      }));

      setIsEditing(false);
    } catch (error) {
      message.error(error.response?.data?.detail || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setUpdating(false);
    }
  };

  // Đổi mật khẩu
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
  const displayAvatar = avatarUrlInForm || (user?.avatar_url || user?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`;

  if (loading) return (
    <div style={{textAlign: 'center', padding: 100}}>
       <Spin size="large"><div style={{marginTop: 20}}>Đang tải dữ liệu...</div></Spin>
    </div>
  );

  // --- GIAO DIỆN XEM ---
  const GeneralInfoView = () => (
      <div style={{ padding: '10px 0' }}>
          <Descriptions column={1} bordered size="middle" styles={{ label: { width: '180px', fontWeight: '600', color: token.colorText } }}>
              <Descriptions.Item label="Tên hiển thị">
                  <span style={{fontSize: 16, color: token.colorText}}>{user?.username}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Email đăng nhập">
                  <span style={{color: token.colorText}}>{user?.email}</span> <Tag color="blue" style={{marginLeft: 8}}>Đã xác minh</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                  {user?.phone_number ? <span style={{color: token.colorText}}>{user.phone_number}</span> : <span style={{color: token.colorTextSecondary, fontStyle: 'italic'}}>Chưa cập nhật</span>}
              </Descriptions.Item>
              <Descriptions.Item label="URL Avatar">
                  <Text ellipsis style={{maxWidth: 300, color: token.colorText}}>{user?.avatar || 'Mặc định'}</Text>
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

  // --- GIAO DIỆN SỬA ---
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
            
            {/* --- PHẦN UPLOAD ẢNH --- */}
            <Col span={24}>
                <Form.Item label="Ảnh đại diện" required tooltip="Nhập link hoặc tải ảnh lên">
                    <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="avatar" noStyle>
                             <Input prefix={<CameraOutlined style={{color:'#1890ff'}}/>} placeholder="Link ảnh..." />
                        </Form.Item>
                        <Upload 
                            customRequest={handleFakeUpload} 
                            showUploadList={false} 
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Tải lên</Button>
                        </Upload>
                    </Space.Compact>
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Email đăng nhập (Không thể sửa)" name="email">
                    <Input prefix={<MailOutlined />} disabled style={{ color: token.colorTextSecondary, backgroundColor: token.colorFillAlter, cursor: 'not-allowed' }} />
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

  // --- TAB BẢO MẬT (Đã gắn hàm handleChangePassword) ---
  const SecurityTab = () => (
    <Form 
        form={passwordForm} 
        layout="vertical" 
        onFinish={handleChangePassword} // <--- ĐÃ GẮN HÀM VÀO ĐÂY
        size="large"
    >
        <div style={{ background: token.colorErrorBg, padding: '12px 16px', borderRadius: 8, marginBottom: 24, border: `1px solid ${token.colorErrorBorder}` }}>
            <Text type="danger" strong><SafetyCertificateFilled /> Khu vực nhạy cảm</Text>
            <div style={{fontSize: 13, color: token.colorText}}>Đổi mật khẩu sẽ đăng xuất bạn khỏi tất cả các thiết bị.</div>
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

          <Card variant="borderless" style={{ 
              marginTop: -60, marginLeft: 24, marginRight: 24, 
              borderRadius: 16, boxShadow: token.boxShadowTertiary,
              background: token.colorBgContainer // Sửa Darkmode
          }}>
              <Row align="middle" gutter={24}>
                  <Col flex="140px" style={{ position: 'relative' }}>
                      <div style={{ marginTop: -80, padding: 4, background: token.colorBgContainer, borderRadius: '50%', display: 'inline-block' }}>
                          <Tooltip title="Nhấn chỉnh sửa để đổi ảnh">
                            <div style={{ position: 'relative', borderRadius: '50%', overflow: 'hidden', width: 128, height: 128 }}>
                                {avatarLoading ? (
                                    <div style={{width:'100%', height:'100%', background: token.colorFillAlter, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <LoadingOutlined style={{fontSize: 24, color: '#1890ff'}} />
                                    </div>
                                ) : (
                                    <Avatar size={128} src={displayAvatar} style={{ border: `1px solid ${token.colorBorderSecondary}`, display: 'block' }} />
                                )}
                            </div>
                          </Tooltip>
                      </div>
                  </Col>
                  <Col flex="auto">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                          <div>
                              <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: token.colorText }}>
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
        <Col xs={24} md={8}>
            <Card title="Thống kê hoạt động" style={{ borderRadius: 12, marginBottom: 24, background: token.colorBgContainer, boxShadow: token.boxShadowTertiary }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems:'center' }}>
                    <Space><ProjectOutlined style={{color: '#faad14'}}/> <Text type="secondary">Workspace</Text></Space>
                    <Text strong style={{fontSize: 16, color: token.colorText}}>{stats.workspaces}</Text>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems:'center' }}>
                    <Space><GlobalOutlined style={{color: '#1890ff'}}/> <Text type="secondary">Tài khoản kết nối</Text></Space>
                    <Text strong style={{fontSize: 16, color: token.colorText}}>{stats.accounts}</Text>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                    <Space><VideoCameraOutlined style={{color: '#52c41a'}}/> <Text type="secondary">Video tháng này</Text></Space>
                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>+{stats.postsThisMonth}</Text>
                 </div>
                 <Divider />
                 <div style={{ textAlign: 'center', color: token.colorTextSecondary, fontSize: 12 }}>
                    ID Người dùng: <Tag>{user?.id}</Tag>
                 </div>
            </Card>
        </Col>

        <Col xs={24} md={16}>
             <Card style={{ borderRadius: 12, boxShadow: token.boxShadowTertiary, background: token.colorBgContainer }}>
                <Tabs defaultActiveKey="1" items={[
                    { 
                        key: '1', 
                        label: <span><UserOutlined /> Thông tin cá nhân</span>, 
                        children: isEditing ? <GeneralInfoEdit /> : <GeneralInfoView />
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