// src/pages/YoutubeIntegration.jsx
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spin, Typography, message, Select, Empty, Avatar, Tag } from 'antd';
import { YoutubeFilled, EyeOutlined, LikeOutlined, VideoCameraOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import moment from 'moment'; // 👇 Đã import thì phải dùng ở dưới

// Import API
import { getAllSocialAccounts, getYouTubeChannels, BASE_URL } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const YoutubeIntegration = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [accounts, setAccounts] = useState([]); 
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  
  const [channels, setChannels] = useState([]); 
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success')) {
        message.success("Kết nối YouTube thành công!");
    }
    fetchYoutubeAccounts();
  }, [location.search]);

  const fetchYoutubeAccounts = async () => {
    setLoading(true);
    try {
        const res = await getAllSocialAccounts();
        const ytAccounts = res.data.filter(acc => acc.platform === 'youtube');
        setAccounts(ytAccounts);
        
        if (ytAccounts.length > 0) {
            setSelectedAccountId(ytAccounts[0].id);
            fetchChannels(ytAccounts[0].id);
        }
    } catch (error) {
        console.error("Lỗi tải account:", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchChannels = async (accountId) => {
    setLoading(true);
    try {
        const res = await getYouTubeChannels(accountId);
        setChannels(res.data);
    } catch (error) {
        console.error("Lỗi tải channels:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAuthorize = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return message.error("Vui lòng đăng nhập");
    window.location.href = `${BASE_URL}/youtube/authorize?token=${token}`;
  };

  const handleAccountChange = (val) => {
    setSelectedAccountId(val);
    fetchChannels(val);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}><YoutubeFilled style={{color:'red'}}/> Quản lý YouTube</Title>
      
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 15 }}>
            Kết nối kênh YouTube để theo dõi số liệu và đăng video tự động
        </Text>
        <Button 
            type="primary" danger size="large" 
            onClick={handleAuthorize} 
            icon={<YoutubeFilled />}
        >
          Thêm tài khoản YouTube mới
        </Button>
      </Card>

      {accounts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
              <Text strong>Chọn tài khoản quản lý:</Text>
              <Select 
                style={{ width: 300, marginLeft: 10 }} 
                value={selectedAccountId}
                onChange={handleAccountChange}
              >
                  {accounts.map(acc => (
                      <Option key={acc.id} value={acc.id}>{acc.name || acc.username}</Option>
                  ))}
              </Select>
          </div>
      )}

      <Spin spinning={loading}>
        {channels.length === 0 && accounts.length > 0 ? (
            <Empty description="Tài khoản này chưa có kênh nào" />
        ) : (
            <Row gutter={[16, 16]}>
                {channels.map(channel => (
                    <Col xs={24} key={channel.id}>
                        <Card hoverable style={{ borderRadius: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <Avatar size={80} src={channel.thumbnail_url} />
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>{channel.title}</Title>
                                    
                                    {/* 👇 ĐÃ SỬA: Dùng moment ở đây để hiển thị ngày tạo */}
                                    <div style={{ color: '#666', marginTop: 5, fontSize: 13 }}>
                                        <div>URL: {channel.custom_url || 'N/A'}</div>
                                        <div>
                                            <CalendarOutlined /> Tạo ngày: {channel.published_at ? moment(channel.published_at).format('DD/MM/YYYY') : 'N/A'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                                        <Tag color="red" icon={<EyeOutlined />}>
                                             {channel.view_count?.toLocaleString()} Views
                                        </Tag>
                                        <Tag color="blue" icon={<LikeOutlined />}>
                                             {channel.subscriber_count?.toLocaleString()} Subs
                                        </Tag>
                                        <Tag color="gold" icon={<VideoCameraOutlined />}>
                                             {channel.video_count?.toLocaleString()} Videos
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        )}
      </Spin>
    </div>
  );
};

export default YoutubeIntegration;