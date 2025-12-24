// src/pages/Workspaces.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Spin, Typography, message, Modal, Form, Input, Avatar, Tooltip, Tag } from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  SettingOutlined, 
  ArrowRightOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import { createWorkspace, getWorkspaces } from '../services/api';

const { Title, Text } = Typography;
const { Meta } = Card;

// Hàm tạo màu ngẫu nhiên cho Avatar dựa trên tên Workspace (cho đẹp)
const getAvatarColor = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a', '#eb2f96'];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const Workspaces = () => {
  // --- GIỮ NGUYÊN LOGIC CŨ ---
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleViewWorkspace = (workspaceId) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleEditWorkspace = (workspaceId) => {
    navigate(`/workspaces/${workspaceId}/edit`);
  };

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspaces();
      // Kiểm tra kỹ dữ liệu trả về để tránh lỗi map
      setWorkspaces(Array.isArray(response.data) ? response.data : []); 
    } catch (error) {
      message.error('Lỗi khi tải danh sách Workspaces.');
      console.error('Fetch workspaces error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreateWorkspace = useCallback(async (values) => {
    setIsCreatingWorkspace(true);
    try {
      await createWorkspace(values);
      message.success('Tạo Workspace thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchWorkspaces(); 
    } catch (error) {
      message.error('Lỗi khi tạo Workspace.');
      console.error('Create workspace error:', error);
    } finally {
      setIsCreatingWorkspace(false);
    }
  }, [setIsCreatingWorkspace, setIsModalVisible, form, fetchWorkspaces]);

  // --- PHẦN GIAO DIỆN MỚI (Render) ---
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      
      {/* 1. HEADER: Tiêu đề và Nút tạo mới nằm ngang hàng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Không gian làm việc</Title>
            <Text type="secondary">Quản lý các dự án và nhóm của bạn</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={showModal}>
             Tạo Workspace mới
        </Button>
      </div>

      <Spin spinning={loading}>
        {/* 2. GRID: Danh sách Workspaces dạng thẻ đẹp */}
        <Row gutter={[24, 24]}>
          {workspaces.map((workspace) => (
            <Col xs={24} sm={12} md={8} lg={6} key={workspace.id}>
              <Card
                hoverable
                style={{ 
                    borderRadius: 12, 
                    overflow: 'hidden', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                actions={[
                  <Tooltip title="Chỉnh sửa">
                      <SettingOutlined key="edit" onClick={() => handleEditWorkspace(workspace.id)} />
                  </Tooltip>,
                  <Tooltip title="Thành viên (Demo)">
                      <TeamOutlined key="members" /> <span style={{ fontSize: 12 }}>3</span>
                  </Tooltip>,
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => handleViewWorkspace(workspace.id)}
                    style={{ fontWeight: 600 }}
                  >
                    Truy cập <ArrowRightOutlined />
                  </Button>
                ]}
              >
                <div style={{ textAlign: 'center', paddingBottom: 10 }}>
                    {/* Avatar hiển thị chữ cái đầu của tên */}
                    <Avatar 
                      size={64} 
                      style={{ 
                          backgroundColor: getAvatarColor(workspace.name || '?'), 
                          fontSize: 24, 
                          marginBottom: 16,
                          verticalAlign: 'middle'
                      }}
                    >
                      {workspace.name ? workspace.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    
                    <Title level={4} style={{ marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {workspace.name}
                    </Title>
                    
                    <div style={{ height: 40, overflow: 'hidden', color: '#888', fontSize: 13, marginBottom: 8 }}>
                        {workspace.description || 'Chưa có mô tả cho nhóm này.'}
                    </div>
                    
                    <Tag color="blue">Admin</Tag> {/* Demo role */}
                </div>
              </Card>
            </Col>
          ))}

          {/* Nếu chưa có workspace nào thì hiện ô dấu cộng to */}
          {!loading && workspaces.length === 0 && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button 
                    type="dashed" 
                    onClick={showModal}
                    style={{ 
                        width: '100%', 
                        height: 230, 
                        borderRadius: 12, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#fafafa'
                    }}
                >
                    <PlusOutlined style={{ fontSize: 32, color: '#999', marginBottom: 10 }} />
                    <span style={{ color: '#666' }}>Tạo nhóm đầu tiên</span>
                </Button>
              </Col>
          )}
        </Row>
      </Spin>

      {/* 3. MODAL: Giữ nguyên logic form */}
      <Modal
        title="Tạo Workspace mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered // Căn giữa màn hình cho đẹp
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkspace}>
          <Form.Item
            name="name"
            label="Tên Workspace"
            rules={[{ required: true, message: 'Vui lòng nhập tên Workspace!' }]}
          >
            <Input placeholder="Ví dụ: Team Marketing, Dự án Tết..." size="large" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả ngắn gọn về nhóm này..." />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={isCreatingWorkspace}>
                    Hoàn tất
                </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Workspaces;