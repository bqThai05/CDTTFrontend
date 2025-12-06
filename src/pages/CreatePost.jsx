import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Radio, Upload } from 'antd';
import { SendOutlined, YoutubeFilled, UploadOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form] = Form.useForm();

  // 1. Lấy danh sách tài khoản đã kết nối để chọn
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/youtube/accounts');
        setAccounts(res.data);
      } catch (error) {
        console.error("Lỗi lấy account:", error);
      }
    };
    fetchAccounts();
  }, []);

  // 2. Xử lý khi bấm nút Đăng
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const workspaceId = localStorage.getItem('workspace_id') || 1;
      
      // Bước 1: Lưu bài viết vào Database (Tạo Post)
      const postRes = await api.post(`/workspaces/${workspaceId}/posts`, {
        content: values.description,
        status: "draft", // Mặc định là nháp trước
        scheduled_at: values.scheduleTime ? values.scheduleTime.toISOString() : null,
      });

      const postId = postRes.data.id;
      message.success('Đã lưu bài viết vào hệ thống!');

      // Bước 2: Nếu chọn "Đăng ngay" -> Gọi API Publish
      if (values.publishOption === 'now') {
        message.loading({ content: 'Đang đẩy lên YouTube...', key: 'publishing' });
        
        await api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
        
        message.success({ content: 'Đăng lên YouTube thành công!', key: 'publishing' });
      }

      form.resetFields();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Card title="Soạn Thảo Bài Viết Mới">
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ publishOption: 'draft' }}>
            
            {/* Chọn kênh để đăng */}
            <Form.Item label="Chọn kênh đăng" name="channel_id" rules={[{ required: true, message: 'Vui lòng chọn kênh!' }]}>
                <Select placeholder="Chọn tài khoản YouTube...">
                    {accounts.map(acc => (
                        <Option key={acc.id} value={acc.id}>
                            <YoutubeFilled style={{ color: 'red', marginRight: 8 }} />
                            {acc.social_id}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Nội dung bài viết (Status / Mô tả)" name="description" rules={[{ required: true }]}>
                <Input.TextArea rows={6} placeholder="Nhập nội dung bạn muốn đăng..." />
            </Form.Item>

            <Form.Item label="Tùy chọn đăng" name="publishOption">
                <Radio.Group>
                    <Radio value="draft">Lưu nháp (Chưa đăng)</Radio>
                    <Radio value="now">Đăng ngay lập tức</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item label="Hẹn giờ (Tùy chọn)" name="scheduleTime">
                <DatePicker showTime style={{width: '100%'}} placeholder="Để trống nếu muốn đăng ngay"/>
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
                Xác Nhận & Đăng
            </Button>
        </Form>
    </Card>
  );
};

export default CreatePost;