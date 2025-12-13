import api from './api';

export const authorizeYouTube = () => api.get('/youtube/authorize');
export const getYouTubeCallback = (code) => api.get(`/youtube/callback?code=${code}`);
export const getYouTubeAccounts = () => api.get('/youtube/accounts');
export const getYouTubeChannels = (socialAccountId) => api.get(`/youtube/channels/${socialAccountId}`);
export const getYouTubeChannelVideos = (channelId) => api.get(`/youtube/channels/${channelId}/videos`);
export const getYouTubeChannelAnalytics = (channelId, params) => api.get(`/youtube/channels/${channelId}/analytics`, { params });
