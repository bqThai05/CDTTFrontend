// src/pages/ChannelContent.jsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Avatar, Typography, Tag, Space, Tooltip, Image, Tabs, Input, Segmented } from 'antd';
import { 
  YoutubeFilled, 
  FacebookFilled, 
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FilterOutlined,
  VideoCameraAddOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ChannelContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('all'); // all, youtube, facebook

  // Dữ liệu giả lập (Mock Data) để Demo cho đẹp
  // Khi nào API ổn định thì thay bằng fetch từ API sau
  const mockData = [
    {
        id: 1,
        title: 'Review iPhone 16 Pro Max - Đỉnh cao công nghệ 2025',
        thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop',
        platform: 'youtube',
        status: 'published',
        views: 125000,
        likes: 4500,
        comments: 340,
        date: '2025-01-05'
    },
    {
        id: 2,
        title: 'Vlog: Một ngày làm việc tại Social Pro',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop',
        platform: 'youtube',
        status: 'processing',
        views: 0,
        likes: 0,
        comments: 0,
        date: '2025-01-07'
    },
    {
        id: 3,
        title: 'Khuyến mãi Tết Nguyên Đán - Giảm giá 50%',
        thumbnail: 'https://images.unsplash.com/photo-1548625361-17c2f6d4825d?q=80&w=1937&auto=format&fit=crop',
        platform: 'facebook',
        status: 'published',
        views: 5600,
        likes: 230,
        comments: 45,
        date: '2025-01-06'
    },
    {
        id: 4,
        title: 'Hướng dẫn sử dụng công cụ Marketing mới',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        platform: 'facebook',
        status: 'draft',
        views: 0,
        likes: 0,
        comments: 0,
        date: '2025-01-08'
    }
  ];

  const [data, setData] = useState(mockData);

  // Giả lập loading khi chuyển tab
 // Giả lập loading khi chuyển tab
  useEffect(() => {
      // eslint-disable-next-line 
      setLoading(true); 
      
      const timer = setTimeout(() => {
          if (platformFilter === 'all') setData(mockData);
          else setData(mockData.filter(item => item.platform === platformFilter));
          setLoading(false);
      }, 500);

      // Dọn dẹp timer khi component unmount
      return () => clearTimeout(timer);
  }, [platformFilter]);

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Nội dung (Video / Bài viết)',
      width: 400,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 120, height: 68, flexShrink: 0 }}>
            <Image 
                src={record.thumbnail} 
                width={120} height={68} 
                style={{ borderRadius: 8, objectFit: 'cover' }} 
                preview={false} 
            />
            <div style={{ 
                position: 'absolute', bottom: 4, right: 4, 
                background: 'rgba(0,0,0,0.7)', color: '#fff', 
                fontSize: 10, padding: '1px 4px', borderRadius: 4 
            }}>
                {record.platform === 'youtube' ? '12:30' : 'IMG'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Text strong style={{ fontSize: 14, marginBottom: 4 }} ellipsis={{tooltip: record.title}}>
                {record.title}
            </Text>
            <Space>
                {record.platform === 'youtube' ? (
                    <Tag icon={<YoutubeFilled />} color="#ff0000" style={{border: 'none', color: 'white'}}>YouTube</Tag>
                ) : (
                    <Tag icon={<FacebookFilled />} color="#1877f2" style={{border: 'none', color: 'white'}}>Facebook</Tag>
                )}
            </Space>
          </div>
        </div>
      )
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        width: 150,
        render: (val) => {
            if (val === 'published') return <Tag icon={<CheckCircleOutlined />} color="success">Đã đăng</Tag>;
            if (val === 'processing') return <Tag icon={<SyncOutlined spin />} color="processing">Đang xử lý</Tag>;
            return <Tag color="default">Bản nháp</Tag>;
        }
    },
    {
        title: 'Ngày đăng',
        dataIndex: 'date',
        width: 150,
        render: (val) => <span style={{ color: '#666' }}>{val}</span>
    },
    {
        title: 'Số liệu',
        render: (_, record) => (
            <Space size="large" style={{ color: '#666' }}>
                <Tooltip title="Lượt xem"><div style={{ minWidth: 50 }}><EyeOutlined /> {record.views.toLocaleString()}</div></Tooltip>
                <Tooltip title="Thích"><div style={{ minWidth: 50 }}><LikeOutlined /> {record.likes.toLocaleString()}</div></Tooltip>
                <Tooltip title="Bình luận"><div style={{ minWidth: 50 }}><MessageOutlined /> {record.comments.toLocaleString()}</div></Tooltip>
            </Space>
        )
    },
    {
        title: '',
        key: 'action',
        width: 50,
        render: () => <Button type="text" icon={<MoreOutlined />} />
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={2} style={{ margin: 0 }}>Nội dung kênh</Title>
                <Text type="secondary">Quản lý và theo dõi hiệu suất tất cả bài đăng của bạn</Text>
            </div>
            <Button 
                type="primary" 
                size="large" 
                icon={<VideoCameraAddOutlined />}
                onClick={() => navigate('/create-post')}
                style={{ 
                    background: 'linear-gradient(90deg, #d4145a, #fbb03b)', 
                    border: 'none', 
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(212, 20, 90, 0.3)'
                }}
            >
                Tạo bài mới
            </Button>
        </div>

        {/* BỘ LỌC & TOOLBAR */}
        <Card bordered={false} bodyStyle={{ padding: 16 }} style={{ borderRadius: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                
                {/* Tabs chuyển đổi nền tảng */}
                <Segmented
                    options={[
                        { label: 'Tất cả', value: 'all', icon: <FilterOutlined /> },
                        { label: 'YouTube', value: 'youtube', icon: <YoutubeFilled style={{color: 'red'}} /> },
                        { label: 'Facebook', value: 'facebook', icon: <FacebookFilled style={{color: '#1877f2'}} /> },
                    ]}
                    value={platformFilter}
                    onChange={setPlatformFilter}
                    size="large"
                />

                {/* Ô tìm kiếm */}
                <Input 
                    prefix={<SearchOutlined style={{ color: '#ccc' }} />} 
                    placeholder="Tìm kiếm video/bài viết..." 
                    style={{ width: 300, borderRadius: 8 }} 
                    size="large"
                />
            </div>
        </Card>

        {/* BẢNG DỮ LIỆU */}
        <Card bordered={false} style={{ borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
            <Table 
                rowKey="id" 
                columns={columns} 
                dataSource={data} 
                loading={loading}
                pagination={{ pageSize: 6 }} 
                rowClassName="editable-row"
            />
        </Card>
    </div>
  );
};

export default ChannelContent;