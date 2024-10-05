'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Typography, Spin, Space } from 'antd';
import { getAllAttendanceRecords } from '@/lib/attendance';
import Layout from '@/components/Layout';

const { Search } = Input;

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const checkInStatusText = (status) => {
    const statusMap = {
      1: '正常',
      2: '迟到',
      3: '缺勤',
      4: '早退',
      5: '迟到加早退'
    };
    return statusMap[status] || '未知';
  };

  const circumstanceText = (circumstance) => {
    const circumstanceMap = {
      1: '没有',
      2: '请假',
      3: '出差',
      4: '培训'
    };
    return circumstanceMap[circumstance] || '未知';
  };

  const loadAttendanceRecords = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAttendanceRecords();
      if (response.data && response.data.code === 1) {
        setAttendanceRecords(response.data.data);
      } else {
        console.error('获取考勤记录失败:', response.data.msg);
      }
    } catch (error) {
      console.error('请求失败:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const columns = [
    {
      title: '员工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: '打卡日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
    },
    {
      title: '是否签到',
      dataIndex: 'isCheckIn',
      key: 'isCheckIn',
      render: (isCheckIn) => isCheckIn === 1 ? '是' : '否',
    },
    {
      title: '上班打卡时间',
      dataIndex: 'onWorkTime',
      key: 'onWorkTime',
    },
    {
      title: '下班打卡时间',
      dataIndex: 'offDutyTime',
      key: 'offDutyTime',
    },
    {
      title: '上班工作时间',
      dataIndex: 'workingTime',
      key: 'workingTime',
    },
    {
      title: '加班时长',
      dataIndex: 'overTime',
      key: 'overTime',
    },
    {
      title: '打卡状态',
      dataIndex: 'checkInStatus',
      key: 'checkInStatus',
      render: (status) => checkInStatusText(status),
    },
    {
      title: '特殊情况',
      dataIndex: 'circumstance',
      key: 'circumstance',
      render: (circumstance) => circumstanceText(circumstance),
    },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.employeeId.includes(searchQuery)
  );

  return (
    <Layout>
      <Typography.Title level={4}>考勤管理</Typography.Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search
          placeholder="输入员工工号查询"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey={(record) => `${record.employeeId}-${record.checkInDate}`}
          />
        </Spin>
      </Space>
    </Layout>
  );
};

export default AttendanceManagement;