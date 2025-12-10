import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Typography } from 'antd';
import { ArrowUpOutlined, PlayCircleOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard = () => {
  // Lấy thông tin kênh đang chọn từ MainLayout
  const [selectedChannel] = useOutletContext();

  // Dữ liệu giả lập (Demo) - Khi nào muốn xịn thì gọi API thay vào
  const stats = {
     views: selectedChannel?.statistics?.viewCount || 0,
    subs: selectedChannel?.statistics?.subscriberCount || 0,
    posts: selectedChannel?.statistics?.videoCount || 0,
    growth: 0
  };

    const demoVideos = [
    { key: 'demo1', title: 'Review iPhone 16 Pro Max (Demo)', views: 12000, likes: 500, status: 'published' },
    { key: 'demo2', title: 'Vlog đi Đà Lạt (Demo)', views: 3400, likes: 120, status: 'published' }
  ];

  // Nếu API trả về video thật thì dùng, nếu không (hoặc mảng rỗng) thì dùng Demo
  const recentVideos = (selectedChannel?.recent_videos && selectedChannel.recent_videos.length > 0) 
      ? selectedChannel.recent_videos 
      : demoVideos;
      
  const columns = [
    { title: 'Tiêu đề video', dataIndex: 'title', key: 'title', render: text => <b>{text}</b> },
    { title: 'Views', dataIndex: 'views', key: 'views' },
    { title: 'Likes', dataIndex: 'likes', key: 'likes' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: status => (
        status === 'published' ? <Tag color="success">Đã đăng</Tag> : <Tag color="warning">Đang xử lý</Tag>
    )}
  ];

  return (
    <div className="dashboard-container">
      {/* 1. Phần tiêu đề */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
            {selectedChannel 
                ? `Thống kê kênh: ${selectedChannel.username || selectedChannel.social_id}` 
                : 'Tổng quan toàn hệ thống'}
        </Title>
      </div>

      {/* 2. Các thẻ thống kê (4 ô trên cùng) */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic 
                title="Tổng lượt xem" 
                value={stats.views} 
                prefix={<PlayCircleOutlined style={{color: '#1890ff'}}/>} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic 
                title="Người theo dõi" 
                value={stats.subs} 
                prefix={<YoutubeFilled style={{color: '#ff0000'}}/>} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="Bài viết tháng này" value={stats.posts} suffix="/ 150" />
            <Progress percent={70} showInfo={false} size="small" strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic 
                title="Tăng trưởng" 
                value={stats.growth} 
                precision={2} 
                valueStyle={{ color: '#3f8600' }} 
                prefix={<ArrowUpOutlined />} 
                suffix="%" 
            />
            <Text type="secondary" style={{fontSize: 12}}>So với tháng trước</Text>
          </Card>
        </Col>
      </Row>

      {/* 3. Phần Bảng hoạt động và Biểu đồ tròn (Dưới) */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Bảng bên trái */}
        <Col span={16}>
          <Card title="Hoạt động gần đây" bordered={false}>
            <Table 
                dataSource={recentVideos} 
                columns={columns} 
                pagination={false} 
                size="small"
            />
          </Card>
        </Col>

        {/* Biểu đồ tròn bên phải */}
        <Col span={8}>
          <Card title="Chất lượng nội dung" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
            <Progress 
                type="circle" 
                percent={85} 
                format={() => <span style={{color: '#1890ff', fontSize: 24}}>Tốt</span>} 
                width={120}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            />
            <div style={{ marginTop: 16 }}>
                <Text>Điểm SEO trung bình</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Cần import YoutubeFilled ở đầu file (em thêm ở trên rồi nhưng nhắc lại cho chắc)
import { YoutubeFilled } from '@ant-design/icons';

export default Dashboard;