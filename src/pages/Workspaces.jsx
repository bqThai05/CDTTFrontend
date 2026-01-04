// src/pages/Workspaces.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Card, Row, Col, Avatar, 
  Dropdown, Modal, Form, Input, message, Spin, Empty, Tag 
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  TeamOutlined, 
  RocketFilled,
  SettingOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import đủ các hàm từ api.js (Đảm bảo bạn đã thêm update và delete bên api.js rồi nhé)
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
  const [editingWorkspace, setEditingWorkspace] = useState(null); // Lưu nhóm đang được sửa

  const [form] = Form.useForm();      // Form tạo mới
  const [editForm] = Form.useForm();  // Form chỉnh sửa
  const navigate = useNavigate();

  // 1. Tải danh sách nhóm
  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await getWorkspaces();
      setWorkspaces(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi:", error);
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
      await createWorkspace({ name: values.name, description: values.description });
      message.success('Tạo nhóm thành công!');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchWorkspaces();
    } catch {
      message.error('Lỗi khi tạo nhóm.');
    }
  };

  // 3. Xử lý mở Modal Sửa (Khi bấm vào nút Sửa)
  const openEditModal = (workspace) => {
    setEditingWorkspace(workspace); // Lưu lại nhóm đang chọn
    // Điền dữ liệu cũ vào form
    editForm.setFieldsValue({
        name: workspace.name,
        description: workspace.description
    });
    setIsEditModalOpen(true); // Mở modal lên
  };

  // 4. Xử lý Lưu thay đổi (Khi bấm OK ở Modal Sửa)
  const handleUpdate = async (values) => {
    try {
      // Gọi API updateWorkspace mà bạn vừa thêm
      await updateWorkspace(editingWorkspace.id, values);
      message.success('Cập nhật thành công!');
      setIsEditModalOpen(false);
      fetchWorkspaces(); // Load lại danh sách mới
    } catch {
      message.error('Lỗi khi cập nhật (Có thể bạn không phải Admin).');
    }
  };

  // 5. Xử lý Xóa nhóm (Khi bấm vào nút Xóa)
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
            // Gọi API deleteWorkspace mà bạn vừa thêm
            await deleteWorkspace(workspaceId);
            message.success('Đã xóa nhóm!');
            setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
        } catch {
            message.error('Không thể xóa (Có thể bạn không phải Admin).');
        }
      },
    });
  };

  // MENU CÀI ĐẶT (Dropdown)
  const getMenuProps = (workspace) => ({
    items: [
        {
            key: 'edit',
            label: 'Chỉnh sửa thông tin',
            icon: <EditOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation(); // Quan trọng: Chặn click lan ra ngoài Card
                openEditModal(workspace);
            }
        },
        {
            key: 'delete',
            label: 'Xóa nhóm này',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation(); // Quan trọng: Chặn click lan ra ngoài Card
                showDeleteConfirm(workspace.id);
            }
        }
    ]
  });

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>

            Không gian làm việc
          </Title>
          <Text type="secondary" style={{ fontSize: 16, marginLeft: 0 }}>
              Quản lý các dự án và đội nhóm của bạn
          </Text>
        </div>
        
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ 
            height: 50, padding: '0 30px', borderRadius: 25, fontSize: 16, fontWeight: 600,
            background: 'linear-gradient(135deg, #d4145a 0%, #fbb03b 100%)',
            border: 'none', boxShadow: '0 8px 20px rgba(212, 20, 90, 0.3)'
          }}
        >
          Tạo nhóm mới
        </Button>
      </div>

      {/* DANH SÁCH NHÓM */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
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
          {workspaces.map((ws, index) => {
            const gradients = [
                'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)',
                'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
                'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
            ];
            const bgGradient = gradients[index % gradients.length];

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={ws.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  style={{ 
                      borderRadius: 20, overflow: 'hidden', border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                    {/* Phần Cover Màu */}
                    <div style={{ height: 100, background: bgGradient, position: 'relative' }}>
                        
                        {/* NÚT CÀI ĐẶT (Đã gắn Dropdown) */}
                        <div style={{ position: 'absolute', top: 15, right: 15, zIndex: 10 }}>
                             <Dropdown menu={getMenuProps(ws)} trigger={['click']} placement="bottomRight">
                                <Button 
                                    shape="circle" 
                                    icon={<SettingOutlined />} 
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.3)', color: '#fff' }}
                                    onClick={(e) => e.stopPropagation()} // Chặn click vào Card
                                />
                             </Dropdown>
                        </div>

                    </div>

                    <div style={{ padding: '0 24px 24px 24px', marginTop: -40, position: 'relative' }}>
                        <Avatar 
                            size={72} 
                            style={{ 
                                backgroundColor: '#fff', color: '#333', 
                                fontSize: 28, fontWeight: 'bold',
                                border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {ws.name.charAt(0).toUpperCase()}
                        </Avatar>

                        <div style={{ marginTop: 15 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Title level={4} style={{ margin: 0, width: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {ws.name}
                                </Title>
                                <Tag color="blue" style={{ borderRadius: 10 }}>Admin</Tag>
                            </div>
                            
                            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginTop: 8, height: 44, fontSize: 13.5, color: '#666' }}>
                                {ws.description || "Chưa có mô tả cho nhóm này."}
                            </Paragraph>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTop: '1px solid #f5f5f5', paddingTop: 15 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 }}>
                                    <TeamOutlined style={{ fontSize: 16 }} /> <b>3</b> thành viên
                                </div>
                                <Button type="link" size="small" style={{ fontWeight: 'bold', padding: 0 }}>Truy cập &rarr;</Button>
                            </div>
                        </div>
                    </div>
                </Card>
              </Col>
            );
          })}
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
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: 'Nhập tên nhóm đi bạn ơi!' }]}>
            <Input size="large" placeholder="VD: Marketing Team..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả ngắn">
            <Input.TextArea rows={3} placeholder="Nhóm này dùng để làm gì..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL CHỈNH SỬA (ĐÃ THÊM) --- */}
      <Modal
        title="✏️ Chỉnh Sửa Thông Tin Nhóm"
        open={isEditModalOpen}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: 'Tên không được để trống' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Workspaces;