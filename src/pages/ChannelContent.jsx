// src/pages/ChannelContent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Card, Button, Avatar, Typography, Row, Col, Tag, Space, 
  Tooltip, Image, Breadcrumb, Spin, Empty, Modal, Form, Input, 
  Select, message, Popconfirm, Tabs, Divider, Alert, List, theme,
  DatePicker
} from 'antd';
import { 
  YoutubeFilled, 
  FacebookFilled, 
  ArrowLeftOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  GlobalOutlined,
  LockOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraAddOutlined,
  PlusOutlined,
  TagsOutlined,
  BarChartOutlined,
  SendOutlined,
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import API
import { 
  getAllSocialAccounts, 
  getYouTubeChannels, 
  getYouTubeChannelVideos,
  refreshYouTubeVideos,
  updateYouTubeVideo,
  deleteYouTubeVideo,
  getYouTubeVideoComments,
  replyToYouTubeComment,
  getYouTubeChannelPlaylists,
  getYouTubePlaylistItems,
  createYouTubePlaylist,
  updateYouTubePlaylist,
  deleteYouTubePlaylist,
  addVideoToYouTubePlaylist,
  deleteYouTubePlaylistItem
} from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- DỮ LIỆU GIẢ LẬP CHO VIDEO (Tạm thời giữ để làm fallback cho các nền tảng khác) ---
const mockVideos = [
  {
      id: 1,
      title: 'Đánh giá iPhone 16 Pro Max - Có đáng tiền?',
      description: 'Chi tiết về hiệu năng, camera và pin sau 1 tuần sử dụng.',
      thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg',
      duration: '15:30',
      privacy: 'public',
      date: '2025-12-20',
      views: 120500,
      likes: 5400,
      comments: 120
  },
  {
      id: 2,
      title: 'Hướng dẫn Setup góc làm việc tối giản',
      description: 'Chia sẻ các món đồ decor bàn làm việc giá rẻ.',
      thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
      duration: '08:45',
      privacy: 'public',
      date: '2025-12-18',
      views: 45000,
      likes: 2100,
      comments: 85
  },
  {
      id: 3,
      title: 'Video nháp: Teaser dự án mới',
      description: 'Chưa công bố.',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=68&fit=crop',
      duration: '01:00',
      privacy: 'private',
      date: '2025-12-15',
      views: 0,
      likes: 0,
      comments: 0
  }
];

const ChannelContent = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  // 1. TRẠNG THÁI
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  // Trạng thái cho Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Trạng thái cho Comments
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [replyText, setReplyText] = useState({}); // Lưu text trả lời cho từng comment

  // Trạng thái cho Playlists
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1.1 TRẠNG THÁI BỘ LỌC
  const [filters, setFilters] = useState({
    searchText: '',
    privacy: 'all',
    dateRange: null
  });

  // Trạng thái cho Tạo Playlist
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [createPlaylistForm] = Form.useForm();

  // Trạng thái cho Sửa Playlist
  const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [updatingPlaylist, setUpdatingPlaylist] = useState(false);
  const [editPlaylistForm] = Form.useForm();

  // Trạng thái cho Thêm vào Playlist
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [videoToAddToPlaylist, setVideoToAddToPlaylist] = useState(null);
  const [addToPlaylistForm] = Form.useForm();
  
  // Trạng thái cho Xem Playlist Items
  const [isPlaylistItemsModalOpen, setIsPlaylistItemsModalOpen] = useState(false);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingPlaylistItems, setLoadingPlaylistItems] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);

  // Trạng thái cho Chọn nhiều (Bulk Selection)
  const [selectedVideoKeys, setSelectedVideoKeys] = useState([]);
  const [isBulkPlaylistModalOpen, setIsBulkPlaylistModalOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Hàm làm mới video từ YouTube API của Backend
  const handleRefreshVideos = async () => {
    if (!selectedAccount || selectedAccount.platform !== 'youtube') return;
    
    setRefreshing(true);
    const hide = message.loading('Đang đồng bộ dữ liệu mới từ YouTube...', 0);
    
    try {
      const targetId = selectedAccount.channel_db_id || selectedAccount.social_channel_id || selectedAccount.social_id;
      await refreshYouTubeVideos(targetId);
      
      message.success('Đồng bộ dữ liệu thành công!');
      
      // Sau khi refresh xong trên server, tải lại dữ liệu ở client
      fetchYouTubeVideos(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
      fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id, selectedAccount.id);
      
      // Làm mới luôn stats
      if (selectedAccount.id) {
        const res = await getYouTubeChannels(selectedAccount.id);
        if (res.data && res.data.length > 0) {
          const channel = res.data[0];
          setSelectedAccount(prev => ({
            ...prev,
            subscriber_count: channel.subscriber_count || 0,
            video_count: channel.video_count || 0,
            view_count: channel.view_count || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi refresh video:", error);
      message.error('Không thể làm mới dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setRefreshing(false);
      hide();
    }
  };

  const fetchYouTubeVideos = useCallback(async (dbId, socialId) => {
    setLoadingVideos(true);
    try {
      let targetId = dbId || socialId;
      console.log(`Đang lấy video thật từ API với ID: ${targetId}`);
      
      let res = await getYouTubeChannelVideos(targetId);
      let rawVideos = Array.isArray(res.data) ? res.data : (res.data?.videos || []);
      
      // Fallback: Nếu không tìm thấy video bằng dbId, thử lại bằng socialId
      if (rawVideos.length === 0 && dbId && socialId && dbId !== socialId) {
        res = await getYouTubeChannelVideos(socialId);
        rawVideos = Array.isArray(res.data) ? res.data : (res.data?.videos || []);
      }
      
      const ytVideos = rawVideos.map(v => ({
        id: v.video_id || v.id || Math.random(),
        real_id: v.video_id || v.id,
        title: v.title || v.snippet?.title || 'Không có tiêu đề',
        description: v.description || v.snippet?.description || '',
        thumbnail: v.thumbnail_url || v.thumbnail || v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url,
        duration: v.duration || 'N/A',
        privacy: v.privacy_status || v.status?.privacyStatus || 'public',
        date: v.published_at ? v.published_at.split('T')[0] : 'N/A',
        views: parseInt(v.view_count || v.views || v.statistics?.viewCount) || 0,
        likes: parseInt(v.like_count || v.likes || v.statistics?.likeCount) || 0,
        comments: parseInt(v.comment_count || v.comments || v.statistics?.commentCount) || 0,
        tags: v.tags || v.snippet?.tags || [],
        category_id: v.category_id || v.snippet?.categoryId,
        url: v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null,
      }));
      
      setVideos(ytVideos);

      // --- ĐOẠN MỚI THÊM: Tính tổng view thật ---
      if (ytVideos.length > 0) {
          const realTotalViews = ytVideos.reduce((sum, item) => sum + item.views, 0);
          console.log("Tổng view thực tế tính được:", realTotalViews);

          // Cập nhật ngược lại state selectedAccount để Header hiển thị đúng
          setSelectedAccount(prev => {
              if (prev) {
                  return {
                      ...prev,
                      view_count: realTotalViews, // Ghi đè bằng số liệu thật
                      video_count: ytVideos.length
                  };
              }
              return prev;
          });
      }
      // ------------------------------------------

    } catch (error) {
      console.error("Lỗi tải video:", error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  const fetchYouTubePlaylists = useCallback(async (dbId, socialId, socialAccountId) => {
    setLoadingPlaylists(true);
    try {
      let targetId = dbId || socialId || socialAccountId;
      console.log(`Đang thử lấy playlists với ID: ${targetId}`);
      
      let res = await getYouTubeChannelPlaylists(targetId);
      let rawPlaylists = Array.isArray(res.data) ? res.data : (res.data?.playlists || []);
      
      // Fallback 1: Thử với socialId (UC...)
      if (rawPlaylists.length === 0 && dbId && socialId && dbId !== socialId) {
        console.log(`Không có playlist với ID ${dbId}, đang thử với socialId: ${socialId}`);
        res = await getYouTubeChannelPlaylists(socialId);
        rawPlaylists = Array.isArray(res.data) ? res.data : (res.data?.playlists || []);
      }

      // Fallback 2: Thử với socialAccountId (ID của kết nối)
      if (rawPlaylists.length === 0 && socialAccountId && targetId !== socialAccountId) {
        console.log(`Vẫn không có playlist, đang thử với socialAccountId: ${socialAccountId}`);
        res = await getYouTubeChannelPlaylists(socialAccountId);
        rawPlaylists = Array.isArray(res.data) ? res.data : (res.data?.playlists || []);
      }
      
      console.log("Kết quả trả về từ API playlists:", rawPlaylists);
      
      const ytPlaylists = rawPlaylists.map(p => ({
        id: p.playlist_id || p.id,
        title: p.title || 'Không có tiêu đề',
        description: p.description || '',
        thumbnail: p.thumbnail_url || (p.snippet?.thumbnails?.medium?.url || p.snippet?.thumbnails?.default?.url),
        item_count: p.item_count || 0,
        privacy: p.privacy_status || 'public',
        date: p.published_at ? p.published_at.split('T')[0] : 'N/A'
      }));

      // Nếu API trả về danh sách trống nhưng hiện tại đang có dữ liệu (có thể do vừa tạo mới và YouTube chưa cập nhật kịp)
      // thì chúng ta sẽ giữ lại dữ liệu hiện tại thay vì ghi đè bằng mảng trống
      setPlaylists(prev => {
        if (ytPlaylists.length === 0 && prev.length > 0) {
          console.log("API trả về trống nhưng local đang có dữ liệu, giữ lại dữ liệu cũ để tránh biến mất (YouTube delay)");
          return prev;
        }
        return ytPlaylists;
      });
    } catch (error) {
      console.error("Lỗi tải playlists:", error);
      // Không set về [] ngay lập tức nếu đang có dữ liệu
      setPlaylists(prev => prev.length > 0 ? prev : []);
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);

  // Khi chọn tài khoản, lấy danh sách video/bài viết
  useEffect(() => {
    if (selectedAccount) {
      console.log("Đã chọn tài khoản:", selectedAccount.name);
      if (selectedAccount.platform === 'youtube') {
        // Thử lấy video bằng channel_db_id trước, nếu không được sẽ thử social_channel_id trong hàm fetch
        fetchYouTubeVideos(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
        fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id, selectedAccount.id);
      } else {
        // Tạm thời dùng mock cho các nền tảng khác
        setVideos(mockVideos);
      }
    }
  }, [selectedAccount?.id, fetchYouTubeVideos, fetchYouTubePlaylists, mockVideos]);

  // Một effect riêng để làm mới thống kê kênh khi ID thay đổi
  useEffect(() => {
    if (selectedAccount?.platform === 'youtube') {
      const refreshChannelStats = async () => {
        setLoadingStats(true);
        try {
          const res = await getYouTubeChannels(selectedAccount.id);
          if (res.data && res.data.length > 0) {
            const channel = res.data[0];
            setSelectedAccount(prev => {
              // Chỉ cập nhật nếu có sự thay đổi thực sự để tránh render vô ích
              if (prev && (prev.subscriber_count === channel.subscriber_count && 
                  prev.video_count === channel.video_count && 
                  prev.view_count === channel.view_count)) {
                return prev;
              }
              return {
                ...prev,
                subscriber_count: channel.subscriber_count || 0,
                video_count: channel.video_count || 0,
                view_count: channel.view_count || 0,
                sub: channel.subscriber_count || 0
              };
            });
          }
        } catch (error) {
          console.error("Lỗi làm mới thống kê kênh:", error);
        } finally {
          setLoadingStats(false);
        }
      };
      
      refreshChannelStats();
    }
  }, [selectedAccount?.id]); 

  // Tìm dòng: const fetchAccounts = useCallback(async () => {
  // Thay thế toàn bộ nội dung hàm đó bằng code dưới đây:

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllSocialAccounts();
      const rawAccounts = response.data || [];
      
      const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
        if (acc.platform === 'youtube') {
          // Thông tin cơ bản ban đầu
          const fallbackAcc = {
            ...acc,
            name: acc.name || acc.username || acc.social_id || 'Kênh YouTube',
            // Ưu tiên thumbnail_url từ backend nếu có (đây là cái em cần)
            avatar: acc.avatar_url || acc.thumbnail_url || acc.avatar || 'https://www.gstatic.com/youtube/img/branding/youtubelogo/2x/youtubelogo_color_24dp.png',
            sub: acc.subscribers || acc.sub || 0,
            subscriber_count: acc.subscribers || acc.subscriber_count || 0,
            video_count: acc.video_count || 0,
            view_count: acc.view_count || 0,
            type: 'Channel'
          };

          try {
            if (!acc.id) return fallbackAcc;
            // Gọi API lấy chi tiết kênh để đảm bảo Avatar mới nhất
            const channelsRes = await getYouTubeChannels(acc.id);
            if (channelsRes.data && channelsRes.data.length > 0) {
              const channel = channelsRes.data[0];
              return {
                ...acc,
                name: channel.title || fallbackAcc.name,
                // Lấy thumbnail_url chuẩn từ API (Quan trọng)
                avatar: channel.thumbnail_url || channel.thumbnail || fallbackAcc.avatar,
                subscriber_count: channel.subscriber_count || 0,
                video_count: channel.video_count || 0,
                view_count: channel.view_count || 0,
                type: 'Channel',
                channel_db_id: channel.id,
                social_channel_id: channel.channel_id
              };
            }
          } catch {
            return fallbackAcc;
          }
          return fallbackAcc;
        }
        
        // Xử lý cho Facebook (Giữ nguyên)
        return {
          ...acc,
          name: acc.name || acc.username || 'Page Facebook',
          avatar: acc.avatar_url || acc.avatar,
          type: 'Page'
        };
      }));

      setAccounts(enrichedAccounts);
    } catch (error) {
      console.error("Lỗi tải danh sách tài khoản:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // --- HÀM XỬ LÝ SỬA / XÓA ---
  const handleEdit = (video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title: video.title,
      description: video.description,
      privacy: video.privacy,
      tags: video.tags ? video.tags.join(', ') : '',
      category_id: video.category_id || '22' // Mặc định là People & Blogs nếu không có
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // Chuyển chuỗi tags thành mảng
      const tagsArray = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      await updateYouTubeVideo(editingVideo.real_id, {
        title: values.title,
        description: values.description,
        privacy_status: values.privacy,
        tags: tagsArray,
        category_id: values.category_id
      });
      
      message.success('Cập nhật video thành công!');
      setIsEditModalOpen(false);
      // Tải lại danh sách video
      fetchYouTubeVideos(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error('Không thể cập nhật video. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await deleteYouTubeVideo(videoId);
      message.success('Đã xóa video thành công');
      fetchYouTubeVideos(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
    } catch (error) {
      console.error("Lỗi xóa video:", error);
      message.error('Lỗi khi xóa video. Vui lòng thử lại.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideoKeys.length === 0) return;

    Modal.confirm({
      title: `Xác nhận xóa ${selectedVideoKeys.length} video?`,
      content: 'Hành động này không thể hoàn tác trên YouTube.',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setBulkProcessing(true);
        try {
          let successCount = 0;
          let failCount = 0;
          
          // Xóa từng video một (YouTube API không hỗ trợ xóa hàng loạt trong 1 request)
          for (const videoId of selectedVideoKeys) {
            try {
              await deleteYouTubeVideo(videoId);
              successCount++;
            } catch (err) {
              console.error(`Lỗi xóa video ${videoId}:`, err);
              failCount++;
            }
          }
          
          if (failCount === 0) {
            message.success(`Đã xóa ${successCount} video thành công!`);
          } else {
            message.warning(`Đã xóa ${successCount} video, thất bại ${failCount} video.`);
          }
          
          setSelectedVideoKeys([]);
          fetchYouTubeVideos(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
        } catch (error) {
          console.error("Lỗi hệ thống khi xóa hàng loạt:", error);
          message.error('Có lỗi xảy ra trong quá trình xử lý hàng loạt.');
        } finally {
          setBulkProcessing(false);
        }
      }
    });
  };

  const handleBulkAddToPlaylist = async (playlistId) => {
    if (selectedVideoKeys.length === 0 || !playlistId) return;

    setBulkProcessing(true);
    try {
      let successCount = 0;
      for (const videoId of selectedVideoKeys) {
        try {
          await addVideoToYouTubePlaylist(playlistId, {
            social_account_id: selectedAccount.id,
            video_id: videoId,
            position: 0
          });
          successCount++;
        } catch (e) {
          console.error(`Lỗi thêm video ${videoId} vào playlist:`, e);
        }
      }
      
      message.success(`Đã thêm ${successCount}/${selectedVideoKeys.length} video vào danh sách phát!`);
      setIsBulkPlaylistModalOpen(false);
      setSelectedVideoKeys([]);
      
      // Refresh playlist data
      if (selectedAccount) {
        fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id, selectedAccount.id);
      }
    } catch (error) {
      console.error("Lỗi thêm hàng loạt vào playlist:", error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // --- HÀM XỬ LÝ BÌNH LUẬN ---
  const handleOpenComments = async (video) => {
    setActiveVideo(video);
    setIsCommentsModalOpen(true);
    setLoadingComments(true);
    try {
      const res = await getYouTubeVideoComments(video.real_id);
      setComments(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
      message.error("Không thể tải bình luận của video này.");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReplyComment = async (commentId) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await replyToYouTubeComment(commentId, text);
      message.success("Đã gửi phản hồi thành công!");
      // Xóa text đã nhập
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      // Tải lại bình luận
      const res = await getYouTubeVideoComments(activeVideo.real_id);
      setComments(res.data || []);
    } catch (error) {
      console.error("Lỗi trả lời bình luận:", error);
      message.error("Không thể gửi phản hồi. Vui lòng thử lại.");
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const values = await createPlaylistForm.validateFields();
      setCreatingPlaylist(true);
      
      // Gửi kèm social_account_id để backend biết tạo cho kênh nào
      const res = await createYouTubePlaylist({
        social_account_id: selectedAccount.id,
        title: values.title,
        description: values.description,
        privacy_status: values.privacy_status
      });
      
      message.success('Tạo danh sách phát thành công!');
      setIsCreatePlaylistModalOpen(false);
      createPlaylistForm.resetFields();
      
      // 1. Cập nhật local state ngay lập tức nếu API trả về dữ liệu mới
      if (res.data) {
        const newPlaylist = {
          id: res.data.playlist_id || res.data.id,
          title: res.data.title || values.title,
          description: res.data.description || values.description,
          thumbnail: res.data.thumbnail_url || (res.data.snippet?.thumbnails?.medium?.url || res.data.snippet?.thumbnails?.default?.url),
          item_count: 0,
          privacy: res.data.privacy_status || values.privacy_status,
          date: new Date().toISOString().split('T')[0]
        };
        setPlaylists(prev => [newPlaylist, ...prev]);
      }

      // 2. Vẫn gọi API fetch lại để đồng bộ dữ liệu chuẩn từ server sau một khoảng thời gian ngắn
      // YouTube API thường có độ trễ (propagation delay) khi cập nhật danh sách
      setTimeout(() => {
        if (selectedAccount) {
          fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id, selectedAccount.id);
        }
      }, 5000); // Tăng thời gian chờ lên 5s để YouTube kịp cập nhật
      
    } catch (error) {
      console.error("Lỗi tạo playlist:", error);
      message.error('Không thể tạo danh sách phát. Vui lòng thử lại.');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    editPlaylistForm.setFieldsValue({
      title: playlist.title,
      description: playlist.description,
      privacy_status: playlist.privacy
    });
    setIsEditPlaylistModalOpen(true);
  };

  const handleUpdatePlaylist = async () => {
    try {
      const values = await editPlaylistForm.validateFields();
      setUpdatingPlaylist(true);
      await updateYouTubePlaylist(editingPlaylist.id, {
        title: values.title,
        description: values.description,
        privacy_status: values.privacy_status
      });
      message.success('Cập nhật danh sách phát thành công!');
      setIsEditPlaylistModalOpen(false);
      fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
    } catch (error) {
      console.error("Lỗi cập nhật playlist:", error);
      message.error('Không thể cập nhật danh sách phát. Vui lòng thử lại.');
    } finally {
      setUpdatingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deleteYouTubePlaylist(playlistId);
      message.success('Đã xóa danh sách phát thành công');
      fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id);
    } catch (error) {
      console.error("Lỗi xóa playlist:", error);
      message.error('Lỗi khi xóa danh sách phát. Vui lòng thử lại.');
    }
  };

  const handleAddToPlaylist = async () => {
    try {
      const values = await addToPlaylistForm.validateFields();
      setAddingToPlaylist(true);
      await addVideoToYouTubePlaylist(values.playlist_id, {
        social_account_id: selectedAccount.id, // Bổ sung social_account_id
        video_id: videoToAddToPlaylist.real_id,
        position: values.position || 0
      });
      message.success('Đã thêm video vào danh sách phát!');
      setIsAddToPlaylistModalOpen(false);
      addToPlaylistForm.resetFields();
      
      // Cập nhật local state ngay lập tức
      setPlaylists(prev => prev.map(p => {
        if (p.id === values.playlist_id) {
          return { ...p, item_count: (parseInt(p.item_count) || 0) + 1 };
        }
        return p;
      }));

      // Vẫn gọi API để đồng bộ dữ liệu chuẩn từ server sau một khoảng thời gian ngắn
      setTimeout(() => {
        if (selectedAccount) {
          fetchYouTubePlaylists(selectedAccount.channel_db_id, selectedAccount.social_channel_id || selectedAccount.social_id, selectedAccount.id);
        }
      }, 2000);
    } catch (error) {
      console.error("Lỗi thêm video vào playlist:", error);
      message.error('Không thể thêm video vào danh sách phát. Vui lòng thử lại.');
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const handleViewPlaylistItems = async (playlist) => {
    setActivePlaylist(playlist);
    setIsPlaylistItemsModalOpen(true);
    setLoadingPlaylistItems(true);
    try {
      const res = await getYouTubePlaylistItems(playlist.id);
      const items = (res.data || []).map(item => ({
        id: item.playlist_item_id || item.id, // Sử dụng playlist_item_id để xóa
        title: item.title || 'Không có tiêu đề',
        thumbnail: item.thumbnail_url || item.thumbnail || (item.snippet?.thumbnails?.medium?.url),
        position: item.position,
        video_id: item.video_id
      }));
      setPlaylistItems(items);
    } catch (error) {
      console.error("Lỗi lấy danh sách video trong playlist:", error);
      message.error("Không thể tải danh sách video của playlist này.");
    } finally {
      setLoadingPlaylistItems(false);
    }
  };

  const handleRemoveFromPlaylist = async (playlistItemId) => {
    try {
      setLoadingPlaylistItems(true);
      await deleteYouTubePlaylistItem(activePlaylist.id, playlistItemId);
      message.success("Đã gỡ video khỏi danh sách phát!");
      
      // Tải lại danh sách items
      const res = await getYouTubePlaylistItems(activePlaylist.id);
      const items = (res.data || []).map(item => ({
        id: item.playlist_item_id || item.id,
        title: item.title || 'Không có tiêu đề',
        thumbnail: item.thumbnail_url || item.thumbnail || (item.snippet?.thumbnails?.medium?.url),
        position: item.position,
        video_id: item.video_id
      }));
      setPlaylistItems(items);
      
      // Cập nhật số lượng video trong playlist ở danh sách chính
      setPlaylists(prev => prev.map(p => {
        if (p.id === activePlaylist.id) {
          return { ...p, item_count: Math.max(0, (parseInt(p.item_count) || 0) - 1) };
        }
        return p;
      }));
    } catch (error) {
      console.error("Lỗi gỡ video khỏi playlist:", error);
      message.error("Không thể gỡ video. Vui lòng thử lại.");
    } finally {
      setLoadingPlaylistItems(false);
    }
  };

  // --- HÀM RENDER ---

  // Giao diện 1: DANH SÁCH TÀI KHOẢN (Hiện ra đầu tiên)
  const renderAccountSelection = () => (
    <Spin spinning={loading} tip="Đang tải danh sách tài khoản...">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Chọn kênh để quản lý</Title>
        <Text type="secondary">Chọn một tài khoản YouTube hoặc Facebook để xem nội dung chi tiết</Text>
      </div>

      <Row gutter={[24, 24]}>
        {accounts.map((acc) => (
          <Col xs={24} sm={12} md={8} lg={6} key={acc.id}>
            <Card
              hoverable
              onClick={() => setSelectedAccount(acc)} // Bấm vào thì lưu tài khoản lại
              style={{ borderRadius: 12, textAlign: 'center', borderTop: `4px solid ${acc.platform === 'youtube' ? '#ff0000' : '#1877f2'}`, background: token.colorBgContainer  }}
            
            >
               <Avatar 
                 src={acc.avatar} 
                 size={80} 
                 style={{ 
                   marginBottom: 16, 
                   border: '2px solid ${token.colorBorder}',
                   padding: 2,
                    background: token.colorBgContainer
                 }}
                 icon={acc.platform === 'youtube' ? <YoutubeFilled style={{color: '#ff0000'}} /> : <FacebookFilled style={{color: '#1877f2'}} />}
               />
               <Title level={4} style={{ fontSize: 18, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {acc.name}
               </Title>
               <Tag icon={acc.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} color={acc.platform === 'youtube' ? 'error' : 'blue'}>
                  {acc.type}
               </Tag>
               <div style={{ marginTop: 12, color: '#666' }}>
                  <b>{acc.sub}</b> người theo dõi
               </div>
            </Card>
          </Col>
        ))}
        
        {/* Nút thêm mới dẫn đến trang Accounts */}
        <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
                hoverable 
                onClick={() => navigate('/accounts')}
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, border: '1px dashed ${token.colorBorder}', background: token.colorBgLayout, minHeight: 200 }}
            >
                <div style={{ textAlign: 'center', color: '#999' }}>
                    <PlusOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                    <div>Thêm kết nối mới</div>
                </div>
            </Card>
        </Col>
      </Row>
      
      {accounts.length === 0 && !loading && (
        <Empty description="Chưa có tài khoản nào được kết nối" style={{ marginTop: 40 }} />
      )}
    </Spin>
  );

  // Giao diện 2: CHI TIẾT NỘI DUNG (Hiện ra sau khi chọn)
  const renderChannelDetail = () => {
    const columns = [
        {
            title: 'Video / Bài viết',
            dataIndex: 'title',
            key: 'title',
            width: '45%',
            render: (text, record) => (
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Image 
                        src={record.thumbnail} 
                        width={140} 
                        height={80}
                        style={{ borderRadius: 8, objectFit: 'cover' }} 
                        fallback="https://via.placeholder.com/140x80?text=No+Thumbnail"
                    />
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 4, 
                        right: 4, 
                        background: 'rgba(0,0,0,0.8)', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: 4, 
                        fontSize: 10,
                        fontWeight: 'bold'
                    }}>
                        {record.duration}
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 14, display: 'block' }} ellipsis>{record.title}</Text>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 8 }}>
                        {record.description}
                    </Paragraph>
                    
                    {record.tags && record.tags.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                            <Space size={[0, 4]} wrap>
                                {record.tags.slice(0, 5).map((tag, idx) => (
                                    <Tag key={idx} style={{ fontSize: 10, borderRadius: 10 }}>#{tag}</Tag>
                                ))}
                                {record.tags.length > 5 && <Text type="secondary" style={{ fontSize: 10 }}>+{record.tags.length - 5}</Text>}
                            </Space>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Tooltip title="Chỉnh sửa chi tiết">
                            <Button 
                                size="small" 
                                icon={<EditOutlined />} 
                                type="text" 
                                onClick={() => handleEdit(record)}
                                style={{ color: '#1677ff' }}
                            />
                        </Tooltip>
                        <Tooltip title="Xem trên YouTube">
                            <Button 
                                size="small" 
                                icon={<YoutubeFilled />} 
                                type="text" 
                                onClick={() => record.url && window.open(record.url, '_blank')}
                                style={{ color: '#ff0000' }}
                            />
                        </Tooltip>
                        <Tooltip title="Thêm vào danh sách phát">
                            <Button 
                                size="small" 
                                icon={<PlusOutlined />} 
                                type="text" 
                                onClick={() => {
                                    setVideoToAddToPlaylist(record);
                                    setIsAddToPlaylistModalOpen(true);
                                }}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Xóa video này?"
                            description="Hành động này không thể hoàn tác trên YouTube."
                            onConfirm={() => handleDelete(record.real_id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Xóa video">
                                <Button size="small" icon={<DeleteOutlined />} type="text" danger />
                            </Tooltip>
                        </Popconfirm>
                    </div>
                </div>
              </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'privacy',
            render: (val) => val === 'public' 
                ? <Tag color="success" icon={<GlobalOutlined />}>Công khai</Tag> 
                : <Tag color="default" icon={<LockOutlined />}>Riêng tư</Tag>
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'date',
            render: (val) => <div>{val}<br/><span style={{fontSize: 11, color:'#999'}}>Đã xuất bản</span></div>
        },
        {
            title: 'Số liệu',
            width: 120,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                        <EyeOutlined style={{ fontSize: 14, color: '#bfbfbf', width: '16px' }} />
                        <Text style={{ fontSize: 13, color: '#595959' }}>{record.views.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                        <LikeOutlined style={{ fontSize: 14, color: '#bfbfbf', width: '16px' }} />
                        <Text style={{ fontSize: 13, color: '#595959' }}>{record.likes.toLocaleString()}</Text>
                    </div>
                    <div 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', cursor: 'pointer' }}
                        onClick={() => handleOpenComments(record)}
                    >
                        <MessageOutlined style={{ fontSize: 14, color: '#bfbfbf', width: '16px' }} />
                        <Text style={{ fontSize: 13, color: '#1677ff', textDecoration: 'underline' }}>{record.comments.toLocaleString()}</Text>
                    </div>
                </div>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys: selectedVideoKeys,
        onChange: (keys) => setSelectedVideoKeys(keys),
    };

    const playlistColumns = [
        {
            title: 'Danh sách phát',
            dataIndex: 'title',
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Image 
                        src={record.thumbnail} 
                        width={120} 
                        height={68} 
                        style={{ borderRadius: 4, objectFit: 'cover' }} 
                    />
                    <div>
                        <Text strong style={{ fontSize: 14 }}>{record.title}</Text>
                        <div style={{ marginTop: 4 }}>
                            <Space size={8}>
                                <Tag color="blue">{record.item_count} video</Tag>
                                <Button 
                                    size="small" 
                                    type="link" 
                                    onClick={() => handleViewPlaylistItems(record)}
                                    style={{ padding: 0, height: 'auto', fontSize: 12 }}
                                >
                                    Xem chi tiết
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'privacy',
            render: (val) => val === 'public' 
                ? <Tag color="success">Công khai</Tag> 
                : <Tag color="default">Riêng tư</Tag>
        },
        {
            title: 'Cập nhật cuối',
            dataIndex: 'date'
          },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa danh sách phát">
                        <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            type="text" 
                            onClick={() => handleEditPlaylist(record)}
                            style={{ color: '#1677ff' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa danh sách phát?"
                        description="Hành động này không thể hoàn tác trên YouTube."
                        onConfirm={() => handleDeletePlaylist(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa danh sách phát">
                            <Button size="small" icon={<DeleteOutlined />} type="text" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredVideos = videos.filter(video => {
        const matchSearch = video.title.toLowerCase().includes(filters.searchText.toLowerCase()) || 
                           video.description.toLowerCase().includes(filters.searchText.toLowerCase());
        const matchPrivacy = filters.privacy === 'all' || video.privacy === filters.privacy;
        
        let matchDate = true;
        if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
            const videoDate = new Date(video.date);
            const startDate = filters.dateRange[0].toDate();
            const endDate = filters.dateRange[1].toDate();
            matchDate = videoDate >= startDate && videoDate <= endDate;
        }
        
        return matchSearch && matchPrivacy && matchDate;
    });

    const filteredPlaylists = playlists.filter(playlist => {
        const matchSearch = playlist.title.toLowerCase().includes(filters.searchText.toLowerCase()) || 
                           playlist.description.toLowerCase().includes(filters.searchText.toLowerCase());
        const matchPrivacy = filters.privacy === 'all' || playlist.privacy === filters.privacy;
        
        let matchDate = true;
        if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
            const playlistDate = new Date(playlist.date);
            const startDate = filters.dateRange[0].toDate();
            const endDate = filters.dateRange[1].toDate();
            matchDate = playlistDate >= startDate && playlistDate <= endDate;
        }
        
        return matchSearch && matchPrivacy && matchDate;
    });

    return (
        <div>
            {/* Thanh điều hướng quay lại */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedAccount(null)}>Quay lại</Button>
                    <Breadcrumb items={[{ title: 'Danh sách kênh' }, { title: selectedAccount.name }]} />
                </Space>
                <Space>
                    {selectedAccount.platform === 'youtube' && (
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleRefreshVideos}
                            loading={refreshing}
                        >
                            Làm mới dữ liệu
                        </Button>
                    )}
                    <Button 
                        type="primary" 
                        icon={<VideoCameraAddOutlined />}
                        onClick={() => navigate('/create-post')}
                    >
                        Tạo bài mới
                    </Button>
                </Space>
            </div>

            {/* Thông tin kênh đang xem */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar src={selectedAccount.avatar} size={64} style={{ border: '2px solid #ddd' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedAccount.name}</Title>
                        <Space separator={<Divider orientation="vertical" />} style={{ marginTop: 4 }}>
                            <Text type="secondary">{selectedAccount.platform === 'youtube' ? 'YouTube' : 'Facebook'}</Text>
                            {selectedAccount.platform === 'youtube' && (
                                <>
                                    <Text type="secondary">
                                        {loadingStats ? <Spin size="small" /> : (selectedAccount.subscriber_count?.toLocaleString() || 0)} người đăng ký
                                    </Text>
                                    <Text type="secondary">
                                        {loadingStats ? <Spin size="small" /> : (selectedAccount.video_count?.toLocaleString() || 0)} video
                                    </Text>
                                    <Text type="secondary">
                                        {loadingStats ? <Spin size="small" /> : (selectedAccount.view_count?.toLocaleString() || 0)} lượt xem
                                    </Text>
                                </>
                            )}
                        </Space>
                    </div>
                </div>
            </Card>

            {/* Thanh tác vụ hàng loạt (Bulk Action Bar) */}
            {selectedVideoKeys.length > 0 && (
                <Alert
                    message={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Đã chọn <b>{selectedVideoKeys.length}</b> video</span>
                            <Space>
                                <Button 
                                    size="small" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => setIsBulkPlaylistModalOpen(true)}
                                >
                                    Thêm vào danh sách phát
                                </Button>
                                <Button 
                                    size="small" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    onClick={handleBulkDelete}
                                    loading={bulkProcessing}
                                >
                                    Xóa hàng loạt
                                </Button>
                                <Button 
                                    size="small" 
                                    type="text" 
                                    onClick={() => setSelectedVideoKeys([])}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #91d5ff' }}
                />
            )}

            {/* Bảng dữ liệu với Tabs */}
            <Card variant="borderless" style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8}>
                            <Input
                                placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                allowClear
                                value={filters.searchText}
                                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                            />
                        </Col>
                        <Col xs={12} md={5}>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Trạng thái hiển thị"
                                value={filters.privacy}
                                onChange={(val) => setFilters({ ...filters, privacy: val })}
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'public', label: 'Công khai' },
                                    { value: 'private', label: 'Riêng tư' },
                                    { value: 'unlisted', label: 'Không công khai' },
                                ]}
                            />
                        </Col>
                        <Col xs={12} md={7}>
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(val) => setFilters({ ...filters, dateRange: val })}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Button 
                                icon={<FilterOutlined />} 
                                block
                                onClick={() => setFilters({ searchText: '', privacy: 'all', dateRange: null })}
                            >
                                Xóa lọc
                            </Button>
                        </Col>
                    </Row>
                </div>
                <Tabs 
                    defaultActiveKey="videos" 
                    style={{ padding: '0 24px' }}
                    items={[
                        {
                            key: 'videos',
                            label: `Video (${filteredVideos.length})`,
                            children: (
                                <Table 
                                    rowKey="real_id" 
                                    rowSelection={rowSelection}
                                    columns={columns} 
                                    dataSource={filteredVideos} 
                                    loading={loadingVideos}
                                    pagination={{ pageSize: 5 }} 
                                    locale={{ emptyText: 'Không tìm thấy nội dung nào' }}
                                    style={{ paddingBottom: 24 }}
                                />
                            )
                        },
                        {
                            key: 'playlists',
                            label: `Danh sách phát (${filteredPlaylists.length})`,
                            children: (
                                <>
                                    <div style={{ marginBottom: 16, marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button 
                                            type="primary" 
                                            icon={<PlusOutlined />} 
                                            onClick={() => setIsCreatePlaylistModalOpen(true)}
                                        >
                                            Tạo danh sách phát mới
                                        </Button>
                                    </div>
                                    <Table 
                                        rowKey="id" 
                                        columns={playlistColumns} 
                                        dataSource={filteredPlaylists} 
                                        loading={loadingPlaylists}
                                        pagination={{ pageSize: 5 }} 
                                        locale={{ emptyText: 'Không tìm thấy danh sách phát nào' }}
                                        style={{ paddingBottom: 24 }}
                                    />
                                </>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Logic điều hướng: Nếu chưa chọn acc -> Render List, Nếu chọn rồi -> Render Detail */}
        {!selectedAccount ? renderAccountSelection() : renderChannelDetail()}

        {/* Modal Chỉnh sửa Video */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <YoutubeFilled style={{ color: '#ff0000', fontSize: 24 }} />
                    <span>Chi tiết video</span>
                </div>
            }
            open={isEditModalOpen}
            onOk={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
            confirmLoading={submitting}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={800}
            style={{ top: 20 }}
            styles={{ body: { padding: '0 24px 24px 24px' } }}
        >
            <Form form={form} layout="vertical">
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'Chi tiết cơ bản',
                        children: (
                            <div style={{ marginTop: 16 }}>
                                <Form.Item 
                                    name="title" 
                                    label={<Text strong>Tiêu đề (bắt buộc)</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                                    extra="Tiêu đề hấp dẫn giúp thu hút người xem."
                                >
                                    <Input maxLength={100} showCount placeholder="Nhập tiêu đề video của bạn" />
                                </Form.Item>

                                <Form.Item 
                                    name="description" 
                                    label={<Text strong>Mô tả</Text>}
                                    extra="Giới thiệu cho người xem về video của bạn."
                                >
                                    <TextArea rows={8} maxLength={5000} showCount placeholder="Viết mô tả chi tiết..." />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="privacy" label={<Text strong>Trạng thái hiển thị</Text>}>
                                            <Select>
                                                <Select.Option value="public">
                                                    <Space><GlobalOutlined /> Công khai</Space>
                                                </Select.Option>
                                                <Select.Option value="unlisted">
                                                    <Space><LockOutlined style={{ color: '#faad14' }} /> Không công khai</Space>
                                                </Select.Option>
                                                <Select.Option value="private">
                                                    <Space><LockOutlined style={{ color: '#ff4d4f' }} /> Riêng tư</Space>
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="category_id" label={<Text strong>Danh mục</Text>}>
                                            <Select placeholder="Chọn danh mục">
                                                <Select.Option value="1">Phim & Hoạt ảnh</Select.Option>
                                                <Select.Option value="2">Ô tô & Xe cộ</Select.Option>
                                                <Select.Option value="10">Âm nhạc</Select.Option>
                                                <Select.Option value="15">Thú cưng & Động vật</Select.Option>
                                                <Select.Option value="17">Thể thao</Select.Option>
                                                <Select.Option value="19">Du lịch & Sự kiện</Select.Option>
                                                <Select.Option value="20">Trò chơi</Select.Option>
                                                <Select.Option value="22">Mọi người & Blog</Select.Option>
                                                <Select.Option value="23">Hài kịch</Select.Option>
                                                <Select.Option value="24">Giải trí</Select.Option>
                                                <Select.Option value="25">Tin tức & Chính trị</Select.Option>
                                                <Select.Option value="26">Hướng dẫn & Phong cách</Select.Option>
                                                <Select.Option value="27">Giáo dục</Select.Option>
                                                <Select.Option value="28">Khoa học & Công nghệ</Select.Option>
                                                <Select.Option value="29">Hoạt động phi lợi nhuận</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )
                    },
                    {
                        key: '2',
                        label: 'Thẻ & Từ khóa',
                        children: (
                            <div style={{ marginTop: 16 }}>
                                <Alert 
                                    message="Thẻ có thể hữu ích nếu người dùng thường nhập sai nội dung video của bạn. Ngoài ra, thẻ đóng vai trò tối thiểu trong việc giúp người xem tìm thấy video." 
                                    type="info" 
                                    showIcon 
                                    style={{ marginBottom: 20 }}
                                />
                                <Form.Item 
                                    name="tags" 
                                    label={<Text strong>Thẻ (Tags)</Text>}
                                    extra="Nhập các thẻ cách nhau bởi dấu phẩy (,)"
                                >
                                    <TextArea 
                                        rows={4} 
                                        placeholder="Ví dụ: youtube, hướng dẫn, công nghệ, ..." 
                                    />
                                </Form.Item>
                                
                                <Divider />
                                
                                <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Lưu ý: Việc lạm dụng thẻ có thể vi phạm chính sách của YouTube về nội dung rác, thông tin sai lệch và thủ đoạn lừa đảo.
                                    </Text>
                                </div>
                            </div>
                        )
                    }
                ]} />
            </Form>
        </Modal>

        {/* Modal Danh sách Bình luận */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageOutlined style={{ color: '#1677ff' }} />
                    <span>Bình luận video: {activeVideo?.title}</span>
                </div>
            }
            open={isCommentsModalOpen}
            onCancel={() => setIsCommentsModalOpen(false)}
            footer={null}
            width={700}
            style={{ top: 20 }}
        >
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: 8 }}>
                <Spin spinning={loadingComments}>
                    <List
                        dataSource={comments}
                        locale={{ emptyText: 'Chưa có bình luận nào' }}
                        renderItem={(item) => (
                            <List.Item 
                                key={item.id}
                                style={{ 
                                    flexDirection: 'column', 
                                    alignItems: 'flex-start', 
                                    padding: '16px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                                    <Avatar icon={<UserOutlined />} src={item.author_profile_image_url} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong>{item.author_name || item.author_display_name}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>{item.published_at}</Text>
                                        </div>
                                        <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>
                                            {item.text_display}
                                        </Paragraph>
                                        
                                        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                            <Space size={4}>
                                                <LikeOutlined style={{ color: '#8c8c8c' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.like_count || 0}</Text>
                                            </Space>
                                            <Space size={4}>
                                                <MessageOutlined style={{ color: '#8c8c8c' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.reply_count || 0} phản hồi</Text>
                                            </Space>
                                        </div>

                                        {/* Phần trả lời */}
                                        {item.can_reply !== false && (
                                            <div style={{ marginTop: 12, background: '#f9f9f9', padding: 12, borderRadius: 8 }}>
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <Input 
                                                        placeholder="Viết phản hồi công khai..." 
                                                        value={replyText[item.id] || ''}
                                                        onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                        onPressEnter={() => handleReplyComment(item.id)}
                                                    />
                                                    <Button 
                                                        type="primary" 
                                                        icon={<SendOutlined />} 
                                                        onClick={() => handleReplyComment(item.id)}
                                                    >
                                                        Phản hồi
                                                    </Button>
                                                </Space.Compact>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Spin>
            </div>
        </Modal>

        {/* Modal Tạo Danh sách phát mới */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlusOutlined style={{ color: '#1677ff' }} />
                    <span>Tạo danh sách phát mới</span>
                </div>
            }
            open={isCreatePlaylistModalOpen}
            onOk={handleCreatePlaylist}
            onCancel={() => {
                setIsCreatePlaylistModalOpen(false);
                createPlaylistForm.resetFields();
            }}
            confirmLoading={creatingPlaylist}
            okText="Tạo mới"
            cancelText="Hủy"
        >
            <Form form={createPlaylistForm} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item 
                    name="title" 
                    label={<Text strong>Tiêu đề</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề danh sách phát' }]}
                >
                    <Input placeholder="Nhập tên danh sách phát..." />
                </Form.Item>
                <Form.Item name="description" label={<Text strong>Mô tả (tùy chọn)</Text>}>
                    <TextArea rows={4} placeholder="Nhập mô tả cho danh sách phát này..." />
                </Form.Item>
                <Form.Item 
                    name="privacy_status" 
                    label={<Text strong>Trạng thái hiển thị</Text>}
                    initialValue="public"
                >
                    <Select>
                        <Select.Option value="public">
                            <Space><GlobalOutlined /> Công khai</Space>
                        </Select.Option>
                        <Select.Option value="unlisted">
                            <Space><LockOutlined style={{ color: '#faad14' }} /> Không công khai</Space>
                        </Select.Option>
                        <Select.Option value="private">
                            <Space><LockOutlined style={{ color: '#ff4d4f' }} /> Riêng tư</Space>
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>

        {/* Modal Thêm Video vào Danh sách phát */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlusOutlined style={{ color: '#52c41a' }} />
                    <span>Thêm vào danh sách phát</span>
                </div>
            }
            open={isAddToPlaylistModalOpen}
            onOk={handleAddToPlaylist}
            onCancel={() => {
                setIsAddToPlaylistModalOpen(false);
                addToPlaylistForm.resetFields();
            }}
            confirmLoading={addingToPlaylist}
            okText="Thêm vào"
            cancelText="Hủy"
        >
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, background: '#f5f5f5', padding: 12, borderRadius: 8, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                    <Image src={videoToAddToPlaylist?.thumbnail} width={100} height={60} style={{ borderRadius: 4, objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }} ellipsis={{ rows: 2 }}>{videoToAddToPlaylist?.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>{videoToAddToPlaylist?.date}</Text>
                </div>
            </div>
            <Form form={addToPlaylistForm} layout="vertical">
                <Form.Item 
                    name="playlist_id" 
                    label={<Text strong>Chọn danh sách phát</Text>}
                    rules={[{ required: true, message: 'Vui lòng chọn một danh sách phát' }]}
                >
                    <Select placeholder="Chọn danh sách phát của bạn..." loading={loadingPlaylists}>
                        {playlists.map(p => (
                            <Select.Option key={p.id} value={p.id}>
                                <Space>
                                    <Image src={p.thumbnail} width={30} height={20} style={{ borderRadius: 2 }} preview={false} />
                                    {p.title} ({p.item_count} video)
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item 
                    name="position" 
                    label={<Text strong>Vị trí trong danh sách (tùy chọn)</Text>}
                    initialValue={0}
                    help="0 là vị trí đầu tiên trong danh sách phát."
                >
                    <Input type="number" min={0} placeholder="Ví dụ: 0" />
                </Form.Item>
            </Form>
        </Modal>

        {/* Modal Chỉnh sửa Danh sách phát */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EditOutlined style={{ color: '#1677ff' }} />
                    <span>Chỉnh sửa danh sách phát</span>
                </div>
            }
            open={isEditPlaylistModalOpen}
            onOk={handleUpdatePlaylist}
            onCancel={() => setIsEditPlaylistModalOpen(false)}
            confirmLoading={updatingPlaylist}
            okText="Cập nhật"
            cancelText="Hủy"
        >
            <Form form={editPlaylistForm} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item 
                    name="title" 
                    label={<Text strong>Tiêu đề</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề danh sách phát' }]}
                >
                    <Input placeholder="Nhập tên danh sách phát..." />
                </Form.Item>
                <Form.Item name="description" label={<Text strong>Mô tả (tùy chọn)</Text>}>
                    <TextArea rows={4} placeholder="Nhập mô tả cho danh sách phát này..." />
                </Form.Item>
                <Form.Item 
                    name="privacy_status" 
                    label={<Text strong>Trạng thái hiển thị</Text>}
                >
                    <Select>
                        <Select.Option value="public">
                            <Space><GlobalOutlined /> Công khai</Space>
                        </Select.Option>
                        <Select.Option value="unlisted">
                            <Space><LockOutlined style={{ color: '#faad14' }} /> Không công khai</Space>
                        </Select.Option>
                        <Select.Option value="private">
                            <Space><LockOutlined style={{ color: '#ff4d4f' }} /> Riêng tư</Space>
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>

        {/* Modal Xem Video trong Danh sách phát */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TagsOutlined style={{ color: '#1677ff' }} />
                    <span>Video trong: {activePlaylist?.title}</span>
                </div>
            }
            open={isPlaylistItemsModalOpen}
            onCancel={() => setIsPlaylistItemsModalOpen(false)}
            footer={null}
            width={700}
        >
            <Spin spinning={loadingPlaylistItems}>
                <List
                    dataSource={playlistItems}
                    locale={{ 
                        emptyText: (
                            <Empty 
                                description={
                                    <span>
                                        Danh sách phát này chưa có video nào.<br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Để thêm video, hãy quay lại tab <b>Video</b> và nhấn vào biểu tượng <PlusOutlined style={{ color: '#52c41a' }} /> trên video bạn muốn thêm.
                                        </Text>
                                    </span>
                                } 
                            />
                        ) 
                    }}
                    renderItem={(item) => (
                        <List.Item key={item.id}>
                            <List.Item.Meta
                                avatar={<Image src={item.thumbnail} width={100} height={60} style={{ borderRadius: 4, objectFit: 'cover' }} />}
                                title={<Text strong>{item.title}</Text>}
                                description={`Vị trí: ${item.position + 1}`}
                            />
                            <Popconfirm
                                title="Gỡ video khỏi danh sách phát?"
                                onConfirm={() => handleRemoveFromPlaylist(item.id)}
                                okText="Gỡ"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                >
                                    Gỡ
                                </Button>
                            </Popconfirm>
                        </List.Item>
                    )}
                />
            </Spin>
        </Modal>

        {/* Modal Thêm HÀNG LOẠT vào Playlist */}
        <Modal
            title="Thêm các video đã chọn vào danh sách phát"
            open={isBulkPlaylistModalOpen}
            onCancel={() => setIsBulkPlaylistModalOpen(false)}
            footer={null}
        >
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Đã chọn {selectedVideoKeys.length} video. Vui lòng chọn danh sách phát đích:</Text>
            </div>
            <List
                loading={loadingPlaylists}
                dataSource={playlists}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<PlusOutlined />}
                                onClick={() => handleBulkAddToPlaylist(item.id)}
                                loading={bulkProcessing}
                            >
                                Thêm vào đây
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar shape="square" src={item.thumbnail} />}
                            title={item.title}
                            description={`${item.item_count} video • ${item.privacy === 'public' ? 'Công khai' : 'Riêng tư'}`}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'Bạn chưa có danh sách phát nào' }}
            />
            {playlists.length === 0 && !loadingPlaylists && (
                <Button 
                    type="dashed" 
                    block 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                        setIsBulkPlaylistModalOpen(false);
                        setIsCreatePlaylistModalOpen(true);
                    }}
                    style={{ marginTop: 16 }}
                >
                    Tạo danh sách phát mới
                </Button>
            )}
        </Modal>
    </div>
  );
};

export default ChannelContent;