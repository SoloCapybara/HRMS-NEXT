'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Table, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getLeaveRequest, updateRevokeStatus } from '@/lib/approval';
import { getAllDepartments } from '@/lib/departments';

const { Option } = Select;

const RevokeApprovalPage = () => {
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeParams, setRevokeParams] = useState({
    page: 1,
    pageSize: 10,
    deptId: null,
    type: null,
    approvalStatus: 2,
    revokeStatus: 0
  });
  const [revokeApprovalInfo, setRevokeApprovalInfo] = useState([]);
  const [revokeTotal, setRevokeTotal] = useState(0);
  const [departmentList, setDepartmentList] = useState([]);
  const [revokeDialogVisible, setRevokeDialogVisible] = useState(false);
  const [revokeForm] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    console.log('Component mounted, fetching departments');
    fetchDepartments();
    getRevokeReq();
  }, []);

  useEffect(() => {
    console.log('Params changed, fetching revoke requests', revokeParams);
    getRevokeReq();
  }, [revokeParams]);

  useEffect(() => {
    console.log('revokeApprovalInfo updated:', revokeApprovalInfo);
  }, [revokeApprovalInfo]);

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

  const getRevokeReq = async () => {
    setRevokeLoading(true);
    try {
      console.log('Fetching revoke requests with params:', revokeParams);
      const res = await getLeaveRequest(revokeParams);
      console.log('API response:', res);
      if (res.data && res.data.code === 1) {
        console.log('Revoke requests fetched successfully', res.data.data);
        setRevokeApprovalInfo(res.data.data.row);
        setRevokeTotal(res.data.data.total);
        console.log('Updated revokeApprovalInfo:', res.data.data.row);
        console.log('Updated revokeTotal:', res.data.data.total);
      } else {
        throw new Error(res.data?.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('Error fetching revoke requests:', error);
      message.error(error.message || '操作失败，请联系管理员');
    } finally {
      setRevokeLoading(false);
    }
  };

  const onSubmitRevoke = async () => {
    try {
      const values = await revokeForm.validateFields();
      if (!currentRecord) {
        throw new Error('请选择要审批的销假记录');
      }
      console.log('Submitting revoke approval with values:', values);
      const response = await updateRevokeStatus({ 
        id: currentRecord.id,
        revokeStatus: values.revokeStatus
      });

      if(response.data.code === 1){
        console.log('Revoke approval submitted successfully');
        message.success('销假审批操作成功');
        setRevokeDialogVisible(false);
        getRevokeReq();
      } else {
        throw new Error(response.data.msg || "审批操作失败");
      }
    } catch (error) {
      console.error('Error in onSubmitRevoke:', error);
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

  const getRevokeStatusText = (status) => {
    const statuses = {
      "0":"未销假",
      "1":"已申请",
      "2":"已销假",
      "3":"销假超时"
    };
    return statuses[status] || '未知状态';
  };

  const onManageRevoke = (record) => {
    revokeForm.setFieldsValue({
      ...record,
      revokeStatus: record.revokeStatus.toString(),
    });
    setCurrentRecord(record);
    setRevokeDialogVisible(true);
  };

  const revokeColumns = [
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
      title: '发起销假时间', 
      dataIndex: 'cancelTime', 
      key: 'cancelTime',
      render: (text) => text ? new Date(text).toLocaleString() : '未发起销假'
    },
    { 
      title: '销假状态', 
      dataIndex: 'revokeStatus', 
      key: 'revokeStatus',
      render: (status) => getRevokeStatusText(status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => onManageRevoke(record)}>
          审批销假
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
            value={revokeParams.deptId}
            onChange={(value) => {
              console.log('Department selected:', value);
              setRevokeParams(prevParams => {
                const newParams = { ...prevParams, deptId: value, page: 1 };
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
            value={revokeParams.type}
            onChange={(value) => {
              console.log('Leave type selected:', value);
              setRevokeParams(prevParams => {
                const newParams = { ...prevParams, type: value, page: 1 };
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
            setRevokeParams(prevParams => {
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
            setRevokeParams(prevParams => {
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
        key={`${revokeParams.page}-${revokeParams.pageSize}`}
        columns={revokeColumns}
        dataSource={revokeApprovalInfo}
        rowKey="id"
        loading={revokeLoading}
        pagination={{
          current: revokeParams.page,
          pageSize: revokeParams.pageSize,
          total: revokeTotal,
          onChange: (page, pageSize) => {
            console.log('Pagination changed:', { page, pageSize });
            setRevokeParams((prevParams) => ({
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
        title="管理销假状态"
        visible={revokeDialogVisible}
        onOk={onSubmitRevoke}
        onCancel={() => {
          setRevokeDialogVisible(false);
          revokeForm.resetFields();
          setCurrentRecord(null);
        }}
      >
        <Form form={revokeForm} layout="vertical">
          <Form.Item
            name="revokeStatus"
            label="销假状态"
            rules={[{ required: true, message: '请选择销假状态' }]}
          >
            <Select>
              <Option value="0">未销假</Option>
              <Option value="1">已申请</Option>
              <Option value="2">已销假</Option>
              <Option value="3">销假超时</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RevokeApprovalPage;