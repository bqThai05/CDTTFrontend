import React, { useState, useEffect } from 'react';
import { 
    Table, Tag, Button, Card, Typography, Space, 
    Select, Tooltip, Avatar, Image, Modal, message, 
    Badge, Row, Col, Statistic, Divider, Segmented, Calendar, Empty 
} from 'antd';
import { 
    SyncOutlined, EyeOutlined, LinkOutlined, 
    GlobalOutlined, LockOutlined, EyeInvisibleOutlined,
    YoutubeFilled, LikeOutlined, UserOutlined,
    VideoCameraOutlined, DownloadOutlined,
    UnorderedListOutlined, CalendarOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
// Import API
import { getAllSocialAccounts, getVideosByAccountId } from '../services/api'; 

const { Title, Text } = Typography;

const History = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);           // Dữ liệu đang hiển thị (đã lọc)
    const [originalData, setOriginalData] = useState([]); // Dữ liệu gốc
    const [accounts, setAccounts] = useState([]);   // Danh sách kênh (để lọc)

    // --- STATE GIAO DIỆN ---
    const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'calendar'
    const [filters, setFilters] = useState({ channelId: 'all', privacy: 'all' });
    
    // --- STATE MODAL ---
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // --- 1. HÀM TẢI DỮ LIỆU (LOGIC GOM DATA) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // B1: Lấy danh sách tài khoản
            const accountRes = await getAllSocialAccounts();
            const allAccounts = accountRes.data || [];
            
            // Lọc lấy các tài khoản YouTube & Lưu vào state để làm bộ lọc
            const youtubeAccounts = allAccounts.filter(acc => acc.platform === 'youtube');
            setAccounts(youtubeAccounts);

            if (youtubeAccounts.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            // B2: Gọi API lấy video cho từng tài khoản (Song song)
            const promises = youtubeAccounts.map(acc => getVideosByAccountId(acc.id));
            const results = await Promise.all(promises);

            // B3: Gộp kết quả
            let allVideos = [];
            results.forEach((res, index) => {
                const videos = res.data || [];
                const currentAcc = youtubeAccounts[index];
                
                const enrichedVideos = videos.map(v => ({
                    ...v,
                    // Chuẩn hóa dữ liệu để dùng chung
                    account_name: currentAcc.name,
                    account_id: currentAcc.id, // Dùng để lọc theo kênh
                    avatar: currentAcc.avatar || currentAcc.avatar_url,
                    platform: 'youtube',
                    publishedDate: dayjs(v.published_at).format('YYYY-MM-DD') // Dùng cho Calendar
                }));
                
                allVideos = [...allVideos, ...enrichedVideos];
            });

            // Sắp xếp mới nhất trước
            allVideos.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

            setOriginalData(allVideos);
            applyFilters(allVideos, filters); // Áp dụng lọc ngay

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            message.error("Có lỗi khi đồng bộ dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. HÀM LỌC (CLIENT SIDE) ---
    const applyFilters = (sourceData, currentFilters) => {
        let result = [...sourceData];

        // Lọc theo Kênh (Channel)
        if (currentFilters.channelId !== 'all') {
            result = result.filter(item => item.account_id === currentFilters.channelId);
        }

        // Lọc theo Trạng thái (Privacy)
        if (currentFilters.privacy !== 'all') {
            result = result.filter(item => item.privacy_status === currentFilters.privacy);
        }
        setData(result);
    };

    // Gọi lần đầu
    useEffect(() => {
        fetchData();
    }, []);

    // Gọi khi đổi bộ lọc
    useEffect(() => {
        applyFilters(originalData, filters);
    }, [filters, originalData]);

    // --- 3. XỬ LÝ LỊCH (CALENDAR RENDER) ---
    const dateCellRender = (value) => {
        const dateString = value.format('YYYY-MM-DD');
        // Lấy video của ngày đó từ danh sách ĐÃ LỌC (data)
        const listData = data.filter(ev => ev.publishedDate === dateString);

        return (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {listData.map((item) => (
                    <li key={item.video_id} style={{ marginBottom: 4 }}>
                        <div 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: '#fff1f0', border: '1px solid #ffa39e',
                                borderRadius: 4, padding: 2, cursor: 'pointer', overflow: 'hidden'
                            }}
                            onClick={(e) => {
                                e.stopPropagation(); // Chặn sự kiện click của ô ngày
                                openDetail(item);
                            }}
                        >
                            {/* Hiển thị Ảnh Thumbnail nhỏ */}
                            <img src={item.thumbnail_url} alt="" style={{width: 24, height: 24, objectFit: 'cover', borderRadius: 2}} />
                            
                            <div style={{flex: 1, overflow: 'hidden'}}>
                                <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10, color: '#333'}}>
                                    {item.title}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    // --- 4. CÁC HÀM TIỆN ÍCH KHÁC ---
    const handleExport = () => {
        if (data.length === 0) return message.warning('Không có dữ liệu');
        let csv = "ID,Title,Channel,Views,Date\n";
        data.forEach(r => csv += `"${r.video_id}","${r.title.replace(/"/g, '""')}","${r.account_name}",${r.view_count},${r.published_at}\n`);
        const link = document.createElement("a");
        link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
        link.download = "video_report.csv";
        link.click();
    };

    const openDetail = (item) => {
        setSelectedItem(item);
        setDetailVisible(true);
    };

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: 'Kênh',
            dataIndex: 'platform',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Badge count={<YoutubeFilled style={{color:'red'}}/>}>
                        <Avatar src={record.avatar} shape="square" size={40} icon={<UserOutlined/>} />
                    </Badge>
                    <div>
                        <Text strong style={{display:'block', fontSize: 13}}>{record.account_name}</Text>
                        <Text type="secondary" style={{fontSize: 11}}>{dayjs(record.published_at).format('HH:mm DD/MM')}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Video',
            dataIndex: 'title',
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Image 
                        src={record.thumbnail_url} 
                        width={80} 
                        style={{ borderRadius: 4, cursor: 'pointer' }}
                        preview={false}
                        onClick={() => openDetail(record)}
                    />
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ maxWidth: 350, display: 'block', fontSize: 14, cursor: 'pointer' }} onClick={() => openDetail(record)} ellipsis>
                            {text}
                        </Text>
                        <Space size={8} style={{fontSize: 11, color: '#666'}}>
                            <span><EyeOutlined/> {parseInt(record.view_count).toLocaleString()}</span>
                            <span><LikeOutlined/> {parseInt(record.like_count).toLocaleString()}</span>
                        </Space>
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'privacy_status',
            width: 120,
            render: (status) => {
                let color = 'success', text = 'Công khai', icon = <GlobalOutlined />;
                if (status === 'private') { color = 'default'; text = 'Riêng tư'; icon = <LockOutlined />; }
                else if (status === 'unlisted') { color = 'warning'; text = 'K.Công khai'; icon = <EyeInvisibleOutlined />; }
                return <Tag icon={icon} color={color}>{text}</Tag>;
            }
        },
        {
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Tooltip title="Xem trên YouTube">
                    <Button type="text" icon={<LinkOutlined style={{color: '#1890ff'}} />} href={`https://youtu.be/${record.video_id}`} target="_blank" />
                </Tooltip>
            )
        }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            
            {/* HEADER & FILTER */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Thư Viện Video</Title>
                        <Text type="secondary">Quản lý {originalData.length} video từ tất cả các kênh</Text>
                    </div>
                    
                    {/* NÚT CHUYỂN ĐỔI CHẾ ĐỘ XEM */}
                    <Segmented
                        options={[
                            { label: 'Danh Sách', value: 'list', icon: <UnorderedListOutlined /> },
                            { label: 'Lịch Đăng', value: 'calendar', icon: <CalendarOutlined /> },
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                        size="large"
                    />
                </div>

                <Card variant="borderless" styles={{ body: { padding: 16 } }} style={{borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                    <Space wrap>
                        {/* LỌC KÊNH (MỚI) */}
                        <Select 
                            placeholder="Chọn kênh" 
                            style={{ width: 220 }}
                            value={filters.channelId}
                            onChange={(val) => setFilters({...filters, channelId: val})}
                        >
                            <Select.Option value="all">Tất cả các kênh</Select.Option>
                            {accounts.map(acc => (
                                <Select.Option key={acc.id} value={acc.id}>
                                    <Space><Avatar src={acc.avatar || acc.avatar_url} size="small"/> {acc.name}</Space>
                                </Select.Option>
                            ))}
                        </Select>

                        <Select 
                            defaultValue="all" 
                            style={{ width: 150 }} 
                            onChange={(val) => setFilters({...filters, privacy: val})}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'public', label: 'Công khai' },
                                { value: 'private', label: 'Riêng tư' },
                            ]}
                        />
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất CSV</Button>
                        <Button type="primary" icon={<SyncOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
                    </Space>
                </Card>
            </div>

            {/* NỘI DUNG CHÍNH (SWITCH GIỮA TABLE VÀ CALENDAR) */}
            <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
                {viewMode === 'list' ? (
                    <Table 
                        columns={columns} 
                        dataSource={data} 
                        rowKey="video_id"
                        loading={loading}
                        pagination={{ pageSize: 8 }}
                    />
                ) : (
                    <div style={{ padding: 16 }}>
                        <Calendar 
                            dateCellRender={dateCellRender} 
                            mode="month"
                        />
                    </div>
                )}
            </Card>

            {/* MODAL CHI TIẾT */}
            <Modal
                title="Chi tiết Video"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={600}
            >
                {selectedItem && (
                    <div>
                        <div style={{position:'relative', width: '100%', height: 300, marginBottom: 16, background:'#000', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <Image src={selectedItem.thumbnail_url} style={{maxHeight: 300, maxWidth:'100%'}} preview={false} />
                            <a 
                                href={`https://youtu.be/${selectedItem.video_id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)', color:'#fff', fontSize: 40}}
                            >
                                <YoutubeFilled />
                            </a>
                        </div>
                        
                        <Title level={4} style={{margin:0}}>{selectedItem.title}</Title>
                        
                        <div style={{marginTop: 12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <Space>
                                <Avatar src={selectedItem.avatar} icon={<UserOutlined/>}/>
                                <div>
                                    <div style={{fontWeight:600}}>{selectedItem.account_name}</div>
                                    <div style={{fontSize:12, color:'#888'}}>Đăng lúc: {dayjs(selectedItem.published_at).format('HH:mm - DD/MM/YYYY')}</div>
                                </div>
                            </Space>
                            <Tag color={selectedItem.privacy_status === 'public' ? 'success' : 'default'}>
                                {selectedItem.privacy_status === 'public' ? 'CÔNG KHAI' : 'RIÊNG TƯ'}
                            </Tag>
                        </div>

                        <Divider />
                        
                        <Row gutter={16} style={{textAlign: 'center'}}>
                            <Col span={8}><Statistic title="Views" value={selectedItem.view_count} prefix={<EyeOutlined />} /></Col>
                            <Col span={8}><Statistic title="Likes" value={selectedItem.like_count} prefix={<LikeOutlined />} /></Col>
                            <Col span={8}><Statistic title="Comments" value={selectedItem.comment_count} prefix={<VideoCameraOutlined />} /></Col>
                        </Row>
                        
                        <Divider />
                        <div style={{background: '#f9f9f9', padding: 12, borderRadius: 8}}>
                            <Text type="secondary">Mô tả:</Text>
                            <p style={{margin:0, marginTop: 4, maxHeight: 100, overflowY:'auto'}}>
                                {selectedItem.description || "Không có mô tả"}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default History;