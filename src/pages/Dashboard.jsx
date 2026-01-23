// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Avatar, Typography, Button, Spin, Progress, Segmented, Space, Tag, Empty, Tabs, DatePicker 
} from 'antd';
import { useTranslation } from '../hooks/useTranslation';
import { 
  ArrowUpOutlined, 
  YoutubeFilled, 
  FacebookFilled, 
  EyeFilled, 
  UsergroupAddOutlined, 
  VideoCameraFilled, 
  FireFilled,
  ThunderboltFilled,
  PlusOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
// 🔥 THÊM getYouTubeChannelVideos VÀO IMPORT
import api, { getAllSocialAccounts, getYouTubeChannels, getYouTubeChannelVideos } from '../services/api';

const { Title, Text } = Typography;

// --- 1. COMPONENT CON: STAT CARD ---
const StatCard = ({ title, value, icon, color, subText }) => (
  <Card 
    variant="borderless" 
    style={{ 
      borderRadius: 16, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
      height: '100%',
      background: '#fff'
    }}
  >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
              <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
              <div style={{ fontSize: 28, fontWeight: '800', marginTop: 4, color: '#333' }}>
                  {value.toLocaleString()}
              </div>
          </div>
          <div style={{ 
              width: 48, height: 48, borderRadius: 12, 
              background: `${color}15`, color: color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
          }}>
              {icon}
          </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={color === '#52c41a' ? 'green' : 'blue'} style={{ borderRadius: 10, border: 'none' }}>
              <ArrowUpOutlined /> Tăng trưởng
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>{subText}</Text>
      </div>
  </Card>
);

// --- 2. COMPONENT CON: CHANNEL LIST ---
const ChannelList = ({ channels, color, icon, totalViews }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {channels.length === 0 ? (
            <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
            channels.map((channel) => (
                <div key={channel.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Avatar src={channel.avatar} shape="square" size={40} style={{ borderRadius: 8 }} />
                                <div style={{ 
                                    position: 'absolute', bottom: -4, right: -4, 
                                    background: color,
                                    color: '#fff', borderRadius: '50%', width: 16, height: 16,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10
                                }}>
                                    {icon}
                                </div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: 14, display:'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{parseInt(channel.subs).toLocaleString()} subs</Text>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Text strong>{parseInt(channel.views).toLocaleString()}</Text>
                            <div style={{ fontSize: 10, color: '#888' }}>VIEWS</div>
                        </div>
                    </div>
                    <Progress 
                        percent={totalViews > 0 ? (channel.views / totalViews) * 100 : 0} 
                        showInfo={false} 
                        size="small" 
                        strokeColor={color} 
                    />
                </div>
            ))
        )}
    </div>
);

// --- 3. COMPONENT CHÍNH ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    totalAccounts: 0,
    totalViews: 0,
    totalSubs: 0,
    totalVideos: 0,
    avgViewsPerVideo: 0,
    youtubeCount: 0,
    facebookCount: 0
  });

  const [topYoutubeChannels, setTopYoutubeChannels] = useState([]);
  const [topFacebookChannels, setTopFacebookChannels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState('views');
  const [filterMonth, setFilterMonth] = useState(dayjs()); // Mặc định tháng hiện tại

  const fetchOverviewData = async () => {
    try {
      const res = await getAllSocialAccounts();
      const rawAccounts = res.data || [];

      let tViews = 0;
      let tSubs = 0;
      let tVideos = 0;
      let ytCount = 0;
      let fbCount = 0;
      
      let ytList = [];
      let fbList = [];
      let allVideos = [];

      await Promise.all(rawAccounts.map(async (acc) => {
        let views = 0; 
        let subs = acc.subscribers || acc.sub || 0;
        let vids = acc.video_count || 0;
        let name = acc.name || acc.username;
        let avatar = acc.avatar_url || acc.avatar;

        if (acc.platform === 'youtube') {
          ytCount++;
          if (!avatar) avatar = 'https://www.gstatic.com/youtube/img/branding/youtubelogo/2x/youtubelogo_color_24dp.png';

          try {
             if(acc.id) {
                 const chRes = await getYouTubeChannels(acc.id);
                 if (chRes.data && chRes.data.length > 0) {
                     const ch = chRes.data[0];
                     subs = parseInt(ch.subscriber_count) || 0;
                     name = ch.title;
                     if (ch.thumbnail_url) avatar = ch.thumbnail_url;
                     else if (ch.thumbnail) avatar = ch.thumbnail;
                 }

                 const vidsRes = await getYouTubeChannelVideos(acc.id);
                 const vidsList = Array.isArray(vidsRes.data) ? vidsRes.data : (vidsRes.data?.videos || []);
                 
                 // Thu thập tất cả video để vẽ biểu đồ
                 vidsList.forEach(v => {
                    allVideos.push({
                        ...v,
                        platform: 'youtube'
                    });
                 });

                 const realVideoViews = vidsList.reduce((sum, v) => sum + (parseInt(v.view_count || v.views) || 0), 0);
                 views = realVideoViews;
                 vids = vidsList.length;
             }
          } catch (e) { console.warn("Lỗi lấy chi tiết kênh/video:", e); }
        } else {
          fbCount++;
          views = acc.view_count || 0;
          if (!avatar) avatar = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';
        }

        // Cộng dồn vào tổng toàn hệ thống
        tViews += views;
        tSubs += subs;
        tVideos += vids;

        const channelData = {
          id: acc.id,
          name: name || 'Không tên',
          platform: acc.platform,
          views,
          subs,
          avatar
        };

        if (acc.platform === 'youtube') {
            ytList.push(channelData);
        } else {
            fbList.push(channelData);
        }
      }));

      // Xử lý dữ liệu biểu đồ từ danh sách video nếu chartData từ API đang trống
      if (allVideos.length > 0) {
        const grouped = {};
        const selectedMonth = filterMonth.format('YYYY-MM');

        allVideos.forEach(v => {
            const videoDate = dayjs(v.published_at || v.created_at);
            const videoMonth = videoDate.format('YYYY-MM');

            // Chỉ lấy video thuộc tháng/năm đã chọn
            if (videoMonth === selectedMonth) {
                const dateKey = videoDate.format('DD/MM');
                if (!grouped[dateKey]) {
                    grouped[dateKey] = { name: dateKey, views: 0, subs: 0 };
                }
                grouped[dateKey].views += (parseInt(v.view_count || v.views) || 0);
            }
        });

        const generatedChartData = Object.values(grouped).sort((a, b) => {
            const dateA = dayjs(a.name, 'DD/MM');
            const dateB = dayjs(b.name, 'DD/MM');
            return dateA.isAfter(dateB) ? 1 : -1;
        });

        // Set dữ liệu biểu đồ dựa trên lọc
        setChartData(generatedChartData);
      }

      // Sắp xếp
      ytList.sort((a, b) => b.views - a.views);
      fbList.sort((a, b) => b.views - a.views);

      // Tính hiệu suất
      const calculatedAvgViews = tVideos > 0 ? Math.round(tViews / tVideos) : 0;

      setMetrics({
        totalAccounts: rawAccounts.length,
        totalViews: tViews,
        totalSubs: tSubs,
        totalVideos: tVideos,
        avgViewsPerVideo: calculatedAvgViews,
        youtubeCount: ytCount,
        facebookCount: fbCount
      });

      setTopYoutubeChannels(ytList.slice(0, 5));
      setTopFacebookChannels(fbList.slice(0, 5));

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  const fetchChartData = async () => {
    try {
        const res = await api.get('/analytics/system-growth'); 
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setChartData(res.data);
            return res.data;
        }
    } catch (error) {
        console.warn("Lỗi lấy dữ liệu tăng trưởng từ API:", error);
    }
    return [];
  };

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await Promise.all([fetchOverviewData(), fetchChartData()]);
        setLoading(false);
    };
    init();
  }, [filterMonth]);

  return (
    <div style={{ padding: '0 12px 24px 12px', maxWidth: 1600, margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                       {t('overview')}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>Báo cáo hiệu suất tất cả các kênh.</Text>
                </div>
            </div>
            <Space>
                <Button size="large" onClick={() => navigate('/accounts')} icon={<UsergroupAddOutlined />}>Quản lý tài khoản</Button>
                <Button size="large" type="primary" onClick={() => navigate('/create-post')} icon={<PlusOutlined />} style={{background: 'linear-gradient(90deg, #1677ff, #4096ff)'}}>Tạo bài đăng mới</Button>
            </Space>
        </div>

        <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title={t('total_views')}
                        value={metrics.totalViews} 
                        icon={<EyeFilled />} 
                        color="#1677ff" 
                        subText="Toàn hệ thống"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title={t('followers')}
                        value={metrics.totalSubs} 
                        icon={<UsergroupAddOutlined />} 
                        color="#722ed1" 
                        subText="Tổng các kênh"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Tổng Video/Bài viết" 
                        value={metrics.totalVideos} 
                        icon={<VideoCameraFilled />} 
                        color="#faad14" 
                        subText="Đã xuất bản"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="TB Views/Video" 
                        value={metrics.avgViewsPerVideo} 
                        icon={<ThunderboltFilled />} 
                        color="#52c41a" 
                        subText="Hiệu suất nội dung"
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card 
                        title="Phân Tích Tăng Trưởng" 
                        variant="borderless" 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%' }}
                        extra={
                            <Space>
                                <DatePicker 
                                    picker="month" 
                                    value={filterMonth} 
                                    onChange={(date) => date && setFilterMonth(date)}
                                    format="MM/YYYY"
                                    allowClear={false}
                                />
                                <Segmented 
                                    options={[
                                        { label: 'Lượt xem', value: 'views', icon: <EyeFilled /> },
                                        { label: 'Theo dõi', value: 'subs', icon: <UsergroupAddOutlined /> },
                                    ]}
                                    value={chartMetric}
                                    onChange={setChartMetric}
                                />
                            </Space>
                        }
                    >
                        <div style={{ height: 350, width: '100%', marginTop: 20 }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartMetric === 'views' ? "#1677ff" : "#722ed1"} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={chartMetric === 'views' ? "#1677ff" : "#722ed1"} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey={chartMetric} 
                                            stroke={chartMetric === 'views' ? "#1677ff" : "#722ed1"} 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorMetric)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    description="Chưa có dữ liệu biểu đồ" 
                                    style={{paddingTop: 80}}
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<div style={{display:'flex', gap: 8, alignItems:'center'}}><FireFilled style={{color:'#ff4d4f'}}/> Top Kênh Hàng Đầu</div>}
                        variant="borderless" 
                        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%' }}
                        styles={{ body: { paddingTop: 0 } }}
                    >
                        <Tabs 
                            defaultActiveKey="1" 
                            items={[
                                {
                                    key: '1',
                                    label: <span style={{color: '#ff0000'}}><YoutubeFilled /> YouTube</span>,
                                    children: <ChannelList channels={topYoutubeChannels} color="#ff0000" icon={<YoutubeFilled />} totalViews={metrics.totalViews} />
                                },
                                {
                                    key: '2',
                                    label: <span style={{color: '#1877f2'}}><FacebookFilled /> Facebook</span>,
                                    children: <ChannelList channels={topFacebookChannels} color="#1877f2" icon={<FacebookFilled />} totalViews={metrics.totalViews} />
                                }
                            ]}
                        />
                        
                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                            <Button type="link" onClick={() => navigate('/accounts')}>{t('view_all')} {metrics.totalAccounts} tài khoản</Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Spin>
    </div>
  );
};

export default Dashboard;