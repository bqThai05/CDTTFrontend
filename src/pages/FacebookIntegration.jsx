// src/pages/FacebookIntegration.jsx
import React, {  useState } from 'react';
import { Button, Card, Col, Row, Spin, Typography, message, Select, DatePicker } from 'antd';
import { 
  FacebookFilled, 
  LikeOutlined, 
  GlobalOutlined, 
  UsergroupAddOutlined 
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FacebookIntegration = () => {
  const [loading, setLoading] = useState(false);
  
  // State quản lý dữ liệu (Cấu trúc y hệt YouTube)
  const [accounts, setAccounts] = useState([]); // Tài khoản Facebook cá nhân
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [pages, setPages] = useState([]); // Fanpages (Tương ứng Channels)
  const [selectedPage, setSelectedPage] = useState(null);
  
  const [posts, setPosts] = useState([]); // Bài đăng (Tương ứng Videos)
  const [analytics, setAnalytics] = useState(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState([moment().subtract(7, 'days'), moment()]);

  // --- GIẢ LẬP LOGIC API (Để anh thấy nó chạy giống YouTube) ---
  const handleAuthorize = () => {
    setLoading(true);
    // Giả lập kết nối thành công sau 1.5s
    setTimeout(() => {
        setLoading(false);
        message.success('Kết nối tài khoản Facebook thành công!');
        // Giả lập dữ liệu trả về
        setAccounts([
            { id: 'acc_1', name: 'Admin User (Facebook Cá Nhân)' }
        ]);
    }, 1500);
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
    setSelectedPage(null);
    setPages([]);
    setPosts([]);
    setAnalytics(null);
    
    if (value) {
      setLoading(true);
      // Giả lập lấy danh sách Fanpage
      setTimeout(() => {
          setPages([
              { id: 'page_1', name: 'Shop Thời Trang Nam' },
              { id: 'page_2', name: 'Góc Ẩm Thực Sài Gòn' },
              { id: 'page_3', name: 'Hội Yêu Mèo' }
          ]);
          setLoading(false);
      }, 500);
    }
  };

  const handlePageChange = (value) => {
    setSelectedPage(value);
    setPosts([]);
    setAnalytics(null);
    
    if (value) {
      setLoading(true);
      // Giả lập lấy bài đăng và thống kê
      setTimeout(() => {
          setPosts([
              { id: 1, title: 'Khuyến mãi Tết 2025', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Post1', likes: 120, comments: 45 },
              { id: 2, title: 'Review sản phẩm mới', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Post2', likes: 85, comments: 12 },
              { id: 3, title: 'Thông báo nghỉ lễ', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Post3', likes: 340, comments: 80 },
              { id: 4, title: 'Minigame tặng quà', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Post4', likes: 560, comments: 230 },
          ]);
          
          setAnalytics({
              likes: 12500,
              followers: 15600,
              reach: 45000,
              engagement: 8900
          });
          setLoading(false);
      }, 800);
    }
  };

  const handleDateRangeChange = (dates) => {
    setAnalyticsDateRange(dates);
    if (selectedPage && dates && dates.length === 2) {
        message.info("Đang lọc dữ liệu theo ngày (Giả lập)...");
    }
  };

  // --- GIAO DIỆN (COPY Y CHANG CẤU TRÚC YOUTUBE CỦA ANH) ---
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tích hợp Facebook Pages</Title>
      
      {/* 1. Nút Kết nối */}
      <Card style={{ marginBottom: '24px' }}>
        <Button 
            type="primary" 
            onClick={handleAuthorize} 
            loading={loading}
            icon={<FacebookFilled />}
            style={{ background: '#1877f2', borderColor: '#1877f2' }}
        >
          Kết nối tài khoản Facebook
        </Button>
      </Card>

      {/* 2. Chọn Tài khoản (User) */}
      <Title level={3}>Tài khoản Facebook đã kết nối</Title>
      {loading && accounts.length === 0 ? (
        <Spin tip="Đang tải..." />
      ) : accounts.length > 0 ? (
        <Select
          placeholder="Chọn tài khoản Facebook"
          style={{ width: '100%', marginBottom: '24px' }}
          onChange={handleAccountChange}
          value={selectedAccount}
        >
          {accounts.map(account => (
            <Option key={account.id} value={account.id}>
              {account.name}
            </Option>
          ))}
        </Select>
      ) : (
        <Text>Chưa có tài khoản Facebook nào được kết nối.</Text>
      )}

      {/* 3. Chọn Fanpage (Tương tự Chọn Channel) */}
      {selectedAccount && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>Fanpage Quản lý</Title>
          {loading && pages.length === 0 ? (
            <Spin tip="Đang tải..." />
          ) : pages.length > 0 ? (
            <Select
              placeholder="Chọn Fanpage"
              style={{ width: '100%', marginBottom: '24px' }}
              onChange={handlePageChange}
              value={selectedPage}
            >
              {pages.map(page => (
                <Option key={page.id} value={page.id}>
                  {page.name}
                </Option>
              ))}
            </Select>
          ) : (
            <Text>Không tìm thấy Fanpage nào cho tài khoản đã chọn.</Text>
          )}
        </Card>
      )}

      {/* 4. Hiển thị Bài đăng & Phân tích */}
      {selectedPage && (
        <Row gutter={[16, 16]}>
          
          {/* Cột Bài đăng */}
          <Col span={24}>
            <Card title="Bài đăng trên Trang">
              {loading ? (
                <Spin tip="Đang tải..." />
              ) : posts.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {posts.map(post => (
                    <Col key={post.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        cover={<img alt={post.title} src={post.image} style={{ height: 150, objectFit: 'cover' }} />}
                      >
                        <Card.Meta 
                            title={post.title} 
                            description={
                                <span style={{ display: 'flex', gap: 10 }}>
                                    <span><LikeOutlined /> {post.likes}</span>
                                    <span>💬 {post.comments}</span>
                                </span>
                            } 
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Text>Không tìm thấy bài đăng nào.</Text>
              )}
            </Card>
          </Col>

          {/* Cột Phân tích */}
          <Col span={24}>
            <Card title="Phân tích Fanpage">
              <div style={{ marginBottom: '16px' }}>
                <RangePicker
                  value={analyticsDateRange}
                  onChange={handleDateRangeChange}
                  ranges={{
                    'Hôm nay': [moment(), moment()],
                    '7 ngày qua': [moment().subtract(7, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                  }}
                />
              </div>
              {loading ? (
                <Spin tip="Đang tải..." />
              ) : analytics ? (
                <div>
                  <Text strong><LikeOutlined /> Tổng lượt thích trang: </Text><Text>{analytics.likes.toLocaleString()}</Text><br />
                  <Text strong><UsergroupAddOutlined /> Người theo dõi: </Text><Text>{analytics.followers.toLocaleString()}</Text><br />
                  <Text strong><GlobalOutlined /> Lượt tiếp cận (Reach): </Text><Text>{analytics.reach.toLocaleString()}</Text><br />
                  <Text strong>⚡ Tương tác bài viết: </Text><Text>{analytics.engagement.toLocaleString()}</Text><br />
                </div>
              ) : (
                <Text>Không có dữ liệu phân tích.</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FacebookIntegration;