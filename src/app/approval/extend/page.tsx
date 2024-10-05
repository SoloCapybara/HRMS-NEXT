'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Table, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getLeaveRequest, updateExtensionStatus } from '@/lib/approval';
import { getAllDepartments } from '@/lib/departments';

const { Option } = Select;

const ExtendApprovalPage = () => {
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendParams, setExtendParams] = useState({
    page: 1,
    pageSize: 10,
    deptId: null,
    type: null,
    approvalStatus: 2,
    revokeStatus: 0
  });
  const [extendApprovalInfo, setExtendApprovalInfo] = useState([]);
  const [extendTotal, setExtendTotal] = useState(0);
  const [departmentList, setDepartmentList] = useState([]);
  const [extendDialogVisible, setExtendDialogVisible] = useState(false);
  const [extendForm] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    console.log('Component mounted, fetching departments and extend requests');
    fetchDepartments();
    getExtendReq();
  }, []);

  useEffect(() => {
    console.log('Params changed, fetching extend requests', extendParams);
    getExtendReq();
  }, [extendParams]);

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

  const getExtendReq = async () => {
    setExtendLoading(true);
    try {
      console.log('Fetching extend requests with params:', extendParams);
      const res = await getLeaveRequest(extendParams);
      console.log('API response:', res);
      if (res.data && res.data.code === 1) {
        console.log('Extend requests fetched successfully', res.data.data);
        setExtendApprovalInfo(res.data.data.row);
        setExtendTotal(res.data.data.total);
      } else {
        throw new Error(res.data?.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('Error fetching extend requests:', error);
      message.error(error.message || '操作失败，请联系管理员');
    } finally {
      setExtendLoading(false);
    }
  };

  const onSubmitExtend = async () => {
    try {
      const values = await extendForm.validateFields();
      if (!currentRecord) {
        throw new Error('请选择要审批的延假记录');
      }
      console.log('Submitting extend approval with values:', values);
      const response = await updateExtensionStatus({ 
        id: currentRecord.id,
        extensionStatus: values.extensionStatus
      });

      if(response.data.code === 1){
        console.log('Extend approval submitted successfully');
        message.success('延假审批操作成功');
        setExtendDialogVisible(false);
        getExtendReq();
      } else {
        throw new Error(response.data.msg || "审批操作失败");
      }
    } catch (error) {
      console.error('Error in onSubmitExtend:', error);
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

  const getExtensionStatusText = (status) => {
    const statuses = {
      "0":"未延期",
      "1":"申请延期",
      "2":"同意延期",
      "3":"不同意延期"
    };
    return statuses[status] || '未知状态';
  };

  const onManageExtend = (record) => {
    extendForm.setFieldsValue({
      ...record,
      extensionStatus: record.extensionStatus.toString(),
    });
    setCurrentRecord(record);
    setExtendDialogVisible(true);
  };

  const extendColumns = [
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
      title: '延长日期至', 
      dataIndex: 'postponedTime', 
      key: 'postponedTime',
      render: (text) => text ? new Date(text).toLocaleString() : '未延期'
    },
    { 
      title: '延假发起时间', 
      dataIndex: 'extensionTime', 
      key: 'extensionTime',
      render: (text) => text ? new Date(text).toLocaleString() : '未发起延假'
    },
    { 
      title: '延假状态', 
      dataIndex: 'extensionStatus', 
      key: 'extensionStatus',
      render: (status) => getExtensionStatusText(status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => onManageExtend(record)}>
          修改状态
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
            value={extendParams.deptId}
            onChange={(value) => {
              console.log('Department selected:', value);
              setExtendParams(prevParams => {
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
            value={extendParams.type}
            onChange={(value) => {
              console.log('Leave type selected:', value);
              setExtendParams(prevParams => {
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
            setExtendParams(prevParams => {
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
            setExtendParams(prevParams => {
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
        key={`${extendParams.page}-${extendParams.pageSize}`}
        columns={extendColumns}
        dataSource={extendApprovalInfo}
        rowKey="id"
        loading={extendLoading}
        pagination={{
          current: extendParams.page,
          pageSize: extendParams.pageSize,
          total: extendTotal,
          onChange: (page, pageSize) => {
            console.log('Pagination changed:', { page, pageSize });
            setExtendParams((prevParams) => ({
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
        title="延假审批操作"
        open={extendDialogVisible}
        onOk={onSubmitExtend}
        onCancel={() => {
          setExtendDialogVisible(false);
          extendForm.resetFields();
          setCurrentRecord(null);
        }}
      >
        <Form form={extendForm} layout="vertical">
          <Form.Item
            name="extensionStatus"
            label="延假状态"
            rules={[{ required: true, message: '请选择延假状态' }]}
          >
            <Select>
              <Option value="0">未延期</Option>
              <Option value="1">申请延期</Option>
              <Option value="2">同意延期</Option>
              <Option value="3">不同意延期</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExtendApprovalPage;