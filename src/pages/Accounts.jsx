// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Avatar, Typography, Row, Col, message, Spin, Modal, 
  Tooltip, Empty, Tag, Statistic, Tabs, Divider, Space 
} from 'antd';
import { 
  YoutubeFilled, 
  FacebookFilled, 
  DisconnectOutlined, 
  SyncOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  UsergroupAddOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  LikeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { BASE_URL, disconnectSocialAccount, getAllSocialAccounts, getYouTubeChannels } from '../services/api';

const { Title, Text } = Typography;

const Accounts = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // --- LOGIC XỬ LÝ DỮ LIỆU (ĐÃ FIX ĐỂ HIỆN AVATAR & VIEW) ---

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAllSocialAccounts();
      const rawAccounts = response.data || [];

      const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
        let processedAcc = {
            ...acc,
            displayName: acc.name || acc.username || acc.social_id,
            avatarUrl: acc.avatar_url || acc.avatar,
            platformType: acc.platform,
            stats: {
                subscribers: 0,
                views: 0,
                videos: 0,
                likes: 0
            }
        };

        if (acc.platform === 'youtube') {
          // Avatar mặc định
          if (!processedAcc.avatarUrl) {
              processedAcc.avatarUrl = 'https://www.gstatic.com/youtube/img/branding/youtubelogo/2x/youtubelogo_color_24dp.png';
          }
          try {
            if (acc.id) {
                const channelsRes = await getYouTubeChannels(acc.id);
                // Kiểm tra kỹ dữ liệu trả về (Data wrapper)
                const channelData = channelsRes.data?.data || channelsRes.data || [];
                
                if (channelData.length > 0) {
                  const ch = channelData[0];
                  
                  // --- FIX 1: LẤY THÔNG TIN LINH HOẠT ---
                  // Youtube API thường trả về trong 'snippet' và 'statistics'
                  const snippet = ch.snippet || ch;
                  const statistics = ch.statistics || ch;

                  processedAcc.displayName = snippet.title || snippet.name || processedAcc.displayName;
                  
                  // Lấy Avatar: Ưu tiên ảnh chất lượng cao
                  processedAcc.avatarUrl = snippet.thumbnails?.high?.url || 
                                           snippet.thumbnails?.medium?.url || 
                                           snippet.thumbnail || 
                                           snippet.thumbnail_url || 
                                           processedAcc.avatarUrl;

                  // Lấy Stats: Chấp nhận cả camelCase (viewCount) và snake_case (view_count)
                  processedAcc.stats = {
                      subscribers: parseInt(statistics.subscriberCount || statistics.subscriber_count || statistics.subscribers || 0),
                      views: parseInt(statistics.viewCount || statistics.view_count || statistics.views || 0),
                      videos: parseInt(statistics.videoCount || statistics.video_count || statistics.video_count || 0),
                      likes: 0 
                  };
                }
            }
          } catch (e) {
            console.warn(`Lỗi lấy chi tiết kênh ${acc.id}:`, e);
          }
        } else {
             // Logic Facebook
             if (!processedAcc.avatarUrl) {
                processedAcc.avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';
             }
             processedAcc.stats.subscribers = acc.followers || acc.subscribers || 0;
             processedAcc.stats.likes = acc.like_count || 0;
        }
        return processedAcc;
      }));

      setAccounts(enrichedAccounts);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const token = queryParams.get('token');

    if (token) localStorage.setItem('access_token', token);

    if (success) {
      message.success('Kết nối tài khoản thành công!');
      navigate('/accounts', { replace: true });
    }
    fetchAccounts();
  }, [location, navigate]);

  const handleConnect = (platform) => {
    const token = localStorage.getItem('access_token');
    if (!token) return message.error("Bạn chưa đăng nhập!");
    window.location.href = `${BASE_URL}/${platform}/authorize/?token=${token}`;
  };

  const handleDisconnect = (id) => {
    Modal.confirm({
      title: 'Ngắt kết nối tài khoản này?',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Tài khoản này sẽ bị xóa khỏi hệ thống và ngừng đồng bộ dữ liệu.',
      okText: 'Ngắt kết nối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await disconnectSocialAccount(id);
          message.success('Đã ngắt kết nối thành công');
          fetchAccounts(); 
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi ngắt kết nối.');
        }
      },
    });
  };

  const youtubeAccounts = accounts.filter(acc => acc.platformType === 'youtube');
  const facebookAccounts = accounts.filter(acc => acc.platformType === 'facebook');

  // --- COMPONENT CON: THẺ TÀI KHOẢN (ĐÃ TINH CHỈNH) ---
  const AccountCard = ({ acc, type }) => {
      const isYoutube = type === 'youtube';
      const color = isYoutube ? '#ff0000' : '#1877f2';
      const bgColor = isYoutube ? '#fff1f0' : '#f0f5ff';
      const Icon = isYoutube ? YoutubeFilled : FacebookFilled;

      return (
        <Col xs={24} sm={12} lg={8} xl={6} key={acc.id}>
            <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '100%' }}
                styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
                {/* Header Card */}
                <div style={{ padding: '12px 16px', background: bgColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={isYoutube ? 'red' : 'blue'} style={{ margin: 0, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon /> {isYoutube ? 'Channel' : 'Fanpage'}
                    </Tag>
                    <Space>
                        <Tooltip title="Làm mới"><Button type="text" size="small" icon={<SyncOutlined />} onClick={fetchAccounts} /></Tooltip>
                        <Tooltip title="Ngắt kết nối"><Button type="text" size="small" danger icon={<DisconnectOutlined />} onClick={() => handleDisconnect(acc.id)} /></Tooltip>
                    </Space>
                </div>

                {/* Body Card */}
                <div style={{ padding: 24, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* AVATAR: Thêm objectFit để ảnh luôn đẹp */}
                    <Avatar 
                        src={acc.avatarUrl} 
                        size={84} 
                        style={{ 
                            border: `3px solid ${color}`, 
                            marginBottom: 16, 
                            padding: 2, 
                            background: '#fff',
                            objectFit: 'cover' // Giúp ảnh không bị méo
                        }} 
                    />
                    <Title level={5} style={{ margin: 0, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={acc.displayName}>
                        {acc.displayName}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>ID: {acc.social_id}</Text>
                    
                    {/* Số liệu chi tiết */}
                    <div style={{ width: '100%', background: '#fafafa', borderRadius: 8, padding: '12px', marginTop: 'auto' }}>
                        <Row gutter={8}>
                            <Col span={12} style={{ borderRight: '1px solid #eee' }}>
                                <Statistic 
                                    title={isYoutube ? "Subscribers" : "Followers"} 
                                    value={acc.stats.subscribers} 
                                    formatter={(val) => parseInt(val).toLocaleString()} // Format số
                                    styles={{ content: { fontSize: 16, fontWeight: 'bold', color: '#333' } }}
                                    prefix={<UsergroupAddOutlined style={{ fontSize: 14 }} />}
                                />
                            </Col>
                            <Col span={12}>
                                {isYoutube ? (
                                    <Statistic 
                                        title="Videos" 
                                        value={acc.stats.videos} 
                                        formatter={(val) => parseInt(val).toLocaleString()}
                                        styles={{ content: { fontSize: 16, fontWeight: 'bold', color: '#333' } }}
                                        prefix={<VideoCameraOutlined style={{ fontSize: 14 }} />}
                                    />
                                ) : (
                                    <Statistic 
                                        title="Likes" 
                                        value={acc.stats.likes} 
                                        formatter={(val) => parseInt(val).toLocaleString()}
                                        styles={{ content: { fontSize: 16, fontWeight: 'bold', color: '#333' } }}
                                        prefix={<LikeOutlined style={{ fontSize: 14 }} />}
                                    />
                                )}
                            </Col>
                        </Row>
                        {isYoutube && (
                            <>
                                <Divider style={{ margin: '8px 0' }} />
                                {/* VIEW COUNT: Hiện rõ ràng */}
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', fontWeight: 500 }}>
                                    <EyeOutlined /> {parseInt(acc.stats.views).toLocaleString()} Lượt xem
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </Col>
      );
  };

  // --- GIAO DIỆN CHÍNH ---

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* HEADER & THỐNG KÊ NHANH */}
      <div style={{ marginBottom: 24, background: '#fff', padding: '24px 32px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
            <Col xs={24} md={12}>
                <Title level={2} style={{ margin: 0 }}>Trung Tâm Tài Khoản</Title>
                <Text type="secondary">Quản lý và đồng bộ tất cả các kênh mạng xã hội của bạn tại một nơi.</Text>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Space size="large">
                    <Statistic title="Tổng kênh YouTube" value={youtubeAccounts.length} prefix={<YoutubeFilled style={{color: 'red'}} />} />
                    <Statistic title="Tổng Fanpage" value={facebookAccounts.length} prefix={<FacebookFilled style={{color: '#1877f2'}} />} />
                </Space>
            </Col>
        </Row>
      </div>

      {/* TABS PHÂN LOẠI */}
      <Spin spinning={loading} tip="Đang đồng bộ dữ liệu...">
        <Tabs 
            defaultActiveKey="youtube" 
            type="card" 
            size="large"
            style={{ marginTop: 20 }}
            items={[
                {
                    key: 'youtube',
                    label: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <YoutubeFilled style={{ color: '#ff0000', fontSize: 18 }} /> YouTube ({youtubeAccounts.length})
                        </span>
                    ),
                    children: (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="primary" danger icon={<YoutubeFilled />} size="large" onClick={() => handleConnect('youtube')} style={{borderRadius: 8}}>
                                    Kết nối kênh YouTube mới
                                </Button>
                            </div>
                            {youtubeAccounts.length === 0 ? (
                                <Empty description="Chưa có kênh YouTube nào" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{background: '#fff', padding: 40, borderRadius: 12}} />
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {youtubeAccounts.map(acc => <AccountCard key={acc.id} acc={acc} type="youtube" />)}
                                </Row>
                            )}
                        </div>
                    )
                },
                {
                    key: 'facebook',
                    label: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FacebookFilled style={{ color: '#1877f2', fontSize: 18 }} /> Facebook ({facebookAccounts.length})
                        </span>
                    ),
                    children: (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="primary" icon={<FacebookFilled />} size="large" onClick={() => handleConnect('facebook')} style={{background: '#1877f2', borderRadius: 8}}>
                                    Kết nối Fanpage mới
                                </Button>
                            </div>
                            {facebookAccounts.length === 0 ? (
                                <Empty description="Chưa có Fanpage nào" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{background: '#fff', padding: 40, borderRadius: 12}} />
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {facebookAccounts.map(acc => <AccountCard key={acc.id} acc={acc} type="facebook" />)}
                                </Row>
                            )}
                        </div>
                    )
                }
            ]}
        />
      </Spin>
    </div>
  );
};

export default Accounts;