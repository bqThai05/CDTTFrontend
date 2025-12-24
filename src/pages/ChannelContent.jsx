// src/pages/ChannelContent.jsx
import React, { useState } from 'react';
import { Table, Card, Button, Avatar, Typography, Row, Col, Tag, Space, Tooltip, Image, Breadcrumb } from 'antd';
import { 
  YoutubeFilled, 
  FacebookFilled, 
  ArrowLeftOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  GlobalOutlined,
  LockOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ChannelContent = () => {
  // 1. TRẠNG THÁI: Tài khoản nào đang được chọn? (Mặc định là null -> Hiện danh sách chọn)
  const [selectedAccount, setSelectedAccount] = useState(null);

  // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
  
  // Danh sách các tài khoản đang kết nối
  const mockAccounts = [
    { id: 1, name: 'Review Công Nghệ Z', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', sub: '125K', type: 'Channel' },
    { id: 2, name: 'Shop Quần Áo Nam', platform: 'facebook', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', sub: '45K', type: 'Page' },
    { id: 3, name: 'Vlog Đời Sống', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', sub: '12K', type: 'Channel' },
  ];

  // Danh sách video chi tiết (Khi bấm vào sẽ hiện cái này)
  const mockVideos = [
    {
        id: 1,
        title: 'Đánh giá iPhone 16 Pro Max - Có đáng tiền?',
        description: 'Chi tiết về hiệu năng, camera và pin sau 1 tuần sử dụng.',
        thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg',
        duration: '15:30',
        privacy: 'public',
        date: '2025-12-20',
        views: 120500,
        likes: 5400,
        comments: 120
    },
    {
        id: 2,
        title: 'Hướng dẫn Setup góc làm việc tối giản',
        description: 'Chia sẻ các món đồ decor bàn làm việc giá rẻ.',
        thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
        duration: '08:45',
        privacy: 'public',
        date: '2025-12-18',
        views: 45000,
        likes: 2100,
        comments: 85
    },
    {
        id: 3,
        title: 'Video nháp: Teaser dự án mới',
        description: 'Chưa công bố.',
        thumbnail: 'https://via.placeholder.com/120x68?text=Draft',
        duration: '01:00',
        privacy: 'private',
        date: '2025-12-15',
        views: 0,
        likes: 0,
        comments: 0
    }
  ];

  // --- HÀM RENDER ---

  // Giao diện 1: DANH SÁCH TÀI KHOẢN (Hiện ra đầu tiên)
  const renderAccountSelection = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Chọn kênh để quản lý</Title>
        <Text type="secondary">Chọn một tài khoản YouTube hoặc Facebook để xem nội dung chi tiết</Text>
      </div>

      <Row gutter={[24, 24]}>
        {mockAccounts.map((acc) => (
          <Col xs={24} sm={12} md={8} lg={6} key={acc.id}>
            <Card
              hoverable
              onClick={() => setSelectedAccount(acc)} // Bấm vào thì lưu tài khoản lại
              style={{ borderRadius: 12, textAlign: 'center', borderTop: `4px solid ${acc.platform === 'youtube' ? '#ff0000' : '#1877f2'}` }}
            >
               <Avatar 
                 src={acc.avatar} 
                 size={80} 
                 style={{ marginBottom: 16, border: '2px solid #f0f0f0' }}
               />
               <Title level={4} style={{ fontSize: 18, marginBottom: 4 }}>{acc.name}</Title>
               <Tag icon={acc.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} color={acc.platform === 'youtube' ? 'error' : 'blue'}>
                  {acc.type}
               </Tag>
               <div style={{ marginTop: 12, color: '#666' }}>
                  <b>{acc.sub}</b> người theo dõi
               </div>
            </Card>
          </Col>
        ))}
        
        {/* Nút thêm mới giả lập */}
        <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
                hoverable 
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, border: '1px dashed #d9d9d9', background: '#fafafa' }}
            >
                <div style={{ textAlign: 'center', color: '#999' }}>
                    <div style={{ fontSize: 32 }}>+</div>
                    <div>Thêm kết nối mới</div>
                </div>
            </Card>
        </Col>
      </Row>
    </div>
  );

  // Giao diện 2: CHI TIẾT NỘI DUNG (Hiện ra sau khi chọn)
  const renderChannelDetail = () => {
    // Cấu hình cột cho bảng video
    const columns = [
        {
          title: 'Video / Bài viết',
          width: 400,
          render: (_, record) => (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ position: 'relative', width: 120 }}>
                <Image src={record.thumbnail} width={120} height={68} style={{ borderRadius: 6, objectFit: 'cover' }} preview={false} />
                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 10, padding: '1px 4px', borderRadius: 2 }}>{record.duration}</div>
              </div>
              <div>
                <Text strong style={{ fontSize: 14 }} ellipsis>{record.title}</Text>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{record.description}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined />} type="text" /></Tooltip>
                    <Tooltip title="Xem"><Button size="small" icon={<YoutubeFilled />} type="text" /></Tooltip>
                    <Tooltip title="Xóa"><Button size="small" icon={<DeleteOutlined />} type="text" danger /></Tooltip>
                </div>
              </div>
            </div>
          )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'privacy',
            render: (val) => val === 'public' 
                ? <Tag color="success" icon={<GlobalOutlined />}>Công khai</Tag> 
                : <Tag color="default" icon={<LockOutlined />}>Riêng tư</Tag>
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'date',
            render: (val) => <div>{val}<br/><span style={{fontSize: 11, color:'#999'}}>Đã xuất bản</span></div>
        },
        {
            title: 'Số liệu',
            render: (_, record) => (
                <Space size="large" style={{ color: '#666' }}>
                    <div style={{ textAlign: 'center' }}><div>{record.views.toLocaleString()}</div><EyeOutlined /></div>
                    <div style={{ textAlign: 'center' }}><div>{record.comments.toLocaleString()}</div><MessageOutlined /></div>
                    <div style={{ textAlign: 'center' }}><div>{record.likes.toLocaleString()}</div><LikeOutlined /></div>
                </Space>
            )
        }
    ];

    return (
        <div>
            {/* Thanh điều hướng quay lại */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedAccount(null)}>Quay lại</Button>
                    <Breadcrumb items={[{ title: 'Danh sách kênh' }, { title: selectedAccount.name }]} />
                </Space>
                <Button type="primary" icon={<VideoCameraAddOutlined />}>Tạo bài mới</Button>
            </div>

            {/* Thông tin kênh đang xem */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar src={selectedAccount.avatar} size={64} style={{ border: '2px solid #ddd' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedAccount.name}</Title>
                        <Text type="secondary">Đang quản lý nội dung trên {selectedAccount.platform === 'youtube' ? 'YouTube' : 'Facebook'}</Text>
                    </div>
                </div>
            </Card>

            {/* Bảng dữ liệu */}
            <Card title="Nội dung đã đăng" bordered={false} style={{ borderRadius: 12 }}>
                <Table 
                    rowKey="id" 
                    columns={columns} 
                    dataSource={mockVideos} 
                    pagination={{ pageSize: 5 }} 
                />
            </Card>
        </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Logic điều hướng: Nếu chưa chọn acc -> Render List, Nếu chọn rồi -> Render Detail */}
        {!selectedAccount ? renderAccountSelection() : renderChannelDetail()}
    </div>
  );
};

export default ChannelContent;