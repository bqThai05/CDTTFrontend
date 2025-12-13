import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, message, Popconfirm, Select, Modal, Form, Input, Spin } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getWorkspaceMembers,
  inviteUserToWorkspace,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from '../services/api';

const { Option } = Select;

const WorkspaceMembers = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspaceMembers(workspaceId);
      setMembers(response.data);
      console.log('Members after fetch:', response.data);
      console.log('Workspace members data:', response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách thành viên.');
      console.error('Fetch members error:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, workspaceId]);

  const handleInviteUser = async (values) => {
    setLoading(true);
    console.log('Inviting user with data:', values);
    try {
      await inviteUserToWorkspace(workspaceId, values);
      message.success('Đã gửi lời mời thành công!');
      setIsInviteModalVisible(false);
      inviteForm.resetFields();
      fetchMembers();
    } catch (error) {
      message.error('Lỗi khi gửi lời mời.');
      console.error('Invite user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setLoading(true);
    try {
      await updateWorkspaceMemberRole(workspaceId, memberId, { role: newRole, user_id: memberId, workspace_id: workspaceId });
      message.success('Cập nhật vai trò thành công!');
      fetchMembers();
    } catch (error) {
      message.error('Lỗi khi cập nhật vai trò.');
      console.error('Update role error:', JSON.stringify(error.response?.data || error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      message.success('Đã xóa thành viên khỏi Workspace.');
      window.location.reload(); // Tải lại trang sau khi xóa thành công
    } catch (error) {
      message.error('Lỗi khi xóa thành viên.');
      console.error('Remove member error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        <Select
          defaultValue={text}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.user_id, value)}
          loading={loading}
        >
          <Option value="admin">Admin</Option>
          <Option value="member">Member</Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa thành viên này?"
          onConfirm={() => handleRemoveMember(record.user_id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => setIsInviteModalVisible(true)}
        style={{ marginBottom: '16px' }}
      >
        Mời thành viên
      </Button>

      <Modal
        title="Mời thành viên vào Workspace"
        open={isInviteModalVisible}
        onCancel={() => setIsInviteModalVisible(false)}
        footer={null}
      >
        <Form form={inviteForm} layout="vertical" onFinish={handleInviteUser}>
          <Form.Item
            name="email"
            label="Email người dùng"
            rules={[{ required: true, message: 'Vui lòng nhập email!', type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi lời mời
            </Button>
            <Button style={{ marginLeft: '8px' }} onClick={() => setIsInviteModalVisible(false)}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Spin spinning={loading} tip="Đang tải thành viên...">
        <Table
          columns={columns}
          dataSource={members}
          rowKey="user_id"
          pagination={false}
        />
      </Spin>
    </div>
  );
};

export default WorkspaceMembers;
