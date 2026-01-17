import React, { useEffect, useState, useCallback } from 'react';

import { Button, Table, message, Popconfirm, Modal, Form, Input, Space, Typography, Select, Avatar, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RocketOutlined, YoutubeFilled, FacebookFilled } from '@ant-design/icons';
import {
  createWorkspacePost,
  publishWorkspacePostNow,
  getWorkspacePosts,
  updateWorkspacePost,
  deleteWorkspacePost,
  getWorkspaceSocialAccounts,
} from '../services/api';
import { getUserIdFromToken } from '../utils/auth';

const { Text, Paragraph } = Typography;
const { Option } = Select;

const WorkspacePosts = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspacePosts(workspaceId);
      setPosts(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách bài đăng.');
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const fetchSocialAccounts = useCallback(async () => {
    try {
      const response = await getWorkspaceSocialAccounts(workspaceId);
      setSocialAccounts(response.data || []);
    } catch (error) {
      console.error('Fetch workspace social accounts error:', error);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchPosts();
    fetchSocialAccounts();
  }, [fetchPosts, fetchSocialAccounts]);

  const showModal = (post = null) => {
    setIsModalVisible(true);
    if (post) {
      setTimeout(() => {
        form.setFieldsValue(post);
        setEditingPost(post);
      }, 0);
    } else {
      setTimeout(() => {
        form.resetFields();
        setEditingPost(null);
      }, 0);
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPost(null);
    form.resetFields();
  };

  const handleSavePost = async (values) => {
    setLoading(true);
    console.log('Sending values:', values); // Log the values being sent
    try {
      const currentUserId = getUserIdFromToken();
      if (!currentUserId) {
        message.error('Không tìm thấy User ID. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      const postData = { ...values, workspace_id: workspaceId, user_id: currentUserId };

      if (editingPost) {
        await updateWorkspacePost(workspaceId, editingPost.id, postData);
        message.success('Cập nhật bài đăng thành công!');
      } else {
        await createWorkspacePost(workspaceId, postData);
        message.success('Tạo bài đăng thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchPosts();
    } catch (error) {
      message.error('Lỗi khi lưu bài đăng.');
      console.error('Save post error:', error);
      if (error.response && error.response.data) {
        const errorDetails = error.response.data.detail || error.response.data;
        console.error('Server error details:', errorDetails); // Log detailed server error
        message.error(`Lỗi từ máy chủ: ${JSON.stringify(errorDetails)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async (postId) => {
    setLoading(true);
    try {
      await publishWorkspacePostNow(workspaceId, postId);
      message.success('Bài đăng đã được xuất bản ngay lập tức!');
      fetchPosts();
    } catch (error) {
      message.error('Lỗi khi xuất bản bài đăng.');
      console.error('Publish post error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setLoading(true);
    try {
      await deleteWorkspacePost(workspaceId, postId);
      message.success('Xóa bài đăng thành công!');
      fetchPosts();
    } catch (error) {
      message.error('Lỗi khi xóa bài đăng.');
      console.error('Delete post error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>,
    },
    {
      title: 'Tài khoản MXH',
      dataIndex: 'social_account_id',
      key: 'social_account_id',
      render: (socialAccountId) => {
        const account = socialAccounts.find(acc => acc.id === socialAccountId);
        if (!account) return <Tag>Không xác định</Tag>;
        return (
          <Space>
            <Avatar size="small" src={account.avatar_url || account.avatar} icon={account.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} />
            <Text>{account.name || account.username}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xuất bản bài đăng này ngay lập tức?"
            onConfirm={() => handlePublishNow(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<RocketOutlined />} type="primary">Xuất bản ngay</Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài đăng này?"
            onConfirm={() => handleDeletePost(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: '16px' }}
      >
        Tạo bài đăng mới
      </Button>

      <Modal
        title={editingPost ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSavePost}>
          <Form.Item
            name="social_account_id"
            label="Tài khoản mạng xã hội"
            rules={[{ required: true, message: 'Vui lòng chọn tài khoản để đăng!' }]}
          >
            <Select placeholder="Chọn tài khoản mạng xã hội...">
              {socialAccounts.map(acc => (
                <Option key={acc.id} value={acc.id}>
                  <Space>
                    <Avatar size="small" src={acc.avatar_url || acc.avatar} icon={acc.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} />
                    {acc.name || acc.username} ({acc.platform})
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bài đăng!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu
            </Button>
            <Button style={{ marginLeft: '8px' }} onClick={handleCancel}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default WorkspacePosts;
