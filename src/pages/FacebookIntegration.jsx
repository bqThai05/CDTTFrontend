// src/pages/FacebookIntegration.jsx
import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Spin, Typography, message, Select, DatePicker, Empty, Avatar, Statistic, Tabs, Table, Tag } from 'antd';
import { 
  FacebookFilled, LikeOutlined, CommentOutlined, ShareAltOutlined, 
  GlobalOutlined, CheckCircleOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

// Import API
import { 
  getAllSocialAccounts, 
  getFacebookPages, 
  getFacebookPagePosts, 
  getFacebookPageAnalytics,
  BASE_URL
} from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FacebookIntegration = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Data State
  const [accounts, setAccounts] = useState([]); // Tài khoản FB cá nhân
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  
  const [pages, setPages] = useState([]); // Danh sách Fanpage
  const [selectedPageId, setSelectedPageId] = useState(null);
  
  const [posts, setPosts] = useState([]); // Bài đăng trên Page
  const [analytics, setAnalytics] = useState([]); // Dữ liệu phân tích

  useEffect(() => {
    // Check callback nếu vừa redirect về từ Facebook
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success') === 'facebook_connected') {
        message.success("Kết nối Facebook thành công!");
    }
    
    fetchFacebookAccounts();
  }, [location]);

  // 1. Lấy danh sách tài khoản FB đã kết nối
  const fetchFacebookAccounts = async () => {
    setLoading(true);
    try {
        const res = await getAllSocialAccounts();
        const fbAccounts = res.data.filter(acc => acc.platform === 'facebook');
        setAccounts(fbAccounts);
        
        // Nếu có tài khoản, tự động chọn cái đầu tiên và tải Pages
        if (fbAccounts.length > 0) {
            setSelectedAccountId(fbAccounts[0].id);
            fetchPages(fbAccounts[0].id);
        }
    } catch (error) {
        console.error("Lỗi tải account:", error);
    } finally {
        setLoading(false);
    }
  };

  // 2. Lấy danh sách Fanpage của Account đó
  const fetchPages = async (accountId) => {
    setLoadingData(true);
    try {
        const res = await getFacebookPages(accountId);
        setPages(res.data);
        // Reset lựa chọn page cũ
        setSelectedPageId(null);
        setPosts([]);
        setAnalytics([]);
    } catch (error) {
        console.error("Lỗi tải Pages:", error);
        message.error("Không thể tải danh sách Fanpage");
    } finally {
        setLoadingData(false);
    }
  };

  // 3. Lấy dữ liệu chi tiết của Page (Bài đăng + Analytics)
  const fetchPageDetails = async (pageId) => {
      setSelectedPageId(pageId);
      setLoadingData(true);
      try {
          // Gọi song song 2 API lấy bài đăng và thống kê
          const [postsRes, analyticsRes] = await Promise.allSettled([
              getFacebookPagePosts(pageId),
              getFacebookPageAnalytics(pageId, {
                  metric: 'page_impressions,page_post_engagements,page_fans', // Các chỉ số cần lấy
                  period: 'day',
                  since: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
                  until: dayjs().format('YYYY-MM-DD')
              })
          ]);

          if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data);
          if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data || []);

      } catch (error) {
          console.error("Lỗi tải chi tiết Page:", error);
      } finally {
          setLoadingData(false);
      }
  };

  // Xử lý nút Kết nối
  const handleAuthorize = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return message.error("Vui lòng đăng nhập");
    window.location.href = `${BASE_URL}/facebook/authorize?token=${token}`;
  };

  // Cột cho bảng bài viết
  const postColumns = [
      {
          title: 'Nội dung',
          dataIndex: 'message',
          key: 'message',
          render: (text, record) => (
              <div style={{ display: 'flex', gap: 10 }}>
                  {record.full_picture && <img src={record.full_picture} alt="img" style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 4}} />}
                  <div>
                      <div style={{fontWeight: 500, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {text || '(Không có nội dung text)'}
                      </div>
                      <div style={{fontSize: 11, color: '#888'}}>{dayjs(record.created_time).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
              </div>
          )
      },
      {
          title: 'Thống kê',
          key: 'stats',
          render: (_, record) => (
              <div style={{display: 'flex', gap: 15, color: '#666'}}>
                  <span title="Likes"><LikeOutlined /> {record.likes_count || 0}</span>
                  <span title="Comments"><CommentOutlined /> {record.comments_count || 0}</span>
                  <span title="Shares"><ShareAltOutlined /> {record.shares_count || 0}</span>
              </div>
          )
      },
      {
          title: 'Trạng thái',
          dataIndex: 'is_published',
          render: (val) => val ? <Tag color="success">Đã đăng</Tag> : <Tag>Nháp</Tag>
      },
      {
          title: 'Link',
          key: 'link',
          render: (_, record) => <a href={record.permalink_url} target="_blank" rel="noreferrer"><GlobalOutlined /> Xem</a>
      }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{margin: 0}}><FacebookFilled style={{color: '#1877f2'}}/> Quản lý Facebook Pages</Title>
          <Button type="primary" onClick={handleAuthorize} icon={<FacebookFilled />} style={{ background: '#1877f2' }}>
              Thêm tài khoản FB
          </Button>
      </div>

      {/* SELECT ACCOUNT */}
      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: '16px 24px' } }}>
          <Row gutter={16} align="middle">
              <Col>
                  <Text strong>Tài khoản quản lý:</Text>
              </Col>
              <Col flex="auto">
                  <Select 
                    style={{ width: 300 }} 
                    value={selectedAccountId}
                    placeholder="Chọn tài khoản Facebook..."
                    onChange={(val) => { setSelectedAccountId(val); fetchPages(val); }}
                    loading={loading}
                  >
                      {accounts.map(acc => (
                          <Option key={acc.id} value={acc.id}>{acc.name || acc.username} (ID: {acc.social_id})</Option>
                      ))}
                  </Select>
              </Col>
          </Row>
      </Card>

      <Row gutter={24}>
          {/* CỘT TRÁI: DANH SÁCH PAGES */}
          <Col xs={24} md={7}>
              <Card title="Danh sách Fanpage" styles={{ body: { padding: 0, maxHeight: 600, overflowY: 'auto' } }}>
                  <Spin spinning={loadingData}>
                      {pages.length === 0 ? <Empty description="Không tìm thấy Fanpage" style={{padding: 20}} /> : (
                          pages.map(page => (
                              <div 
                                  key={page.id}
                                  onClick={() => fetchPageDetails(page.id)}
                                  style={{
                                      padding: '12px 16px',
                                      borderBottom: '1px solid #f0f0f0',
                                      cursor: 'pointer',
                                      background: selectedPageId === page.id ? '#e6f7ff' : '#fff',
                                      display: 'flex', alignItems: 'center', gap: 12,
                                      transition: 'all 0.2s'
                                  }}
                              >
                                  <Avatar shape="square" size={40} style={{ backgroundColor: '#1877f2' }}>{page.name.charAt(0)}</Avatar>
                                  <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600 }}>{page.name}</div>
                                      <div style={{ fontSize: 11, color: '#888' }}>{page.category || 'Doanh nghiệp'}</div>
                                  </div>
                                  {selectedPageId === page.id && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
                              </div>
                          ))
                      )}
                  </Spin>
              </Card>
          </Col>

          {/* CỘT PHẢI: CHI TIẾT PAGE */}
          <Col xs={24} md={17}>
              {selectedPageId ? (
                  <Card 
                    title={
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                            <span>Chi tiết Fanpage</span>
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchPageDetails(selectedPageId)} />
                        </div>
                    }
                  >
                      <Tabs defaultActiveKey="1" items={[
                          {
                              key: '1',
                              label: 'Bài đăng (Posts)',
                              children: (
                                  <Table 
                                      dataSource={posts} 
                                      columns={postColumns} 
                                      rowKey="id" 
                                      loading={loadingData}
                                      pagination={{ pageSize: 5 }}
                                  />
                              )
                          },
                          {
                              key: '2',
                              label: 'Thông số (Insights)',
                              children: (
                                  <div style={{ textAlign: 'center', padding: 40 }}>
                                      {/* Phần này hiển thị data analytics nếu có */}
                                      {analytics.length > 0 ? (
                                          <Row gutter={16}>
                                              {analytics.map((metric, idx) => (
                                                  <Col span={8} key={idx}>
                                                      <Statistic title={metric.title} value={metric.values[0]?.value} />
                                                  </Col>
                                              ))}
                                          </Row>
                                      ) : (
                                          <Empty description="Chưa có dữ liệu phân tích hoặc Page chưa đủ điều kiện" />
                                      )}
                                  </div>
                              )
                          }
                      ]} />
                  </Card>
              ) : (
                  <Card style={{ textAlign: 'center', padding: 50, background: '#f5f5f5' }}>
                      <Empty description="Hãy chọn một Fanpage bên trái để xem chi tiết" />
                  </Card>
              )}
          </Col>
      </Row>
    </div>
  );
};

export default FacebookIntegration;