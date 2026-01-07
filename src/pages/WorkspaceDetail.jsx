// src/pages/WorkspaceDetail.jsx
import React, { useState, useEffect } from 'react';
import { 
  Tabs, Card, Table, Tag, Button, Avatar, Typography, 
  Timeline, Spin, Modal, Form, Input, Select, message, Tooltip, Badge 
} from 'antd';
import { 
  UserAddOutlined, TeamOutlined, HistoryOutlined, 
  SettingOutlined, DeleteOutlined, CrownFilled, 
  MailOutlined, ClockCircleOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Import API
import { 
  getWorkspaceDetails, 
  getWorkspaceMembers, 
  getWorkspaceLogs, 
  inviteUserToWorkspace, 
  removeWorkspaceMember 
} from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const WorkspaceDetail = () => {
  const { workspaceId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Mời
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 3 API để tiết kiệm thời gian
      const [wsRes, memRes, logRes] = await Promise.all([
        getWorkspaceDetails(workspaceId),
        getWorkspaceMembers(workspaceId),
        getWorkspaceLogs(workspaceId)
      ]);

      setWorkspace(wsRes.data);
      setMembers(memRes.data);
      setLogs(logRes.data);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể tải thông tin nhóm");
      // Nếu lỗi (ví dụ không có quyền) thì đá về trang danh sách
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mời thành viên
  const handleInvite = async (values) => {
    setInviteLoading(true);
    try {
      await inviteUserToWorkspace(workspaceId, {
        email: values.email,
        role: values.role
      });
      message.success(`Đã gửi lời mời đến ${values.email}`);
      setIsInviteOpen(false);
      form.resetFields();
      // Reload log để thấy hành động vừa làm
      const logRes = await getWorkspaceLogs(workspaceId);
      setLogs(logRes.data);
    } catch (error) {
      message.error(error.response?.data?.detail || "Lỗi khi gửi lời mời");
    } finally {
      setInviteLoading(false);
    }
  };

  // Xử lý xóa thành viên
  const handleRemoveMember = (userId) => {
    Modal.confirm({
        title: 'Xóa thành viên này?',
        content: 'Họ sẽ không thể truy cập vào nhóm nữa.',
        okType: 'danger',
        onOk: async () => {
            try {
                await removeWorkspaceMember(workspaceId, userId);
                message.success('Đã xóa thành viên');
                fetchData(); // Reload lại
            } catch {
                message.error('Không thể xóa thành viên này');
            }
        }
    });
  };

  // Cột cho bảng thành viên
  const memberColumns = [
    {
      title: 'Thành viên',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.user?.username}`} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.user?.username}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
          let color = role === 'owner' ? 'gold' : (role === 'admin' ? 'blue' : 'green');
          return <Tag color={color}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
          record.role !== 'owner' && (
            <Tooltip title="Xóa khỏi nhóm">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveMember(record.user_id)} />
            </Tooltip>
          )
      )
    }
  ];

  if (loading) return <div style={{textAlign: 'center', padding: 100}}><Spin size="large" tip="Đang vào nhóm..." /></div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Title level={2} style={{ margin: 0 }}>{workspace?.name}</Title>
                  {workspace?.owner_id && <Tag icon={<CrownFilled />} color="gold">Premium Workspace</Tag>}
              </div>
              <Text type="secondary">Quản lý thành viên và theo dõi hoạt động</Text>
          </div>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsInviteOpen(true)}>
              Mời thành viên
          </Button>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="1" items={[
            // TAB 1: THÀNH VIÊN
            {
                key: '1',
                label: <span><TeamOutlined /> Thành viên ({members.length})</span>,
                children: (
                    <Table 
                        dataSource={members} 
                        columns={memberColumns} 
                        rowKey="user_id" 
                        pagination={false} 
                    />
                )
            },
            // TAB 2: NHẬT KÝ HOẠT ĐỘNG
            {
                key: '2',
                label: <span><HistoryOutlined /> Nhật ký hoạt động</span>,
                children: (
                    <div style={{ padding: 20 }}>
                        {logs.length === 0 ? <Text type="secondary">Chưa có hoạt động nào.</Text> : (
                            <Timeline
                                items={logs.map(log => ({
                                    color: 'blue',
                                    children: (
                                        <>
                                            <Text strong>{log.user?.username}</Text> {log.action} <br/>
                                            <Text type="secondary" style={{fontSize: 12}}>
                                                <ClockCircleOutlined /> {dayjs(log.timestamp).format('DD/MM/YYYY HH:mm')}
                                            </Text>
                                        </>
                                    ),
                                }))}
                            />
                        )}
                    </div>
                )
            },
            // TAB 3: CÀI ĐẶT
            {
                key: '3',
                label: <span><SettingOutlined /> Cài đặt</span>,
                children: (
                    <div style={{ padding: 20 }}>
                        <Text>Chức năng đổi tên và giải tán nhóm đang phát triển...</Text>
                    </div>
                )
            }
        ]} />
      </Card>

      {/* MODAL MỜI THÀNH VIÊN */}
      <Modal
        title="📧 Mời cộng sự"
        open={isInviteOpen}
        onCancel={() => setIsInviteOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={inviteLoading}
        okText="Gửi lời mời"
      >
          <Form form={form} layout="vertical" onFinish={handleInvite}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input prefix={<MailOutlined />} placeholder="nhanvien@example.com" />
              </Form.Item>
              <Form.Item name="role" label="Vai trò" initialValue="editor">
                  <Select>
                      <Option value="admin">Quản trị viên (Admin)</Option>
                      <Option value="editor">Biên tập viên (Editor)</Option>
                      <Option value="viewer">Người xem (Viewer)</Option>
                  </Select>
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
};

export default WorkspaceDetail;