import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spin, Typography, message, Select, DatePicker } from 'antd';
import { useLocation } from 'react-router-dom';
import { authorizeYouTube, getYouTubeAccounts, getYouTubeCallback, getYouTubeChannels, getYouTubeChannelVideos, getYouTubeChannelAnalytics } from '../services/youtubeApi';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const YoutubeIntegration = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState([moment().subtract(7, 'days'), moment()]);

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');

      if (code) {
        setLoading(true);
        try {
          await getYouTubeCallback(code);
          message.success('Kết nối tài khoản YouTube thành công!');
          fetchAccounts();
        } catch (error) {
          message.error('Lỗi khi kết nối tài khoản YouTube.');
          console.error('YouTube callback error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAccounts();
    handleCallback();
  }, [location]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getYouTubeAccounts();
      setAccounts(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách tài khoản YouTube.');
      console.error('Fetch YouTube accounts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async (socialAccountId) => {
    setLoading(true);
    try {
      const response = await getYouTubeChannels(socialAccountId);
      setChannels(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách kênh YouTube.');
      console.error('Fetch YouTube channels error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (channelId) => {
    setLoading(true);
    try {
      const response = await getYouTubeChannelVideos(channelId);
      setVideos(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách video YouTube.');
      console.error('Fetch YouTube videos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (channelId, startDate, endDate) => {
    setLoading(true);
    try {
      const response = await getYouTubeChannelAnalytics(channelId, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      });
      setAnalytics(response.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu phân tích YouTube.');
      console.error('Fetch YouTube analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      const response = await authorizeYouTube();
      window.location.href = response.data.authorization_url;
    } catch (error) {
      message.error('Lỗi khi bắt đầu ủy quyền YouTube.');
      console.error('YouTube authorization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
    setSelectedChannel(null);
    setChannels([]);
    setVideos([]);
    setAnalytics(null);
    if (value) {
      fetchChannels(value);
    }
  };

  const handleChannelChange = (value) => {
    setSelectedChannel(value);
    setVideos([]);
    setAnalytics(null);
    if (value) {
      fetchVideos(value);
      fetchAnalytics(value, analyticsDateRange[0], analyticsDateRange[1]);
    }
  };

  const handleDateRangeChange = (dates) => {
    setAnalyticsDateRange(dates);
    if (selectedChannel && dates && dates.length === 2) {
      fetchAnalytics(selectedChannel, dates[0], dates[1]);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tích hợp YouTube</Title>
      <Card style={{ marginBottom: '24px' }}>
        <Button type="primary" onClick={handleAuthorize} loading={loading}>
          Kết nối tài khoản YouTube
        </Button>
      </Card>

      <Title level={3}>Tài khoản YouTube đã kết nối</Title>
      {loading ? (
        <Spin tip="Đang tải..." />
      ) : accounts.length > 0 ? (
        <Select
          placeholder="Chọn tài khoản YouTube"
          style={{ width: '100%', marginBottom: '24px' }}
          onChange={handleAccountChange}
          value={selectedAccount}
        >
          {accounts.map(account => (
            <Option key={account.id} value={account.id}>
              {account.name || `Tài khoản ${account.id}`}
            </Option>
          ))}
        </Select>
      ) : (
        <Text>Chưa có tài khoản YouTube nào được kết nối.</Text>
      )}

      {selectedAccount && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>Kênh YouTube</Title>
          {loading ? (
            <Spin tip="Đang tải..." />
          ) : channels.length > 0 ? (
            <Select
              placeholder="Chọn kênh YouTube"
              style={{ width: '100%', marginBottom: '24px' }}
              onChange={handleChannelChange}
              value={selectedChannel}
            >
              {channels.map(channel => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name || `Kênh ${channel.id}`}
                </Option>
              ))}
            </Select>
          ) : (
            <Text>Không tìm thấy kênh nào cho tài khoản đã chọn.</Text>
          )}
        </Card>
      )}

      {selectedChannel && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Video của kênh">
              {loading ? (
                <Spin tip="Đang tải..." />
              ) : videos.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {videos.map(video => (
                    <Col key={video.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        cover={<img alt={video.title} src={video.thumbnail} />}
                      >
                        <Card.Meta title={video.title} description={`Lượt xem: ${video.views || 0}`} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Text>Không tìm thấy video nào cho kênh đã chọn.</Text>
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Phân tích kênh">
              <div style={{ marginBottom: '16px' }}>
                <RangePicker
                  value={analyticsDateRange}
                  onChange={handleDateRangeChange}
                  ranges={{
                    'Hôm nay': [moment(), moment()],
                    '7 ngày qua': [moment().subtract(7, 'days'), moment()],
                    '30 ngày qua': [moment().subtract(30, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                  }}
                />
              </div>
              {loading ? (
                <Spin tip="Đang tải..." />
              ) : analytics ? (
                <div>
                  <Text strong>Tổng lượt xem: </Text><Text>{analytics.views}</Text><br />
                  <Text strong>Tổng bình luận: </Text><Text>{analytics.comments}</Text><br />
                  <Text strong>Tổng lượt thích: </Text><Text>{analytics.likes}</Text><br />
                  {/* Thêm các chỉ số phân tích khác nếu có */}
                </div>
              ) : (
                <Text>Không có dữ liệu phân tích cho kênh đã chọn.</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default YoutubeIntegration;
