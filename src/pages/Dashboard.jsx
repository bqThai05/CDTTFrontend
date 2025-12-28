// src/pages/Dashboard.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Avatar, Typography, Button, List, Tag, Divider } from 'antd';
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
  LogoutOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
  // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
  
  // 1. Danh sách tài khoản (Mô phỏng giống ảnh vẽ demo)
  const connectedAccounts = {
    youtube: [
      { id: 1, name: 'Review Công Nghệ Z', email: 'techz@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', sub: 125000, views: 1200000 },
      { id: 2, name: 'Vlog Đời Sống', email: 'vlog.life@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', sub: 12000, views: 45000 },
      { id: 3, name: 'Học Code Dạo', email: 'dev.code@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', sub: 5600, views: 10000 },
    ],
    facebook: [
      { id: 4, name: 'Shop Quần Áo Nam', email: 'menshop@fb.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', sub: 45000, views: 850000 },
      { id: 5, name: 'Hội Yêu Mèo', email: 'catlover@fb.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty', sub: 8900, views: 32000 },
    ]
  };

  // 2. Tính toán TỔNG HỢP số liệu (Aggregated Stats)
  const allAccounts = [...connectedAccounts.youtube, ...connectedAccounts.facebook];
  const totalViews = allAccounts.reduce((sum, acc) => sum + acc.views, 0);
  const totalSubs = allAccounts.reduce((sum, acc) => sum + acc.sub, 0);
  const totalAccounts = allAccounts.length;

  // 3. Dữ liệu biểu đồ chung toàn hệ thống
  const chartData = [
    { name: 'T2', views: 45000 },
    { name: 'T3', views: 52000 },
    { name: 'T4', views: 49000 },
    { name: 'T5', views: 61000 },
    { name: 'T6', views: 58000 },
    { name: 'T7', views: 72000 },
    { name: 'CN', views: 85000 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      
      {/* --- PHẦN 1: THẺ SỐ LIỆU TỔNG QUAN (GLOBAL STATS) --- */}
      <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tổng lượt xem (Toàn bộ)" 
                        value={totalViews} 
                        prefix={<EyeOutlined />} 
                        valueStyle={{ color: '#3f8600' }}
                    />
                    <div style={{ color: 'green', marginTop: 8 }}><ArrowUpOutlined /> +12% tuần này</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tổng người theo dõi" 
                        value={totalSubs} 
                        prefix={<UsergroupAddOutlined />} 
                        valueStyle={{ color: '#1677ff' }}
                    />
                    <div style={{ color: 'green', marginTop: 8 }}><ArrowUpOutlined /> +{connectedAccounts.youtube.length + connectedAccounts.facebook.length} kênh đang kết nối</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tổng bài viết/Video" 
                        value={1240} 
                        prefix={<VideoCameraOutlined />} 
                    />
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Đã đăng trên {totalAccounts} tài khoản</Text>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tương tác trung bình" 
                        value="8.2%" 
                        prefix={<LikeOutlined />} 
                        valueStyle={{ color: '#cf1322' }}
                    />
                     <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Ổn định so với tuần trước</Text>
                </Card>
            </Col>
          </Row>
      </div>

      {/* --- PHẦN 2: CHIA CỘT (DANH SÁCH TÀI KHOẢN vs BIỂU ĐỒ) --- */}
      <Row gutter={[24, 24]}>
          
          {/* CỘT TRÁI: DANH SÁCH TÀI KHOẢN (Giống ảnh demo) */}
          <Col xs={24} lg={8}>
              <Card 
                title={<div style={{display:'flex', alignItems:'center', gap: 10}}><SettingOutlined /> Quản lý tài khoản</div>}
                bordered={false} 
                style={{ borderRadius: 12, height: '100%', overflow: 'hidden' }}
                bodyStyle={{ padding: 0, background: '#f5f5f5' }}
                extra={<Button type="link" size="small" icon={<PlusCircleOutlined />}>Thêm</Button>}
              >
                  
                  {/* NHÓM YOUTUBE */}
                  <div style={{ background: '#e6f7ff', padding: '10px 16px', borderBottom: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#ff0000', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <YoutubeFilled style={{ fontSize: 20 }} /> YOUTUBE CHANNELS
                      </span>
                      <Tag color="red">{connectedAccounts.youtube.length}</Tag>
                  </div>
                  <div style={{ background: '#fff' }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={connectedAccounts.youtube}
                        renderItem={item => (
                          <List.Item 
                            style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                            actions={[<Tooltip title="Đăng xuất"><Button size="small" type="text" danger icon={<LogoutOutlined />} /></Tooltip>]}
                            className="account-item" // Class để hover
                          >
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} size={40} style={{ border: '2px solid #ff0000' }} />}
                              title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                              description={<span style={{ fontSize: 12, color: '#888' }}>{item.email}</span>}
                            />
                          </List.Item>
                        )}
                      />
                  </div>

                  {/* NHÓM FACEBOOK */}
                  <div style={{ background: '#e6f7ff', padding: '10px 16px', borderBottom: '1px solid #d9d9d9', borderTop: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1877f2', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FacebookFilled style={{ fontSize: 20 }} /> FACEBOOK PAGES
                      </span>
                      <Tag color="blue">{connectedAccounts.facebook.length}</Tag>
                  </div>
                  <div style={{ background: '#fff' }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={connectedAccounts.facebook}
                        renderItem={item => (
                          <List.Item 
                            style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                            actions={[<Tooltip title="Đăng xuất"><Button size="small" type="text" danger icon={<LogoutOutlined />} /></Tooltip>]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} size={40} style={{ border: '2px solid #1877f2' }} />}
                              title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                              description={<span style={{ fontSize: 12, color: '#888' }}>{item.email}</span>}
                            />
                          </List.Item>
                        )}
                      />
                  </div>
                  
                  {/* Nút xem tất cả */}
                  <div style={{ padding: 12, textAlign: 'center', background: '#fff' }}>
                      <Button type="dashed" block>Quản lý tất cả kết nối</Button>
                  </div>

              </Card>
          </Col>

          {/* CỘT PHẢI: BIỂU ĐỒ & HOẠT ĐỘNG */}
          <Col xs={24} lg={16}>
              <Card title="Hiệu suất tăng trưởng toàn hệ thống" bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
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

              {/* Bảng hoạt động gần đây */}
              <Card title="Hoạt động gần đây" bordered={false} style={{ borderRadius: 12 }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                        { title: 'Video: Review iPhone 16', time: '2 giờ trước', platform: 'youtube', status: 'Đã đăng' },
                        { title: 'Post: Khuyến mãi Tết', time: '5 giờ trước', platform: 'facebook', status: 'Đã đăng' },
                        { title: 'Video: Hướng dẫn ReactJS', time: '1 ngày trước', platform: 'youtube', status: 'Đang xử lý' },
                    ]}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={item.platform === 'youtube' ? <YoutubeFilled style={{color:'red', fontSize: 24}}/> : <FacebookFilled style={{color:'#1877f2', fontSize: 24}}/>}
                                title={<span>{item.title}</span>}
                                description={item.time}
                            />
                            <Tag color={item.status === 'Đã đăng' ? 'green' : 'orange'}>{item.status}</Tag>
                        </List.Item>
                    )}
                  />
              </Card>
          </Col>
      </Row>
    </div>
  );
};

export default Dashboard;