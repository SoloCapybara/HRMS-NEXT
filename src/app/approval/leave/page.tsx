'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Table, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getLeaveRequest, saveApproval } from '@/lib/approval';
import { getAllDepartments } from '@/lib/departments';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;

const QuillEditor = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const LeaveApprovalPage = () => {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    deptId: null,
    type: null,
    approvalStatus: null
  });
  const [approvalInfo, setApprovalInfo] = useState([]);
  const [total, setTotal] = useState(0);
  const [departmentList, setDepartmentList] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    console.log('Component mounted, fetching departments');
    fetchDepartments();
    getLeaveReq();
  }, []);

  useEffect(() => {
    console.log('Params changed, fetching leave requests', params);
    getLeaveReq();
  }, [params]);

  useEffect(() => {
    console.log('approvalInfo updated:', approvalInfo);
  }, [approvalInfo]);

  const fetchDepartments = async () => {
    try {
      const res = await getAllDepartments();
      if (res.data && res.data.code === 1) {
        console.log('Departments fetched successfully', res.data.data);
        setDepartmentList(res.data.data);
      } else {
        throw new Error(res.data?.msg || '获取部门数据失败');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error(error.message || "获取部门数据失败");
    }
  };

  const getLeaveReq = async () => {
    setLoading(true);
    try {
      console.log('Fetching leave requests with params:', params);
      const res = await getLeaveRequest(params);
      console.log('API response:', res);
      if (res.data && res.data.code === 1) {
        console.log('Leave requests fetched successfully', res.data.data);
        setApprovalInfo(res.data.data.row);
        setTotal(res.data.data.total);
        console.log('Updated approvalInfo:', res.data.data.row);
        console.log('Updated total:', res.data.data.total);
      } else {
        throw new Error(res.data?.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      message.error(error.message || '操作失败，请联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!currentRecord) {
        throw new Error('请选择要审批的请假记录');
      }
      console.log('Submitting approval with values:', values);
      const response = await saveApproval({
        id: currentRecord.id,
        approvalStatus: values.approvalStatus,
        approvalInstructions: values.approvalInstructions
      });
      
      if (response.data.code === 1) {
        console.log('Approval submitted successfully');
        message.success('请假审批操作成功');
        setDialogVisible(false);
        getLeaveReq();
      } else {
        throw new Error(response.data.msg || '审批操作失败');
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      message.error(error.message || '审批操作失败，请联系管理员');
    }
  };

  const getLeaveTypeText = (type) => {
    const types = {
      "1":"请假",
      "2":"出差",
      "3":"培训"
    };
    return types[type] || '未知类型';
  };

  const getApprovalStatusText = (status) => {
    const statuses = {
      "0":"未审批",
      "1":"审批中",
      "2":"批准假期",
      "3":"驳回请假申请"
    };
    return statuses[status] || '未知状态';
  };

  const onEditApproval = (record) => {
    form.setFieldsValue({
      ...record,
      approvalStatus: record.approvalStatus.toString(),
    });
    setCurrentRecord(record);
    setDialogVisible(true);
  };

  const showReasonModal = (record) => {
    setCurrentRecord(record);
    setReasonModalVisible(true);
  };

  const columns = [
    { title: '请假编号', dataIndex: 'id', key: 'id' },
    { title: '员工名称', dataIndex: 'employeeName', key: 'employeeName' },
    { title: '所属部门', dataIndex: 'deptName', key: 'deptName' },
    { 
      title: '请假类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type) => getLeaveTypeText(type)
    },
    { 
      title: '开始时间', 
      dataIndex: 'startTime', 
      key: 'startTime',
      render: (text) => new Date(text).toLocaleString()
    },
    { 
      title: '结束时间', 
      dataIndex: 'endTime', 
      key: 'endTime',
      render: (text) => new Date(text).toLocaleString()
    },
    { 
      title: '发起请假时间', 
      dataIndex: 'applyTime', 
      key: 'applyTime',
      render: (text) => new Date(text).toLocaleString()
    },
    { 
      title: '审批状态', 
      dataIndex: 'approvalStatus', 
      key: 'approvalStatus',
      render: (status) => getApprovalStatusText(status)
    },
    { 
      title: '审批说明', 
      dataIndex: 'approvalInstructions', 
      key: 'approvalInstructions',
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
    },
    {
      title: '请假原因',
      key: 'reason',
      render: (_, record) => (
        <Button onClick={() => showReasonModal(record)}>
          查看原因
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => onEditApproval(record)}>
          审批请假
        </Button>
      ),
    },
  ];

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="所在部门">
          <Select
            style={{ width: 200 }}
            value={params.deptId}
            onChange={(value) => {
              console.log('Department selected:', value);
              setParams(prevParams => {
                const newParams = { ...prevParams, deptId: value };
                console.log('New params after department selection:', newParams);
                return newParams;
              });
            }}
          >
            <Option value={null}>全部</Option>
            {departmentList.map((dept) => (
              <Option key={dept.deptId} value={dept.deptId}>{dept.deptName}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="请假类型">
          <Select
            style={{ width: 200 }}
            value={params.type}
            onChange={(value) => {
              console.log('Leave type selected:', value);
              setParams(prevParams => {
                const newParams = { ...prevParams, type: value };
                console.log('New params after leave type selection:', newParams);
                return newParams;
              });
            }}
          >
            <Option value={null}>全部</Option>
            <Option value={1}>请假</Option>
            <Option value={2}>出差</Option>
            <Option value={3}>培训</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => {
            console.log('Search button clicked');
            setParams(prevParams => {
              const newParams = { ...prevParams, page: 1 };
              console.log('New params after search:', newParams);
              return newParams;
            });
          }} icon={<SearchOutlined />}>
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={() => {
            console.log('Reset button clicked');
            setParams(prevParams => {
              const newParams = {
                ...prevParams,
                page: 1,
                deptId: null,
                type: null
              };
              console.log('New params after reset:', newParams);
              return newParams;
            });
          }}>
            重置
          </Button>
        </Form.Item>
      </Form>
      <Table
        key={`${params.page}-${params.pageSize}`}
        columns={columns}
        dataSource={approvalInfo}
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: total,
          onChange: (page, pageSize) => {
            console.log('Pagination changed:', { page, pageSize });
            setParams((prevParams) => ({
              ...prevParams,
              page: page,
              pageSize: pageSize
            }));
          },
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
      <Modal
        title="审批操作"
        visible={dialogVisible}
        onOk={onSubmit}
        onCancel={() => {
          setDialogVisible(false);
          form.resetFields();
          setCurrentRecord(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="approvalStatus"
            label="审批操作"
            rules={[{ required: true, message: '请选择审批状态' }]}
          >
            <Select>
              <Option value="0">未审批</Option>
              <Option value="1">审批中</Option>
              <Option value="2">批准假期</Option>
              <Option value="3">驳回请假申请</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="approvalInstructions"
            label="审批说明"
            rules={[{ required: true, message: '请填写审批说明' }]}
          >
            <QuillEditor theme="snow" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="请假原因"
        visible={reasonModalVisible}
        onCancel={() => {
          setReasonModalVisible(false);
          setCurrentRecord(null);
        }}
        footer={null}
      >
        {currentRecord && (
          <p>{currentRecord.reason}</p>
        )}
      </Modal>
    </>
  );
};

export default LeaveApprovalPage;