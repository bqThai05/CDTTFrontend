// src/pages/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Upload, Row, Col, Typography, DatePicker, message, Avatar, Divider, Modal, Spin, Radio, Select, Switch, Space } from 'antd';
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
  RobotOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  DislikeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LockOutlined,
  TagOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAllSocialAccounts, getYouTubeChannels } from '../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const CreatePost = () => {
  // --- STATE CŨ ---
  const [postType, setPostType] = useState('video'); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);
  
  // State AI
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  // State quản lý tài khoản
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]); 

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await getAllSocialAccounts();
        const rawAccounts = response.data || [];
        
        // Enrich account data
        const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
          if (acc.platform === 'youtube') {
            const fallbackAcc = {
              ...acc,
              name: acc.name || acc.username || acc.title || acc.social_id || 'Kênh YouTube',
              avatar: acc.avatar_url || acc.avatar || acc.picture || acc.profile_image_url || acc.thumbnail || 'https://www.gstatic.com/youtube/img/branding/youtubelogo/2x/youtubelogo_color_24dp.png',
              type: 'Channel'
            };

            try {
              const channelsRes = await getYouTubeChannels(acc.id);
              if (channelsRes.data && channelsRes.data.length > 0) {
                const channel = channelsRes.data[0];
                return {
                  ...acc,
                  name: channel.title || fallbackAcc.name,
                  avatar: channel.thumbnail || channel.avatar || fallbackAcc.avatar,
                  type: 'Channel'
                };
              }
            } catch (e) {
              console.warn(`Không thể làm giàu dữ liệu cho kênh ${acc.social_id}:`, e.message);
              return fallbackAcc;
            }
            return fallbackAcc;
          }
          return {
            ...acc,
            name: acc.name || acc.username || acc.title || acc.social_id,
            avatar: acc.avatar_url || acc.avatar || acc.picture || acc.profile_image_url || acc.thumbnail,
            type: acc.platform === 'youtube' ? 'Channel' : 'Page'
          };
        }));

        setAccounts(enrichedAccounts);
        if (enrichedAccounts.length > 0) {
          setSelectedAccountIds([enrichedAccounts[0].id]);
        }
      } catch (error) {
        message.error("Không thể tải danh sách tài khoản.");
        console.error(error);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  // --- STATE MỚI ---
  const [visibility, setVisibility] = useState('public'); 
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [isSchedule, setIsSchedule] = useState(false); 
  const [scheduleDate, setScheduleDate] = useState(null);

  // --- LOGIC XỬ LÝ ---
  const toggleAccount = (id) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(accId => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const previewAccount = accounts.find(acc => acc.id === selectedAccountIds[selectedAccountIds.length - 1]) || accounts[0] || {};
  const handleUpload = ({ fileList: newFileList }) => setFileList(newFileList);
  const previewImage = fileList.length > 0 ? fileList[0].thumbUrl || URL.createObjectURL(fileList[0].originFileObj) : null;

  // Kiểm tra platform đang chọn
  const isYoutubeSelected = previewAccount?.platform === 'youtube';
  const isFacebookSelected = previewAccount?.platform === 'facebook';

  // --- STATE QUẢN LÝ NỀN TẢNG ---
  const [lastPlatform, setLastPlatform] = useState(previewAccount?.platform);

  // Reset visibility về mặc định khi đổi nền tảng để tránh lỗi logic
  if (previewAccount?.platform !== lastPlatform) {
    setLastPlatform(previewAccount?.platform);
    setVisibility('public');
  }

  // Render Icon chế độ hiển thị (SỬA LẠI LOGIC)
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <GlobalOutlined style={{ fontSize: 12 }} />;
      case 'friends': return <TeamOutlined style={{ fontSize: 12 }} />;
      case 'private': return <LockOutlined style={{ fontSize: 12 }} />;
      case 'unlisted': return <EyeInvisibleOutlined style={{ fontSize: 12 }} />; // Icon cho YouTube Unlisted
      default: return <GlobalOutlined style={{ fontSize: 12 }} />;
    }
  };

  const handleAiGenerate = () => {
    if (!aiTopic) { message.warning('Vui lòng nhập chủ đề!'); return; }
    setAiLoading(true);
    setTimeout(() => {
        const fakeContent = `🔥 [HOT TREND] ${aiTopic.toUpperCase()} ĐANG ĐỔ BỘ! 🔥\n\n✨ Cơ hội không thể bỏ lỡ...\n#${aiTopic.replace(/\s/g, '')} #Trending`;
        if (isYoutubeSelected && postType === 'video') { setTitle(`Review: ${aiTopic} - Có đáng tiền không?`); }
        setContent(fakeContent);
        setAiLoading(false);
        setIsAiModalOpen(false);
        message.success('AI đã viết xong!');
        setAiTopic('');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Row gutter={24}>
        
        {/* --- CỘT TRÁI: FORM NHẬP LIỆU --- */}
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 24 }}>
             <Title level={2} style={{ margin: 0 }}>Tạo bài đăng mới</Title>
             <Text type="secondary">Soạn thảo, tối ưu và đăng bài lên nhiều nền tảng</Text>
          </div>

          <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            
            {/* 1. CHỌN TÀI KHOẢN */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Đăng lên:</Text>
              <Spin spinning={loadingAccounts}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {accounts.map(acc => {
                        const isSelected = selectedAccountIds.includes(acc.id);
                        return (
                            <div key={acc.id} onClick={() => toggleAccount(acc.id)}
                                style={{ 
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid ${acc.platform === 'youtube' ? '#ff0000' : '#1877f2'}` : '2px solid #f0f0f0',
                                    borderRadius: 8, padding: '8px 12px',
                                    background: isSelected ? (acc.platform === 'youtube' ? '#fff1f0' : '#e6f7ff') : '#fff',
                                    display: 'flex', alignItems: 'center', gap: 10, opacity: isSelected ? 1 : 0.6
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
              </Spin>
            </div>

            <Divider />

            {/* --- LỰA CHỌN LOẠI BÀI (CHỈ HIỆN KHI CHỌN YOUTUBE) --- */}
            {isYoutubeSelected && (
                <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 15, borderRadius: 8 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Bạn muốn đăng gì lên YouTube?</Text>
                    <Radio.Group value={postType} onChange={(e) => setPostType(e.target.value)} buttonStyle="solid">
                        <Radio.Button value="video"><VideoCameraOutlined /> Video dài</Radio.Button>
                        <Radio.Button value="post"><FileTextOutlined /> Bài đăng cộng đồng</Radio.Button>
                    </Radio.Group>
                </div>
            )}

            {/* --- 2. TIÊU ĐỀ (CHỈ HIỆN CHO YOUTUBE VIDEO) --- */}
            {(isYoutubeSelected && postType === 'video') && (
                <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Tiêu đề video <span style={{color:'red'}}>*</span>:</Text>
                    <Input 
                        size="large" placeholder="Nhập tiêu đề video..." 
                        value={title} onChange={(e) => setTitle(e.target.value)} 
                        maxLength={100} showCount style={{ borderRadius: 8 }}
                    />
                </div>
            )}

            {/* 3. NỘI DUNG */}
            <div style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>{(isYoutubeSelected && postType === 'video') ? 'Mô tả video:' : 'Nội dung bài viết:'}</Text>
                    <Button type="dashed" size="small" icon={<ThunderboltFilled style={{ color: '#faad14' }} />} onClick={() => setIsAiModalOpen(true)} style={{ color: '#1677ff', borderColor: '#1677ff' }}>Viết bằng AI Magic</Button>
               </div>
               <TextArea 
                  rows={5} placeholder="Nhập nội dung chi tiết, hashtag..." 
                  style={{ fontSize: 15, borderRadius: 8 }}
                  value={content} onChange={(e) => setContent(e.target.value)}
                  maxLength={2200} showCount
               />
            </div>

            {/* 4. UPLOAD */}
            <div style={{ marginBottom: 24 }}>
               <Text strong>{(isYoutubeSelected && postType === 'video') ? 'Upload Video & Thumbnail:' : 'Thêm ảnh/GIF:'}</Text>
               <Upload.Dragger listType="picture-card" fileList={fileList} onChange={handleUpload} beforeUpload={() => false} maxCount={1} style={{ marginTop: 8, background: '#fafafa', borderRadius: 8 }}>
                  <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: '#1677ff' }} /></p>
                  <p className="ant-upload-text">Kéo thả file vào đây</p>
               </Upload.Dragger>
            </div>

            {/* --- 5. CÀI ĐẶT NÂNG CAO --- */}
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
                <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 15 }}><GlobalOutlined /> Cài đặt bài đăng</Text>
                
                <Row gutter={[24, 24]}>
                    
                    {/* 👇👇👇 PHẦN SỬA LỖI LOGIC Ở ĐÂY 👇👇👇 */}
                    <Col span={12}>
                        <div style={{ marginBottom: 5 }}>Chế độ hiển thị</div>
                        <Select value={visibility} onChange={setVisibility} style={{ width: '100%' }}>
                            <Option value="public"><GlobalOutlined /> Công khai</Option>
                            
                            {/* Nếu là Facebook thì hiện "Bạn bè" */}
                            {isFacebookSelected && (
                                <Option value="friends"><TeamOutlined /> Bạn bè</Option>
                            )}

                            {/* Nếu là YouTube thì hiện "Không công khai" */}
                            {isYoutubeSelected && (
                                <Option value="unlisted"><EyeInvisibleOutlined /> Không công khai</Option>
                            )}
                            
                            <Option value="private"><LockOutlined /> Riêng tư</Option>
                        </Select>
                    </Col>
                    {/* 👆👆👆 ----------------------- 👆👆👆 */}

                    <Col span={12}>
                        <div style={{ marginBottom: 5 }}>Vị trí / Check-in</div>
                        <Input 
                            prefix={<EnvironmentOutlined style={{ color: '#eb2f96' }} />} 
                            placeholder="VD: Hà Nội" 
                            value={location} onChange={(e) => setLocation(e.target.value)}
                        />
                    </Col>

                    <Col span={12}>
                        <Space style={{ marginBottom: 5 }}>
                            <span>Lên lịch đăng?</span>
                            <Switch size="small" checked={isSchedule} onChange={setIsSchedule} />
                        </Space>
                        <DatePicker 
                            showTime placeholder="Chọn ngày giờ" style={{ width: '100%' }} 
                            disabled={!isSchedule} format="DD/MM/YYYY HH:mm"
                            onChange={setScheduleDate}
                        />
                    </Col>

                    <Col span={12}>
                        <div style={{ marginBottom: 5 }}>Thẻ (Tags)</div>
                        <Select mode="tags" placeholder="Nhập tag..." style={{ width: '100%' }} suffixIcon={<TagOutlined />} onChange={setTags} />
                    </Col>
                </Row>
            </div>

            {/* 6. BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 32, gap: 15 }}>
               <Button size="large">Lưu nháp</Button>
               <Button 
                    type="primary" size="large" icon={<SendOutlined />} 
                    disabled={selectedAccountIds.length === 0}
                    onClick={() => {
                        message.success(`Đã đăng bài thành công!`);
                        setContent(''); setTitle(''); setFileList([]);
                    }}
                    style={{ borderRadius: 8, padding: '0 40px', fontWeight: 600 }}
               >
                  {isSchedule ? 'LÊN LỊCH' : 'ĐĂNG NGAY'}
               </Button>
            </div>
          </Card>
        </Col>

        {/* --- CỘT PHẢI: PREVIEW (GIỮ NGUYÊN CODE TỐT CỦA ANH) --- */}
        <Col xs={24} lg={10}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
             <Title level={5} style={{ color: '#888', margin: 0 }}>Xem trước hiển thị</Title>
             <Text type="secondary" style={{ fontSize: 12 }}>
                Giao diện: <b style={{ color: isYoutubeSelected ? 'red' : '#1877f2' }}>{previewAccount.name}</b>
             </Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <div style={{ width: 360, minHeight: 650, background: '#fff', border: '10px solid #222', borderRadius: 40, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ height: 30, background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', fontSize: 10, fontWeight: 'bold' }}>
                    <span>9:41</span><span>📶 🔋</span>
                </div>

                {/* FACEBOOK PREVIEW */}
                {isFacebookSelected && (
                    <div style={{ background: '#f0f2f5', height: '100%' }}>
                        <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
                             <span style={{ color: '#1877f2', fontWeight: 'bold', fontSize: 18 }}>facebook</span>
                             <span style={{fontSize: 18}}>🔍</span>
                        </div>
                        <div style={{ background: '#fff', marginTop: 10, paddingBottom: 10 }}>
                            <div style={{ padding: 12, display: 'flex', gap: 10 }}>
                                <Avatar src={previewAccount.avatar} />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                                        {previewAccount.name} 
                                        {location && <span style={{fontWeight: 'normal', color: '#666'}}> đang ở <b>{location}</b></span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {isSchedule && scheduleDate ? dayjs(scheduleDate).format('DD/MM HH:mm') : 'Vừa xong'} · {getVisibilityIcon()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '0 12px 12px', fontSize: 14, whiteSpace: 'pre-line' }}>
                                {content || 'Nội dung bài viết...'}
                                {tags.length > 0 && <div style={{color: '#1877f2', marginTop: 5}}>{tags.map(t => `#${t} `)}</div>}
                            </div>
                            {previewImage && <img src={previewImage} alt="Post" style={{ width: '100%', objectFit: 'cover' }} />}
                            <div style={{ padding: '10px 12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', color: '#65676b' }}>
                                <span><LikeOutlined /> Thích</span><span><CommentOutlined /> Bình luận</span><span><ShareAltOutlined /> Chia sẻ</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* YOUTUBE PREVIEW */}
                {isYoutubeSelected && (
                    <div style={{ background: '#fff', height: '100%' }}>
                        {postType === 'video' ? (
                            <>
                                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {previewImage ? <img src={previewImage} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <YoutubeFilled style={{ fontSize: 40, color: '#333' }} />}
                                </div>
                                <div style={{ padding: 12 }}>
                                    <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{title || 'Tiêu đề video...'}</div>
                                    <div style={{ fontSize: 12, color: '#606060', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        1.2K lượt xem · 2 giờ trước · {getVisibilityIcon()}
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
                                        <div style={{ fontSize: 13, color: '#0f0f0f', marginTop: 4, whiteSpace: 'pre-line' }}>{content || 'Mô tả...'}</div>
                                        <div style={{color: '#065fd4', marginTop: 5, fontSize: 13}}>{tags.map(t => `#${t} `)}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Community Post
                            <div style={{ padding: 16 }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    <Avatar src={previewAccount.avatar} size={40} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{previewAccount.name}</div>
                                        <div style={{ fontSize: 12, color: '#606060' }}>2 giờ trước</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 15, marginBottom: 12, whiteSpace: 'pre-line' }}>{content || 'Nội dung bài đăng...'}</div>
                                {previewImage && <img src={previewImage} alt="Post" style={{ width: '100%', borderRadius: 12 }} />}
                                <div style={{ display: 'flex', gap: 20, marginTop: 12, color: '#606060' }}>
                                    <LikeOutlined style={{ fontSize: 20 }} /> <DislikeOutlined style={{ fontSize: 20 }} /> <CommentOutlined style={{ fontSize: 20, marginLeft: 'auto' }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>
        </Col>
      </Row>

      {/* MODAL AI */}
      <Modal title={<div><RobotOutlined style={{color: '#1677ff'}}/> Trợ lý AI</div>} open={isAiModalOpen} onCancel={() => setIsAiModalOpen(false)} footer={null} centered>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>Nhập chủ đề:</p>
            <Input placeholder="VD: Review iPhone 16..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} onPressEnter={handleAiGenerate} />
            <Button type="primary" style={{ marginTop: 20 }} onClick={handleAiGenerate} loading={aiLoading}>Viết ngay</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePost;