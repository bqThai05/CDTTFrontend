// src/pages/Dashboard.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dữ liệu giả lập (Sau này thay bằng data gọi từ API)
const dataChart = [
  { name: 'T2', views: 4000 },
  { name: 'T3', views: 3000 },
  { name: 'T4', views: 2000 },
  { name: 'T5', views: 2780 },
  { name: 'T6', views: 1890 },
  { name: 'T7', views: 2390 },
  { name: 'CN', views: 3490 },
];

const columns = [
  { title: 'Chiến dịch', dataIndex: 'name', key: 'name' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: text => <Tag color="green">{text}</Tag> },
  { title: 'Tương tác', dataIndex: 'engagement', key: 'engagement' },
];

const dataTable = [
  { key: '1', name: 'Post Khuyến mãi Tết', status: 'Đã đăng', engagement: '1.2k' },
  { key: '2', name: 'Video giới thiệu SP', status: 'Đã đăng', engagement: '850' },
  { key: '3', name: 'Giveaway Fanpage', status: 'Đang chạy', engagement: '3.4k' },
];

const Dashboard = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 24 }}>Tổng quan kênh</h2>
      
      {/* 1. Phần Thống kê nhanh (Stats) */}
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Tổng lượt xem (Views)" 
              value={112893} 
              precision={0} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<EyeOutlined />}
              suffix="+"
            />
             <div style={{ color: 'green', marginTop: 10 }}><ArrowUpOutlined /> 12% so với tuần trước</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Tổng tương tác" 
              value={9300} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<LikeOutlined />}
            />
            <div style={{ color: 'red', marginTop: 10 }}><ArrowDownOutlined /> 5% so với tuần trước</div>
          </Card>
        </Col>
        <Col span={12}>
           {/* Biểu đồ nằm ngay cạnh */}
           <Card title="Hiệu suất 7 ngày qua" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '100%', height: 150 }}>
                <ResponsiveContainer>
                  <AreaChart data={dataChart}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1677ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="#1677ff" fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </Col>
      </Row>

      {/* 2. Phần Danh sách bài đăng gần đây */}
      <h3 style={{ marginTop: 30 }}>Bài đăng gần đây</h3>
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
         <Table columns={columns} dataSource={dataTable} pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;