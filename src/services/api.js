// src/services/api.js
import axios from 'axios';

// Backend server URL
export const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'https://api-socialpro-753322230318.asia-southeast1.run.app/api/v1'; 
//export const BASE_URL = 'http://localhost:8000/api/v1'; 
export const uploadMedia = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const createYouTubePost = (data) => {
    // Chuyển sang FormData để gửi kèm ảnh (nếu có)
    const formData = new FormData();
    formData.append('social_account_id', data.social_account_id);
    formData.append('content', data.content);
    
    if (data.image_file) {
        formData.append('image_file', data.image_file);
    }

    return api.post('/youtube/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserProfile = () => {
    return api.get('/users/me');
};

// ============================================================
// CONFIG AXIOS INTERCEPTORS
// ============================================================

// Request Interceptor: Tự động gắn Token vào Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động đá ra Login nếu Token hết hạn (Lỗi 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu request có flag silent thì không log error ra console
    if (!error.config?.silent) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Tránh reload vòng lặp nếu đang ở trang login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ... Code cũ giữ nguyên

// Xóa tài khoản liên kết
export const deleteSocialAccount = (id) => {
    return api.delete(`/youtube/accounts/${id}`); 
};
export const getPostHistory = (params) => {
    return api.get('/posts/history', { params }); 
};

export const retryPost = (postId) => {
    return api.post(`/posts/${postId}/retry`);
};
export const getRealYoutubeVideos = () => {
    return api.get('/youtube/videos');
};

export const getCalendarPosts = (params) => {
    return api.get('/posts/calendar', { params });
};
export const getVideosByAccountId = (socialAccountId) => {
    return api.get(`/youtube/${socialAccountId}/videos`);
};

// ============================================================
// 1. AUTH API (ĐĂNG NHẬP / ĐĂNG KÝ)
// ============================================================

// 🔥 QUAN TRỌNG: Hàm Login chuẩn cho FastAPI (x-www-form-urlencoded)
export const login = (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username); // FastAPI yêu cầu field này tên là 'username' (dù là email)
  formData.append('password', password);
  
  return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const registerUser = (userData) => api.post('/auth/register', userData);
export const verifyEmail = (verificationData) => api.post('/auth/verify-email', verificationData);
export const forgotPassword = (email) => api.post('/password-reset/forgot-password', { email });
export const resetPassword = (data) => api.post('/password-reset/reset-password', data);
export const changeUserPassword = (data) => api.post('/password-reset/change-password', data);

// ============================================================
// 2. USER API
// ============================================================
export const getCurrentUser = () => api.get('/users/me'); 
export const updateUserProfile = (data) => api.put('/users/me', data); 

// ============================================================
// 3. WORKSPACE API
// ============================================================
export const getWorkspaces = () => api.get('/workspaces');
export const getWorkspaceDetails = (workspaceId) => api.get(`/workspaces/${workspaceId}`);
export const createWorkspace = (workspaceData) => api.post('/workspaces', workspaceData);
export const updateWorkspace = (workspaceId, data) => api.put(`/workspaces/${workspaceId}`, data);
export const deleteWorkspace = (workspaceId) => api.delete(`/workspaces/${workspaceId}`);

// Members & Permissions
export const getWorkspaceMembers = (workspaceId) => api.get(`/workspaces/${workspaceId}/members`);
export const inviteUserToWorkspace = (workspaceId, inviteData) => api.post(`/workspaces/${workspaceId}/invite`, inviteData);
export const updateWorkspaceMemberRole = (workspaceId, memberId, roleData) => api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, roleData);
export const removeWorkspaceMember = (workspaceId, memberId) => api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
export const leaveWorkspace = (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`);
export const transferWorkspaceOwnership = (workspaceId, newOwnerId) => api.post(`/workspaces/${workspaceId}/transfer-ownership/${newOwnerId}`);
export const getUserWorkspacePermissions = (workspaceId, userId) => api.get(`/workspaces/${workspaceId}/permissions/${userId}`);
export const acceptWorkspaceInvitation = (token) => api.post('/workspaces/accept-invite', null, { params: { token } });

// Social Accounts in Workspace
export const getWorkspaceSocialAccounts = (workspaceId) => api.get(`/workspaces/${workspaceId}/social-accounts`);
export const linkSocialAccountToWorkspace = (workspaceId, socialAccountId) => api.post(`/workspaces/${workspaceId}/social-accounts`, { social_account_id: socialAccountId });
export const unlinkSocialAccountFromWorkspace = (workspaceId, socialAccountId) => api.delete(`/workspaces/${workspaceId}/social-accounts/${socialAccountId}`);

// Inbox & Logs
export const getWorkspaceLogs = (workspaceId) => api.get(`/workspaces/${workspaceId}/logs`);
export const getWorkspaceInboxComments = (workspaceId) => api.get(`/workspaces/${workspaceId}/inbox`);
export const assignCommentToUser = (commentId, assignData) => api.put(`/workspaces/inbox/comments/${commentId}/assign`, assignData);
export const replyToComment = (commentId, replyData) => api.post(`/workspaces/inbox/comments/${commentId}/reply`, replyData);

// ============================================================
// 4. POSTS & CONTENT API
// ============================================================
export const getWorkspacePosts = (workspaceId) => api.get(`/workspaces/${workspaceId}/posts`);
export const createWorkspacePost = (workspaceId, postData) => api.post(`/workspaces/${workspaceId}/posts`, postData);
export const updateWorkspacePost = (workspaceId, postId, postData) => api.put(`/workspaces/${workspaceId}/posts/${postId}`, postData);
export const deleteWorkspacePost = (workspaceId, postId) => api.delete(`/workspaces/${workspaceId}/posts/${postId}`);
export const publishWorkspacePostNow = (workspaceId, postId) => api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
export const createPostComment = (workspaceId, postId, commentData) => api.post(`/workspaces/${workspaceId}/posts/${postId}/comments`, commentData);

// 🔥 Lấy thống kê bài viết (Dùng cho Dashboard)
export const getWorkspaceAnalytics = (workspaceId) => api.get(`/posts/${workspaceId}/analytics`);

// ============================================================
// 5. SOCIAL ACCOUNT API (Tổng hợp & YouTube)
// ============================================================
// Lấy danh sách tài khoản MXH
export const getAllSocialAccounts = () => api.get('/social'); 
// Ngắt kết nối MXH
export const disconnectSocialAccount = (id) => api.delete(`/social/${id}`);
// Lấy kênh Youtube (để tính view/sub)
export const getYouTubeChannels = (socialAccountId) => api.get(`/youtube/channels/${socialAccountId}`, { silent: true });
// Lấy video của kênh Youtube
export const getYouTubeChannelVideos = (channelId) => api.get(`/youtube/channels/${channelId}/videos`);
export const refreshYouTubeChannelData = (channelId) => api.post(`/youtube/channels/${channelId}/videos/refresh`);
// Cập nhật video Youtube
export const updateYouTubeVideo = (videoId, data) => api.put(`/youtube/videos/${videoId}`, data);
// Xóa video Youtube
export const deleteYouTubeVideo = (videoId) => api.delete(`/youtube/videos/${videoId}`);
// Lấy bình luận của video Youtube
export const getYouTubeVideoComments = (videoId) => api.get(`/youtube/videos/${videoId}/comments`);
// Trả lời bình luận Youtube
export const replyToYouTubeComment = (commentId, text) => api.post(`/youtube/comments/${commentId}/reply`, { text });
// Bình luận vào video Youtube
export const commentOnYouTubeVideo = (videoId, text) => api.post(`/youtube/videos/${videoId}/comments`, { text });
// Lấy danh sách playlist của kênh Youtube
export const getYouTubeChannelPlaylists = (channelId) => api.get(`/youtube/channels/${channelId}/playlists`);
// Lấy danh sách video trong playlist
export const getYouTubePlaylistItems = (playlistId) => api.get(`/youtube/playlists/${playlistId}/items`);
// Tạo danh sách phát mới
export const createYouTubePlaylist = (data) => api.post('/youtube/playlists', data);
// Cập nhật danh sách phát
export const updateYouTubePlaylist = (playlistId, data) => api.put(`/youtube/playlists/${playlistId}`, data);
// Xóa danh sách phát
export const deleteYouTubePlaylist = (playlistId) => api.delete(`/youtube/playlists/${playlistId}`);
// Thêm video vào danh sách phát
export const addVideoToYouTubePlaylist = (playlistId, data) => api.post(`/youtube/playlists/${playlistId}/items`, data);
// Xóa video khỏi danh sách phát
export const deleteYouTubePlaylistItem = (playlistId, itemId) => api.delete(`/youtube/playlists/${playlistId}/items/${itemId}`);

// ============================================================
// 6. FACEBOOK API
// ============================================================
export const getFacebookPages = (socialAccountId) => api.get(`/facebook/pages/${socialAccountId}`);
export const getFacebookPagePosts = (pageId) => api.get(`/facebook/pages/${pageId}/posts`);
export const getFacebookPageAnalytics = (pageId, params) => api.get(`/facebook/pages/${pageId}/analytics`, { params });
export const postToYouTube = (data) => {
    // data bao gồm: title, description, tags, category_id, privacy_status, file, thumbnail_file, social_account_id, is_shorts
    const formData = new FormData();
    console.log('--- postToYouTube Payload Debug ---');
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
             console.log(`${key}:`, data[key]);
             // Nếu là mảng (ví dụ tags), append từng cái
             if (Array.isArray(data[key])) {
                 data[key].forEach(val => {
                     formData.append(key, val);
                 });
             } else {
                 formData.append(key, data[key]);
             }
        }
    });
    console.log('--- End Payload Debug ---');
    return api.post('/youtube/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const postToFacebook = (data) => api.post(`/facebook/pages/${data.page_id}/posts`, data);

// Đăng hàng loạt (Gọi API schedule cũ nhưng với tham số publish now)
export const postBulk = (workspaceId, data) => api.post(`/workspaces/${workspaceId}/publish-now`, data);

// ============================================================
// 7. ANALYTICS API
// ============================================================
export const getAnalyticsGrowthChart = () => api.get('/analytics/growth-chart');
export const syncAnalyticsData = () => api.post('/analytics/sync');

// ============================================================
// EXPORT TẤT CẢ
// ============================================================
export default api;
