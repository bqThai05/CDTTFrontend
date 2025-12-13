import axios from 'axios';

// Backend bạn của bạn chạy ở cổng 8000 (theo docker-compose.yml)
const BASE_URL = 'http://127.0.0.1:8000/api/v1'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Backend bạn của bạn dùng "Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi (Ví dụ: Hết hạn token thì đá ra login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const registerUser = (userData) => api.post('/auth/register', userData);
const verifyEmail = (verificationData) => api.post('/auth/verify-email', verificationData);

// Workspace API
const getWorkspaces = () => api.get('/workspaces/');
const getWorkspaceDetails = (workspaceId) => api.get(`/workspaces/${workspaceId}`);
const createWorkspace = (workspaceData) => api.post('/workspaces/', workspaceData);
const getWorkspaceMembers = (workspaceId) => api.get(`/workspaces/${workspaceId}/members`);
const inviteUserToWorkspace = (workspaceId, inviteData) => api.post(`/workspaces/${workspaceId}/invite`, inviteData);
const getWorkspaceLogs = (workspaceId) => api.get(`/workspaces/${workspaceId}/logs`);
const createWorkspacePost = (workspaceId, postData) => api.post(`/workspaces/${workspaceId}/posts`, postData);
const publishWorkspacePostNow = (workspaceId, postId) => api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
const getWorkspacePosts = (workspaceId) => api.get(`/workspaces/${workspaceId}/posts`);
const updateWorkspacePost = (workspaceId, postId, postData) => api.put(`/workspaces/${workspaceId}/posts/${postId}`, postData);
const deleteWorkspacePost = (workspaceId, postId) => api.delete(`/workspaces/${workspaceId}/posts/${postId}`);
const updateWorkspaceMemberRole = (workspaceId, memberId, roleData) => api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, roleData);
const removeWorkspaceMember = (workspaceId, memberId) => api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
const leaveWorkspace = (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`);
const transferWorkspaceOwnership = (workspaceId, newOwnerId) => api.post(`/workspaces/${workspaceId}/transfer-ownership/${newOwnerId}`);
const getUserWorkspacePermissions = (workspaceId, userId) => api.get(`/workspaces/${workspaceId}/permissions/${userId}`);
const getWorkspaceInboxComments = (workspaceId) => api.get(`/workspaces/${workspaceId}/inbox`);
const assignCommentToUser = (commentId, assignData) => api.put(`/workspaces/inbox/comments/${commentId}/assign`, assignData);
const replyToComment = (commentId, replyData) => api.post(`/workspaces/inbox/comments/${commentId}/reply`, replyData);
const createPostComment = (workspaceId, postId, commentData) => api.post(`/workspaces/${workspaceId}/posts/${postId}/comments`, commentData);
const acceptWorkspaceInvitation = (token) => api.post('/workspaces/accept-invite', null, { params: { token } });

export {
  registerUser,
  verifyEmail,
  getWorkspaces,
  getWorkspaceDetails,
  createWorkspace,
  getWorkspaceMembers,
  inviteUserToWorkspace,
  getWorkspaceLogs,
  createWorkspacePost,
  publishWorkspacePostNow,
  getWorkspacePosts,
  updateWorkspacePost,
  deleteWorkspacePost,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
  transferWorkspaceOwnership,
  getUserWorkspacePermissions,
  getWorkspaceInboxComments,
  assignCommentToUser,
  replyToComment,
  createPostComment,
  acceptWorkspaceInvitation,
};
export default api;