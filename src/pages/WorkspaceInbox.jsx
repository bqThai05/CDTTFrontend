import React, { useEffect, useState } from 'react';
import { Table, message, Spin, Button, Popconfirm, Modal, Form, Input, Select } from 'antd';
import {
  getWorkspaceInboxComments,
  assignCommentToUser,
  replyToComment,
  getWorkspaceMembers,
} from '../services/api';

const { Option } = Select;

const WorkspaceInbox = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]); // New state for assignable users
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [replyForm] = Form.useForm();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getWorkspaceInboxComments(workspaceId);
      setComments(response.data);
    } catch (error) {
      message.error('Lỗi khi tải hộp thư đến bình luận.');
      console.error('Fetch inbox comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch comments
        const commentsResponse = await getWorkspaceInboxComments(workspaceId);
        setComments(commentsResponse.data);

        // Fetch assignable users (members of the workspace)
        const membersResponse = await getWorkspaceMembers(workspaceId);
        setAssignableUsers(membersResponse.data);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu hộp thư đến.');
        console.error('Fetch inbox initial data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [workspaceId]);

  const handleAssignComment = async (commentId, userId) => {
    setLoading(true);
    try {
      await assignCommentToUser(commentId, { assigned_to: userId });
      message.success('Gán bình luận thành công!');
      fetchComments();
    } catch (error) {
      message.error('Lỗi khi gán bình luận.');
      console.error('Assign comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showReplyModal = (comment) => {
    setCurrentComment(comment);
    setIsReplyModalVisible(true);
    replyForm.resetFields();
  };

  const handleReply = async (values) => {
    setLoading(true);
    try {
      await replyToComment(currentComment.id, values);
      message.success('Trả lời bình luận thành công!');
      setIsReplyModalVisible(false);
      replyForm.resetFields();
      fetchComments();
    } catch (error) {
      message.error('Lỗi khi trả lời bình luận.');
      console.error('Reply comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Người gửi',
      dataIndex: 'sender',
      key: 'sender',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Được gán cho',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      render: (text, record) => (
        <Select
          defaultValue={text || 'unassigned'}
          style={{ width: 150 }}
          onChange={(value) => handleAssignComment(record.id, value === 'unassigned' ? null : value)}
          loading={loading}
        >
          <Option value="unassigned">Chưa gán</Option>
          {assignableUsers.map(user => (
            <Option key={user.id} value={user.id}>{user.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => showReplyModal(record)}>Trả lời</Button>
      ),
    },
  ];

  return (
    <div>
      <Spin spinning={loading} tip="Đang tải hộp thư đến...">
        <Table
          columns={columns}
          dataSource={comments}
          rowKey="id"
          pagination={false}
        />
      </Spin>

      <Modal
        title="Trả lời bình luận"
        open={isReplyModalVisible}
        onCancel={() => setIsReplyModalVisible(false)}
        footer={null}
      >
        <Form form={replyForm} layout="vertical" onFinish={handleReply}>
          <Form.Item
            name="replyContent"
            label="Nội dung trả lời"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi trả lời
            </Button>
            <Button style={{ marginLeft: '8px' }} onClick={() => setIsReplyModalVisible(false)}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkspaceInbox;
