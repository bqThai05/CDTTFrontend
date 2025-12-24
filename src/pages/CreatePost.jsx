import React, { useState } from 'react';
import { Card, Input, Button, Upload, Row, Col, Typography, Space, Select, DatePicker, message, Avatar, Divider } from 'antd';
import { 
  CloudUploadOutlined, 
  FacebookFilled, 
  YoutubeFilled, 
  InstagramFilled, 
  ClockCircleOutlined,
  SendOutlined,
  GlobalOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  MoreOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  const [platform, setPlatform] = useState('facebook'); // Mặc định chọn Facebook

  // Xử lý khi upload ảnh (giả lập)
  const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList);

  // Lấy ảnh đầu tiên để hiện preview (nếu có)
  const previewImage = fileList.length > 0 ? fileList[0].thumbUrl || URL.createObjectURL(fileList[0].originFileObj) : null;

  return (
    <div>
      <Row gutter={24}>
        {/* --- CỘT TRÁI: KHUNG SOẠN THẢO --- */}
        <Col xs={24} lg={14}>
          <Title level={3}>Tạo bài đăng mới</Title>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            
            {/* 1. Chọn kênh đăng */}
            <div style={{ marginBottom: 24 }}>
              <Text strong>Chọn nền tảng:</Text>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                 <Button 
                    type={platform === 'facebook' ? 'primary' : 'default'} 
                    icon={<FacebookFilled />} 
                    onClick={() => setPlatform('facebook')}
                    style={{ background: platform === 'facebook' ? '#1877F2' : '' }}
                 >
                    Facebook
                 </Button>
                 <Button 
                    type={platform === 'youtube' ? 'primary' : 'default'} 
                    icon={<YoutubeFilled />} 
                    onClick={() => setPlatform('youtube')}
                    style={{ background: platform === 'youtube' ? '#FF0000' : '' }}
                    danger={platform === 'youtube'}
                 >
                    YouTube
                 </Button>
                 <Button 
                    type={platform === 'instagram' ? 'primary' : 'default'} 
                    icon={<InstagramFilled />} 
                    onClick={() => setPlatform('instagram')}
                    style={{ background: platform === 'instagram' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '', border: 'none' }}
                 >
                    Instagram
                 </Button>
              </div>
            </div>

            {/* 2. Nhập nội dung */}
            <div style={{ marginBottom: 24 }}>
               <Text strong>Nội dung bài viết:</Text>
               <TextArea 
                  rows={6} 
                  placeholder="Bạn đang nghĩ gì thế? Viết vào đây nhé..." 
                  style={{ marginTop: 8, fontSize: 16 }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  showCount
               />
            </div>

            {/* 3. Upload Media */}
            <div style={{ marginBottom: 24 }}>
               <Text strong>Thêm ảnh/video:</Text>
               <Upload.Dragger
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUpload}
                  beforeUpload={() => false} // Chặn upload thật để test giao diện thôi
                  maxCount={4}
                  style={{ marginTop: 8, background: '#fafafa' }}
               >
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined style={{ color: '#1677ff' }} />
                  </p>
                  <p className="ant-upload-text">Kéo thả ảnh hoặc click để tải lên</p>
               </Upload.Dragger>
            </div>

            {/* 4. Lên lịch & Đăng */}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <DatePicker 
                  showTime 
                  placeholder="Lên lịch đăng (tùy chọn)" 
                  style={{ width: 250 }} 
                  suffixIcon={<ClockCircleOutlined />}
               />
               <Button 
    type="primary" 
    size="large" 
    icon={<SendOutlined />} 
    style={{ padding: '0 40px' }}
    onClick={() => {
        // Khi bấm vào sẽ hiện thông báo thành công
        message.success('Đã lên lịch đăng bài thành công!');
        // (Tùy chọn) Xóa nội dung sau khi đăng
        setContent('');
        setFileList([]);
    }}
>
   ĐĂNG NGAY
</Button>
            </div>

          </Card>
        </Col>

        {/* --- CỘT PHẢI: LIVE PREVIEW (ĐIỆN THOẠI) --- */}
        <Col xs={24} lg={10}>
          <Title level={4} style={{ textAlign: 'center', color: '#888' }}>Xem trước trên điện thoại</Title>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             {/* Cái vỏ điện thoại */}
             <div style={{ 
                width: 375, 
                minHeight: 600, 
                background: '#fff', 
                border: '12px solid #333', 
                borderRadius: 40, 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
             }}>
                {/* Tai thỏ (Notch) */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 25, background: '#333', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 10 }}></div>

                {/* Màn hình bên trong */}
                <div style={{ paddingTop: 40, background: '#f0f2f5', height: '100%' }}>
                    
                    {/* BÀI POST GIẢ LẬP */}
                    <div style={{ background: '#fff', paddingBottom: 10, marginBottom: 10 }}>
                        {/* Header bài post */}
                        <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" size={40} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: 15 }}>Admin User</div>
                                <div style={{ fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Vừa xong · <GlobalOutlined style={{ fontSize: 12 }} />
                                </div>
                            </div>
                            <MoreOutlined style={{ fontSize: 20 }} />
                        </div>

                        {/* Nội dung text */}
                        <div style={{ padding: '0 12px 12px', fontSize: 15, whiteSpace: 'pre-wrap' }}>
                            {content || <span style={{ color: '#ccc' }}>Nội dung bài viết sẽ hiện ở đây...</span>}
                        </div>

                        {/* Nội dung ảnh */}
                        {previewImage && (
                            <div style={{ width: '100%', height: 250, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img src={previewImage} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        {!previewImage && (
                            <div style={{ height: 200, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                (Chưa có ảnh)
                            </div>
                        )}

                        {/* Footer tương tác */}
                        <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f2f5', marginTop: 10, color: '#65676b' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><LikeOutlined /> Thích</div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><CommentOutlined /> Bình luận</div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><ShareAltOutlined /> Chia sẻ</div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreatePost;