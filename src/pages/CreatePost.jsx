import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, message, DatePicker, Row, Col, Alert } from 'antd';
import { SendOutlined, YoutubeFilled, FacebookFilled, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api'; // Import file cấu hình API chuẩn

const { Option } = Select;
const { TextArea } = Input;

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // Hook để reset form sau khi đăng

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Lấy Workspace ID
      // Do Backend yêu cầu phải có workspace_id, ta lấy từ localStorage (đã lưu lúc login/init)
      // Nếu không có thì mặc định là 1 để test
      const workspaceId = localStorage.getItem('workspace_id') || 1;

      // 2. Chuẩn bị dữ liệu đúng chuẩn Backend (PostCreate Schema)
      // Backend của bạn chỉ có field 'content', 'status', 'scheduled_at'
      const payload = {
        content: values.description, // Nội dung bài viết
        status: values.scheduleTime ? "scheduled" : "draft", // Nếu chọn giờ -> scheduled, không -> draft
        scheduled_at: values.scheduleTime ? values.scheduleTime.toISOString() : null,
      };

      // 3. Gọi API thật
      // POST /api/v1/workspaces/{id}/posts
      const response = await api.post(`/workspaces/${workspaceId}/posts`, payload);

      if (response.data) {
        message.success('Bài viết đã được tạo thành công trên hệ thống!');
        
        // Nếu muốn đăng ngay lập tức (Publish Now)
        if (!values.scheduleTime) {
             // Gọi tiếp API publish-now nếu cần thiết (tùy logic backend)
             // await api.post(`/workspaces/${workspaceId}/posts/${response.data.id}/publish-now`);
             // message.success('Đã gửi lệnh đăng ngay!');
        }

        form.resetFields(); // Xóa trắng form
      }

    } catch (error) {
      console.error("Lỗi đăng bài:", error);
      // Hiển thị lỗi chi tiết từ Backend trả về
      const errorMsg = error.response?.data?.detail || 'Có lỗi xảy ra khi tạo bài viết.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Soạn Thảo & Đăng Bài</h2>
      </div>
      
      <Form 
        form={form}
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ channels: ['youtube'] }} // Mặc định chọn Youtube
      >
        <Row gutter={24}>
          {/* CỘT TRÁI: NHẬP NỘI DUNG */}
          <Col span={16} xs={24}>
            <Card title="Nội dung bài viết" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              
              <Alert 
                message="Lưu ý" 
                description="Hệ thống sẽ tự động đồng bộ nội dung này lên các kênh đã chọn." 
                type="info" 
                showIcon 
                style={{ marginBottom: 20 }} 
              />

              <Form.Item 
                label="Tiêu đề (Dành cho Youtube)" 
                name="title" 
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input size="large" placeholder="Nhập tiêu đề video/bài viết..." />
              </Form.Item>

              <Form.Item 
                label="Nội dung chi tiết / Mô tả" 
                name="description" 
                rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
              >
                <TextArea 
                  rows={8} 
                  placeholder="Nhập nội dung bài viết, caption facebook hoặc mô tả video youtube..." 
                  showCount 
                  maxLength={5000} 
                />
              </Form.Item>

              {/* Backend hiện tại chưa hỗ trợ upload file trực tiếp trong API tạo post */}
              {/* Nên tạm thời ẩn hoặc để UI giả lập */}
              <Form.Item label="Link Video / Hình ảnh (URL)" name="mediaUrl">
                 <Input prefix={<YoutubeFilled />} placeholder="https://..." />
                 <div style={{fontSize: 12, color: '#999', marginTop: 5}}>
                    *Do giới hạn API, vui lòng nhập link video đã upload hoặc để trống.
                 </div>
              </Form.Item>
            </Card>
          </Col>

          {/* CỘT PHẢI: CẤU HÌNH ĐĂNG */}
          <Col span={8} xs={24}>
            <Card title="Thiết lập đăng" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              
              <Form.Item 
                label="Chọn kênh đăng tải" 
                name="channels"
                rules={[{ required: true, message: 'Chọn ít nhất 1 kênh!' }]}
              >
                <Select 
                  mode="multiple" 
                  placeholder="Chọn kênh..." 
                  size="large"
                >
                  <Option value="youtube" label="Youtube">
                    <div style={{display:'flex', alignItems:'center'}}>
                        <YoutubeFilled style={{color:'red', marginRight:8}}/> Kênh Review Xe
                    </div>
                  </Option>
                  <Option value="facebook" label="Facebook">
                    <div style={{display:'flex', alignItems:'center'}}>
                        <FacebookFilled style={{color:'#1877F2', marginRight:8}}/> Fanpage Bán Hàng
                    </div>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item label="Hẹn giờ đăng (Tùy chọn)" name="scheduleTime">
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm" 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày giờ..."
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>

              <div style={{ marginTop: 20 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SendOutlined />} 
                  loading={loading} 
                  block 
                  size="large"
                  style={{ height: 50, fontSize: 16 }}
                >
                  LÊN LỊCH / ĐĂNG NGAY
                </Button>
                
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <Button type="link">Lưu nháp</Button>
                </div>
              </div>

            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreatePost;