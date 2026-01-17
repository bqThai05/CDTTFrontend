import React from 'react';
import { Tabs, Typography } from 'antd';
import { YoutubeFilled, FacebookFilled, RocketFilled } from '@ant-design/icons';
import YoutubeTab from './YoutubeTab';
import FacebookTab from './FacebookTab';
import BulkTab from './BulkTab';

const { Title, Text } = Typography;

const CreatePost = () => {
    const items = [
        {
            key: 'youtube',
            label: <span style={{fontSize: 16}}><YoutubeFilled style={{color: 'red'}}/> YouTube Studio</span>,
            children: <YoutubeTab />
        },
        {
            key: 'facebook',
            label: <span style={{fontSize: 16}}><FacebookFilled style={{color: '#1877f2'}}/> Facebook Post</span>,
            children: <FacebookTab />
        },
        {
            key: 'bulk',
            label: <span style={{fontSize: 16}}><RocketFilled style={{color: 'orange'}}/> Đăng Hàng Loạt</span>,
            children: <BulkTab />
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Tạo Nội Dung Mới</Title>
                <Text type="secondary">Chọn nền tảng bạn muốn đăng tải</Text>
            </div>

            <Tabs 
                defaultActiveKey="youtube" 
                type="card" 
                size="large"
                items={items} 
                style={{ background: '#f5f7fa' }} // Nền nhẹ cho Tabs
            />
        </div>
    );
};

export default CreatePost;