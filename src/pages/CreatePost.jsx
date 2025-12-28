// src/pages/CreatePost.jsx
import React, { useState } from 'react';
import { Card, Input, Button, Upload, Row, Col, Typography, Space, Select, DatePicker, message, Avatar, Divider, Badge, Tooltip, Modal, Spin } from 'antd';
import { 
  CloudUploadOutlined, 
  FacebookFilled, 
  YoutubeFilled, 
  SendOutlined,
  GlobalOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  ScheduleOutlined,
  ThunderboltFilled,
  RobotOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  
  // --- PHẦN MỚI: STATE CHO AI ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  // -----------------------------

  const myAccounts = [
    { id: 1, name: 'Review Công Nghệ Z', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, name: 'Shop Quần Áo Nam', platform: 'facebook', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
    { id: 3, name: 'Vlog Đời Sống', platform: 'youtube', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  ];

  const [selectedAccountIds, setSelectedAccountIds] = useState([1]); 

  const toggleAccount = (id) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(accId => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const previewAccount = myAccounts.find(acc => acc.id === selectedAccountIds[selectedAccountIds.length - 1]) || myAccounts[0];
  const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList);
  const previewImage = fileList.length > 0 ? fileList[0].thumbUrl || URL.createObjectURL(fileList[0].originFileObj) : null;

  // --- HÀM GIẢ LẬP AI VIẾT BÀI ---
  const handleAiGenerate = () => {
    if (!aiTopic) {
        message.warning('Vui lòng nhập chủ đề bạn muốn viết!');
        return;
    }
    setAiLoading(true);
    
    // Giả vờ đợi 1.5 giây như đang gọi ChatGPT
    setTimeout(() => {
        const fakeContent = `🔥 [HOT TREND] ${aiTopic.toUpperCase()} ĐANG ĐỔ BỘ! 🔥\n\n✨ Cơ hội không thể bỏ lỡ dành cho các fan cứng nhà mình đây ạ. Sau bao ngày chờ đợi thì cuối cùng em nó cũng đã xuất hiện.\n\n👉 Tính năng nổi bật:\n✅ Thiết kế sang trọng, hiện đại\n✅ Hiệu năng đỉnh cao, cân mọi tác vụ\n✅ Giá cực yêu thương cho 100 bạn chốt đơn sớm nhất\n\n🎁 QUÀ TẶNG: Voucher giảm giá 20% + Freeship toàn quốc.\n\n👇 Comment ngay "CHẤM" để nhận báo giá chi tiết nhé cả nhà ơi! 👇\n#${aiTopic.replace(/\s/g, '')} #Review #Unboxing #Trending #Viral`;
        
        setContent(fakeContent);
        setAiLoading(false);
        setIsAiModalOpen(false);
        message.success('AI đã viết xong nội dung cho bạn!');
        setAiTopic('');
    }, 1500);
  };
  // ------------------------------

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
            
            {/* 1. CHỌN TÀI KHOẢN */}
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
            </div>

            <Divider />

            {/* 2. NỘI DUNG & NÚT AI MAGIC */}
            <div style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Nội dung bài viết:</Text>
                    
                    {/* NÚT KÍCH HOẠT AI */}
                    <Button 
                        type="dashed" 
                        size="small" 
                        icon={<ThunderboltFilled style={{ color: '#faad14' }} />} 
                        onClick={() => setIsAiModalOpen(true)}
                        style={{ color: '#1677ff', borderColor: '#1677ff' }}
                    >
                        Viết bằng AI Magic
                    </Button>
               </div>
               
               <TextArea 
                  rows={6} 
                  placeholder="Nhập nội dung caption, mô tả video..." 
                  style={{ fontSize: 15, borderRadius: 8 }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2200}
                  showCount
               />
            </div>

            {/* 3. UPLOAD MEDIA */}
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

            {/* 4. FOOTER ACTIONS */}
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

        {/* --- CỘT PHẢI: PREVIEW (GIỮ NGUYÊN) --- */}
        <Col xs={24} lg={10}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
             <Title level={5} style={{ color: '#888', margin: 0 }}>Xem trước hiển thị</Title>
             <Text type="secondary" style={{ fontSize: 12 }}>
                Đang xem giao diện: <b style={{ color: previewAccount.platform === 'youtube' ? 'red' : '#1877f2' }}>{previewAccount.name}</b>
             </Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <div style={{ width: 360, minHeight: 650, background: '#fff', border: '10px solid #222', borderRadius: 40, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ height: 30, background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', fontSize: 10, fontWeight: 'bold' }}>
                    <span>9:41</span>
                    <span>📶 🔋</span>
                </div>

                {previewAccount.platform === 'facebook' ? (
                    <div style={{ background: '#f0f2f5', height: '100%' }}>
                        <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                             <span style={{ color: '#1877f2', fontWeight: 'bold', fontSize: 18 }}>facebook</span>
                             <span style={{fontSize: 18}}>🔍</span>
                        </div>
                        <div style={{ background: '#fff', marginTop: 10, paddingBottom: 10 }}>
                            <div style={{ padding: 12, display: 'flex', gap: 10 }}>
                                <Avatar src={previewAccount.avatar} />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>{previewAccount.name}</div>
                                    <div style={{ fontSize: 11, color: '#65676b' }}>Vừa xong · <GlobalOutlined /></div>
                                </div>
                            </div>
                            <div style={{ padding: '0 12px 12px', fontSize: 14, whiteSpace: 'pre-line' }}>
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
                    <div style={{ background: '#fff', height: '100%' }}>
                        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <YoutubeFilled style={{ color: 'red', fontSize: 24 }} />
                                <span style={{ fontWeight: 'bold' }}>YouTube</span>
                            </div>
                        </div>
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {previewImage ? <img src={previewImage} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <YoutubeFilled style={{ fontSize: 40, color: '#333' }} />}
                        </div>
                        <div style={{ padding: 12 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{content ? content.split('\n')[0].substring(0, 50) + '...' : 'Tiêu đề video...'}</div>
                            <div style={{ fontSize: 12, color: '#606060', marginTop: 4 }}>1.2K lượt xem · 2 giờ trước</div>
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
                                <div style={{ fontSize: 13, color: '#0f0f0f', marginTop: 4, whiteSpace: 'pre-line' }}>{content || 'Phần mô tả chi tiết...'}</div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </Col>
      </Row>

      {/* --- MODAL AI MAGIC --- */}
      <Modal
        title={<div><RobotOutlined style={{color: '#1677ff'}}/> Trợ lý AI Social Pro</div>}
        open={isAiModalOpen}
        onCancel={() => setIsAiModalOpen(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>Bạn muốn viết về chủ đề gì?</p>
            <Input 
                placeholder="VD: Review iPhone 16, Sale Tết, Tuyển dụng..." 
                size="large"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                style={{ marginBottom: 20 }}
                onPressEnter={handleAiGenerate}
            />
            
            {aiLoading ? (
                <div style={{ marginTop: 20 }}>
                    <Spin size="large" tip="AI đang suy nghĩ..." />
                </div>
            ) : (
                <Button 
                    type="primary" 
                    size="large" 
                    shape="round"
                    icon={<ThunderboltFilled />} 
                    onClick={handleAiGenerate}
                    style={{ background: 'linear-gradient(90deg, #1677ff 0%, #722ed1 100%)', border: 'none' }}
                >
                    Tạo nội dung ngay
                </Button>
            )}
        </div>
      </Modal>

    </div>
  );
};

export default CreatePost;