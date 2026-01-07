// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Avatar, Typography, Button, List, Tag, Modal, Spin } from 'antd';
import { 
  ArrowUpOutlined, 
  YoutubeFilled, 
  FacebookFilled, 
  EyeOutlined,
  UsergroupAddOutlined,
  LikeOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom'; 

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate(); 

  // Dữ liệu mẫu (State)
  const [accounts,] = useState({
    youtube: [
      { id: 1, name: 'Review Công Nghệ Z', email: 'techz@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', sub: 125000, views: 1200000 },
      { id: 2, name: 'Vlog Đời Sống', email: 'vlog.life@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', sub: 12000, views: 45000 },
    ],
    facebook: [
      { id: 4, name: 'Shop Quần Áo Nam', email: 'menshop@fb.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', sub: 45000, views: 850000 },
    ]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tính toán số liệu
  const allAccounts = [...accounts.youtube, ...accounts.facebook];
  const totalViews = allAccounts.reduce((sum, acc) => sum + acc.views, 0);
  const totalSubs = allAccounts.reduce((sum, acc) => sum + acc.sub, 0);
  const totalAccounts = allAccounts.length;

  // --- HÀM XỬ LÝ KẾT NỐI (ĐÃ SỬA LẠI HOÀN TOÀN) ---
  const handleConnect = (platform) => {
    // 1. Đóng Modal trước
    setIsModalOpen(false); 

    // 2. Kiểm tra nền tảng để chuyển hướng
    if (platform === 'youtube') {
        navigate('/youtube-integration'); // Chuyển sang trang YouTube
    } else if (platform === 'facebook') {
        navigate('/facebook-integration'); // Chuyển sang trang Facebook
    }
  };

  // Dữ liệu biểu đồ
  const chartData = [
    { name: 'T2', views: 45000 }, { name: 'T3', views: 52000 }, { name: 'T4', views: 49000 },
    { name: 'T5', views: 61000 }, { name: 'T6', views: 58000 }, { name: 'T7', views: 72000 },
    { name: 'CN', views: 85000 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      
      {/* PHẦN 1: THẺ SỐ LIỆU TỔNG QUAN */}
      <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Tổng lượt xem" value={totalViews} prefix={<EyeOutlined />} valueStyle={{ color: '#3f8600' }} />
                    <div style={{ color: 'green', marginTop: 8 }}><ArrowUpOutlined /> +12% tuần này</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Tổng người theo dõi" value={totalSubs} prefix={<UsergroupAddOutlined />} valueStyle={{ color: '#1677ff' }} />
                    <div style={{ color: 'green', marginTop: 8 }}><ArrowUpOutlined /> +{totalAccounts} kênh</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Tổng bài đăng" value={1240} prefix={<VideoCameraOutlined />} />
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Đã đăng trên {totalAccounts} tài khoản</Text>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Tương tác TB" value="8.2%" prefix={<LikeOutlined />} valueStyle={{ color: '#cf1322' }} />
                     <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Ổn định</Text>
                </Card>
            </Col>
          </Row>
      </div>

      {/* PHẦN 2: CHIA CỘT */}
      <Row gutter={[24, 24]}>
          
          {/* CỘT TRÁI: QUẢN LÝ TÀI KHOẢN */}
          <Col xs={24} lg={8}>
              <Card 
                title={<div style={{display:'flex', alignItems:'center', gap: 10}}><SettingOutlined /> Quản lý tài khoản</div>}
                variant="borderless" 
                style={{ borderRadius: 12, height: '100%', overflow: 'hidden' }}
                styles={{ body: { padding: 0, background: '#f5f5f5' } }}
                extra={
                    <Button 
                        type="link" 
                        size="small" 
                        icon={<PlusCircleOutlined />} 
                        onClick={() => setIsModalOpen(true)} // Mở Modal khi bấm Thêm
                        style={{ fontWeight: 'bold' }}
                    >
                        Thêm
                    </Button>
                }
              >
                  {/* List YouTube */}
                  <div style={{ background: '#e6f7ff', padding: '10px 16px', borderBottom: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#ff0000', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <YoutubeFilled style={{ fontSize: 20 }} /> YOUTUBE
                      </span>
                      <Tag color="red">{accounts.youtube.length}</Tag>
                  </div>
                  <div style={{ background: '#fff' }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={accounts.youtube}
                        renderItem={item => (
                          <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} size={40} style={{ border: '2px solid #ff0000' }} />}
                              title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                              description={<span style={{ fontSize: 12, color: '#888' }}>{item.email}</span>}
                            />
                          </List.Item>
                        )}
                      />
                  </div>

                  {/* List Facebook */}
                  <div style={{ background: '#e6f7ff', padding: '10px 16px', borderBottom: '1px solid #d9d9d9', borderTop: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1877f2', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FacebookFilled style={{ fontSize: 20 }} /> FACEBOOK
                      </span>
                      <Tag color="blue">{accounts.facebook.length}</Tag>
                  </div>
                  <div style={{ background: '#fff' }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={accounts.facebook}
                        renderItem={item => (
                          <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} size={40} style={{ border: '2px solid #1877f2' }} />}
                              title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                              description={<span style={{ fontSize: 12, color: '#888' }}>{item.email}</span>}
                            />
                          </List.Item>
                        )}
                      />
                  </div>
              </Card>
          </Col>

          {/* CỘT PHẢI: BIỂU ĐỒ */}
          <Col xs={24} lg={16}>
              <Card title="Hiệu suất tăng trưởng toàn hệ thống" variant="borderless" style={{ borderRadius: 12, marginBottom: 24 }}>
                    <div style={{ height: 320, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip labelStyle={{ color: '#000' }} />
                                <Area type="monotone" dataKey="views" stroke="#1890ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
              </Card>
          </Col>
      </Row>

      {/* --- MODAL THÊM TÀI KHOẢN --- */}
      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GlobalOutlined style={{ color: '#1890ff' }} /> Thêm liên kết tài khoản
            </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={400}
      >
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ marginBottom: 20, color: '#666' }}>Chọn nền tảng bạn muốn kết nối:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                
                {/* NÚT YOUTUBE -> Chuyển hướng */}
                <Button 
                    size="large" 
                    block 
                    icon={<YoutubeFilled style={{ fontSize: 24 }} />}
                    style={{ 
                        height: 50, background: '#ff0000', color: '#fff', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        fontSize: 16, fontWeight: 'bold'
                    }}
                    onClick={() => handleConnect('youtube')}
                >
                    Kết nối YouTube
                </Button>

                {/* NÚT FACEBOOK -> Chuyển hướng */}
                <Button 
                    size="large" 
                    block
                    icon={<FacebookFilled style={{ fontSize: 24 }} />}
                    style={{ 
                        height: 50, background: '#1877f2', color: '#fff', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        fontSize: 16, fontWeight: 'bold'
                    }}
                    onClick={() => handleConnect('facebook')}
                >
                    Kết nối Facebook
                </Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;