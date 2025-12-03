import React from 'react';
import { Table, Tag, Space, Button, Input, Card } from 'antd';
import { SearchOutlined, YoutubeFilled, FacebookFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const PostHistory = () => {
  // DỮ LIỆU GIẢ
  const data = [
    { key: 1, title: 'Review Xe Mới 2025', platform: 'youtube', date: '2025-11-20 08:00', status: 'success', views: 1500 },
    { key: 2, title: 'Khuyến mãi tháng 11', platform: 'facebook', date: '2025-11-19 10:30', status: 'success', views: 300 },
    { key: 3, title: 'Vlog Thử Thách 24h', platform: 'youtube', date: '2025-11-18 20:00', status: 'failed', views: 0 },
  ];

  const columns = [
    {
        title: 'Nền tảng',
        dataIndex: 'platform',
        render: (p) => p === 'youtube' ? <YoutubeFilled style={{color:'red', fontSize: 20}}/> : <FacebookFilled style={{color:'blue', fontSize: 20}}/>
    },
    { title: 'Tiêu đề bài viết', dataIndex: 'title', render: t => <b>{t}</b> },
    { title: 'Ngày đăng', dataIndex: 'date' },
    { 
        title: 'Trạng thái', 
        dataIndex: 'status',
        render: s => s === 'success' ? <Tag color="green">Thành công</Tag> : <Tag color="red">Thất bại</Tag>
    },
    { title: 'Lượt xem', dataIndex: 'views' },
    {
        title: 'Hành động',
        render: () => (
            <Space>
                <Button icon={<EditOutlined />} size="small" />
                <Button icon={<DeleteOutlined />} size="small" danger />
            </Space>
        )
    }
  ];

  return (
    <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
            <h2>Quản lý nội dung / Lịch sử</h2>
            <Input prefix={<SearchOutlined/>} placeholder="Tìm kiếm bài viết..." style={{width: 300}} />
        </div>
        
        <Card>
            <Table dataSource={data} columns={columns} />
        </Card>
    </div>
  );
};

export default PostHistory;