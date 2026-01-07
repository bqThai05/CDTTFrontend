// src/pages/PostHistory.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, message, Space, Typography, Tooltip, Tabs, Select, Calendar, Badge, Modal, Spin } from 'antd';
import { 
  CloudUploadOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  SyncOutlined, SearchOutlined, DeleteOutlined, RocketFilled,
  CalendarOutlined, UnorderedListOutlined, ExclamationCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { getWorkspaces, getWorkspacePosts, publishWorkspacePostNow, deleteWorkspacePost } from '../services/api';

const { Title, Text } = Typography;
const { confirm } = Modal;

const PostHistory = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // 1. Load danh sách Workspace trước
  useEffect(() => {
    const fetchWS = async () => {
      try {
        const res = await getWorkspaces();
        if (res.data.length > 0) {
            setWorkspaces(res.data);
            setSelectedWorkspace(res.data[0].id); // Chọn nhóm đầu tiên mặc định
        }
      } catch {
        message.error("Không thể tải danh sách nhóm");
      }
    };
    fetchWS();
  }, []);

  // 2. Khi chọn Workspace -> Load bài viết của nhóm đó
  useEffect(() => {
    if (selectedWorkspace) {
        fetchPosts(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const fetchPosts = async (wsId) => {
    setLoading(true);
    try {
      const res = await getWorkspacePosts(wsId);
      setPosts(res.data);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Đăng Ngay (Publish Now)
  const handlePublishNow = (postId) => {
    confirm({
        title: 'Đăng bài viết này ngay lập tức?',
        icon: <RocketFilled style={{ color: '#1677ff' }} />,
        content: 'Bài viết sẽ được đẩy lên các nền tảng đã chọn.',
        onOk: async () => {
            try {
                message.loading({ content: 'Đang xử lý...', key: 'pub' });
                await publishWorkspacePostNow(selectedWorkspace, postId);
                message.success({ content: 'Đã đẩy lệnh đăng bài!', key: 'pub' });
                fetchPosts(selectedWorkspace); // Reload lại
            } catch  {
                message.error({ content: 'Lỗi khi đăng bài', key: 'pub' });
            }
        }
    });
  };

  // 4. Xử lý Xóa bài
  const handleDelete = (postId) => {
      confirm({
          title: 'Xóa bài viết?',
          icon: <ExclamationCircleFilled style={{ color: 'red' }} />,
          okType: 'danger',
          onOk: async () => {
              try {
                  await deleteWorkspacePost(selectedWorkspace, postId);
                  message.success('Đã xóa');
                  fetchPosts(selectedWorkspace);
              } catch  {
                  message.error('Lỗi khi xóa');
              }
          }
      });
  };

  // --- RENDER CHO PHẦN LỊCH (CALENDAR) ---
  const dateCellRender = (value) => {
    const listData = posts.filter(post => 
        post.scheduled_at && dayjs(post.scheduled_at).isSame(value, 'day')
    );
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <li key={item.id} style={{ marginBottom: 4 }}>
            <Badge 
                status={item.status === 'published' ? 'success' : 'warning'} 
                text={<span style={{fontSize: 12}}>{item.title || 'Không tiêu đề'}</span>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
          <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.title || '(Không tiêu đề)'}</div>
              <div style={{ color: '#666', fontSize: 13, maxHeight: 40, overflow: 'hidden' }}>{text}</div>
          </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
          <div>
              {record.scheduled_at ? (
                  <>
                    <CalendarOutlined /> {dayjs(record.scheduled_at).format('DD/MM/YYYY HH:mm')}
                  </>
              ) : <Tag>Đăng ngay</Tag>}
          </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'published' ? 'success' : 'warning';
        let icon = status === 'published' ? <CheckCircleOutlined /> : <ClockCircleOutlined />;
        let text = status === 'published' ? 'Đã đăng' : 'Chờ đăng';
        return <Tag icon={icon} color={color}>{text.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.status !== 'published' && (
            <Tooltip title="Đăng ngay">
                <Button type="primary" size="small" icon={<RocketFilled />} onClick={() => handlePublishNow(record.id)} />
            </Tooltip>
          )}
           <Tooltip title="Xóa">
               <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
           </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        
        {/* HEADER & FILTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={2} style={{ margin: 0 }}>Lịch sử tin & Bài đăng</Title>
                <Text type="secondary">Theo dõi lộ trình nội dung của các nhóm</Text>
            </div>
            
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Xem nhóm:</span>
                <Select 
                    style={{ width: 200 }} 
                    value={selectedWorkspace}
                    onChange={setSelectedWorkspace}
                    placeholder="Chọn nhóm..."
                    loading={workspaces.length === 0}
                >
                    {workspaces.map(ws => (
                        <Select.Option key={ws.id} value={ws.id}>{ws.name}</Select.Option>
                    ))}
                </Select>
                <Button icon={<SyncOutlined />} onClick={() => fetchPosts(selectedWorkspace)} />
            </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <Tabs defaultActiveKey="1" items={[
                 {
                     key: '1',
                     label: <span><UnorderedListOutlined /> Dạng Danh Sách</span>,
                     children: (
                        <Table 
                            rowKey="id"
                            dataSource={posts} 
                            columns={columns} 
                            loading={loading}
                            pagination={{ pageSize: 6 }}
                        />
                     )
                 },
                 {
                     key: '2',
                     label: <span><CalendarOutlined /> Dạng Lịch (Calendar)</span>,
                     children: (
                         <div style={{ padding: 10 }}>
                             {loading ? <div style={{textAlign: 'center', padding: 50}}><Spin /></div> : (
                                <Calendar dateCellRender={dateCellRender} />
                             )}
                         </div>
                     )
                 }
             ]} />
        </Card>
    </div>
  );
};

export default PostHistory;