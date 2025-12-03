import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Progress, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, YoutubeFilled, EyeFilled, LikeFilled } from '@ant-design/icons';

const Dashboard = () => {
  // Lấy thông tin kênh đang chọn từ MainLayout truyền xuống
  const [selectedChannel] = useOutletContext();

  // --- DỮ LIỆU GIẢ (MOCK) ---
  const globalStats = { views: '1.2M', subs: '450K', posts: 120, growth: 12.5 };
  const channelStats = { views: '85K', subs: '12.5K', posts: 15, growth: -5.2 };

  // Chọn dữ liệu hiển thị tùy theo đang ở đâu
  const stats = selectedChannel ? channelStats : globalStats;
  const title = selectedChannel ? `Thống kê kênh: ${selectedChannel.name}` : 'Tổng quan toàn hệ thống';

  // Dữ liệu bảng bài viết gần đây
  const recentPosts = [
    { key: 1, title: 'Review iPhone 16 Pro Max', views: 12000, likes: 500, status: 'published' },
    { key: 2, title: 'Vlog đi Đà Lạt', views: 3400, likes: 120, status: 'published' },
    { key: 3, title: 'Hướng dẫn ReactJS', views: 0, likes: 0, status: 'processing' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>{title}</h2>

      {/* 1. CÁC THẺ THỐNG KÊ (CARDS) */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng lượt xem" 
              value={stats.views} 
              prefix={<EyeFilled style={{color: '#1890ff'}}/>} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Người theo dõi" 
              value={stats.subs} 
              prefix={<YoutubeFilled style={{color: 'red'}}/>} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Bài viết tháng này" 
              value={stats.posts} 
            />
            <Progress percent={70} size="small" status="active" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tăng trưởng"
              value={Math.abs(stats.growth)}
              precision={2}
              valueStyle={{ color: stats.growth > 0 ? '#3f8600' : '#cf1322' }}
              prefix={stats.growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
            <div style={{fontSize: 12, color: '#888'}}>So với tháng trước</div>
          </Card>
        </Col>
      </Row>

      {/* 2. BIỂU ĐỒ & DANH SÁCH (Giả lập) */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={16}>
          <Card title="Hoạt động gần đây">
            <Table 
              dataSource={recentPosts} 
              pagination={false}
              columns={[
                { title: 'Tiêu đề video', dataIndex: 'title', render: t => <b>{t}</b> },
                { title: 'Views', dataIndex: 'views' },
                { title: 'Likes', dataIndex: 'likes' },
                { title: 'Trạng thái', dataIndex: 'status', render: s => (
                    s === 'published' 
                    ? <Tag color="green">Đã đăng</Tag> 
                    : <Tag color="orange">Đang xử lý</Tag>
                )}
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Chất lượng nội dung">
            <div style={{textAlign: 'center', padding: 20}}>
               <Progress type="circle" percent={85} format={() => 'Tốt'} />
               <p style={{marginTop: 10}}>Điểm SEO trung bình</p>
            </div>
            <div style={{marginTop: 10}}>
                <div>Tương tác: <Progress percent={60} /></div>
                <div>Click rate: <Progress percent={45} status="exception" /></div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;