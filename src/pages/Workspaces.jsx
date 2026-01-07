// src/pages/Workspaces.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Card, Row, Col, Avatar, 
  Dropdown, Modal, Form, Input, message, Spin, Empty, Tag, Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  TeamOutlined, 
  RocketFilled,
  SettingOutlined,
  ExclamationCircleFilled,
  LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import API
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '../services/api'; 

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal Tạo mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State quản lý Modal Chỉnh sửa (Edit)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [form] = Form.useForm();      // Form tạo mới
  const [editForm] = Form.useForm();  // Form chỉnh sửa
  const navigate = useNavigate();

  // 1. Tải danh sách nhóm từ API
  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await getWorkspaces();
      // Backend trả về mảng danh sách workspace
      setWorkspaces(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể tải danh sách nhóm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // 2. Xử lý Tạo nhóm mới
  const handleCreate = async (values) => {
    try {
      await createWorkspace({ name: values.name }); // Backend chỉ cần field 'name'
      message.success('Tạo nhóm thành công!');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchWorkspaces(); // Load lại danh sách
    } catch  {
      message.error('Lỗi khi tạo nhóm.');
    }
  };

  // 3. Xử lý mở Modal Sửa
  const openEditModal = (workspace) => {
    setEditingWorkspace(workspace);
    editForm.setFieldsValue({ name: workspace.name });
    setIsEditModalOpen(true);
  };

  // 4. Xử lý Lưu thay đổi (Sửa tên)
  const handleUpdate = async (values) => {
    try {
      await updateWorkspace(editingWorkspace.id, values);
      message.success('Cập nhật thành công!');
      setIsEditModalOpen(false);
      fetchWorkspaces();
    } catch {
      message.error('Lỗi khi cập nhật (Có thể bạn không phải Owner).');
    }
  };

  // 5. Xử lý Xóa nhóm
  const showDeleteConfirm = (workspaceId) => {
    confirm({
      title: 'Xóa nhóm làm việc này?',
      icon: <ExclamationCircleFilled style={{ color: 'red' }} />,
      content: 'Hành động này không thể hoàn tác. Tất cả bài đăng trong nhóm sẽ mất.',
      okText: 'Xóa luôn',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
            await deleteWorkspace(workspaceId);
            message.success('Đã xóa nhóm!');
            fetchWorkspaces();
        } catch {
            message.error('Không thể xóa (Chỉ Owner mới được xóa).');
        }
      },
    });
  };

  // MENU CÀI ĐẶT (Nút 3 chấm trên thẻ)
  const getMenuProps = (workspace) => ({
    items: [
        {
            key: 'edit',
            label: 'Đổi tên nhóm',
            icon: <EditOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                openEditModal(workspace);
            }
        },
        { type: 'divider' },
        {
            key: 'delete',
            label: 'Giải tán nhóm',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                showDeleteConfirm(workspace.id);
            }
        }
    ]
  });

  // Random màu gradient cho đẹp
  const getGradient = (index) => {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)'
      ];
      return gradients[index % gradients.length];
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <RocketFilled style={{color: '#faad14'}} /> Không gian làm việc
          </Title>
          <Text type="secondary">Quản lý các dự án và đội nhóm của bạn</Text>
        </div>
        
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ 
            height: 45, borderRadius: 8, fontWeight: 600,
            background: '#1677ff', boxShadow: '0 4px 10px rgba(22, 119, 255, 0.3)'
          }}
        >
          Tạo nhóm mới
        </Button>
      </div>

      {/* DANH SÁCH NHÓM */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" tip="Đang tải danh sách..." /></div>
      ) : workspaces.length === 0 ? (
        <Empty 
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 200 }}
            description={<span style={{ fontSize: 16, color: '#888' }}>Bạn chưa tham gia nhóm nào cả</span>}
        >
            <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>Tạo nhóm ngay</Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {workspaces.map((ws, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={ws.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  style={{ 
                      borderRadius: 16, overflow: 'hidden', border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      height: '100%'
                  }}
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    {/* Phần Cover Màu */}
                    <div style={{ height: 80, background: getGradient(index), position: 'relative' }}>
                        {/* Nút Cài đặt góc phải */}
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                             <Dropdown menu={getMenuProps(ws)} trigger={['click']} placement="bottomRight">
                                <Button 
                                    shape="circle" size="small"
                                    icon={<SettingOutlined />} 
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.3)', color: '#fff' }}
                                    onClick={(e) => e.stopPropagation()} 
                                />
                             </Dropdown>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px', marginTop: -35, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Avatar Tên Nhóm */}
                        <Avatar 
                            size={70} 
                            style={{ 
                                backgroundColor: '#fff', color: '#333', 
                                fontSize: 28, fontWeight: 'bold',
                                border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {ws.name.charAt(0).toUpperCase()}
                        </Avatar>

                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Title level={4} style={{ margin: 0, width: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ws.name}
                                </Title>
                                <Tag color="blue">Owner</Tag>
                            </div>
                            
                            <Text type="secondary" style={{ fontSize: 13, marginTop: 5, display: 'block' }}>
                                ID Nhóm: #{ws.id}
                            </Text>
                        </div>

                        {/* Footer Card */}
                        <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#888' }}>
                                <TeamOutlined /> <span>Thành viên</span>
                            </div>
                            <Tooltip title="Vào không gian làm việc">
                                <Button type="primary" shape="circle" icon={<LoginOutlined />} ghost />
                            </Tooltip>
                        </div>
                    </div>
                </Card>
              </Col>
          ))}
        </Row>
      )}

      {/* --- MODAL TẠO MỚI --- */}
      <Modal
        title="🚀 Tạo Không Gian Làm Việc Mới"
        open={isCreateModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="Tạo ngay"
        cancelText="Hủy bỏ"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm!' }]}>
            <Input size="large" placeholder="VD: Marketing Team A..." autoFocus />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL CHỈNH SỬA --- */}
      <Modal
        title="✏️ Đổi Tên Nhóm"
        open={isEditModalOpen}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Tên mới" rules={[{ required: true, message: 'Tên không được để trống' }]}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Workspaces;