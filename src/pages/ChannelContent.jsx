import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Image, Tag, Typography, Space, Tooltip } from 'antd';
import { 
  EyeOutlined, LikeOutlined, MessageOutlined, 
  GlobalOutlined, LockOutlined, ReloadOutlined, PlaySquareOutlined 
} from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

const { Text, Title } = Typography;

const ChannelContent = () => {
  const [selectedChannel] = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    if (!selectedChannel) return;
    setLoading(true);
    try {
      const res = await api.get(`/youtube/${selectedChannel.id}/videos`);
      setVideos(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, [selectedChannel]);

  // Cấu hình bảng giống YouTube Studio
  const columns = [
    {
      title: 'Video',
      width: 450,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
          {/* Hình thu nhỏ */}
          <div style={{ position: 'relative' }}>
            <Image 
                width={120} 
                height={68}
                src={record.thumbnail} 
                style={{ borderRadius: 4, objectFit: 'cover' }} 
                fallback="https://via.placeholder.com/120x68?text=No+Img"
            />
            <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
               HD
            </div>
          </div>
          
          {/* Tiêu đề & Mô tả */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: 14, marginBottom: 4 }} ellipsis={{ tooltip: record.title }}>
                {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: record.description }}>
                {record.description || 'Chưa có mô tả'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Chế độ hiển thị',
      dataIndex: 'privacy',
      width: 150,
      render: (privacy) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {privacy === 'public' ? <GlobalOutlined style={{color: '#52c41a'}} /> : <LockOutlined />}
            <Text>{privacy === 'public' ? 'Công khai' : 'Riêng tư'}</Text>
        </div>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'publishedAt',
      width: 150,
      render: (date) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Đã xuất bản</Text>
        </div>
      )
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      align: 'right',
      width: 100,
      render: (views) => <Text>{parseInt(views).toLocaleString()}</Text>
    },
    {
      title: 'Bình luận',
      dataIndex: 'comments',
      align: 'right',
      width: 100,
      render: (cmt) => <Text>{parseInt(cmt).toLocaleString()}</Text>
    },
    {
      title: 'Lượt thích',
      dataIndex: 'likes',
      align: 'right',
      width: 100,
      render: (likes) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
            <Text>{parseInt(likes).toLocaleString()}</Text>
            <LikeOutlined />
        </div>
      )
    }
  ];

  if (!selectedChannel) return <Card>Vui lòng chọn kênh</Card>;

  return (
    <div style={{ background: '#fff', padding: 24, minHeight: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Title level={4}>Nội dung của kênh</Title>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchVideos} loading={loading}>
                Cập nhật dữ liệu
            </Button>
        </div>

        {/* Các Tab giả lập giống YouTube */}
        <div style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
            <Space size="large">
                <Text strong style={{ color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: 12 }}>Video</Text>
                <Text type="secondary">Trực tiếp</Text>
                <Text type="secondary">Bài đăng</Text>
                <Text type="secondary">Danh sách phát</Text>
            </Space>
        </div>

        <Table 
            rowKey="id"
            columns={columns} 
            dataSource={videos} 
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    </div>
  );
};

export default ChannelContent;