import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, message, Space } from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import api from '../services/api';

const PostHistory = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  // Hàm lấy danh sách bài viết
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const workspaceId = localStorage.getItem('workspace_id') || 1;
      const res = await api.get(`/workspaces/${workspaceId}/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Hàm xử lý nút "Đăng ngay" cho bài đang nháp
  const handlePublishNow = async (postId) => {
    message.loading({ content: 'Đang đẩy lên YouTube...', key: 'pub' });
    try {
      const workspaceId = localStorage.getItem('workspace_id') || 1;
      await api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
      message.success({ content: 'Đăng thành công!', key: 'pub' });
      fetchPosts(); // Load lại danh sách
    } catch (error) {
      console.error("Chi tiết lỗi:", error); 
      
      message.error({ content: 'Lỗi khi đăng bài', key: 'pub' });
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '50%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'published') return <Tag icon={<CheckCircleOutlined />} color="success">Đã đăng</Tag>;
        if (status === 'draft') return <Tag icon={<ClockCircleOutlined />} color="warning">Lưu nháp</Tag>;
        return <Tag color="default">{status}</Tag>;
      }
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<CloudUploadOutlined />} 
              onClick={() => handlePublishNow(record.id)}
            >
              Đăng ngay
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Lịch sử bài đăng" 
      extra={<Button icon={<SyncOutlined />} onClick={fetchPosts}>Làm mới</Button>}
    >
      <Table 
        rowKey="id"
        dataSource={posts} 
        columns={columns} 
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};

export default PostHistory;