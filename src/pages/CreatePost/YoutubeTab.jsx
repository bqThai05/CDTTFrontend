// src/pages/CreatePost/YoutubeTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Button, Upload, Row, Col, 
  message, Card, Typography, Divider, 
  Segmented, Avatar, Tag, Space, Image, theme // 1. Thêm import theme
} from 'antd';
import { 
  InboxOutlined, YoutubeFilled, UploadOutlined, 
  GlobalOutlined, LockOutlined, 
  EyeInvisibleOutlined, VideoCameraFilled, 
  MobileFilled, MessageFilled, UserOutlined,
  LikeOutlined, CommentOutlined, MoreOutlined,
  PictureFilled, PlayCircleFilled
} from '@ant-design/icons';
import { getAllSocialAccounts, postToYouTube, createYouTubePost, getYouTubeChannels } from '../../services/api';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// --- 1. COMPONENT PREVIEW (ĐÃ SỬA DARK MODE) ---
const YoutubePreview = ({ type, data, avatar }) => {
    // 2. Lấy token màu để xử lý giao diện
    const { token } = theme.useToken();

    const safeTitle = data.title || "Tiêu đề video của bạn sẽ hiện ở đây";
    const safeDesc = data.description || "Mô tả video sẽ hiện ở đây. Phần này hiển thị chi tiết nội dung video của bạn...";
    const safeDate = "Vừa xong";
    const channelName = data.channelName || "Tên Kênh";
    
    // Style chung cho Card Preview
    const cardStyle = {
        background: token.colorBgContainer, // Sửa: Màu nền động
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: token.boxShadowSecondary, // Sửa: Shadow động
        border: `1px solid ${token.colorBorderSecondary}`, // Sửa: Viền động
        maxWidth: 400,
        margin: '0 auto'
    };

    // --- VIEW 1: VIDEO DÀI ---
    if (type === 'video') {
        return (
            <div style={cardStyle}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {data.videoUrl ? (
                        <video src={data.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                    ) : data.thumbUrl ? (
                        <>
                            <img src={data.thumbUrl} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                            <PlayCircleFilled style={{ position: 'absolute', fontSize: 48, color: '#fff' }} />
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666' }}>
                            <YoutubeFilled style={{ fontSize: 48, color: 'red' }} />
                            <div style={{ color: '#fff', marginTop: 8 }}>Video Player</div>
                        </div>
                    )}
                </div>
                <div style={{ padding: 12 }}>
                    <Text strong style={{ fontSize: 16, display: 'block', lineHeight: 1.4, marginBottom: 8, color: token.colorText }}>{safeTitle}</Text>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <Avatar src={avatar} icon={<UserOutlined />} size={36} />
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 13, color: token.colorText }}>{channelName}</Text>
                            <div style={{ fontSize: 12, color: token.colorTextSecondary }}>0 lượt xem • {safeDate}</div>
                        </div>
                    </div>
                    {/* Sửa: Nền box mô tả */}
                    <div style={{ marginTop: 12, background: token.colorFillAlter, padding: 10, borderRadius: 8 }}>
                        <Text strong style={{fontSize: 12, color: token.colorText}}>Mô tả:</Text>
                        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'thêm' }} style={{ color: token.colorTextSecondary, marginTop: 4, fontSize: 13, marginBottom: 0, whiteSpace: 'pre-line' }}>
                            {safeDesc}
                        </Paragraph>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: SHORTS (Giữ nền tối đặc trưng của Shorts) ---
    if (type === 'shorts') {
        return (
            <div style={{ ...cardStyle, maxWidth: 280, borderRadius: 24, background: '#222', color: '#fff', height: 500, position: 'relative', border: 'none' }}>
                {data.videoUrl ? (
                    <video src={data.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }} autoPlay muted loop />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
                         <MobileFilled style={{ fontSize: 48, marginBottom: 16 }} />
                         <Text style={{color:'#aaa'}}>Video Dọc (9:16)</Text>
                    </div>
                )}
                
                {/* Overlay thông tin */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', borderRadius: '0 0 24px 24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Avatar src={avatar} size={32} style={{border: '1px solid #fff'}} />
                        <Text strong style={{ color: '#fff', fontSize: 13 }}>@{channelName.replace(/\s+/g, '')}</Text>
                        <Button size="small" style={{ height: 24, fontSize: 10, background: '#fff', color: '#000', border:'none', fontWeight: 'bold', borderRadius: 12 }}>Đăng ký</Button>
                     </div>
                     <Text style={{ color: '#fff', display: 'block', marginBottom: 8, fontSize: 14, lineHeight: 1.3 }}>{safeTitle}</Text>
                     <Text style={{ color: '#fff', fontSize: 12 }}>🎵 Âm thanh gốc - {channelName}</Text>
                </div>

                <div style={{ position: 'absolute', right: 8, bottom: 80, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                    <div style={{textAlign:'center'}}><div style={{background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '50%'}}><LikeOutlined style={{fontSize: 24}}/></div><span style={{fontSize:11}}>Thích</span></div>
                    <div style={{textAlign:'center'}}><div style={{background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '50%'}}><CommentOutlined style={{fontSize: 24}}/></div><span style={{fontSize:11}}>Bình</span></div>
                    <div style={{textAlign:'center'}}><div style={{background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '50%'}}><MoreOutlined style={{fontSize: 24}}/></div></div>
                </div>
            </div>
        );
    }

    // --- VIEW 3: POST ---
    if (type === 'post') {
        return (
            <div style={cardStyle}>
                <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <Avatar src={avatar} icon={<UserOutlined />} />
                        <div>
                            <Text strong style={{ display: 'block', color: token.colorText }}>{channelName}</Text>
                            <Text type="secondary" style={{ fontSize: 12, color: token.colorTextSecondary }}>{safeDate}</Text>
                        </div>
                    </div>
                    <Paragraph style={{ marginBottom: 12, fontSize: 15, whiteSpace: 'pre-line', color: token.colorText }}>
                        {data.content || "Nội dung bài viết..."}
                    </Paragraph>
                    
                    {data.postImgUrl && (
                        <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
                            <Image src={data.postImgUrl} style={{ width: '100%', display: 'block' }} />
                        </div>
                    )}
                </div>
                <div style={{ padding: '8px 16px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', gap: 24 }}>
                    <Text type="secondary" style={{color: token.colorTextSecondary}}><LikeOutlined /> 0</Text>
                    <Text type="secondary" style={{color: token.colorTextSecondary}}><LikeOutlined rotate={180} /></Text>
                    <Text type="secondary" style={{color: token.colorTextSecondary}}><CommentOutlined /> 0</Text>
                </div>
            </div>
        );
    }
};

// --- COMPONENT CHÍNH ---
const YoutubeTab = () => {
    const { token } = theme.useToken(); // Lấy token cho Component chính
    const [form] = Form.useForm();
    const [postType, setPostType] = useState('video');
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [previewData, setPreviewData] = useState({
        title: '', description: '', content: '',
        thumbUrl: null, videoUrl: null, postImgUrl: null, 
        channelName: 'Tên Kênh'
    });

    const [fileList, setFileList] = useState([]);     
    const [thumbList, setThumbList] = useState([]);   
    const [postImgList, setPostImgList] = useState([]); 

    const YOUTUBE_CATEGORIES = [
        { id: '22', name: 'Mọi người & Blog' },
        { id: '10', name: 'Âm nhạc' },
        { id: '20', name: 'Gaming' },
        { id: '24', name: 'Giải trí' },
        { id: '27', name: 'Giáo dục' },
        { id: '28', name: 'Công nghệ' },
    ];

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await getAllSocialAccounts();
                const ytAccounts = res.data.filter(acc => acc.platform === 'youtube');
                
                const enrichedAccounts = await Promise.all(ytAccounts.map(async (acc) => {
                    try {
                        const chRes = await getYouTubeChannels(acc.id);
                        if (chRes.data && chRes.data.length > 0) {
                            const ch = chRes.data[0];
                            return {
                                ...acc,
                                name: ch.title || acc.name,
                                avatar: ch.thumbnail_url || ch.thumbnail || acc.avatar_url
                            };
                        }
                    } catch (e) { console.error("Lỗi lấy chi tiết kênh", e); }
                    return { ...acc, name: acc.name || acc.username || "Kênh chưa đặt tên" };
                }));

                setAccounts(enrichedAccounts);
                
                if (enrichedAccounts.length > 0) {
                    const first = enrichedAccounts[0];
                    form.setFieldsValue({ account_id: first.id });
                    handleAccountChange(first.id, first);
                }
            } catch {
                message.error('Lỗi tải danh sách kênh YouTube');
            }
        };
        fetchAccounts();
    }, []);

    const handleAccountChange = (id, accObj = null) => {
        const acc = accObj || accounts.find(a => a.id === id);
        if (acc) {
            setSelectedAccount(acc);
            setPreviewData(prev => ({ ...prev, channelName: acc.name || acc.username }));
        }
    };

    const handleValuesChange = (changedValues, allValues) => {
        setPreviewData(prev => ({
            ...prev,
            title: allValues.title,
            description: allValues.description,
            content: allValues.content
        }));
    };

    const handleVideoChange = ({ file }) => {
        if (file.status !== 'removed') {
            const url = URL.createObjectURL(file.originFileObj || file);
            setPreviewData(prev => ({ ...prev, videoUrl: url }));
            setFileList([file]);
        } else {
            setPreviewData(prev => ({ ...prev, videoUrl: null }));
            setFileList([]);
        }
        return false; 
    };

    const handleThumbChange = ({ file }) => {
        if (file.status !== 'removed') {
            const url = URL.createObjectURL(file.originFileObj || file);
            setPreviewData(prev => ({ ...prev, thumbUrl: url }));
            setThumbList([file]);
        } else {
            setPreviewData(prev => ({ ...prev, thumbUrl: null }));
            setThumbList([]);
        }
        return false;
    };

    const handlePostImgChange = ({ file }) => {
        if (file.status !== 'removed') {
            const url = URL.createObjectURL(file.originFileObj || file);
            setPreviewData(prev => ({ ...prev, postImgUrl: url }));
            setPostImgList([file]);
        } else {
            setPreviewData(prev => ({ ...prev, postImgUrl: null }));
            setPostImgList([]);
        }
        return false;
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (postType === 'post') {
                await createYouTubePost({
                    social_account_id: values.account_id,
                    content: values.content,
                    image_file: postImgList.length > 0 ? (postImgList[0].originFileObj || postImgList[0]) : null
                });
                message.success('Đã đăng bài viết cộng đồng!');
            } else {
                if (fileList.length === 0) return message.error('Chưa chọn video!');
                
                const payload = {
                    social_account_id: values.account_id,
                    title: values.title,
                    description: values.description,
                    privacy_status: values.privacy,
                    category_id: values.category,
                    tags: values.tags, 
                    is_shorts: postType === 'shorts', 
                    video_file: fileList[0].originFileObj || fileList[0], 
                    thumbnail_file: thumbList.length > 0 ? (thumbList[0].originFileObj || thumbList[0]) : null
                };

                await postToYouTube(payload);
                message.success(`Đăng ${postType === 'shorts' ? 'Shorts' : 'Video'} thành công!`);
            }
            form.resetFields();
            setFileList([]); setThumbList([]); setPostImgList([]);
            setPreviewData(prev => ({...prev, title:'', description:'', content:'', thumbUrl: null, videoUrl: null, postImgUrl: null}));
        } catch (error) {
            if (error.response && error.response.status === 404) message.error('API 404: Lỗi kết nối Backend.');
            else message.error('Có lỗi xảy ra khi đăng tải.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={24}>
                {/* CỘT FORM */}
                <Col xs={24} lg={14} xl={15}>
                    <Card style={{ 
                        borderRadius: 12, 
                        boxShadow: token.boxShadowTertiary,
                        background: token.colorBgContainer // Sửa: Màu nền động
                    }}>
                        <div style={{ marginBottom: 24, textAlign: 'center' }}>
                            <Segmented
                                options={[
                                    { label: 'Video Dài', value: 'video', icon: <VideoCameraFilled /> },
                                    { label: 'Shorts', value: 'shorts', icon: <MobileFilled /> },
                                    { label: 'Bài Đăng', value: 'post', icon: <MessageFilled /> },
                                ]}
                                value={postType}
                                onChange={setPostType}
                                size="large"
                                block
                            />
                        </div>

                        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange} initialValues={{ privacy: 'public', category: '22' }}>
                            
                            <Form.Item name="account_id" label="Chọn Kênh đăng tải" rules={[{ required: true }]}>
                                <Select 
                                    placeholder="Chọn kênh YouTube..." 
                                    onChange={handleAccountChange}
                                    size="large"
                                    optionLabelProp="label" 
                                    loading={accounts.length === 0}
                                >
                                    {accounts.map(acc => (
                                        <Select.Option 
                                            key={acc.id} 
                                            value={acc.id}
                                            label={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
                                                    <Avatar src={acc.avatar} size="small" icon={<UserOutlined/>} />
                                                    <span style={{ fontWeight: 500, color: token.colorText }}>{acc.name}</span>
                                                </div>
                                            }
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Avatar src={acc.avatar} icon={<UserOutlined/>} />
                                                <span style={{ fontWeight: 500, color: token.colorText }}>{acc.name}</span>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {(postType === 'video' || postType === 'shorts') && (
                                <>
                                    <Form.Item label="Tải lên Video" required>
                                        <Dragger 
                                            fileList={fileList} 
                                            beforeUpload={() => false} 
                                            onChange={handleVideoChange} 
                                            maxCount={1} 
                                            accept="video/*" 
                                            height={150}
                                            style={{ background: token.colorFillAlter }} // Sửa: Nền upload động
                                        >
                                            <p className="ant-upload-drag-icon"><InboxOutlined style={{color: '#ff0000'}} /></p>
                                            <p className="ant-upload-text" style={{color: token.colorText}}>Kéo thả Video vào đây</p>
                                        </Dragger>
                                    </Form.Item>

                                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, max: 100 }]}>
                                        <Input placeholder="Tiêu đề video..." showCount maxLength={100} size="large" />
                                    </Form.Item>

                                    <Form.Item name="description" label="Mô tả">
                                        <TextArea rows={4} placeholder="Mô tả nội dung..." showCount maxLength={5000} />
                                    </Form.Item>

                                    {postType === 'video' && (
                                        <Row gutter={16}>
                                            <Col span={10}>
                                                <Form.Item label="Hình thu nhỏ (Thumbnail)">
                                                    <Upload listType="picture-card" fileList={thumbList} beforeUpload={() => false} onChange={handleThumbChange} maxCount={1} accept="image/*">
                                                        <div><UploadOutlined /><div style={{ marginTop: 8 }}>Ảnh</div></div>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Form.Item name="category" label="Danh mục">
                                                    <Select>{YOUTUBE_CATEGORIES.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}</Select>
                                                </Form.Item>
                                                <Form.Item name="privacy" label="Chế độ">
                                                    <Select>
                                                        <Select.Option value="public"><GlobalOutlined/> Công khai</Select.Option>
                                                        <Select.Option value="unlisted"><EyeInvisibleOutlined/> Không công khai</Select.Option>
                                                        <Select.Option value="private"><LockOutlined/> Riêng tư</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}
                                    
                                    {postType === 'video' && (
                                        <Form.Item name="tags" label="Thẻ từ khóa (Tags)">
                                            <Select mode="tags" placeholder="Gõ rồi Enter..." tokenSeparators={[',']} />
                                        </Form.Item>
                                    )}
                                </>
                            )}

                            {postType === 'post' && (
                                <>
                                    <Form.Item name="content" label="Nội dung bài viết" rules={[{ required: true }]}>
                                        <TextArea rows={5} placeholder="Bạn đang nghĩ gì?..." showCount maxLength={2000} style={{ fontSize: 16 }} />
                                    </Form.Item>
                                    <Form.Item label="Hình ảnh đính kèm (Tùy chọn)">
                                        <Upload listType="picture" fileList={postImgList} beforeUpload={() => false} onChange={handlePostImgChange} maxCount={1} accept="image/*">
                                            <Button icon={<PictureFilled />}>Chọn ảnh</Button>
                                        </Upload>
                                    </Form.Item>
                                </>
                            )}

                            <Divider />
                            <Button type="primary" htmlType="submit" size="large" loading={loading} block icon={<YoutubeFilled />} danger style={{ height: 50, fontSize: 16, fontWeight: 700 }}>
                                {postType === 'post' ? 'ĐĂNG BÀI VIẾT' : `TẢI LÊN ${postType.toUpperCase()}`}
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* CỘT PREVIEW */}
                <Col xs={24} lg={10} xl={9}>
                    <div style={{ position: 'sticky', top: 24 }}>
                        <div style={{ marginBottom: 16, textAlign: 'center' }}><Tag color="red">XEM TRƯỚC (PREVIEW)</Tag></div>
                        <YoutubePreview type={postType} data={previewData} avatar={selectedAccount?.avatar || "https://www.gstatic.com/youtube/img/branding/youtubelogo/2x/youtubelogo_color_24dp.png"} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default YoutubeTab;