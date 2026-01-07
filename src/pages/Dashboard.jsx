// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Avatar, Typography, Button, List, Tag, Modal, Skeleton, message, Empty } from 'antd';
import { 
  EyeOutlined, UsergroupAddOutlined, LikeOutlined, VideoCameraOutlined, 
  SettingOutlined, PlusCircleOutlined, GlobalOutlined, YoutubeFilled, FacebookFilled
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// eslint-disable-next-line no-unused-vars
import { useNavigate } from 'react-router-dom'; 

// Import API
import { getWorkspaces, getAllSocialAccounts, getYouTubeChannels, getWorkspaceAnalytics } from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [stats, setStats] = useState({ views: 0, subs: 0, posts: 0, engagement: 0 });
  const [chartData, setChartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
        // 1. Lấy danh sách Workspace
        const wsRes = await getWorkspaces();
        const workspaces = wsRes.data;
        
        // 2. Lấy danh sách tài khoản MXH (Dùng setSocialAccounts để hết lỗi)
        const socialRes = await getAllSocialAccounts();
        const accounts = socialRes.data;
        setSocialAccounts(accounts);

        // 3. Tính toán tổng Views/Subs (YouTube)
        let totalViews = 0;
        let totalSubs = 0;

        // Lọc acc YouTube và gọi API lấy chi tiết kênh (Dùng getYouTubeChannels để hết lỗi)
        const youtubeAccounts = accounts.filter(acc => acc.platform === 'youtube');
        for (const acc of youtubeAccounts) {
            try {
                const channelsRes = await getYouTubeChannels(acc.id);
                channelsRes.data.forEach(channel => {
                    totalViews += (channel.view_count || 0);
                    totalSubs += (channel.subscriber_count || 0);
                });
            } catch (err) {
                console.error("Lỗi lấy kênh Youtube:", err);
            }
        }

        // 4. Lấy thống kê bài đăng (Analytics) (Dùng getWorkspaceAnalytics để hết lỗi)
        let totalPosts = 0;
        if (workspaces.length > 0) {
            const currentWsId = workspaces[0].id;
            try {
                const analyticsRes = await getWorkspaceAnalytics(currentWsId);
                totalPosts = analyticsRes.data.total_posts || 0;
            } catch (err) {
                console.error("Lỗi lấy analytics:", err);
            }
        }

        // Cập nhật State (Dùng setStats để hết lỗi)
        setStats({
            views: totalViews,
            subs: totalSubs,
            posts: totalPosts,
            engagement: 0 
        });
        
        // Mock Chart
        setChartData([
            { name: 'T2', views: totalViews * 0.1 }, { name: 'T3', views: totalViews * 0.15 }, 
            { name: 'T4', views: totalViews * 0.12 }, { name: 'T5', views: totalViews * 0.2 }, 
            { name: 'T6', views: totalViews * 0.18 }, { name: 'T7', views: totalViews * 0.25 },
        ]);

    } catch (error) {
        console.error("Lỗi tải Dashboard:", error);
        // message.error("Không thể tải dữ liệu Dashboard"); // Có thể bỏ qua nếu chưa chạy backend
    } finally {
        setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    const token = localStorage.getItem('access_token');
    if (!token) return message.error("Vui lòng đăng nhập lại");
    window.location.href = `${API_URL}/api/v1/${platform}/authorize?token=${token}`;
  };

  // Helper render list accounts
  const renderAccountList = (platform) => {
      if (loading) {
          return (
              <div style={{ padding: 16 }}>
                  <Skeleton avatar paragraph={{ rows: 1 }} active />
                  <Skeleton avatar paragraph={{ rows: 1 }} active style={{ marginTop: 20 }} />
              </div>
          );
      }

      const filtered = socialAccounts.filter(acc => acc.platform === platform);
      if (filtered.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa kết nối" />;
      
      return (
          <List
            itemLayout="horizontal"
            dataSource={filtered}
            renderItem={item => (
              <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <List.Item.Meta
                  avatar={<Avatar src={platform === 'youtube' ? 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' : 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png'} />}
                  title={<span style={{ fontWeight: 600 }}>{item.name || item.username || item.social_id}</span>}
                  description={<span style={{ fontSize: 12, color: '#888' }}>ID: {item.social_id}</span>}
                />
                <Tag color="green">Active</Tag>
              </List.Item>
            )}
          />
      );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      
        {/* PHẦN 1: THẺ SỐ LIỆU TỔNG QUAN */}
        <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
            <Row gutter={[24, 24]}>
                {/* Card 1: Views */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                            <Statistic 
                                title="Tổng lượt xem (YouTube)" 
                                value={stats.views} 
                                prefix={<EyeOutlined />} 
                                formatter={(val) => val.toLocaleString()}
                                valueStyle={{ color: '#3f8600' }} 
                            />
                        </Skeleton>
                    </Card>
                </Col>
                {/* Card 2: Subs */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                            <Statistic 
                                title="Tổng người theo dõi" 
                                value={stats.subs} 
                                prefix={<UsergroupAddOutlined />} 
                                formatter={(val) => val.toLocaleString()}
                                valueStyle={{ color: '#1677ff' }} 
                            />
                        </Skeleton>
                    </Card>
                </Col>
                {/* Card 3: Posts */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                            <Statistic title="Tổng bài đăng" value={stats.posts} prefix={<VideoCameraOutlined />} />
                        </Skeleton>
                    </Card>
                </Col>
                {/* Card 4: Engagement */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                            <Statistic title="Tương tác" value={stats.engagement} prefix={<LikeOutlined />} valueStyle={{ color: '#cf1322' }} />
                        </Skeleton>
                    </Card>
                </Col>
            </Row>
        </div>

        {/* PHẦN 2: CHIA CỘT */}
        <Row gutter={[24, 24]}>
            {/* CỘT TRÁI: QUẢN LÝ TÀI KHOẢN */}
            <Col xs={24} lg={8}>
                <Card 
                    title={<div style={{display:'flex', alignItems:'center', gap: 10}}><SettingOutlined /> Tài khoản kết nối</div>}
                    bordered={false} 
                    style={{ borderRadius: 12, height: '100%', overflow: 'hidden' }}
                    bodyStyle={{ padding: 0, background: '#f5f5f5' }}
                    extra={<Button type="link" size="small" icon={<PlusCircleOutlined />} onClick={() => setIsModalOpen(true)}>Thêm</Button>}
                >
                    <div style={{ background: '#fff' }}>
                        <div style={{ padding: '10px 16px', background: '#fafafa', fontWeight: 'bold', color: 'red' }}><YoutubeFilled /> YouTube</div>
                        {renderAccountList('youtube')}
                        
                        <div style={{ padding: '10px 16px', background: '#fafafa', fontWeight: 'bold', color: '#1877f2', marginTop: 10 }}><FacebookFilled /> Facebook</div>
                        {renderAccountList('facebook')}
                    </div>
                </Card>
            </Col>

            {/* CỘT PHẢI: BIỂU ĐỒ */}
            <Col xs={24} lg={16}>
                <Card title="Biểu đồ tăng trưởng" bordered={false} style={{ borderRadius: 12 }}>
                    <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
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
                                    <Tooltip />
                                    <Area type="monotone" dataKey="views" stroke="#1890ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Skeleton>
                </Card>
            </Col>
        </Row>

      {/* MODAL */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><GlobalOutlined /> Thêm liên kết tài khoản</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={400}
      >
        <div style={{ padding: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Button 
                size="large" block icon={<YoutubeFilled />}
                style={{ background: '#ff0000', color: '#fff', border: 'none', height: 50 }}
                onClick={() => handleConnect('youtube')}
            >
                Kết nối YouTube
            </Button>
            <Button 
                size="large" block icon={<FacebookFilled />}
                style={{ background: '#1877f2', color: '#fff', border: 'none', height: 50 }}
                onClick={() => handleConnect('facebook')}
            >
                Kết nối Facebook
            </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;