'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Table, Modal, Form, Select, DatePicker, message, Spin, Input, Tooltip, Space
} from 'antd';
import { 
  getLeaveRecords, postLeaveRequest, postRevokeRequest, postExtensionRequest, deleteLeaveRecords, updateLeaveReason
} from '@/lib/attendance';
import dayjs from 'dayjs';
import Layout from '@/components/Layout';
import DOMPurify from 'dompurify';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const LeaveRequestPage = () => {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [extendModal, setExtendModal] = useState(false);
  const [reasonModal, setReasonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [extendForm] = Form.useForm();
  const [reasonForm] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  const fetchLeaveRecords = async () => {
    setLoading(true);
    try {
      const response = await getLeaveRecords({});
      console.log('API Response:', response);
      if (response.data && response.data.code === 1) {
        const rawData = response.data.data;
        const records = Array.isArray(rawData) ? rawData : rawData.row || [];
        setLeaveRecords(records);
      } else {
        throw new Error(response.data.msg || '获取申请记录失败');
      }
    } catch (error) {
      console.error('获取申请记录失败', error);
      message.error('获取申请记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenExtendModal = (record) => {
    setSelectedRecord(record);
    setExtendModal(true);
    extendForm.setFieldsValue({
      extendEndTime: dayjs(record.postponedTime || record.endTime)
    });
  };
  const handleCloseExtendModal = () => setExtendModal(false);

  const handleOpenReasonModal = (record) => {
    setSelectedRecord(record);
    setReasonModal(true);
    reasonForm.setFieldsValue({
      reason: record.reason
    });
  };
  const handleCloseReasonModal = () => setReasonModal(false);

  const handleSubmitLeave = async (values) => {
    try {
      const leaveData = {
        type: parseInt(values.type),
        startTime: values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss'),
        reason: values.reason
      };
      const response = await postLeaveRequest(leaveData);
      if (response.data && response.data.code === 1) {
        message.success('申请提交成功');
        handleCloseModal();
        fetchLeaveRecords();
      } else {
        throw new Error(response.data.msg || '提交申请失败');
      }
    } catch (error) {
      console.error('提交申请失败', error);
      message.error('提交申请失败，请稍后重试');
    }
  };

  const handleRevokeLeave = async (id) => {
    try {
      const response = await deleteLeaveRecords([id]);
      if (response.data && response.data.code === 1) {
        message.success('撤销申请成功');
        fetchLeaveRecords();
      } else {
        throw new Error(response.data.msg || '撤销申请失败');
      }
    } catch (error) {
      console.error('撤销申请失败', error);
      message.error('撤销申请失败，请稍后重试');
    }
  };

  const handleCancelLeave = async (id) => {
    try {
      const response = await postRevokeRequest(id);
      if (response.data && response.data.code === 1) {
        message.success('销假申请提交成功');
        fetchLeaveRecords();
      } else {
        throw new Error(response.data.msg || '提交销假申请失败');
      }
    } catch (error) {
      console.error('提交销假申请失败', error);
      message.error('提交销假申请失败，请稍后重试');
    }
  };

  const handleExtendLeave = async (values) => {
    try {
      const formattedExtendForm = {
        id: selectedRecord.id,
        endTime: values.extendEndTime.format('YYYY-MM-DDTHH:mm:ss')
      };
      const response = await postExtensionRequest(formattedExtendForm);
      if (response.data && response.data.code === 1) {
        message.success('延期申请提交成功');
        handleCloseExtendModal();
        fetchLeaveRecords();
      } else {
        throw new Error(response.data.msg || '提交延期申请失败');
      }
    } catch (error) {
      console.error('提交延期申请失败', error);
      message.error('提交延期申请失败，请稍后重试');
    }
  };

  const handleUpdateReason = async (values) => {
    try {
      if (!selectedRecord) {
        throw new Error('No record selected');
      }
      const response = await updateLeaveReason(selectedRecord.id, values.reason);
      if (response.data && response.data.code === 1) {
        message.success('请假原因更新成功');
        handleCloseReasonModal();
        fetchLeaveRecords();
      } else {
        throw new Error(response.data.msg || '更新请假原因失败');
      }
    } catch (error) {
      console.error('更新请假原因失败', error);
      message.error('更新请假原因失败，请稍后重试');
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 1: return '请假';
      case 2: return '出差';
      case 3: return '培训';
      default: return '未知';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return '未审批';
      case 1: return '审批中';
      case 2: return '已批准';
      case 3: return '已驳回';
      default: return '未知';
    }
  };

  const getRevokeStatusText = (status) => {
    switch (status) {
      case 0: return '未销假';
      case 1: return '已销假';
      default: return '未知';
    }
  };

  const getExtensionStatusText = (status) => {
    switch (status) {
      case 0: return '未延期';
      case 1: return '已延期';
      default: return '未知';
    }
  };

  const columns = [
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type) => getTypeText(type)
    },
    { 
      title: '开始时间', 
      dataIndex: 'startTime', 
      key: 'startTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    { 
      title: '结束时间', 
      dataIndex: 'endTime', 
      key: 'endTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    { 
      title: '状态', 
      dataIndex: 'approvalStatus', 
      key: 'approvalStatus',
      render: (status) => getStatusText(status)
    },
    {
      title: '销假状态',
      dataIndex: 'revokeStatus',
      key: 'revokeStatus',
      render: (status) => getRevokeStatusText(status)
    },
    {
      title: '延期状态',
      dataIndex: 'extensionStatus',
      key: 'extensionStatus',
      render: (status) => getExtensionStatusText(status)
    },
    {
      title: '延长至',
      dataIndex: 'postponedTime',
      key: 'postponedTime',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '无'
    },
    {
      title: '审批说明',
      dataIndex: 'approvalInstructions',
      key: 'approvalInstructions',
      render: (text) => text ? (
        <Tooltip title={<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} />}>
          <span>查看说明</span>
        </Tooltip>
      ) : '无'
    },
    {
      title: '请假原因',
      key: 'reason',
      render: (_, record) => (
        <Button onClick={() => handleOpenReasonModal(record)}>查看原因</Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleRevokeLeave(record.id)} disabled={record.approvalStatus !== 0}>撤销</Button>
          <Button onClick={() => handleCancelLeave(record.id)} disabled={record.approvalStatus !== 2 || record.revokeStatus === 1}>销假</Button>
          <Button onClick={() => handleOpenExtendModal(record)} disabled={record.approvalStatus !== 2 || record.revokeStatus === 1}>延期</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Typography.Title level={4}>申请管理</Typography.Title>
      <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: 16 }}>
        新建申请
      </Button>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={Array.isArray(leaveRecords) ? leaveRecords : []} rowKey="id" />
      </Spin>
      <Modal
        title="新建申请"
        open={openModal}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmitLeave} layout="vertical">
          <Form.Item
            name="type"
            label="申请类型"
            rules={[{ required: true, message: '请选择申请类型' }]}
          >
            <Select>
              <Option value="1">请假</Option>
              <Option value="2">出差</Option>
              <Option value="3">培训</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="申请原因"
            rules={[{ required: true, message: '请输入申请原因' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="延长假期"
        open={extendModal}
        onCancel={handleCloseExtendModal}
        footer={null}
      >
        <Form form={extendForm} onFinish={handleExtendLeave} layout="vertical">
          <Form.Item
            name="extendEndTime"
            label="延长至"
            rules={[{ required: true, message: '请选择延长的结束时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交延期申请
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="请假原因"
        open={reasonModal}
        onCancel={handleCloseReasonModal}
        footer={null}
      >
        <Form form={reasonForm} onFinish={handleUpdateReason} layout="vertical">
          <Form.Item
            name="reason"
            label="请假原因"
            rules={[{ required: true, message: '请输入请假原因' }]}
          >
            <TextArea rows={4} disabled={selectedRecord && selectedRecord.approvalStatus === 2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={selectedRecord && selectedRecord.approvalStatus === 2}>
              更新请假原因
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default LeaveRequestPage;