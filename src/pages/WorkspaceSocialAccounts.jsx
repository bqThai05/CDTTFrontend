import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, message, Space, Typography, Modal, Select, Avatar, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, YoutubeFilled, FacebookFilled, LinkOutlined } from '@ant-design/icons';
import { 
  getWorkspaceSocialAccounts, 
  linkSocialAccountToWorkspace, 
  unlinkSocialAccountFromWorkspace,
  getAllSocialAccounts,
  getYouTubeChannels
} from '../services/api';

const { Text, Title } = Typography;
const { Option } = Select;

const WorkspaceSocialAccounts = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const fetchWorkspaceAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspaceSocialAccounts(workspaceId);
      const rawAccounts = response.data || [];
      
      // Làm giàu dữ liệu cho tài khoản YouTube
      const enrichedAccounts = await Promise.all(rawAccounts.map(async (acc) => {
        if (acc.platform === 'youtube' && (!acc.name || !acc.avatar_url)) {
          try {
            const channelsRes = await getYouTubeChannels(acc.id);
            if (channelsRes.data && channelsRes.data.length > 0) {
              const channel = channelsRes.data[0];
              return {
                ...acc,
                name: channel.title || acc.name || acc.username,
                avatar_url: channel.thumbnail || acc.avatar_url || acc.avatar
              };
            }
          } catch (e) {
            console.warn("Lỗi lấy chi tiết kênh YouTube:", e);
          }
        }
        return acc;
      }));
      
      setSocialAccounts(enrichedAccounts);
    } catch (error) {
      console.error('Fetch workspace social accounts error:', error);
      setSocialAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const fetchAvailableAccounts = async () => {
    try {
      const response = await getAllSocialAccounts();
      const rawAccounts = response.data || [];
      
      // Lọc ra những tài khoản chưa được liên kết với workspace này
      const linkedIds = socialAccounts.map(acc => acc.id);
      const filtered = rawAccounts.filter(acc => !linkedIds.includes(acc.id));
      
      // Làm giàu dữ liệu cho tài khoản YouTube
      const enrichedAccounts = await Promise.all(filtered.map(async (acc) => {
        if (acc.platform === 'youtube' && (!acc.name || !acc.avatar_url)) {
          try {
            const channelsRes = await getYouTubeChannels(acc.id);
            if (channelsRes.data && channelsRes.data.length > 0) {
              const channel = channelsRes.data[0];
              return {
                ...acc,
                name: channel.title || acc.name || acc.username,
                avatar_url: channel.thumbnail || acc.avatar_url || acc.avatar
              };
            }
          } catch (e) {
            console.warn("Lỗi lấy chi tiết kênh YouTube:", e);
          }
        }
        return acc;
      }));
      
      setAvailableAccounts(enrichedAccounts);
    } catch (error) {
      console.error('Fetch all social accounts error:', error);
      message.error('Không thể tải danh sách tài khoản cá nhân.');
    }
  };

  useEffect(() => {
    fetchWorkspaceAccounts();
  }, [fetchWorkspaceAccounts]);

  const handleLinkAccount = async () => {
    if (!selectedAccountId) {
      message.warning('Vui lòng chọn một tài khoản để liên kết!');
      return;
    }
    setLoading(true);
    try {
      await linkSocialAccountToWorkspace(workspaceId, selectedAccountId);
      message.success('Liên kết tài khoản thành công!');
      setIsModalVisible(false);
      setSelectedAccountId(null);
      fetchWorkspaceAccounts();
    } catch (error) {
      console.error('Link account error:', error);
      message.error('Lỗi khi liên kết tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async (socialAccountId) => {
    setLoading(true);
    try {
      await unlinkSocialAccountFromWorkspace(workspaceId, socialAccountId);
      message.success('Đã hủy liên kết tài khoản!');
      fetchWorkspaceAccounts();
    } catch (error) {
      console.error('Unlink account error:', error);
      message.error('Lỗi khi hủy liên kết tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tài khoản',
      key: 'account',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar_url || record.avatar} icon={record.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} />
          <Text strong>{record.name || record.username || record.social_id || 'Không tên'}</Text>
        </Space>
      ),
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <Tag color={platform === 'youtube' ? 'red' : 'blue'} icon={platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />}>
          {platform.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'ID Mạng xã hội',
      dataIndex: 'social_id',
      key: 'social_id',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<DeleteOutlined />} 
          danger 
          onClick={() => handleUnlinkAccount(record.id)}
        >
          Hủy liên kết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tài khoản mạng xã hội đã liên kết</Title>
        <Button 
          type="primary" 
          icon={<LinkOutlined />} 
          onClick={() => {
            fetchAvailableAccounts();
            setIsModalVisible(true);
          }}
        >
          Liên kết tài khoản mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={socialAccounts} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'Chưa có tài khoản mạng xã hội nào được liên kết với workspace này.' }}
      />

      <Modal
        title="Liên kết tài khoản mạng xã hội"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleLinkAccount}
        confirmLoading={loading}
        okText="Liên kết"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Chọn một tài khoản từ danh sách tài khoản cá nhân của bạn để thêm vào workspace này.</Text>
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn tài khoản..."
          onChange={setSelectedAccountId}
          value={selectedAccountId}
        >
          {availableAccounts.map(acc => (
            <Option key={acc.id} value={acc.id}>
              <Space>
                <Avatar size="small" src={acc.avatar_url || acc.avatar} icon={acc.platform === 'youtube' ? <YoutubeFilled /> : <FacebookFilled />} />
                {acc.name || acc.username || acc.social_id || 'Không tên'} ({acc.platform})
              </Space>
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default WorkspaceSocialAccounts;
