import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Spin, Typography, message, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createWorkspace, getWorkspaces } from '../services/api';

const { Title, Text } = Typography;

const Workspaces = () => {
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
    // Tạm thời điều hướng đến trang chỉnh sửa, bạn có thể thay đổi thành mở modal sau
    navigate(`/workspaces/${workspaceId}/edit`);
  };

  // Placeholder for fetching workspaces - you'll need to implement getWorkspaces in api.js
  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspaces();
      setWorkspaces(response.data);
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
      fetchWorkspaces(); // Refresh the list
    } catch (error) {
      message.error('Lỗi khi tạo Workspace.');
      console.error('Create workspace error:', error);
    } finally {
      setIsCreatingWorkspace(false);
    }
  }, [setIsCreatingWorkspace, setIsModalVisible, form, fetchWorkspaces]);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Tạo Workspace mới
        </Button>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {workspaces.map((workspace) => (
            <Col xs={24} sm={12} md={8} lg={6} key={workspace.id}>
              <Card
                title={workspace.name}
                variant="default"
                hoverable
                actions={[
                  <Button type="link" key="view" onClick={() => handleViewWorkspace(workspace.id)}>Xem</Button>,
                  <Button type="link" key="edit" onClick={() => handleEditWorkspace(workspace.id)}>Sửa</Button>,
                ]}
              >
                <Text>{workspace.description || 'Không có mô tả.'}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      <Modal
                title="Tạo Workspace mới"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
              >
                <Form form={form} layout="vertical" onFinish={handleCreateWorkspace}>
                  <Form.Item
                    name="name"
                    label="Tên Workspace"
                    rules={[{ required: true, message: 'Vui lòng nhập tên Workspace!' }]
                  }>
                    <Input placeholder="Nhập tên Workspace" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Mô tả"
                  >
                    <Input.TextArea placeholder="Nhập mô tả" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isCreatingWorkspace}>
                      Tạo
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
    </div>
  );
};

export default Workspaces;
