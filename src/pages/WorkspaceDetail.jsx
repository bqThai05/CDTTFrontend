import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Spin, Typography, message, Tabs } from 'antd';
import { getWorkspaceDetails, transferWorkspaceOwnership, getUserWorkspacePermissions, getWorkspaceMembers } from '../services/api';
import { Button, Modal, Select, Form } from 'antd';
import WorkspaceMembers from './WorkspaceMembers';
import WorkspacePosts from './WorkspacePosts';
import WorkspaceLogs from './WorkspaceLogs';
import WorkspaceInbox from './WorkspaceInbox';
import WorkspaceSocialAccounts from './WorkspaceSocialAccounts';

const { Title, Text } = Typography;

import { getUserIdFromToken } from '../utils/auth';

// ... (các import khác)

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null); // New state for user permissions
  const [members, setMembers] = useState([]); // New state for workspace members
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transferForm] = Form.useForm();

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      setLoading(true);
      try {
        const response = await getWorkspaceDetails(workspaceId);
        setWorkspace(response.data);

        // Fetch user permissions for this workspace
        const currentUserId = getUserIdFromToken();
        if (currentUserId) {
          const permissionsResponse = await getUserWorkspacePermissions(workspaceId, currentUserId);
          setUserPermissions(permissionsResponse.data);
        } else {
          console.warn("Không tìm thấy User ID. Không thể tải quyền người dùng.");
        }

        // Fetch members for transfer ownership
        const membersResponse = await getWorkspaceMembers(workspaceId);
        setMembers(membersResponse.data);

      } catch (error) {
        message.error('Lỗi khi tải chi tiết Workspace hoặc quyền người dùng.');
        console.error('Fetch workspace details or permissions error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId]);

  const handleTransferOwnership = async (values) => {
    setLoading(true);
    try {
      await transferWorkspaceOwnership(workspaceId, values.newOwnerId);
      message.success('Chuyển quyền sở hữu thành công!');
      setIsTransferModalVisible(false);
      transferForm.resetFields();
      // Optionally refetch workspace details to update owner info
      // fetchWorkspaceDetails();
    } catch (error) {
      message.error('Lỗi khi chuyển quyền sở hữu.');
      console.error('Transfer ownership error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Đang tải chi tiết Workspace...">
      {!workspace ? (
        <Text>Không tìm thấy Workspace.</Text>
      ) : (
        <div style={{ padding: '24px' }}>
          <Title level={2}>Chi tiết Workspace: {workspace.name}</Title>
          <Card style={{ marginBottom: '24px' }}>
            <Text>{workspace.description}</Text>
            {userPermissions?.isOwner && (
              <Button
                type="primary"
              danger
                onClick={() => setIsTransferModalVisible(true)}
                style={{ marginTop: '16px' }}
              >
                Chuyển quyền sở hữu
              </Button>
            )}
          </Card>

          <Tabs defaultActiveKey="members" items={[
            {
              label: 'Thành viên',
              key: 'members',
              children: <WorkspaceMembers workspaceId={workspaceId} />,
            },
            {
              label: 'Bài đăng',
              key: 'posts',
              children: <WorkspacePosts workspaceId={workspaceId} />,
            },
            {
              label: 'Nhật ký',
              key: 'logs',
              children: <WorkspaceLogs workspaceId={workspaceId} />,
            },
            {
              label: 'Hộp thư đến',
              key: 'inbox',
              children: <WorkspaceInbox workspaceId={workspaceId} />,
            },
            {
              label: 'Tài khoản MXH',
              key: 'social_accounts',
              children: <WorkspaceSocialAccounts workspaceId={workspaceId} />,
            },
          ]} />

          <Modal
            title="Chuyển quyền sở hữu Workspace"
            open={isTransferModalVisible}
            onCancel={() => setIsTransferModalVisible(false)}
            footer={null}
          >
            <Form form={transferForm} layout="vertical" onFinish={handleTransferOwnership}>
              <Form.Item
                name="newOwnerId"
                label="Chọn chủ sở hữu mới"
                rules={[{ required: true, message: 'Vui lòng chọn một chủ sở hữu mới!' }]}
              >
                <Select placeholder="Chọn thành viên">
                  {members.map(member => (
                    <Select.Option key={member.id} value={member.id}>
                      {member.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Chuyển quyền sở hữu
                </Button>
                <Button style={{ marginLeft: '8px' }} onClick={() => setIsTransferModalVisible(false)}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </Spin>
  );
};

export default WorkspaceDetail;
