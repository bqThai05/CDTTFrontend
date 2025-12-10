import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, Upload, Radio } from 'antd';
import { SendOutlined, YoutubeFilled, UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom'; 
import api from '../services/api';


const { Option } = Select;

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [postType, setPostType] = useState('text'); // 'text' hoặc 'video'
  const [fileList, setFileList] = useState([]);
  const location = useLocation();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/youtube/accounts');
        setAccounts(res.data);
      } catch (error) { console.error(error); }
    };
    fetchAccounts();
  }, []);
  useEffect(() => {
    // Nếu có dữ liệu truyền từ Menu sang
    if (location.state?.preSelectedChannelId) {
        // Tự động chọn kênh đó trong dropdown
        form.setFieldsValue({ 
            channel_id: parseInt(location.state.preSelectedChannelId) 
        });
    }
  }, [location.state]);

  const onFinish = async (values) => {
    setLoading(true);
    const workspaceId = localStorage.getItem('workspace_id') || 1;

    try {
      // TRƯỜNG HỢP 1: ĐĂNG VIDEO (UPLOAD)
      if (postType === 'video') {
        if (fileList.length === 0) {
            message.error("Vui lòng chọn video để đăng!");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('content', values.description);
        formData.append('channel_id', values.channel_id);
        formData.append('file', fileList[0].originFileObj); // File video

        message.loading({ content: 'Đang upload video lên YouTube (sẽ hơi lâu)...', key: 'upload' });
        
        await api.post(`/workspaces/${workspaceId}/upload-video-youtube`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        message.success({ content: 'Upload Video thành công!', key: 'upload' });
      } 
      
      // TRƯỜNG HỢP 2: ĐĂNG STATUS (NHƯ CŨ)
      else {
        await api.post(`/workspaces/${workspaceId}/posts`, {
            content: values.description,
            status: "draft",
            social_account_ids: [values.channel_id]
        });
        // Logic đăng ngay nếu cần (giữ nguyên logic cũ nếu muốn)
        message.success("Đã lưu bài viết!");
      }

      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Card title="Đăng Bài Mới">
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'text' }}>
            
            <Form.Item label="Chọn kênh đăng" name="channel_id" rules={[{ required: true }]}>
                <Select placeholder="Chọn tài khoản YouTube...">
                    {accounts.map(acc => (
                        <Option key={acc.id} value={acc.id}><YoutubeFilled style={{ color: 'red' }} /> {acc.social_id}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Loại bài đăng">
                <Radio.Group value={postType} onChange={e => setPostType(e.target.value)}>
                    <Radio.Button value="text">📝 Bài viết (Status)</Radio.Button>
                    <Radio.Button value="video">🎥 Upload Video</Radio.Button>
                </Radio.Group>
            </Form.Item>

            <Form.Item label={postType === 'video' ? "Tiêu đề Video" : "Nội dung bài viết"} name="description" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
            </Form.Item>

            {/* Chỉ hiện nút upload khi chọn loại là Video */}
            {postType === 'video' && (
                <Form.Item label="Chọn File Video (.mp4)">
                    <Upload 
                        beforeUpload={() => false} // Chặn upload tự động
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        maxCount={1}
                        accept="video/*"
                    >
                        <Button icon={<UploadOutlined />}>Chọn Video từ máy tính</Button>
                    </Upload>
                </Form.Item>
            )}

            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large" style={{marginTop: 20}}>
                {postType === 'video' ? 'Upload lên YouTube' : 'Lưu bài viết'}
            </Button>
        </Form>
    </Card>
  );
};

export default CreatePost;