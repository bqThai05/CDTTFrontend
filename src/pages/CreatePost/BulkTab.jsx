import React, { useState, useEffect } from 'react';
import { 
    Form, Input, Button, Card, List, Avatar, message, 
    Tag, Typography, Row, Col, Checkbox, Space, Badge 
} from 'antd';
import { 
    RocketFilled, YoutubeFilled, FacebookFilled, 
    CheckCircleFilled, UserOutlined, AppstoreOutlined 
} from '@ant-design/icons';
// Gọi thêm getYouTubeChannels để lấy avatar chuẩn
import { getAllSocialAccounts, postBulk, getYouTubeChannels } from '../../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

const BulkTab = () => {
    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [form] = Form.useForm();

    // 1. LẤY DANH SÁCH TÀI KHOẢN (CÓ XỬ LÝ AVATAR YOUTUBE)
    useEffect(() => {
        const loadAccounts = async () => {
            setLoadingAccounts(true);
            try {
                const res = await getAllSocialAccounts();
                const rawAccounts = res.data || [];

                // Kỹ thuật "Enrich": Duyệt qua từng tk, nếu là Youtube thì lấy thêm info
                const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
                    // Mặc định dùng thông tin có sẵn
                    let finalAcc = {
                        ...acc,
                        displayName: acc.name || acc.username || "Tài khoản",
                        displayAvatar: acc.avatar_url || acc.avatar
                    };

                    // Nếu là YouTube, gọi API lấy chi tiết để có Avatar xịn
                    if (acc.platform === 'youtube') {
                        try {
                            const chRes = await getYouTubeChannels(acc.id);
                            if (chRes.data && chRes.data.length > 0) {
                                const ch = chRes.data[0];
                                finalAcc.displayName = ch.title; // Tên kênh thật
                                finalAcc.displayAvatar = ch.thumbnail_url || ch.thumbnail; // Avatar thật
                            }
                        } catch  {
                            console.warn("Không lấy được chi tiết kênh:", acc.id);
                        }
                    } 
                    // Nếu là Facebook (Fanpage)
                    else if (acc.platform === 'facebook') {
                         // Nếu acc.avatar chưa có, có thể fallback sang icon mặc định
                         if (!finalAcc.displayAvatar) {
                             finalAcc.displayAvatar = "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg";
                         }
                    }

                    return finalAcc;
                }));

                setAccounts(enrichedAccounts);
            } catch { 
                message.error('Lỗi tải danh sách tài khoản'); 
            } finally {
                setLoadingAccounts(false);
            }
        };
        loadAccounts();
    }, []);

    const onFinish = async (values) => {
        if (selectedAccounts.length === 0) return message.warning('Vui lòng chọn ít nhất 1 kênh để đăng!');
        
        setLoading(true);
        try {
            // Lấy workspaceId (Giả định = 1 nếu chưa có hệ thống workspace)
            const workspaceId = 1;
            
            const payload = {
                content: values.content,
                // Map ra danh sách các account ID cần đăng
                platforms: selectedAccounts.map(id => ({ social_account_id: id })),
                title: values.title // Tiêu đề dùng cho YouTube (nếu có chọn kênh YT)
            };

            await postBulk(workspaceId, payload);
            message.success(`🚀 Đã đẩy lệnh đăng bài cho ${selectedAccounts.length} kênh!`);
            
            // Reset form
            form.resetFields();
            setSelectedAccounts([]);
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi đăng hàng loạt. Kiểm tra kết nối Backend.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm chọn/bỏ chọn tài khoản
    const toggleAccount = (id) => {
        if (selectedAccounts.includes(id)) {
            setSelectedAccounts(prev => prev.filter(item => item !== id));
        } else {
            setSelectedAccounts(prev => [...prev, id]);
        }
    };

    // Hàm chọn tất cả
    const toggleSelectAll = () => {
        if (selectedAccounts.length === accounts.length) {
            setSelectedAccounts([]);
        } else {
            setSelectedAccounts(accounts.map(a => a.id));
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {/* PHẦN 1: CHỌN TÀI KHOẢN */}
            <Card 
                title={
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Space><AppstoreOutlined /> <span>1. Chọn các kênh muốn đăng ({selectedAccounts.length})</span></Space>
                        <Checkbox 
                            checked={accounts.length > 0 && selectedAccounts.length === accounts.length}
                            indeterminate={selectedAccounts.length > 0 && selectedAccounts.length < accounts.length}
                            onChange={toggleSelectAll}
                        >
                            Chọn tất cả
                        </Checkbox>
                    </div>
                } 
                variant="borderless" 
                style={{marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}
            >
                <Spin spinning={loadingAccounts}>
                    <Row gutter={[16, 16]}>
                        {accounts.map(item => {
                            const isSelected = selectedAccounts.includes(item.id);
                            const isYoutube = item.platform === 'youtube';
                            
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                                    <div 
                                        onClick={() => toggleAccount(item.id)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            borderRadius: 12,
                                            border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                                            backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                                            padding: 12,
                                            position: 'relative',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                    >
                                        {/* Icon nền tảng góc trên */}
                                        <div style={{position: 'absolute', top: -8, left: -8, zIndex: 1}}>
                                            {isYoutube ? 
                                                <Avatar size={20} style={{backgroundColor:'#fff'}} icon={<YoutubeFilled style={{color:'red', fontSize: 20}}/>} /> : 
                                                <Avatar size={20} style={{backgroundColor:'#fff'}} icon={<FacebookFilled style={{color:'#1877f2', fontSize: 20}}/>} />
                                            }
                                        </div>

                                        {/* Icon Check khi chọn */}
                                        {isSelected && <CheckCircleFilled style={{position:'absolute', top: 10, right: 10, color: '#1890ff', fontSize: 18}} />}

                                        {/* Avatar Kênh */}
                                        <Avatar 
                                            src={item.displayAvatar} 
                                            size={48} 
                                            icon={<UserOutlined />}
                                            style={{ border: isSelected ? '1px solid #1890ff' : '1px solid #eee' }}
                                        />

                                        {/* Thông tin Kênh */}
                                        <div style={{overflow: 'hidden'}}>
                                            <Text strong style={{display:'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14}}>
                                                {item.displayName}
                                            </Text>
                                            <Tag color={isYoutube ? 'red' : 'blue'} style={{margin:0, fontSize: 10, borderRadius: 10}}>
                                                {isYoutube ? 'YouTube Channel' : 'Facebook Page'}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Spin>
            </Card>

            {/* PHẦN 2: NỘI DUNG BÀI ĐĂNG */}
            <Card title="2. Nội dung bài đăng" variant="borderless" style={{borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <Form.Item 
                            name="title" 
                            label="Tiêu đề (Bắt buộc cho YouTube)" 
                            help="Nếu chọn kênh YouTube, bài viết sẽ được đăng dưới dạng Community Post (hoặc Video nếu có file)."
                        >
                            <Input placeholder="Nhập tiêu đề chung..." size="large" />
                        </Form.Item>
                        
                        <Form.Item name="content" label="Nội dung chính" rules={[{ required: true, message: 'Không được để trống nội dung!' }]}>
                            <TextArea 
                                rows={8} 
                                placeholder="Nhập nội dung muốn đăng lên tất cả các kênh đã chọn..." 
                                showCount 
                                maxLength={2000} 
                                style={{fontSize: 16}}
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                        <div style={{background: '#f9f9f9', padding: 20, borderRadius: 12, height: '100%'}}>
                            <Title level={5}><RocketFilled /> Tóm tắt lệnh đăng</Title>
                            <ul style={{paddingLeft: 20, color: '#666'}}>
                                <li>Số kênh đã chọn: <b>{selectedAccounts.length}</b></li>
                                <li>Nền tảng: {selectedAccounts.length > 0 ? 'Đa nền tảng' : 'Chưa chọn'}</li>
                                <li>Trạng thái: <b>Đăng ngay lập tức</b></li>
                            </ul>
                            
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                loading={loading} 
                                block 
                                style={{
                                    height: 50, 
                                    fontSize: 16, 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #d4145a, #fbb03b)', 
                                    border: 'none',
                                    marginTop: 20,
                                    boxShadow: '0 4px 15px rgba(212, 20, 90, 0.3)'
                                }}
                                icon={<RocketFilled />}
                            >
                                ĐĂNG NGAY ({selectedAccounts.length})
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </Form>
    );
};

export default BulkTab;