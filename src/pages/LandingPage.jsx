// src/pages/LandingPage.jsx
import React from 'react';
import { Button, Typography, Row, Col, Card, Space, Layout, Tag, Divider, Collapse } from 'antd';
import { 
  RocketFilled,           
  CheckCircleFilled,      
  CloseCircleOutlined,    
  ArrowRightOutlined,
  PlayCircleFilled,
  GlobalOutlined,
  SafetyCertificateFilled,
  ThunderboltFilled,
  SmileOutlined,
  RobotFilled,            
  PieChartFilled,         
  CrownFilled,            
  TeamOutlined,
  MailOutlined,           
  PhoneOutlined,          
  EnvironmentOutlined     
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- BỘ MÀU TẾT ---
  const colors = {
    primary: '#d4145a',     
    secondary: '#fbb03b',   
    bg: '#fffcf5',          
    textGradient: 'linear-gradient(90deg, #d4145a 0%, #fbb03b 100%)',
    buttonGradient: 'linear-gradient(90deg, #d4145a 0%, #fbb03b 100%)',
  };

  const styles = {
    gradientText: {
        background: colors.textGradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        fontWeight: 900
    },
    heroSection: {
        background: `linear-gradient(180deg, ${colors.bg} 0%, #ffffff 100%)`,
        padding: '120px 20px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 20, 90, 0.1)',
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(212, 20, 90, 0.05)'
    },
    section: {
        padding: '80px 20px',
        maxWidth: 1200,
        margin: '0 auto'
    },
    iconBox: {
        width: 50, height: 50, 
        borderRadius: 16, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(212, 20, 90, 0.08)',
        color: colors.primary,
        fontSize: 24,
        marginBottom: 15
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      
      {/* 1. HEADER */}
      <Header style={{ 
          position: 'sticky', top: 0, zIndex: 1000, width: '100%', 
          background: 'rgba(255, 252, 245, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)', padding: '0 40px', height: 70
      }}>
        {/* LOGO */}
        <div style={{ fontSize: 24, color: colors.primary, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <RocketFilled style={{ fontSize: 28 }} /> 
            <span style={styles.gradientText}>SOCIAL PRO</span>
        </div>

        {/* MENU (ĐÃ GẮN SỰ KIỆN SCROLL) */}
        <div className="desktop-menu hidden-mobile">
            <Space size={40}>
                <Button type="link" onClick={() => scrollToSection('features')} style={{color: '#333', fontSize: 16, fontWeight: 500}}>Tính năng</Button>
                <Button type="link" onClick={() => scrollToSection('pricing')} style={{color: '#333', fontSize: 16, fontWeight: 500}}>Bảng giá</Button>
                <Button type="link" onClick={() => scrollToSection('partners')} style={{color: '#333', fontSize: 16, fontWeight: 500}}>Khách hàng</Button>
            </Space>
        </div>

        {/* BUTTONS */}
        <Space>
            <Button type="text" onClick={() => navigate('/login')} style={{ fontSize: 16 }}>Đăng nhập</Button>
            <Button type="primary" shape="round" size="large" onClick={() => navigate('/register')} 
                style={{ background: colors.buttonGradient, border: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(212, 20, 90, 0.3)' }}>
                Đăng ký ngay
            </Button>
        </Space>
      </Header>

      <Content>
        {/* 2. HERO SECTION */}
        <div style={styles.heroSection}>
            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <Tag color="#fff0f6" style={{ marginBottom: 20, padding: '6px 20px', borderRadius: 20, color: colors.primary, border: `1px solid ${colors.primary}`, fontSize: 14 }}>
                    🚀 Phiên bản Khai Xuân 2.0
                </Tag>
                <Title level={1} style={{ fontSize: 64, marginBottom: 24, lineHeight: 1.1, fontWeight: 800, color: '#2c3e50' }}>
                    Quản lý đa kênh <br/> 
                    <span style={styles.gradientText}>Bứt phá doanh thu.</span>
                </Title>
                <Paragraph style={{ fontSize: 20, color: '#666', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.6 }}>
                    Tích hợp AI viết content, lên lịch tự động cho Facebook & YouTube. 
                    Giải pháp toàn diện cho Creator mùa Tết này.
                </Paragraph>
                <Space size="middle">
                    <Button 
                        type="primary" size="large" icon={<ArrowRightOutlined />} 
                        style={{ height: 56, fontSize: 18, padding: '0 40px', borderRadius: 28, background: colors.buttonGradient, border: 'none', boxShadow: '0 10px 30px rgba(212, 20, 90, 0.3)' }}
                        onClick={() => navigate('/register')}
                    >
                        Dùng thử miễn phí
                    </Button>
                    <Button 
                        size="large" icon={<PlayCircleFilled style={{color: colors.primary}}/>} 
                        style={{ height: 56, fontSize: 18, padding: '0 30px', borderRadius: 28, borderColor: colors.primary, color: colors.primary }}
                    >
                        Xem Demo
                    </Button>
                </Space>
                
                <div style={{ marginTop: 40, fontSize: 14, color: '#888' }}>
                    <Space size="large">
                        <span><CheckCircleFilled style={{ color: colors.secondary }} /> Free 14 ngày</span>
                        <span><CheckCircleFilled style={{ color: colors.secondary }} /> Không cần thẻ tín dụng</span>
                    </Space>
                </div>
            </div>

            {/* MOCKUP DASHBOARD */}
            <div style={{ marginTop: 80, perspective: '1000px' }}>
                <div style={{ 
                    maxWidth: 1000, margin: '0 auto', borderRadius: 24, 
                    boxShadow: '0 40px 80px rgba(212, 20, 90, 0.15)', 
                    border: '8px solid #222', overflow: 'hidden', background: '#fff', transform: 'rotateX(5deg)'
                }}>
                    <div style={{ height: 550, background: '#f5f7fa', position: 'relative', display: 'flex' }}>
                        <div style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', padding: 20 }}>
                            <div style={{height: 30, width: '60%', background: '#eee', borderRadius: 6, marginBottom: 30}}></div>
                            <Space orientation="vertical" style={{width: '100%'}} size={15}>
                                <div style={{height: 15, width: '80%', background: '#f0f0f0', borderRadius: 4}}></div>
                                <div style={{height: 15, width: '90%', background: '#f0f0f0', borderRadius: 4}}></div>
                                <div style={{height: 15, width: '70%', background: '#ffeef1', borderRadius: 4}}></div>
                                <div style={{height: 15, width: '85%', background: '#f0f0f0', borderRadius: 4}}></div>
                            </Space>
                        </div>
                        <div style={{ flex: 1, padding: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                                <div style={{ height: 40, width: '30%', background: '#fff', borderRadius: 8 }}></div>
                                <div style={{ height: 40, width: '15%', background: colors.primary, borderRadius: 20, opacity: 0.8 }}></div>
                            </div>
                            <Row gutter={20}>
                                {[1, 2, 3].map(i => (
                                    <Col span={8} key={i}><div style={{ height: 140, background: '#fff', borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}></div></Col>
                                ))}
                            </Row>
                            <div style={{ height: 280, background: '#fff', borderRadius: 16, marginTop: 25, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text type="secondary" style={{fontSize: 20, opacity: 0.5}}>DASHBOARD PREVIEW</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. PARTNERS (ĐÃ GẮN ID="partners") */}
        <div id="partners" style={{ padding: '60px 0', borderBottom: '1px solid #f0f0f0', textAlign: 'center', background: '#fff' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 30, letterSpacing: 2, fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>Được tin dùng bởi hơn 10.000 Creator</Text>
            <Space size={80} style={{ opacity: 0.4, filter: 'grayscale(100%)' }}>
                 <GlobalOutlined style={{ fontSize: 36 }} />
                 <SafetyCertificateFilled style={{ fontSize: 36 }} />
                 <ThunderboltFilled style={{ fontSize: 36 }} />
                 <SmileOutlined style={{ fontSize: 36 }} />
            </Space>
        </div>

        {/* 4. FEATURES (ĐÃ GẮN ID="features") */}
        <div id="features" style={styles.section}>
            <Row gutter={[80, 48]} align="middle">
                <Col xs={24} md={12}>
                    <div style={styles.iconBox}><RobotFilled /></div>
                    <Title level={2} style={{fontSize: 40}}>Trợ lý AI Thông minh</Title>
                    <Paragraph style={{ fontSize: 18, color: '#666', lineHeight: 1.7 }}>
                        Bí ý tưởng? Chỉ cần nhập từ khóa, AI sẽ tự động viết caption, kịch bản video chuẩn SEO, bắt trend cực nhanh.
                    </Paragraph>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#666', lineHeight: 2.5, fontSize: 16 }}>
                        <li><CheckCircleFilled style={{ color: colors.primary, marginRight: 10 }} /> Viết đa dạng chủ đề: Sale, Review, Vlog...</li>
                        <li><CheckCircleFilled style={{ color: colors.primary, marginRight: 10 }} /> Tự động thêm icon sinh động.</li>
                        <li><CheckCircleFilled style={{ color: colors.primary, marginRight: 10 }} /> Tiết kiệm 90% thời gian viết lách.</li>
                    </ul>
                </Col>
                <Col xs={24} md={12}>
                    <Card style={styles.glassCard} variant="borderless">
                        <div style={{ padding: 25 }}>
                            <div style={{ background: '#fff0f6', padding: '10px 20px', borderRadius: 20, marginBottom: 20, width: 'fit-content', border: `1px solid ${colors.primary}20` }}>
                                <Text strong style={{color: colors.primary}}>User:</Text> "Viết caption bán giày Tết"
                            </div>
                            <div style={{ background: '#fff', padding: 25, borderRadius: 16, border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: 13, color: colors.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <RobotFilled /> AI đang viết...
                                </div>
                                <Text style={{fontSize: 16, lineHeight: 1.6}}>
                                    "🧧 <b>TẾT ĐẾN CHÂN RỒI - SẮM GIÀY MỚI THÔI!</b> 👟<br/><br/>
                                    Sale sập sàn 50% toàn bộ mẫu Sneaker đón Xuân Bính Ngọ. <br/>
                                    👉 Êm ái du xuân - Nhận lì xì khủng!"
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '100px 0', borderColor: '#f0f0f0' }} />

            <Row gutter={[80, 48]} align="middle">
                <Col xs={24} md={12} order={2}>
                     <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(251,176,59,0.15) 0%, rgba(255,255,255,0) 70%)' }}></div>
                        <Card style={{...styles.glassCard, borderColor: '#ffccc7'}} variant="borderless">
                             <div style={{ textAlign: 'center', padding: 40 }}>
                                 <div style={{...styles.iconBox, margin: '0 auto 20px', background: '#fff1f0', color: '#cf1322', width: 60, height: 60, fontSize: 30}}><PieChartFilled /></div>
                                 <Title level={4} style={{marginBottom: 5}}>Tăng trưởng Kênh</Title>
                                 <div style={{ fontSize: 60, fontWeight: '800', color: colors.primary, lineHeight: 1, marginBottom: 5 }}>+125%</div>
                                 <Text type="secondary" style={{fontSize: 16}}>Lượt xem tháng này</Text>
                             </div>
                        </Card>
                     </div>
                </Col>
                <Col xs={24} md={12} order={1}>
                    <div style={styles.iconBox}><PieChartFilled /></div>
                    <Title level={2} style={{fontSize: 40}}>Báo cáo trực quan</Title>
                    <Paragraph style={{ fontSize: 18, color: '#666', lineHeight: 1.7 }}>
                        Không còn phải đoán mò. Hệ thống phân tích dữ liệu từ tất cả các kênh và hiển thị trên một Dashboard duy nhất.
                    </Paragraph>
                    <Button type="primary" size="large" ghost style={{ borderColor: colors.primary, color: colors.primary, height: 50, padding: '0 30px', borderRadius: 25, fontWeight: 600 }}>
                        Xem ví dụ báo cáo
                    </Button>
                </Col>
            </Row>
        </div>

        {/* 5. PRICING (ĐÃ GẮN ID="pricing") */}
        <div id="pricing" style={{ background: '#fffcf5', padding: '100px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 70 }}>
                <Title level={2}>Bảng giá linh hoạt</Title>
                <Text type="secondary" style={{fontSize: 16}}>Chọn gói phù hợp với quy mô của bạn</Text>
            </div>
            
            <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Gói Free */}
                <Col xs={24} md={8}>
                    <Card hoverable style={{ height: '100%', borderRadius: 20, textAlign: 'center', borderTop: '6px solid #d9d9d9', padding: 20 }}>
                        <Title level={3}>Starter</Title>
                        <div style={{ fontSize: 40, fontWeight: '800', color: '#333', marginBottom: 5 }}>0đ</div>
                        <Text type="secondary">Trọn đời</Text>
                        <Divider />
                        <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.8, textAlign: 'left', fontSize: 15 }}>
                            <li><CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} /> 1 Tài khoản kết nối</li>
                            <li><CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} /> Lên lịch 10 bài/tháng</li>
                            <li style={{ color: '#ccc' }}><CloseCircleOutlined style={{marginRight: 8}} /> Không có AI Writer</li>
                            <li style={{ color: '#ccc' }}><CloseCircleOutlined style={{marginRight: 8}} /> Báo cáo cơ bản</li>
                        </ul>
                        <Button block size="large" style={{ marginTop: 30, height: 45, borderRadius: 22 }}>Đăng ký Free</Button>
                    </Card>
                </Col>

                {/* Gói PRO */}
                <Col xs={24} md={8}>
                    <div style={{ position: 'relative', transform: 'scale(1.08)', zIndex: 10 }}>
                        <div style={{ position: 'absolute', top: -16, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
                             <Tag color="#d4145a" style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontWeight: 'bold', fontSize: 13, boxShadow: '0 5px 15px rgba(212, 20, 90, 0.3)' }}>PHỔ BIẾN NHẤT</Tag>
                        </div>
                        <Card hoverable style={{ height: '100%', borderRadius: 20, textAlign: 'center', border: `2px solid ${colors.primary}`, boxShadow: '0 20px 60px rgba(212, 20, 90, 0.15)', padding: 20 }}>
                            <CrownFilled style={{ fontSize: 32, color: colors.secondary, marginBottom: 15 }} />
                            <Title level={3} style={{ color: colors.primary, marginTop: 0 }}>Pro</Title>
                            <div style={{ fontSize: 48, fontWeight: '800', color: colors.primary, marginBottom: 5 }}>199k</div>
                            <Text type="secondary">/ tháng</Text>
                            <Divider />
                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.8, textAlign: 'left', fontSize: 15 }}>
                                <li><CheckCircleFilled style={{ color: colors.secondary, marginRight: 8 }} /> <b>5 Tài khoản</b> kết nối</li>
                                <li><CheckCircleFilled style={{ color: colors.secondary, marginRight: 8 }} /> <b>Không giới hạn</b> bài đăng</li>
                                <li><CheckCircleFilled style={{ color: colors.secondary, marginRight: 8 }} /> <b>AI Writer</b> (GPT-4)</li>
                                <li><CheckCircleFilled style={{ color: colors.secondary, marginRight: 8 }} /> Báo cáo chuyên sâu</li>
                            </ul>
                            <Button type="primary" block size="large" style={{ marginTop: 30, height: 45, borderRadius: 22, background: colors.buttonGradient, border: 'none', fontWeight: 700 }} onClick={() => navigate('/register')}>Dùng thử 14 ngày</Button>
                        </Card>
                    </div>
                </Col>

                {/* Gói Agency */}
                <Col xs={24} md={8}>
                    <Card hoverable style={{ height: '100%', borderRadius: 20, textAlign: 'center', borderTop: '6px solid #333', padding: 20 }}>
                        <TeamOutlined style={{ fontSize: 32, color: '#333', marginBottom: 15 }} />
                        <Title level={3}>Agency</Title>
                        <div style={{ fontSize: 40, fontWeight: '800', color: '#333', marginBottom: 5 }}>999k</div>
                        <Text type="secondary">/ tháng</Text>
                        <Divider />
                        <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.8, textAlign: 'left', fontSize: 15 }}>
                            <li><CheckCircleFilled style={{ color: '#333', marginRight: 8 }} /> <b>50 Tài khoản</b> kết nối</li>
                            <li><CheckCircleFilled style={{ color: '#333', marginRight: 8 }} /> Quản lý Team/Nhân viên</li>
                            <li><CheckCircleFilled style={{ color: '#333', marginRight: 8 }} /> API Access</li>
                            <li><CheckCircleFilled style={{ color: '#333', marginRight: 8 }} /> Support 24/7</li>
                        </ul>
                        <Button block size="large" style={{ marginTop: 30, height: 45, borderRadius: 22 }}>Liên hệ Sale</Button>
                    </Card>
                </Col>
            </Row>
        </div>

        {/* 6. FAQ */}
        <div style={{ padding: '100px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 50 }}>Câu hỏi thường gặp</Title>
            <Collapse 
                ghost 
                accordion 
                expandIconPlacement="end" 
                size="large"
                items={[
                    {
                        key: '1',
                        label: <span style={{fontWeight: 600, fontSize: 16}}>Tôi có thể hủy gói Pro bất cứ lúc nào không?</span>,
                        children: <p style={{color: '#666'}}>Hoàn toàn được. Bạn có thể hủy gia hạn bất kỳ lúc nào trong phần Cài đặt mà không mất phí phạt.</p>,
                    },
                    {
                        key: '2',
                        label: <span style={{fontWeight: 600, fontSize: 16}}>Social Pro có an toàn cho tài khoản của tôi không?</span>,
                        children: <p style={{color: '#666'}}>Chúng tôi sử dụng API chính thức của Facebook và YouTube. Mật khẩu của bạn không bao giờ được lưu trữ trên hệ thống của chúng tôi.</p>,
                    },
                    {
                        key: '3',
                        label: <span style={{fontWeight: 600, fontSize: 16}}>AI có hỗ trợ tiếng Việt tốt không?</span>,
                        children: <p style={{color: '#666'}}>Rất tốt! AI được tối ưu hóa cho ngôn ngữ Tiếng Việt, hiểu được tiếng lóng và các trend mới nhất hiện nay.</p>,
                    },
                ]}
            />
        </div>

        {/* 7. FOOTER */}
        <Footer style={{ background: '#111', color: '#fff', padding: '80px 20px 40px' }}>
             <Row gutter={[48, 48]} style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Col xs={24} md={8}>
                    <div style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 20, display:'flex', alignItems:'center', gap: 10 }}>
                        <RocketFilled style={{color: colors.primary}} /> SOCIAL PRO
                    </div>
                    <Text style={{ color: '#888', lineHeight: 1.8, fontSize: 15 }}>
                        Giải pháp quản lý mạng xã hội toàn diện dành cho doanh nghiệp và người sáng tạo nội dung. Bứt phá doanh thu ngay hôm nay.
                    </Text>
                </Col>
                
                <Col xs={12} md={5}>
                    <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 25, color: '#fff' }}>Sản phẩm</div>
                    <Space orientation="vertical" style={{ color: '#888' }} size={15}>
                        <a href="#" style={{color: '#888'}}>Tính năng</a>
                        <a href="#" style={{color: '#888'}}>Bảng giá</a>
                        <a href="#" style={{color: '#888'}}>API</a>
                        <a href="#" style={{color: '#888'}}>Download</a>
                    </Space>
                </Col>
                
                <Col xs={12} md={5}>
                    <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 25, color: '#fff' }}>Công ty</div>
                    <Space orientation="vertical" style={{ color: '#888' }} size={15}>
                        <a href="#" style={{color: '#888'}}>Về chúng tôi</a>
                        <a href="#" style={{color: '#888'}}>Blog</a>
                        <a href="#" style={{color: '#888'}}>Tuyển dụng</a>
                        <a href="#" style={{color: '#888'}}>Đối tác</a>
                    </Space>
                </Col>
                
                <Col xs={24} md={6}>
                    <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 25, color: '#fff' }}>Liên hệ</div>
                    <Space orientation="vertical" style={{ color: '#888' }} size={15}>
                        <span style={{display: 'flex', gap: 10}}><MailOutlined /> contact@socialpro.vn</span>
                        <span style={{display: 'flex', gap: 10}}><PhoneOutlined /> 1900 1234</span>
                        <span style={{display: 'flex', gap: 10}}><EnvironmentOutlined /> Hồ Chí Minh, Việt Nam</span>
                    </Space>
                </Col>
             </Row>

             <Divider style={{ borderColor: '#333', margin: '60px 0 30px' }} />
             
             <div style={{ textAlign: 'center', color: '#555', fontSize: 14 }}>
                 © 2025 Social Pro. All rights reserved.
             </div>
        </Footer>
      </Content>
      <style>{`
        @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
};

export default LandingPage;