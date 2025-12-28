// src/pages/LandingPage.jsx
import React from 'react';
import { Button, Typography, Row, Col, Card, Space, Layout, Avatar, Collapse, Tag, Divider } from 'antd';
import { 
  RocketOutlined, 
  CheckCircleFilled, 
  ArrowRightOutlined,
  PlayCircleFilled,
  GlobalOutlined,
  SafetyCertificateFilled,
  ThunderboltFilled,
  SmileOutlined,
  QuestionCircleOutlined,
  StarFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

const LandingPage = () => {
  const navigate = useNavigate();

  // CSS nội bộ cho hiệu ứng đẹp
  const styles = {
    gradientText: {
        background: 'linear-gradient(90deg, #1677ff 0%, #722ed1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSection: {
        background: 'linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)',
        padding: '100px 20px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
    },
    section: {
        padding: '80px 20px',
        maxWidth: 1200,
        margin: '0 auto'
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      
      {/* 1. STICKY HEADER */}
      <Header style={{ 
          position: 'sticky', top: 0, zIndex: 1000, width: '100%', 
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)', padding: '0 40px'
      }}>
        <div style={{ fontSize: 24, fontWeight: '900', color: '#1677ff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <RocketOutlined /> SOCIAL PRO
        </div>
        <div className="desktop-menu">
            <Space size="large">
                <Button type="link" style={{color: '#333'}}>Tính năng</Button>
                <Button type="link" style={{color: '#333'}}>Bảng giá</Button>
                <Button type="link" style={{color: '#333'}}>Khách hàng</Button>
            </Space>
        </div>
        <Space>
            <Button type="text" onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button type="primary" shape="round" onClick={() => navigate('/register')} style={{ background: '#1677ff', borderColor: '#1677ff', fontWeight: 600 }}>
                Đăng ký miễn phí
            </Button>
        </Space>
      </Header>

      <Content>
        {/* 2. HERO SECTION NÂNG CẤP */}
        <div style={styles.heroSection}>
            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <Tag color="blue" style={{ marginBottom: 20, padding: '5px 15px', borderRadius: 20 }}>🚀 Phiên bản 2.0 đã ra mắt</Tag>
                <Title level={1} style={{ fontSize: 60, marginBottom: 24, lineHeight: 1.1, fontWeight: 800 }}>
                    Quản lý đa kênh <br/> 
                    <span style={styles.gradientText}>Thông minh hơn.</span>
                </Title>
                <Paragraph style={{ fontSize: 20, color: '#666', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
                    Tích hợp AI viết content, lên lịch tự động cho Facebook & YouTube. 
                    Giúp bạn tiết kiệm 80% thời gian quản lý mạng xã hội.
                </Paragraph>
                <Space size="middle">
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<ArrowRightOutlined />} 
                        style={{ height: 56, fontSize: 18, padding: '0 40px', borderRadius: 28 }}
                        onClick={() => navigate('/login')}
                    >
                        Dùng thử ngay
                    </Button>
                    <Button 
                        size="large" 
                        icon={<PlayCircleFilled />} 
                        style={{ height: 56, fontSize: 18, padding: '0 30px', borderRadius: 28 }}
                    >
                        Xem Demo
                    </Button>
                </Space>
                
                <div style={{ marginTop: 30, fontSize: 14, color: '#888' }}>
                    <Space size="large">
                        <span><CheckCircleFilled style={{ color: '#52c41a' }} /> Free 14 ngày</span>
                        <span><CheckCircleFilled style={{ color: '#52c41a' }} /> Không cần thẻ tín dụng</span>
                    </Space>
                </div>
            </div>

            {/* MOCKUP DASHBOARD (Hình ảnh giả lập) */}
            <div style={{ marginTop: 60, perspective: '1000px' }}>
                <div style={{ 
                    maxWidth: 1000, margin: '0 auto', 
                    borderRadius: 20, boxShadow: '0 30px 60px rgba(0,0,0,0.12)', 
                    border: '8px solid #333', overflow: 'hidden', background: '#fff',
                    transform: 'rotateX(5deg)'
                }}>
                    <img src="https://ant.design/docs/spec/introduce-cn" style={{ width: '100%', height: 'auto', display: 'block', opacity: 0 }} alt="Dashboard Mockup" />
                    {/* Giả lập Dashboard bằng code để không cần ảnh thật */}
                    <div style={{ height: 500, background: '#f5f7fa', position: 'relative' }}>
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ width: 200, background: '#fff', borderRight: '1px solid #eee' }}></div>
                            <div style={{ flex: 1, padding: 20 }}>
                                <div style={{ height: 40, width: '30%', background: '#e1e4e8', borderRadius: 8, marginBottom: 20 }}></div>
                                <Row gutter={16}>
                                    <Col span={8}><div style={{ height: 120, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}></div></Col>
                                    <Col span={8}><div style={{ height: 120, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}></div></Col>
                                    <Col span={8}><div style={{ height: 120, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}></div></Col>
                                </Row>
                                <div style={{ height: 250, background: '#fff', borderRadius: 12, marginTop: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 24, fontWeight: 'bold' }}>
                                    SOCIAL PRO DASHBOARD
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. LOGO PARTNERS (Social Proof) */}
        <div style={{ padding: '40px 0', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20, letterSpacing: 2, fontSize: 12, textTransform: 'uppercase' }}>Được tin dùng bởi hơn 10.000 Creator</Text>
            <Space size={60} style={{ opacity: 0.6, filter: 'grayscale(100%)' }}>
                 <GlobalOutlined style={{ fontSize: 32 }} />
                 <SafetyCertificateFilled style={{ fontSize: 32 }} />
                 <ThunderboltFilled style={{ fontSize: 32 }} />
                 <SmileOutlined style={{ fontSize: 32 }} />
            </Space>
        </div>

        {/* 4. TÍNH NĂNG NỔI BẬT (Grid Layout) */}
        <div style={styles.section}>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
                <Title level={2}>Công cụ mạnh mẽ cho người dẫn đầu</Title>
                <Paragraph type="secondary" style={{ fontSize: 16 }}>Chúng tôi tích hợp mọi thứ bạn cần để phát triển kênh một cách bền vững.</Paragraph>
            </div>

            <Row gutter={[48, 48]} align="middle">
                <Col xs={24} md={12}>
                    <Title level={3}>1. Trợ lý AI Thông minh 🤖</Title>
                    <Paragraph style={{ fontSize: 16, color: '#666' }}>
                        Bí ý tưởng? Chỉ cần nhập từ khóa, AI sẽ tự động viết caption, kịch bản video chuẩn SEO, bắt trend cực nhanh.
                    </Paragraph>
                    <ul style={{ color: '#666', lineHeight: 2 }}>
                        <li>✅ Viết đa dạng chủ đề: Sale, Review, Vlog...</li>
                        <li>✅ Tự động thêm icon sinh động.</li>
                        <li>✅ Tiết kiệm 90% thời gian viết lách.</li>
                    </ul>
                </Col>
                <Col xs={24} md={12}>
                    <Card style={styles.glassCard} bordered={false}>
                        <div style={{ padding: 20, textAlign: 'center' }}>
                            <div style={{ background: '#f0f5ff', padding: 15, borderRadius: 12, marginBottom: 10, textAlign: 'left' }}>
                                <div style={{ fontSize: 12, color: '#999' }}>User input:</div>
                                <b>"Viết caption bán giày Tết"</b>
                            </div>
                            <div style={{ background: '#fff', padding: 15, borderRadius: 12, textAlign: 'left', border: '1px solid #eee' }}>
                                <div style={{ fontSize: 12, color: '#1677ff', marginBottom: 5 }}>🤖 AI generating...</div>
                                "🧧 TẾT ĐẾN CHÂN RỒI - SẮM GIÀY MỚI THÔI! 👟<br/>
                                Sale sập sàn 50% toàn bộ mẫu Sneaker..."
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '60px 0' }} />

            <Row gutter={[48, 48]} align="middle">
                <Col xs={24} md={12} order={2}>
                     <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -20, left: -20, width: 60, height: 60, background: '#ff4d4f', borderRadius: '50%', opacity: 0.1 }}></div>
                        <Card style={{...styles.glassCard, borderColor: '#ffccc7'}} bordered={false}>
                             <div style={{ textAlign: 'center', padding: 20 }}>
                                 <Title level={4}>YouTube Channel</Title>
                                 <div style={{ fontSize: 32, fontWeight: 'bold', color: '#cf1322' }}>+125%</div>
                                 <Text type="secondary">Tăng trưởng Views tháng này</Text>
                             </div>
                        </Card>
                        <Card style={{...styles.glassCard, position: 'absolute', bottom: -30, right: -20, borderColor: '#91caff'}} bordered={false}>
                             <div style={{ textAlign: 'center', padding: 20 }}>
                                 <Title level={4}>Facebook Page</Title>
                                 <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1677ff' }}>+890</div>
                                 <Text type="secondary">Followers mới</Text>
                             </div>
                        </Card>
                     </div>
                </Col>
                <Col xs={24} md={12} order={1}>
                    <Title level={3}>2. Báo cáo trực quan & Chi tiết 📈</Title>
                    <Paragraph style={{ fontSize: 16, color: '#666' }}>
                        Không còn phải đoán mò. Hệ thống phân tích dữ liệu từ tất cả các kênh và hiển thị trên một Dashboard duy nhất.
                    </Paragraph>
                    <Button type="primary" ghost size="large">Xem ví dụ báo cáo</Button>
                </Col>
            </Row>
        </div>

        {/* 5. PRICING (Bảng giá) */}
        <div style={{ background: '#f9f9f9', padding: '80px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <Title level={2}>Bảng giá linh hoạt</Title>
                <Text type="secondary">Chọn gói phù hợp với quy mô của bạn</Text>
            </div>
            
            <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ height: '100%', borderRadius: 16, textAlign: 'center' }}>
                        <Title level={3}>Starter</Title>
                        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#333' }}>0đ</div>
                        <Text type="secondary">Trọn đời</Text>
                        <Divider />
                        <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.5, textAlign: 'left' }}>
                            <li>✅ 1 Tài khoản kết nối</li>
                            <li>✅ Lên lịch 10 bài/tháng</li>
                            <li>❌ Không có AI Writer</li>
                            <li>❌ Báo cáo cơ bản</li>
                        </ul>
                        <Button block size="large" style={{ marginTop: 20 }}>Đăng ký Free</Button>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -15, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
                             <Tag color="red" style={{ padding: '4px 12px', borderRadius: 20 }}>PHỔ BIẾN NHẤT</Tag>
                        </div>
                        <Card hoverable style={{ height: '100%', borderRadius: 16, textAlign: 'center', border: '2px solid #1677ff', transform: 'scale(1.05)', boxShadow: '0 10px 40px rgba(22, 119, 255, 0.15)' }}>
                            <Title level={3} style={{ color: '#1677ff' }}>Pro</Title>
                            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#1677ff' }}>199k</div>
                            <Text type="secondary">/ tháng</Text>
                            <Divider />
                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.5, textAlign: 'left' }}>
                                <li>✅ <b>5 Tài khoản</b> kết nối</li>
                                <li>✅ <b>Không giới hạn</b> bài đăng</li>
                                <li>✅ <b>AI Writer</b> (GPT-4)</li>
                                <li>✅ Báo cáo chuyên sâu</li>
                            </ul>
                            <Button type="primary" block size="large" style={{ marginTop: 20 }} onClick={() => navigate('/register')}>Dùng thử 14 ngày</Button>
                        </Card>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ height: '100%', borderRadius: 16, textAlign: 'center' }}>
                        <Title level={3}>Agency</Title>
                        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#333' }}>999k</div>
                        <Text type="secondary">/ tháng</Text>
                        <Divider />
                        <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.5, textAlign: 'left' }}>
                            <li>✅ <b>50 Tài khoản</b> kết nối</li>
                            <li>✅ Quản lý Team/Nhân viên</li>
                            <li>✅ API Access</li>
                            <li>✅ Support 24/7</li>
                        </ul>
                        <Button block size="large" style={{ marginTop: 20 }}>Liên hệ Sale</Button>
                    </Card>
                </Col>
            </Row>
        </div>

        {/* 6. FAQ (Câu hỏi thường gặp) */}
        <div style={{ padding: '80px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Câu hỏi thường gặp</Title>
            <Collapse ghost accordion expandIconPosition="end">
                <Panel header="Tôi có thể hủy gói Pro bất cứ lúc nào không?" key="1">
                    <p>Hoàn toàn được. Bạn có thể hủy gia hạn bất kỳ lúc nào trong phần Cài đặt mà không mất phí phạt.</p>
                </Panel>
                <Panel header="Social Pro có an toàn cho tài khoản của tôi không?" key="2">
                    <p>Chúng tôi sử dụng API chính thức của Facebook và YouTube. Mật khẩu của bạn không bao giờ được lưu trữ trên hệ thống của chúng tôi.</p>
                </Panel>
                <Panel header="AI Writer có hỗ trợ tiếng Việt tốt không?" key="3">
                    <p>Rất tốt! AI của chúng tôi được tối ưu hóa đặc biệt cho ngôn ngữ Tiếng Việt, hiểu được tiếng lóng và các trend mới nhất.</p>
                </Panel>
            </Collapse>
        </div>

        {/* 7. FOOTER */}
        <Footer style={{ background: '#001529', color: '#fff', padding: '60px 20px' }}>
             <Row gutter={[32, 32]} style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Col xs={24} md={8}>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>SOCIAL PRO</div>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Giải pháp quản lý mạng xã hội toàn diện dành cho doanh nghiệp và người sáng tạo nội dung.
                    </Text>
                </Col>
                <Col xs={12} md={5}>
                    <div style={{ fontWeight: 'bold', marginBottom: 15 }}>Sản phẩm</div>
                    <Space direction="vertical" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Tính năng</span>
                        <span>Bảng giá</span>
                        <span>API</span>
                    </Space>
                </Col>
                <Col xs={12} md={5}>
                    <div style={{ fontWeight: 'bold', marginBottom: 15 }}>Công ty</div>
                    <Space direction="vertical" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Về chúng tôi</span>
                        <span>Blog</span>
                        <span>Tuyển dụng</span>
                    </Space>
                </Col>
                <Col xs={24} md={6}>
                    <div style={{ fontWeight: 'bold', marginBottom: 15 }}>Liên hệ</div>
                    <Space direction="vertical" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>contact@socialpro.vn</span>
                        <span>Hotline: 1900 1234</span>
                        <span>Hồ Chí Minh, Việt Nam</span>
                    </Space>
                </Col>
             </Row>
             <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
             <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                 © 2025 Social Pro. All rights reserved.
             </div>
        </Footer>
      </Content>
    </Layout>
  );
};

export default LandingPage;