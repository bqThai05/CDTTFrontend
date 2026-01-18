// src/pages/Settings.jsx
import React, { useState } from 'react';
import { 
    Card, Tabs, Form, Switch, Select, Button, 
    Typography, Row, Col, Divider, message, 
    Radio, Alert, Progress, Tag 
} from 'antd';
import { 
    SettingOutlined, BellOutlined, RocketOutlined, 
    CreditCardOutlined, GlobalOutlined,
    BgColorsOutlined, SaveOutlined
} from '@ant-design/icons';

// Import Context để lấy và cập nhật cài đặt toàn cục
import { useSettings } from '../contexts/SettingsContext';

const { Title, Text } = Typography;
const { Option } = Select;

// --- CÁC COMPONENT CON (KHAI BÁO NGOÀI RENDER) ---

const GeneralSettings = ({ settings, onChange }) => (
    <div>
        <Title level={4} style={{marginTop: 0}}>Giao diện & Hiển thị</Title>
        <Form layout="vertical">
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item label="Ngôn ngữ hệ thống">
                        <Select 
                            value={settings.language} 
                            onChange={(val) => onChange('language', null, val)}
                        >
                            <Option value="vi">🇻🇳 Tiếng Việt</Option>
                            <Option value="en">🇺🇸 English</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                        <Form.Item label="Chế độ giao diện">
                        <Radio.Group 
                            value={settings.theme} 
                            buttonStyle="solid"
                            onChange={(e) => onChange('theme', null, e.target.value)}
                        >
                            <Radio.Button value="light"><BgColorsOutlined /> Sáng</Radio.Button>
                            <Radio.Button value="dark"><SettingOutlined /> Tối</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
            
            <Divider />
            
            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <Text strong>Chế độ thu gọn (Compact Mode)</Text>
                    <div style={{fontSize: 12, color: '#888'}}>Thu nhỏ khoảng cách giữa các phần tử để hiển thị nhiều hơn.</div>
                </div>
                <Switch 
                    checked={settings.compactMode} 
                    onChange={(checked) => onChange('compactMode', null, checked)} 
                />
            </div>
        </Form>
    </div>
);

const PublishingSettings = ({ settings, onChange }) => (
    <div>
        <Title level={4} style={{marginTop: 0}}>Mặc định đăng bài</Title>
        <Alert message="Các cài đặt này sẽ được áp dụng tự động mỗi khi bạn tạo bài viết mới." type="info" showIcon style={{marginBottom: 20}} />
        
        <Form layout="vertical">
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item label="Quyền riêng tư mặc định">
                        <Select 
                            value={settings.publishing.defaultPrivacy}
                            onChange={(val) => onChange('publishing', 'defaultPrivacy', val)}
                        >
                            <Option value="public"><GlobalOutlined /> Công khai (Public)</Option>
                            <Option value="private">🔒 Riêng tư (Private)</Option>
                            <Option value="unlisted">👁️ Không công khai (Unlisted)</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Múi giờ đăng bài">
                        <Select 
                            value={settings.publishing.defaultTimezone}
                            onChange={(val) => onChange('publishing', 'defaultTimezone', val)}
                        >
                            <Option value="+07:00">(GMT+07:00) Bangkok, Hanoi, Jakarta</Option>
                            <Option value="+00:00">(GMT+00:00) UTC</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center', marginTop: 10}}>
                <div>
                    <Text strong>Tự động đề xuất Hashtag</Text>
                    <div style={{fontSize: 12, color: '#888'}}>AI sẽ tự động thêm hashtag dựa trên nội dung bài viết.</div>
                </div>
                <Switch 
                    checked={settings.publishing.autoHashtag} 
                    onChange={(checked) => onChange('publishing', 'autoHashtag', checked)}
                />
            </div>
        </Form>
    </div>
);

const NotificationSettings = ({ settings, onChange }) => (
    <div>
        <Title level={4} style={{marginTop: 0}}>Tùy chọn thông báo</Title>
        
        <div style={{marginBottom: 20}}>
            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                <div>
                    <Text strong>Thông báo qua Email</Text>
                    <div style={{fontSize: 12, color: '#888'}}>Nhận email khi bài đăng thành công hoặc thất bại.</div>
                </div>
                <Switch 
                    checked={settings.notifications.email} 
                    onChange={(checked) => onChange('notifications', 'email', checked)}
                />
            </div>
            
            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                <div>
                    <Text strong>Thông báo trên trình duyệt (Popup)</Text>
                    <div style={{fontSize: 12, color: '#888'}}>Hiển thị popup góc màn hình khi có sự kiện mới.</div>
                </div>
                <Switch 
                    checked={settings.notifications.browser} 
                    onChange={(checked) => onChange('notifications', 'browser', checked)}
                />
            </div>

            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <Text strong>Báo cáo tuần</Text>
                    <div style={{fontSize: 12, color: '#888'}}>Nhận tổng hợp hiệu suất kênh vào mỗi sáng Thứ Hai.</div>
                </div>
                <Switch 
                    checked={settings.notifications.weeklyReport} 
                    onChange={(checked) => onChange('notifications', 'weeklyReport', checked)}
                />
            </div>
        </div>
    </div>
);

const BillingSettings = () => (
    <div>
        <Title level={4} style={{marginTop: 0}}>Gói dịch vụ hiện tại</Title>
        
        <Card style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 12, border: 'none', marginBottom: 20 }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <Tag color="purple" style={{fontSize: 14, padding: '4px 10px', marginBottom: 10}}>STARTER PLAN</Tag>
                    <Title level={3} style={{margin: 0}}>Miễn phí</Title>
                    <Text type="secondary">Hết hạn: Vĩnh viễn</Text>
                </div>
                <Button type="primary" size="large" icon={<RocketOutlined />} style={{background: '#d4145a', border:'none'}}>
                    Nâng cấp PRO
                </Button>
            </div>
        </Card>

        <Title level={5}>Dung lượng sử dụng</Title>
        <div style={{marginBottom: 15}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 5}}>
                <Text>Số tài khoản kết nối</Text>
                <Text strong>3 / 5</Text>
            </div>
            <Progress percent={60} showInfo={false} strokeColor="#1890ff" />
        </div>
        
        <div style={{marginBottom: 15}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 5}}>
                <Text>Bài đăng trong tháng</Text>
                <Text strong>12 / 30</Text>
            </div>
            <Progress percent={40} showInfo={false} strokeColor="#52c41a" />
        </div>

        <div style={{marginBottom: 15}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 5}}>
                <Text>Dung lượng Media</Text>
                <Text strong>150MB / 1GB</Text>
            </div>
            <Progress percent={15} showInfo={false} strokeColor="#faad14" />
        </div>
    </div>
);

// --- COMPONENT CHÍNH (SETTINGS) ---

const Settings = () => {
    const [loading, setLoading] = useState(false);

    // 1. Lấy settings từ Context (Thay vì useState nội bộ)
    const { settings, updateNestedSetting } = useSettings();

    // 2. Hàm xử lý thay đổi (Realtime update vào Context)
    const handleSettingChange = (category, key, value) => {
        updateNestedSetting(category, key, value);
    };

    // 3. Hàm Save chỉ để thông báo (vì Context đã tự lưu rồi)
    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            message.success('Đã lưu cấu hình!');
            setLoading(false);
        }, 500);
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Cài đặt hệ thống</Title>
                    <Text type="secondary">Tùy chỉnh trải nghiệm SocialPro của bạn</Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<SaveOutlined />} 
                    loading={loading}
                    onClick={handleSave}
                >
                    Lưu cài đặt
                </Button>
            </div>

            <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: 500 }}>
                <Tabs 
                    tabPosition="left"
                    size="large"
                    items={[
                        {
                            key: 'general',
                            label: <span><SettingOutlined /> Chung</span>,
                            children: <GeneralSettings settings={settings} onChange={handleSettingChange} />
                        },
                        {
                            key: 'publishing',
                            label: <span><RocketOutlined /> Đăng bài</span>,
                            children: <PublishingSettings settings={settings} onChange={handleSettingChange} />
                        },
                        {
                            key: 'notifications',
                            label: <span><BellOutlined /> Thông báo</span>,
                            children: <NotificationSettings settings={settings} onChange={handleSettingChange} />
                        },
                        {
                            key: 'billing',
                            label: <span><CreditCardOutlined /> Gói cước</span>,
                            children: <BillingSettings />
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default Settings;