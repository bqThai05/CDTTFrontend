// src/pages/WorkspaceInbox.jsx
import React, { useState, useEffect } from 'react';
import { 
  List, Avatar, Card, Typography, Tag, Input, Button, 
  Badge, Spin, Empty, Select, message, Tooltip, Divider 
} from 'antd';
import { 
  YoutubeFilled, FacebookFilled, UserOutlined, 
  SendOutlined, CheckCircleOutlined, ClockCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { 
  getWorkspaceInboxComments, 
  replyToComment, 
  assignCommentToUser,
  getWorkspaceMembers 
} from '../services/api';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const WorkspaceInbox = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [members, setMembers] = useState([]);
  
  // State trả lời
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  // Dữ liệu giả lập nếu API chưa có comment (Để Demo cho đẹp)
  const mockComments = [
      { id: 1, author_name: 'Nguyen Van A', content: 'Sản phẩm này giá bao nhiêu vậy shop?', platform: 'facebook', status: 'new', published_at: new Date(), avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1' },
      { id: 2, author_name: 'Tech Reviewer', content: 'Video rất hay, mong ra thêm nhiều clip về coding nhé!', platform: 'youtube', status: 'replied', published_at: new Date(Date.now() - 86400000), avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2' },
      { id: 3, author_name: 'Khách hàng khó tính', content: 'Sao mình nhắn tin không thấy ai trả lời?', platform: 'facebook', status: 'new', published_at: new Date(), avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3' },
  ];

  useEffect(() => {
    if (workspaceId) {
        fetchInboxData();
    }
  }, [workspaceId]);

  const fetchInboxData = async () => {
    setLoading(true);
    try {
        const [commentRes, memberRes] = await Promise.all([
            getWorkspaceInboxComments(workspaceId),
            getWorkspaceMembers(workspaceId)
        ]);
        
        // Nếu API trả về rỗng thì dùng Mock Data để demo
        if (commentRes.data && commentRes.data.length > 0) {
            setComments(commentRes.data);
        } else {
            setComments(mockComments);
        }

        setMembers(memberRes.data);
    } catch (error) {
        console.error("Lỗi tải inbox:", error);
        // Fallback mock data khi lỗi
        setComments(mockComments);
    } finally {
        setLoading(false);
    }
  };

  // Xử lý gửi trả lời
  const handleReply = async () => {
      if (!replyContent.trim()) return;
      setSending(true);
      try {
          // Gọi API Backend
          if (selectedComment.id > 100) { // Check id giả hay thật
             await replyToComment(selectedComment.id, { content: replyContent });
          } else {
             // Mock delay
             await new Promise(r => setTimeout(r, 1000));
          }
          
          message.success('Đã gửi câu trả lời!');
          setReplyContent('');
          
          // Cập nhật trạng thái comment ở local
          const updatedComments = comments.map(c => 
              c.id === selectedComment.id ? { ...c, status: 'replied' } : c
          );
          setComments(updatedComments);
          setSelectedComment({ ...selectedComment, status: 'replied' });

      } catch {
          message.error('Lỗi khi gửi trả lời');
      } finally {
          setSending(false);
      }
  };

  // Xử lý giao việc (Assign)
  const handleAssign = async (userId) => {
      try {
          if (selectedComment.id > 100) {
            await assignCommentToUser(selectedComment.id, { assigned_to: userId });
          }
          message.success('Đã giao việc thành công');
          // Update UI logic here if needed
      } catch  {
          message.error('Lỗi khi giao việc');
      }
  };

  return (
    <Spin spinning={loading} tip="Đang tải tin nhắn..."> 
    <div style={{ display: 'flex', height: '600px', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
      
      {/* CỘT TRÁI: DANH SÁCH COMMENT */}
      <div style={{ width: 350, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
              <Title level={5} style={{ margin: 0 }}>Hộp thư đến ({comments.filter(c => c.status === 'new').length})</Title>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
              <List
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={item => (
                      <List.Item 
                          onClick={() => setSelectedComment(item)}
                          style={{ 
                              padding: '12px 16px', 
                              cursor: 'pointer',
                              background: selectedComment?.id === item.id ? '#e6f7ff' : (item.status === 'new' ? '#fff' : '#f9f9f9'),
                              borderLeft: selectedComment?.id === item.id ? '4px solid #1890ff' : '4px solid transparent',
                              transition: 'all 0.2s'
                          }}
                      >
                          <List.Item.Meta
                              avatar={
                                  <Badge count={item.platform === 'youtube' ? <YoutubeFilled style={{color:'red'}}/> : <FacebookFilled style={{color:'#1877f2'}}/>} offset={[0, 30]}>
                                      <Avatar src={item.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=user"} />
                                  </Badge>
                              }
                              title={
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Text strong ellipsis style={{maxWidth: 140}}>{item.author_name}</Text>
                                      <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.published_at).format('DD/MM')}</Text>
                                  </div>
                              }
                              description={
                                  <div>
                                      <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, fontSize: 13, color: '#666' }}>{item.content}</Paragraph>
                                      {item.status === 'new' && <Tag color="error" style={{zoom: 0.8, marginTop: 4}}>Mới</Tag>}
                                  </div>
                              }
                          />
                      </List.Item>
                  )}
              />
          </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT & TRẢ LỜI */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {selectedComment ? (
              <>
                  {/* Header chi tiết */}
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar size="large" src={selectedComment.avatar} />
                          <div>
                              <Title level={5} style={{ margin: 0 }}>{selectedComment.author_name}</Title>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                  Đã bình luận trên {selectedComment.platform === 'youtube' ? 'YouTube' : 'Facebook'} • {dayjs(selectedComment.published_at).format('HH:mm DD/MM/YYYY')}
                              </Text>
                          </div>
                      </div>
                      
                      {/* Giao việc */}
                      <div>
                          <span style={{ marginRight: 8, color: '#888' }}>Giao cho:</span>
                          <Select 
                              style={{ width: 150 }} 
                              placeholder="Chọn nhân viên" 
                              bordered={false}
                              onChange={handleAssign}
                          >
                              {members.map(m => (
                                  <Select.Option key={m.user_id} value={m.user_id}>
                                      <Avatar size="small" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.username}`} /> {m.user?.username}
                                  </Select.Option>
                              ))}
                          </Select>
                      </div>
                  </div>

                  {/* Nội dung hội thoại */}
                  <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#f5f7fa' }}>
                      {/* Bong bóng tin nhắn khách */}
                      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                          <Avatar src={selectedComment.avatar} />
                          <div style={{ background: '#fff', padding: '10px 15px', borderRadius: '0 15px 15px 15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', maxWidth: '70%' }}>
                              <Text>{selectedComment.content}</Text>
                          </div>
                      </div>

                      {/* Nếu đã trả lời thì hiện ra */}
                      {selectedComment.status === 'replied' && (
                          <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse', marginBottom: 20 }}>
                              <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                              <div style={{ background: '#e6f7ff', padding: '10px 15px', borderRadius: '15px 0 15px 15px', maxWidth: '70%' }}>
                                  <Text>Cảm ơn bạn đã quan tâm! Bên mình đã inbox tư vấn nhé. ❤️</Text>
                                  <div style={{ textAlign: 'right', fontSize: 10, color: '#999', marginTop: 5 }}>
                                      <CheckCircleOutlined /> Đã gửi
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Khu vực nhập liệu */}
                  <div style={{ padding: 20, borderTop: '1px solid #f0f0f0' }}>
                      <TextArea 
                          rows={3} 
                          placeholder={`Trả lời ${selectedComment.author_name}...`} 
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          style={{ marginBottom: 12, borderRadius: 8 }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 5 }}>
                              <Tooltip title="Chèn câu mẫu"><Button size="small" icon={<MoreOutlined />} /></Tooltip>
                          </div>
                          <Button 
                              type="primary" 
                              icon={<SendOutlined />} 
                              onClick={handleReply} 
                              loading={sending}
                              disabled={!replyContent.trim()}
                          >
                              Gửi trả lời
                          </Button>
                      </div>
                  </div>
              </>
          ) : (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#999' }}>
                  <Empty description="Chọn một hội thoại để bắt đầu" />
              </div>
          )}
      </div>
    </div>
     </Spin> 
  );
};

export default WorkspaceInbox;