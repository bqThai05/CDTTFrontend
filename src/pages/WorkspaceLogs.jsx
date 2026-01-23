import React, { useEffect, useState, useCallback } from 'react';
import { Table, message, Spin } from 'antd';
import { getWorkspaceLogs } from '../services/api';

const WorkspaceLogs = ({ workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkspaceLogs(workspaceId);
      setLogs(response.data);
    } catch (error) {
      message.error('Lỗi khi tải nhật ký hoạt động.');
      console.error('Fetch logs error:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchLogs();
  }, [workspaceId, fetchLogs]);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải nhật ký...">
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        pagination={false}
      />
    </Spin>
  );
};

export default WorkspaceLogs;
