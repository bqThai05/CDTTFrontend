// src/pages/CreatePost.jsx
import React, { useState } from 'react';
import { Card, Input, Button, Upload, Row, Col, Typography, Space, Select, DatePicker, message, Avatar, Divider, Badge, Tooltip, Checkbox } from 'antd';
import { 
  CloudUploadOutlined, 
  FacebookFilled, 
  YoutubeFilled, 
  SendOutlined,
  GlobalOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  MoreOutlined,
  CheckCircleFilled,
  ScheduleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  
  // 1. STATE QUẢN LÝ TÀI KHOẢN ĐƯỢC CHỌN
  // Danh sách tài khoản giả lập (Giống bên Dashboard)
  const myAccounts = [
    { id: 1, name: 'Review Công Nghệ Z', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, name: 'Shop Quần Áo Nam', platform: 'facebook', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
    { id: 3, name: 'Vlog Đời Sống', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  ];

  // Mảng chứa ID các tài khoản đang được chọn (Ví dụ: [1, 2])
  const [selectedAccountIds, setSelectedAccountIds] = useState([1]); 

  // Hàm xử lý chọn/bỏ chọn tài khoản
  const toggleAccount = (id) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(accId => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  // Lấy thông tin tài khoản đầu tiên đang chọn để hiển thị Preview
  const previewAccount = myAccounts.find(acc => acc.id === selectedAccountIds[selectedAccountIds.length - 1]) || myAccounts[0];

  // Xử lý upload ảnh (giả lập)
  const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList);
  const previewImage = fileList.length > 0 ? fileList[0].thumbUrl || URL.createObjectURL(fileList[0].originFileObj) : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Row gutter={24}>
        
        {/* --- CỘT TRÁI: KHUNG SOẠN THẢO --- */}
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 24 }}>
             <Title level={2} style={{ margin: 0 }}>Tạo bài đăng mới</Title>
             <Text type="secondary">Chọn các kênh bạn muốn đăng bài viết này</Text>
          </div>

          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            
            {/* 1. KHU VỰC CHỌN TÀI KHOẢN (QUAN TRỌNG) */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Đăng lên:</Text>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                 {myAccounts.map(acc => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                        <div 
                            key={acc.id}
                            onClick={() => toggleAccount(acc.id)}
                            style={{ 
                                cursor: 'pointer',
                                border: isSelected ? `2px solid ${acc.platform === 'youtube' ? '#ff0000' : '#1877f2'}` : '2px solid #f0f0f0',
                                borderRadius: 8,
                                padding: '8px 12px',
                                background: isSelected ? (acc.platform === 'youtube' ? '#fff1f0' : '#e6f7ff') : '#fff',
                                display: 'flex', alignItems: 'center', gap: 10,
                                transition: 'all 0.2s',
                                opacity: isSelected ? 1 : 0.6
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Avatar src={acc.avatar} size={32} />
                                {isSelected && <CheckCircleFilled style={{ position: 'absolute', top: -5, right: -5, color: '#52c41a', background: '#fff', borderRadius: '50%' }} />}
                            </div>
                            <div style={{ lineHeight: 1.2 }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
                                <div style={{ fontSize: 10, color: '#888', textTransform: 'capitalize' }}>
                                    {acc.platform === 'youtube' ? <YoutubeFilled style={{color:'red'}}/> : <FacebookFilled style={{color:'#1877f2'}}/>} {acc.platform}
                                </div>
                            </div>
                        </div>
                    );
                 })}
              </div>
              {selectedAccountIds.length === 0 && <Text type="danger" style={{ fontSize: 12 }}>* Vui lòng chọn ít nhất 1 kênh</Text>}
            </div>

            <Divider />

            {/* 2. Nhập nội dung */}
            <div style={{ marginBottom: 24 }}>
               <Text strong>Nội dung bài viết:</Text>
               <TextArea 
                  rows={6} 
                  placeholder="Nhập nội dung caption, mô tả video..." 
                  style={{ marginTop: 8, fontSize: 15, borderRadius: 8 }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2200}
                  showCount
               />
            </div>

            {/* 3. Upload Media */}
            <div style={{ marginBottom: 24 }}>
               <Text strong>Thêm ảnh/video/Thumbnail:</Text>
               <Upload.Dragger
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUpload}
                  beforeUpload={() => false}
                  maxCount={1}
                  style={{ marginTop: 8, background: '#fafafa', borderRadius: 8 }}
               >
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined style={{ color: '#1677ff' }} />
                  </p>
                  <p className="ant-upload-text">Kéo thả file vào đây</p>
               </Upload.Dragger>
            </div>

            {/* 4. Hành động */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
               <DatePicker 
                  showTime 
                  placeholder="Lên lịch (Để trống nếu đăng ngay)" 
                  style={{ width: 240 }} 
                  suffixIcon={<ScheduleOutlined />}
               />
               <Button 
                    type="primary" 
                    size="large" 
                    icon={<SendOutlined />} 
                    disabled={selectedAccountIds.length === 0}
                    onClick={() => {
                        message.success(`Đã lên lịch đăng bài cho ${selectedAccountIds.length} tài khoản!`);
                        setContent('');
                        setFileList([]);
                    }}
                    style={{ borderRadius: 8, padding: '0 30px', fontWeight: 600 }}
               >
                  ĐĂNG ({selectedAccountIds.length})
               </Button>
            </div>

          </Card>
        </Col>

        {/* --- CỘT PHẢI: LIVE PREVIEW --- */}
        <Col xs={24} lg={10}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
             <Title level={5} style={{ color: '#888', margin: 0 }}>Xem trước hiển thị</Title>
             <Text type="secondary" style={{ fontSize: 12 }}>
                Đang xem giao diện: <b style={{ color: previewAccount.platform === 'youtube' ? 'red' : '#1877f2' }}>{previewAccount.name}</b>
             </Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             {/* VỎ ĐIỆN THOẠI */}
             <div style={{ 
                width: 360, 
                minHeight: 650, 
                background: '#fff', 
                border: '10px solid #222', 
                borderRadius: 40, 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
             }}>
                {/* Status Bar giả */}
                <div style={{ height: 30, background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', fontSize: 10, fontWeight: 'bold' }}>
                    <span>9:41</span>
                    <span>📶 🔋</span>
                </div>

                {/* --- LOGIC RENDER PREVIEW THEO NỀN TẢNG --- */}
                
                {previewAccount.platform === 'facebook' ? (
                    // 1. GIAO DIỆN FACEBOOK
                    <div style={{ background: '#f0f2f5', height: '100%' }}>
                        <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                             <span style={{ color: '#1877f2', fontWeight: 'bold', fontSize: 18 }}>facebook</span>
                             <Space><SearchOutlined /><MessageOutlined /></Space>
                        </div>
                        <div style={{ background: '#fff', marginTop: 10, paddingBottom: 10 }}>
                            <div style={{ padding: 12, display: 'flex', gap: 10 }}>
                                <Avatar src={previewAccount.avatar} />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>{previewAccount.name}</div>
                                    <div style={{ fontSize: 11, color: '#65676b' }}>Vừa xong · <GlobalOutlined /></div>
                                </div>
                            </div>
                            <div style={{ padding: '0 12px 12px', fontSize: 14 }}>
                                {content || 'Nội dung bài viết sẽ hiện ở đây...'}
                            </div>
                            {previewImage && <img src={previewImage} alt="Post" style={{ width: '100%', objectFit: 'cover' }} />}
                            
                            <div style={{ padding: '10px 12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', color: '#65676b' }}>
                                <span><LikeOutlined /> Thích</span>
                                <span><CommentOutlined /> Bình luận</span>
                                <span><ShareAltOutlined /> Chia sẻ</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 2. GIAO DIỆN YOUTUBE
                    <div style={{ background: '#fff', height: '100%' }}>
                        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <YoutubeFilled style={{ color: 'red', fontSize: 24 }} />
                                <span style={{ fontWeight: 'bold' }}>YouTube</span>
                            </div>
                        </div>
                        
                        {/* Video Player giả lập */}
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {previewImage ? (
                                <img src={previewImage} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <YoutubeFilled style={{ fontSize: 40, color: '#333' }} />
                            )}
                        </div>

                        <div style={{ padding: 12 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>
                                {content ? content.split('\n')[0] : 'Tiêu đề video YouTube sẽ hiện ở đây...'}
                            </div>
                            <div style={{ fontSize: 12, color: '#606060', marginTop: 4 }}>
                                1.2K lượt xem · 2 giờ trước
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid #e5e5e5' }}>
                                <Avatar src={previewAccount.avatar} size={32} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{previewAccount.name}</div>
                                    <div style={{ fontSize: 11, color: '#606060' }}>125K người đăng ký</div>
                                </div>
                                <Button size="small" type="primary" danger style={{ borderRadius: 20 }}>Đăng ký</Button>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <Text strong>Mô tả:</Text>
                                <div style={{ fontSize: 13, color: '#0f0f0f', marginTop: 4 }}>
                                    {content || 'Phần mô tả chi tiết của video...'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

             </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

// Icon Search giả cho FB
const SearchOutlined = () => <span style={{ fontSize: 18 }}>🔍</span>;

export default CreatePost;