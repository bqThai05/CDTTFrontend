// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Avatar, Typography, Button, Space, Tag, Breadcrumb } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  YoutubeFilled, 
  FacebookFilled, 
  ArrowLeftOutlined,
  EyeOutlined,
  UserOutlined,
  LikeOutlined,
  VideoCameraOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
  // 1. STATE QUẢN LÝ: Đang ở màn hình chọn hay màn hình chi tiết?
  const [selectedChannel, setSelectedChannel] = useState(null);

  // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
  
  // Danh sách các kênh đang có
  const myChannels = [
    { id: 1, name: 'Review Công Nghệ Z', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', type: 'Channel', stats: { views: '1.2M', sub: '125K', growth: '+12%' } },
    { id: 2, name: 'Shop Quần Áo Nam', platform: 'facebook', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', type: 'Fanpage', stats: { views: '850K', sub: '45K', growth: '+5%' } },
    { id: 3, name: 'Vlog Đời Sống', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', type: 'Channel', stats: { views: '12K', sub: '1.2K', growth: '-2%' } },
  ];

  // Dữ liệu biểu đồ chi tiết (Khi vào trong mới thấy)
  const chartData = [
    { name: 'T2', views: 4000, likes: 2400 },
    { name: 'T3', views: 3000, likes: 1398 },
    { name: 'T4', views: 2000, likes: 9800 },
    { name: 'T5', views: 2780, likes: 3908 },
    { name: 'T6', views: 1890, likes: 4800 },
    { name: 'T7', views: 2390, likes: 3800 },
    { name: 'CN', views: 3490, likes: 4300 },
  ];

  // --- MÀN HÌNH 1: CHỌN KÊNH (LOBBY) ---
  const renderChannelSelection = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
         <Title level={2}>Tổng quan hệ thống</Title>
         <Text type="secondary">Chọn kênh bạn muốn xem báo cáo chi tiết</Text>
      </div>

      <Row gutter={[24, 24]}>
        {myChannels.map((channel) => (
           <Col xs={24} sm={12} md={8} key={channel.id}>
              <Card 
                hoverable 
                onClick={() => setSelectedChannel(channel)}
                style={{ 
                    borderRadius: 16, 
                    borderTop: `6px solid ${channel.platform === 'youtube' ? '#ff0000' : '#1877f2'}`,
                    textAlign: 'center'
                }}
              >
                 <Avatar src={channel.avatar} size={80} style={{ marginBottom: 16, border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                 <Title level={4} style={{ marginBottom: 4 }}>{channel.name}</Title>
                 
                 <div style={{ marginBottom: 16 }}>
                    {channel.platform === 'youtube' 
                        ? <Tag color="#ff0000" icon={<YoutubeFilled />}>YouTube Channel</Tag>
                        : <Tag color="#1877f2" icon={<FacebookFilled />}>Facebook Page</Tag>
                    }
                 </div>

                 {/* Số liệu tóm tắt bên ngoài */}
                 <Row gutter={8} style={{ background: '#f5f5f5', padding: '12px 0', borderRadius: 8 }}>
                    <Col span={12} style={{ borderRight: '1px solid #ddd' }}>
                        <div style={{ fontSize: 12, color: '#888' }}>Người theo dõi</div>
                        <div style={{ fontWeight: 'bold', fontSize: 16 }}>{channel.stats.sub}</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ fontSize: 12, color: '#888' }}>Tăng trưởng</div>
                        <div style={{ fontWeight: 'bold', color: channel.stats.growth.includes('+') ? 'green' : 'red' }}>
                            {channel.stats.growth}
                        </div>
                    </Col>
                 </Row>
              </Card>
           </Col>
        ))}
      </Row>
    </div>
  );

  // --- MÀN HÌNH 2: DASHBOARD CHI TIẾT (DETAIL) ---
  const renderDashboardDetail = () => (
    <div>
        {/* Header điều hướng */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedChannel(null)} shape="circle" size="large" />
                <div>
                    <Breadcrumb items={[{ title: 'Tổng quan' }, { title: selectedChannel.name }]} />
                    <Title level={3} style={{ margin: 0 }}>
                        {selectedChannel.platform === 'youtube' ? <YoutubeFilled style={{color:'red'}}/> : <FacebookFilled style={{color:'#1877f2'}}/>} 
                        {' ' + selectedChannel.name}
                    </Title>
                </div>
            </Space>
            <Button>Xuất báo cáo</Button>
        </div>

        {/* 1. Các thẻ số liệu chính */}
        <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tổng lượt xem (Views)" 
                        value={selectedChannel.id === 1 ? 112893 : 4500} // Fake số liệu đổi theo kênh
                        prefix={<EyeOutlined />} 
                        valueStyle={{ color: '#3f8600' }}
                    />
                    <div style={{ marginTop: 8, color: 'green' }}><ArrowUpOutlined /> 12% so với tháng trước</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Người đăng ký (Subscribers)" 
                        value={selectedChannel.stats.sub} 
                        prefix={<UserOutlined />} 
                        valueStyle={{ color: '#1677ff' }}
                    />
                    <div style={{ marginTop: 8, color: 'green' }}><ArrowUpOutlined /> +150 người mới</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Video đã đăng" 
                        value={142} 
                        prefix={<VideoCameraOutlined />} 
                    />
                    <div style={{ marginTop: 8, color: '#888' }}>2 video tuần này</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Tương tác trung bình" 
                        value="8.5%" 
                        prefix={<LikeOutlined />} 
                        valueStyle={{ color: '#cf1322' }}
                    />
                    <div style={{ marginTop: 8, color: 'red' }}><ArrowDownOutlined /> Giảm nhẹ</div>
                </Card>
            </Col>
        </Row>

        {/* 2. Biểu đồ */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={16}>
                <Card title="Biểu đồ tăng trưởng (7 ngày qua)" bordered={false} style={{ borderRadius: 12 }}>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1677ff" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="views" stroke="#1677ff" fillOpacity={1} fill="url(#colorViews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                <Card title="Nội dung top đầu" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>Review iPhone 16</div>
                                <div style={{ fontSize: 12, color: '#888' }}>50K Views</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>Vlog đi Đà Lạt</div>
                                <div style={{ fontSize: 12, color: '#888' }}>32K Views</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>Hướng dẫn Code</div>
                                <div style={{ fontSize: 12, color: '#888' }}>15K Views</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {/* Logic hiển thị: Nếu chưa chọn kênh -> Hiện danh sách. Nếu chọn rồi -> Hiện chi tiết */}
        {!selectedChannel ? renderChannelSelection() : renderDashboardDetail()}
    </div>
  );
};

export default Dashboard;