import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Button, Upload, Row, Col, 
  message, Card, Typography, Divider, 
  Segmented, Avatar, Tag, Space, Image, Spin 
} from 'antd';
import { 
  FileImageOutlined, FacebookFilled, VideoCameraFilled, 
  GlobalOutlined, LikeOutlined, CommentOutlined, 
  ShareAltOutlined, UserOutlined, FlagFilled,
  InboxOutlined, SendOutlined
} from '@ant-design/icons';
import { getAllSocialAccounts, getFacebookPages, postToFacebook } from '../../services/api';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// --- 1. COMPONENT PREVIEW FACEBOOK ---
const FacebookPreview = ({ type, data, pageInfo }) => {
    const safeContent = data.content || "Nội dung bài viết sẽ hiện ở đây...";
    const safeDate = "Vừa xong";
    const pageName = pageInfo?.name || "Tên Fanpage";
    const pageAvatar = pageInfo?.picture?.data?.url || "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg";

    const cardStyle = {
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        maxWidth: 400,
        margin: '0 auto',
        fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'
    };

    return (
        <div style={cardStyle}>
            {/* Header: Avatar + Tên Page */}
            <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar src={pageAvatar} size={40} />
                <div>
                    <Text strong style={{ display: 'block', fontSize: 15, color: '#050505' }}>{pageName}</Text>
                    <div style={{ fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {safeDate} · <GlobalOutlined style={{ fontSize: 12 }} />
                    </div>
                </div>
            </div>

            {/* Nội dung Text */}
            <div style={{ padding: '0 16px 16px 16px' }}>
                <Paragraph style={{ fontSize: 15, color: '#050505', marginBottom: 0, whiteSpace: 'pre-line' }}>
                    {safeContent}
                </Paragraph>
            </div>

            {/* Nội dung Media (Ảnh hoặc Video) */}
            {data.mediaUrl && (
                <div style={{ width: '100%', background: '#000', display:'flex', justifyContent:'center' }}>
                    {type === 'reel' ? (
                        <video 
                            src={data.mediaUrl} 
                            controls 
                            style={{ maxHeight: 500, maxWidth: '100%' }} 
                        />
                    ) : (
                        <Image 
                            src={data.mediaUrl} 
                            width="100%" 
                            style={{ objectFit: 'cover', display: 'block' }} 
                            preview={false}
                        />
                    )}
                </div>
            )}

            {/* Footer: Like/Comment/Share */}
            <div style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65676b', fontSize: 14, marginBottom: 12 }}>
                    <span><LikeOutlined style={{color: '#1877f2', marginRight: 4}}/> 12</span>
                    <span>5 bình luận</span>
                </div>
                <div style={{ borderTop: '1px solid #ced0d4', borderBottom: '1px solid #ced0d4', padding: '6px 0', display: 'flex', justifyContent: 'space-around' }}>
                    <Button type="text" icon={<LikeOutlined />} style={{ color: '#65676b', fontWeight: 600 }}>Thích</Button>
                    <Button type="text" icon={<CommentOutlined />} style={{ color: '#65676b', fontWeight: 600 }}>Bình luận</Button>
                    <Button type="text" icon={<ShareAltOutlined />} style={{ color: '#65676b', fontWeight: 600 }}>Chia sẻ</Button>
                </div>
            </div>
        </div>
    );
};

// --- 2. COMPONENT CHÍNH ---
const FacebookTab = () => {
    const [form] = Form.useForm();
    const [postType, setPostType] = useState('post'); // 'post' | 'reel'
    const [loading, setLoading] = useState(false);
    
    // Data Sources
    const [accounts, setAccounts] = useState([]); // Tài khoản FB cá nhân
    const [pages, setPages] = useState([]);       // Danh sách Fanpage của TK đó
    const [loadingPages, setLoadingPages] = useState(false);

    // State Preview
    const [selectedPage, setSelectedPage] = useState(null);
    const [previewData, setPreviewData] = useState({
        content: '',
        mediaUrl: null,
    });
    const [fileList, setFileList] = useState([]);

    // 1. Load Tài khoản FB khi vào trang
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await getAllSocialAccounts();
                // Lọc lấy tài khoản Facebook
                const fbAccounts = res.data.filter(acc => acc.platform === 'facebook');
                setAccounts(fbAccounts);
                
                // Nếu có tài khoản, tự động chọn cái đầu tiên
                if (fbAccounts.length > 0) {
                    const firstAcc = fbAccounts[0];
                    form.setFieldsValue({ account_id: firstAcc.id });
                    handleAccountChange(firstAcc.id);
                }
            } catch { message.error('Lỗi tải tài khoản Facebook'); }
        };
        fetchAccounts();
    }, []);

    // 2. Khi chọn Tài khoản -> Gọi API lấy danh sách Page
    const handleAccountChange = async (accountId) => {
        setLoadingPages(true);
        setPages([]);
        setSelectedPage(null);
        form.setFieldsValue({ page_id: null }); // Reset ô chọn Page

        try {
            // Gọi API lấy Page (Cần Backend hỗ trợ endpoint này)
            const res = await getFacebookPages(accountId);
            const pageList = res.data || [];
            setPages(pageList);

            // Tự động chọn Page đầu tiên nếu có
            if (pageList.length > 0) {
                const firstPage = pageList[0];
                form.setFieldsValue({ page_id: firstPage.id });
                handlePageChange(firstPage.id, firstPage);
            }
        } catch (e) {
            console.error(e);
            message.warning('Không lấy được danh sách Page (Kiểm tra Backend).');
        } finally {
            setLoadingPages(false);
        }
    };

    // 3. Khi chọn Page -> Cập nhật Preview
    const handlePageChange = (pageId, pageObj = null) => {
        const page = pageObj || pages.find(p => p.id === pageId);
        if (page) setSelectedPage(page);
    };

    // 4. Xử lý nhập liệu Preview
    const handleValuesChange = (_, allValues) => {
        setPreviewData(prev => ({ ...prev, content: allValues.content }));
    };

    const handleFileChange = ({ file }) => {
        if (file.status !== 'removed') {
            const url = URL.createObjectURL(file.originFileObj || file);
            setPreviewData(prev => ({ ...prev, mediaUrl: url }));
            setFileList([file]);
        } else {
            setPreviewData(prev => ({ ...prev, mediaUrl: null }));
            setFileList([]);
        }
        return false;
    };

    const onFinish = async (values) => {
        if (!selectedPage) return message.error('Vui lòng chọn Fanpage!');
        if (postType === 'reel' && fileList.length === 0) return message.error('Reels bắt buộc phải có Video!');

        setLoading(true);
        try {
            const payload = {
                page_id: selectedPage.id, // ID của Page trong DB hoặc ID Facebook
                page_access_token: selectedPage.access_token, // Token của Page để đăng bài
                content: values.content,
                type: postType,
                file: fileList.length > 0 ? (fileList[0].originFileObj || fileList[0]) : null
            };

            await postToFacebook(payload);
            message.success('Đăng bài lên Facebook thành công!');
            
            // Reset
            form.resetFields(['content']);
            setFileList([]);
            setPreviewData(prev => ({ ...prev, content: '', mediaUrl: null }));
        } catch {
            message.error('Lỗi khi đăng bài. Kiểm tra lại quyền Admin của Page.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={24}>
                {/* CỘT TRÁI: FORM */}
                <Col xs={24} lg={14}>
                    <Card style={{ borderRadius: 12 }}>
                        <div style={{ marginBottom: 24, textAlign: 'center' }}>
                            <Segmented
                                options={[
                                    { label: 'Bài viết (Post)', value: 'post', icon: <FileImageOutlined /> },
                                    { label: 'Reels (Video)', value: 'reel', icon: <VideoCameraFilled /> },
                                ]}
                                value={postType}
                                onChange={(val) => {
                                    setPostType(val);
                                    setFileList([]);
                                    setPreviewData(prev => ({...prev, mediaUrl: null}));
                                }}
                                size="large"
                                block
                            />
                        </div>

                        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="account_id" label="1. Tài khoản Quản trị" rules={[{ required: true }]}>
                                        <Select 
                                            placeholder="Chọn nick Facebook..." 
                                            onChange={handleAccountChange}
                                            size="large"
                                        >
                                            {accounts.map(acc => (
                                                <Select.Option key={acc.id} value={acc.id}>
                                                    <Space><Avatar src={acc.avatar_url} size="small"/> {acc.name}</Space>
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="page_id" label="2. Chọn Fanpage đích" rules={[{ required: true }]}>
                                        <Select 
                                            placeholder="Chọn Page..." 
                                            loading={loadingPages}
                                            disabled={!pages.length}
                                            onChange={handlePageChange}
                                            size="large"
                                        >
                                            {pages.map(p => (
                                                <Select.Option key={p.id} value={p.id}>
                                                    <Space><Avatar src={p.picture?.data?.url} size="small" shape="square"/> {p.name}</Space>
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="content" label="Nội dung (Caption)">
                                <TextArea rows={5} placeholder={postType === 'reel' ? "Mô tả cho Reels..." : "Bạn đang nghĩ gì?"} showCount maxLength={2000} style={{ fontSize: 16 }} />
                            </Form.Item>

                            <Form.Item label={postType === 'reel' ? "Tải lên Video Reels (9:16)" : "Ảnh đính kèm"}>
                                <Dragger 
                                    fileList={fileList}
                                    beforeUpload={() => false}
                                    onChange={handleFileChange}
                                    maxCount={1}
                                    accept={postType === 'reel' ? "video/*" : "image/*"}
                                    height={120}
                                >
                                    <p className="ant-upload-drag-icon">
                                        {postType === 'reel' ? <VideoCameraFilled style={{color:'#1877f2'}}/> : <FileImageOutlined style={{color:'#42b72a'}}/>}
                                    </p>
                                    <p className="ant-upload-text">
                                        Kéo thả {postType === 'reel' ? 'Video' : 'Ảnh'} vào đây
                                    </p>
                                </Dragger>
                            </Form.Item>

                            <Divider />
                            <Button type="primary" htmlType="submit" size="large" loading={loading} block icon={<SendOutlined />} style={{ background: '#1877f2', height: 50, fontSize: 16, fontWeight: 'bold' }}>
                                ĐĂNG LÊN FACEBOOK
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* CỘT PHẢI: PREVIEW */}
                <Col xs={24} lg={10}>
                    <div style={{ position: 'sticky', top: 24 }}>
                        <div style={{ marginBottom: 16, textAlign: 'center' }}>
                            <Tag color="blue">FACEBOOK PREVIEW</Tag>
                        </div>
                        <FacebookPreview type={postType} data={previewData} pageInfo={selectedPage} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default FacebookTab;