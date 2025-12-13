import React, { useEffect, useState, useCallback } from 'react';

import { Button, Table, message, Popconfirm, Modal, Form, Input, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import {
  createWorkspacePost,
  publishWorkspacePostNow,
  getWorkspacePosts,
  updateWorkspacePost,
  deleteWorkspacePost,
} from '../services/api';
import { getUserIdFromToken } from '../utils/auth';

const { Text } = Typography;

const WorkspacePosts = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      render: (text) => <Text ellipsis={{ rows: 2 }}>{text}</Text>,
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
