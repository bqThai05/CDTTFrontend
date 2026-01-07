// src/pages/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Upload, Row, Col, Typography, DatePicker, message, Avatar, Divider, Modal, Select, Switch, Space, Spin, Radio } from 'antd';
import { 
  CloudUploadOutlined, SendOutlined,
  ThunderboltFilled, CheckCircleFilled, 
  VideoCameraOutlined, FileTextOutlined,
  GlobalOutlined, LockOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { 
  getWorkspaces, 
  getAllSocialAccounts, 
  createWorkspacePost, 
  publishWorkspacePostNow 
} from '../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const CreatePost = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dữ liệu từ API
  const [workspaces, setWorkspaces] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);

  // Form State
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  
  // 👇 1. Biến postType và setPostType (đã được dùng ở dưới)
  const [postType, setPostType] = useState('video'); 
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  
  // State AI (Giả lập)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 👇 2. Biến visibility và setVisibility (đã được dùng ở dưới)
  const [visibility, setVisibility] = useState('public'); 
  
  const [isSchedule, setIsSchedule] = useState(false); 
  const [scheduleDate, setScheduleDate] = useState(null);

  // 1. Load dữ liệu Workspace & Accounts khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [wsRes, accRes] = await Promise.all([
          getWorkspaces(),
          getAllSocialAccounts()
        ]);
        
        setWorkspaces(wsRes.data);
        setSocialAccounts(accRes.data);

        // Mặc định chọn workspace đầu tiên nếu có
        if (wsRes.data.length > 0) {
            setSelectedWorkspaceId(wsRes.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        message.error("Không thể tải danh sách nhóm hoặc tài khoản.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const toggleAccount = (id) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(accId => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  // Preview logic
  const previewAccount = socialAccounts.find(acc => acc.id === selectedAccountIds[selectedAccountIds.length - 1]) || socialAccounts[0] || {};
  const isYoutubeSelected = previewAccount.platform === 'youtube';
  const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList);
  const previewImage = fileList.length > 0 ? fileList[0].thumbUrl || URL.createObjectURL(fileList[0].originFileObj) : null;

  // Xử lý AI (Giả lập frontend)
  const handleAiGenerate = () => {
    if (!aiTopic) return message.warning('Nhập chủ đề đã!');
    setAiLoading(true);
    setTimeout(() => {
        const fakeContent = `🔥 [AI CONTENT] ${aiTopic.toUpperCase()} \n\n✨ Nội dung này được tạo tự động cho kênh ${previewAccount.name || 'của bạn'}...\n#${aiTopic.replace(/\s/g, '')} #Trending`;
        if (isYoutubeSelected && postType === 'video') setTitle(`Review: ${aiTopic}`);
        setContent(fakeContent);
        setAiLoading(false);
        setIsAiModalOpen(false);
        message.success('AI đã viết xong!');
    }, 1000);
  };

  // 2. Xử lý ĐĂNG BÀI (Gọi API thật)
  const handleSubmit = async () => {
    if (!selectedWorkspaceId) return message.error("Vui lòng chọn Workspace (Nhóm)!");
    if (selectedAccountIds.length === 0) return message.error("Chọn ít nhất 1 tài khoản để đăng!");
    if (!content) return message.error("Nội dung không được để trống!");

    setSubmitting(true);
    try {
        // Bước 1: Tạo bài viết trong Workspace
        const postPayload = {
            workspace_id: selectedWorkspaceId,
            content: content,
            // Nếu có title (cho YouTube) thì gửi, không thì thôi
            ...(title && { title: title }),
            status: isSchedule ? 'scheduled' : 'draft',
            scheduled_at: isSchedule && scheduleDate ? scheduleDate.toISOString() : null,
            // 👇 Gửi thêm thông tin meta_data (bao gồm visibility)
            meta_data: {
                privacy_status: visibility,
                youtube_post_type: postType
            }
        };

        // Gọi API tạo bài (Backend: POST /workspaces/{id}/posts)
        const createRes = await createWorkspacePost(selectedWorkspaceId, postPayload);
        const newPostId = createRes.data.id;

        // Bước 2: Nếu chọn "Đăng ngay" -> Gọi API publish-now
        if (!isSchedule) {
            await publishWorkspacePostNow(selectedWorkspaceId, newPostId);
            message.success("Đã đăng bài thành công lên các nền tảng!");
        } else {
            message.success(`Đã lên lịch đăng vào ${dayjs(scheduleDate).format('HH:mm DD/MM')}`);
        }

        // Reset form
        setContent('');
        setTitle('');
        setFileList([]);

    } catch (error) {
        console.error("Lỗi đăng bài:", error);
        message.error("Có lỗi xảy ra khi đăng bài.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loadingData) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 24 }}>
             <Title level={2} style={{ margin: 0 }}>Tạo bài đăng</Title>
             <Text type="secondary">Đăng bài lên nhiều nền tảng cùng lúc</Text>
          </div>

          <Card bordered={false} style={{ borderRadius: 12 }}>
            
            {/* CHỌN WORKSPACE (QUAN TRỌNG) */}
            <div style={{ marginBottom: 24 }}>
                <Text strong>Chọn Nhóm làm việc (Workspace):</Text>
                <Select 
                    style={{ width: '100%', marginTop: 8 }} 
                    placeholder="Chọn workspace..."
                    value={selectedWorkspaceId}
                    onChange={setSelectedWorkspaceId}
                >
                    {workspaces.map(ws => (
                        <Option key={ws.id} value={ws.id}>{ws.name}</Option>
                    ))}
                </Select>
            </div>

            {/* CHỌN TÀI KHOẢN */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Đăng lên tài khoản nào?</Text>
              {socialAccounts.length === 0 ? <Text type="danger">Bạn chưa kết nối tài khoản nào. Vào Dashboard kết nối ngay!</Text> : (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                     {socialAccounts.map(acc => {
                        const isSelected = selectedAccountIds.includes(acc.id);
                        return (
                            <div key={acc.id} onClick={() => toggleAccount(acc.id)}
                                style={{ 
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid ${acc.platform === 'youtube' ? '#ff0000' : '#1877f2'}` : '2px solid #f0f0f0',
                                    borderRadius: 8, padding: '8px 12px',
                                    background: isSelected ? '#f6ffed' : '#fff',
                                    display: 'flex', alignItems: 'center', gap: 10, opacity: isSelected ? 1 : 0.7
                                }}
                            >
                                <Avatar size={32} style={{ backgroundColor: acc.platform === 'youtube' ? 'red' : 'blue' }}>{acc.platform[0].toUpperCase()}</Avatar>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name || acc.username}</div>
                                </div>
                                {isSelected && <CheckCircleFilled style={{ color: '#52c41a' }} />}
                            </div>
                        );
                     })}
                  </div>
              )}
            </div>

            <Divider />

            {/* 👇 SỬA LỖI 1: Thêm phần chọn loại bài (dùng setPostType) */}
            {isYoutubeSelected && (
                <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 15, borderRadius: 8 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Loại bài đăng YouTube:</Text>
                    <Radio.Group 
                        value={postType} 
                        onChange={(e) => setPostType(e.target.value)} 
                        buttonStyle="solid"
                    >
                        <Radio.Button value="video"><VideoCameraOutlined /> Video dài</Radio.Button>
                        <Radio.Button value="short"><VideoCameraOutlined /> Shorts</Radio.Button>
                        <Radio.Button value="post"><FileTextOutlined /> Bài đăng cộng đồng</Radio.Button>
                    </Radio.Group>
                </div>
            )}

            {/* INPUT TIÊU ĐỀ (Cho YouTube) */}
            {(isYoutubeSelected && (postType === 'video' || postType === 'short')) && (
                <div style={{ marginBottom: 24 }}>
                    <Text strong>Tiêu đề video (YouTube):</Text>
                    <Input size="large" placeholder="Nhập tiêu đề..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: 8 }} />
                </div>
            )}

            {/* INPUT NỘI DUNG */}
            <div style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Nội dung bài viết:</Text>
                    <Button type="dashed" size="small" icon={<ThunderboltFilled />} onClick={() => setIsAiModalOpen(true)}>AI Viết Hộ</Button>
               </div>
               <TextArea rows={5} placeholder="Nhập nội dung..." value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            {/* UPLOAD FILE */}
            <div style={{ marginBottom: 24 }}>
               <Upload.Dragger listType="picture-card" fileList={fileList} onChange={handleUpload} beforeUpload={() => false} maxCount={1}>
                  <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                  <p className="ant-upload-text">Kéo thả ảnh/video vào đây</p>
               </Upload.Dragger>
            </div>

            {/* CÀI ĐẶT NÂNG CAO */}
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12 }}>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        {/* 👇 SỬA LỖI 2: Dùng visibility và setVisibility */}
                        <Text strong style={{ display: 'block', marginBottom: 5 }}>Chế độ hiển thị:</Text>
                        <Select 
                            value={visibility} 
                            onChange={setVisibility} 
                            style={{ width: '100%' }}
                        >
                            <Option value="public"><GlobalOutlined /> Công khai</Option>
                            <Option value="unlisted"><EyeInvisibleOutlined /> Không công khai</Option>
                            <Option value="private"><LockOutlined /> Riêng tư</Option>
                        </Select>
                    </Col>
                    
                    <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 5 }}>Lên lịch đăng:</Text>
                        <Space>
                            <Switch size="small" checked={isSchedule} onChange={setIsSchedule} />
                            <DatePicker 
                                showTime placeholder="Chọn ngày giờ" 
                                disabled={!isSchedule} onChange={setScheduleDate} 
                                style={{ width: 200 }}
                            />
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* BUTTON SUBMIT */}
            <div style={{ marginTop: 32, textAlign: 'right' }}>
               <Button 
                    type="primary" size="large" icon={<SendOutlined />} 
                    loading={submitting}
                    disabled={selectedAccountIds.length === 0}
                    onClick={handleSubmit}
                    style={{ borderRadius: 8, padding: '0 40px', fontWeight: 600 }}
               >
                  {isSchedule ? 'LÊN LỊCH' : 'ĐĂNG NGAY'}
               </Button>
            </div>
          </Card>
        </Col>

        {/* PREVIEW BÊN PHẢI */}
        <Col xs={24} lg={10}>
             <div style={{ textAlign: 'center', marginTop: 50 }}>
                 <div style={{ border: '10px solid #333', borderRadius: 40, height: 600, background: '#fff', overflow: 'hidden', position: 'relative' }}>
                     <div style={{ padding: 20, background: isYoutubeSelected ? '#ff0000' : '#1877f2', color: '#fff' }}>
                         {isYoutubeSelected ? 'YouTube Preview' : 'Facebook Preview'}
                     </div>
                     <div style={{ padding: 20, textAlign: 'left' }}>
                         <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                             <Avatar style={{ backgroundColor: '#ccc' }} />
                             <div>
                                 <div style={{ fontWeight: 'bold' }}>{previewAccount.name || 'Tên tài khoản'}</div>
                                 <div style={{ fontSize: 12, color: '#999' }}>Vừa xong • {visibility === 'public' ? 'Công khai' : 'Riêng tư'}</div>
                             </div>
                         </div>
                         <div style={{ whiteSpace: 'pre-wrap', marginBottom: 15 }}>{content || 'Nội dung bài viết sẽ hiện ở đây...'}</div>
                         {previewImage && <img src={previewImage} style={{ width: '100%', borderRadius: 8 }} />}
                     </div>
                 </div>
             </div>
        </Col>
      </Row>

      {/* MODAL AI */}
      <Modal title="AI Writer" open={isAiModalOpen} onCancel={() => setIsAiModalOpen(false)} footer={null}>
        <Input placeholder="Chủ đề..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} onPressEnter={handleAiGenerate} />
        <Button type="primary" block style={{ marginTop: 15 }} onClick={handleAiGenerate} loading={aiLoading}>Viết ngay</Button>
      </Modal>
    </div>
  );
};

export default CreatePost;  