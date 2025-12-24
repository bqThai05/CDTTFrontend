// src/pages/PostHistory.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, message, Space, Typography, Tooltip, Avatar, Tabs, Input, Select, Badge } from 'antd';
import { 
  CloudUploadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined,
  SearchOutlined,
  YoutubeFilled,
  FacebookFilled,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const PostHistory = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Hàm lấy danh sách bài viết (Logic cũ giữ nguyên)
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const workspaceId = localStorage.getItem('workspace_id') || 1;
      // Giả lập dữ liệu nếu API chưa trả về nền tảng (platform)
      const res = await api.get(`/workspaces/${workspaceId}/posts`);
      
      // Map thêm dữ liệu giả nếu thiếu để test giao diện
      const dataWithPlatform = res.data.map(item => ({
          ...item,
          platform: item.platform || (Math.random() > 0.5 ? 'youtube' : 'facebook') // Random nếu thiếu
      }));
      
      setPosts(dataWithPlatform);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
      // Dữ liệu mẫu để test giao diện nếu API lỗi
      setPosts([
          { id: 1, content: 'Video giới thiệu sản phẩm mới...', status: 'published', platform: 'youtube', created_at: new Date(), media_url: 'https://via.placeholder.com/50' },
          { id: 2, content: 'Chào mừng ngày lễ lớn!', status: 'draft', platform: 'facebook', created_at: new Date(), media_url: '' },
          { id: 3, content: 'Thông báo bảo trì server...', status: 'failed', platform: 'facebook', created_at: new Date(), media_url: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Hàm xử lý đăng ngay
  const handlePublishNow = async (postId) => {
    message.loading({ content: 'Đang đẩy bài lên mạng xã hội...', key: 'pub' });
    try {
      const workspaceId = localStorage.getItem('workspace_id') || 1;
      await api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
      message.success({ content: 'Đăng thành công!', key: 'pub' });
      fetchPosts(); 
    } catch (error) {
      console.error("Chi tiết lỗi:", error); 
      message.error({ content: 'Lỗi khi đăng bài', key: 'pub' });
    }
  };

  // Lọc dữ liệu
  const filteredPosts = posts.filter(item => {
      const matchSearch = item.content?.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchStatus;
  });

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Bài viết',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
      render: (text, record) => (
          <div style={{ display: 'flex', gap: 12 }}>
              {/* Thumbnail ảnh/video */}
              <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {record.media_url ? (
                      <img src={record.media_url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                      <CloudUploadOutlined style={{ fontSize: 24, color: '#ccc' }} />
                  )}
              </div>
              
              {/* Nội dung text */}
              <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {record.platform === 'youtube' ? <YoutubeFilled style={{ color: 'red' }} /> : <FacebookFilled style={{ color: '#1877f2' }} />}
                      <Text strong style={{ fontSize: 13, color: '#888' }}>
                          {record.platform === 'youtube' ? 'YouTube Video' : 'Facebook Post'}
                      </Text>
                  </div>
                  <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 300, display: 'block' }}>
                      {text || '(Không có nội dung text)'}
                  </Text>
              </div>
          </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = 'default';
        let icon = null;
        let text = status;

        if (status === 'published') {
            color = 'success';
            icon = <CheckCircleOutlined />;
            text = 'Đã đăng';
        } else if (status === 'draft') {
            color = 'warning';
            icon = <ClockCircleOutlined />;
            text = 'Lưu nháp';
        } else if (status === 'failed') {
            color = 'error';
            icon = <CloseCircleOutlined />;
            text = 'Lỗi';
        }

        return <Tag icon={icon} color={color} style={{ padding: '4px 10px', borderRadius: 20 }}>{text.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '20%',
      render: (text) => (
          <div>
              <div>{new Date(text).toLocaleDateString('vi-VN')}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{new Date(text).toLocaleTimeString('vi-VN')}</Text>
          </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Tooltip title="Đăng ngay lập tức">
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CloudUploadOutlined />} 
                  onClick={() => handlePublishNow(record.id)}
                >
                  Đăng
                </Button>
            </Tooltip>
          )}
           {record.status === 'published' && (
             <Tooltip title="Xem bài viết gốc">
                <Button size="small" icon={<EyeOutlined />} href="#" target="_blank" />
             </Tooltip>
           )}
           <Tooltip title="Xóa">
               <Button size="small" danger type="text" icon={<DeleteOutlined />} />
           </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Header trang */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={2} style={{ margin: 0 }}>Quản lý nội dung</Title>
                <Text type="secondary">Theo dõi trạng thái tất cả bài viết của bạn</Text>
            </div>
            <Button icon={<SyncOutlined />} onClick={fetchPosts} loading={loading}>
                Làm mới dữ liệu
            </Button>
        </div>

        {/* Thanh công cụ lọc */}
        <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Input 
                    placeholder="Tìm kiếm nội dung bài viết..." 
                    prefix={<SearchOutlined style={{ color: '#ccc' }} />} 
                    style={{ width: 300 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                
                <Select 
                    defaultValue="all" 
                    style={{ width: 180 }} 
                    onChange={setFilterStatus}
                    suffixIcon={<ClockCircleOutlined />}
                >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="published">✅ Đã đăng thành công</Option>
                    <Option value="draft">📝 Bản nháp (Draft)</Option>
                    <Option value="failed">❌ Gặp lỗi</Option>
                </Select>

                <Select defaultValue="all" style={{ width: 150 }} placeholder="Nền tảng">
                     <Option value="all">Tất cả nền tảng</Option>
                     <Option value="youtube">YouTube</Option>
                     <Option value="facebook">Facebook</Option>
                </Select>
            </div>
        </Card>

        {/* Bảng dữ liệu chính */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
             <Tabs defaultActiveKey="1" tabBarStyle={{ padding: '0 24px' }}>
                <TabPane tab="Danh sách bài viết" key="1">
                    <Table 
                        rowKey="id"
                        dataSource={filteredPosts} 
                        columns={columns} 
                        loading={loading}
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                    />
                </TabPane>
                <TabPane tab="Lịch đăng bài (Calendar)" key="2">
                     <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                         <ClockCircleOutlined style={{ fontSize: 40, marginBottom: 16 }} />
                         <p>Tính năng Lịch (Calendar View) đang được phát triển...</p>
                     </div>
                </TabPane>
             </Tabs>
        </Card>
    </div>
  );
};

export default PostHistory;