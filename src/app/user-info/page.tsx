'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Input, Select, Button, Table, Form, 
  Modal, message, Space, Popconfirm, InputNumber
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { 
  fetchEmployeeData, updateEmployeeProfile, deleteEmployees, 
  addEmployee, getUserInfo 
} from '@/lib/user';
import { getAllDepartments } from '@/lib/departments';
import Layout from '@/components/Layout';

const { Option } = Select;

const UserInfoPage = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadDepartments();
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await getUserInfo();
      if (response.data && response.data.code === 1) {
        setCurrentUser(response.data.data);
      } else {
        throw new Error(response.data?.msg || '获取用户信息失败');
      }
    } catch (error) {
      console.error("获取用户信息失败", error);
      message.error('获取用户信息失败，请检查网络或重新登录');
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await getAllDepartments();
      if (response.data && response.data.code === 1) {
        setDepartments(response.data.data);
      } else {
        message.error('获取部门数据失败');
      }
    } catch (error) {
      console.error("获取部门数据失败", error);
      message.error('获取部门数据失败，请检查网络或联系管理员');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchEmployeeData();
      if (response.data && response.data.code === 1) {
        setAllUsers(response.data.data);
        setUsers(response.data.data);
      } else {
        message.error('获取用户数据失败');
      }
    } catch (error) {
      console.error("获取用户数据失败", error);
      message.error('获取用户数据失败，请检查网络或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filteredUsers = allUsers.filter(user => 
      (user.employeeId.includes(searchKeyword) || user.username.includes(searchKeyword)) &&
      (selectedDepartment === '' || user.department === parseInt(selectedDepartment))
    );
    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSelectedDepartment('');
    setUsers(allUsers);
  };

  const showModal = (mode, user = null) => {
    setModalMode(mode);
    setEditingUser(user);
    if (mode === 'edit' && user) {
      form.setFieldsValue({
        department: user.department,
        position: user.position,
        role: user.role
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (modalMode === 'add') {
        handleAddUser(values);
      } else {
        handleEditUser(values);
      }
    });
  };

  const handleAddUser = async (values) => {
    try {
      const response = await addEmployee({ 
        ...values, 
        role: 0,
        gender: parseInt(values.gender),
        department: parseInt(values.department),
        age: parseInt(values.age)
      });
      if (response.data && response.data.code === 1) {
        message.success('添加用户成功');
        setModalVisible(false);
        loadUsers();
      } else {
        throw new Error(response.data?.msg || '添加失败');
      }
    } catch (error) {
      console.error("添加用户失败", error);
      message.error('添加用户失败: ' + error.message);
    }
  };

  const handleEditUser = async (values) => {
    try {
      if (!currentUser) {
        message.error('无法获取当前用户信息，请重新登录');
        return;
      }

      if (currentUser.employeeId === editingUser.employeeId) {
        message.error('不能修改自己的信息');
        return;
      }

      const updatedValues = {
        employeeId: editingUser.employeeId,
        department: parseInt(values.department),
        position: parseInt(values.position),
        role: parseInt(values.role)
      };
      
      const response = await updateEmployeeProfile(
        updatedValues.employeeId,
        updatedValues.department,
        updatedValues.position,
        updatedValues.role
      );
      
      if (response.data && response.data.code === 1) {
        message.success('更新用户信息成功');
        setModalVisible(false);
        loadUsers();
      } else {
        throw new Error(response.data?.msg || '更新失败');
      }
    } catch (error) {
      console.error("更新用户信息失败", error);
      message.error('更新用户信息失败: ' + error.message);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      if (!currentUser) {
        message.error('无法获取当前用户信息，请重新登录');
        return;
      }

      if (currentUser.employeeId === employeeId) {
        message.error('不能删除自己的信息');
        return;
      }

      const response = await deleteEmployees([employeeId]);
      if (response.data && response.data.code === 1) {
        message.success('删除用户成功');
        loadUsers();
      } else {
        throw new Error(response.data?.msg || '删除失败');
      }
    } catch (error) {
      console.error("删除用户失败", error);
      message.error('删除用户失败: ' + error.message);
    }
  };

  const handleBatchDelete = async () => {
    if (!currentUser) {
      message.error('无法获取当前用户信息，请重新登录');
      return;
    }

    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }

    // 检查是否包含当前用户
    if (selectedRowKeys.includes(currentUser.employeeId)) {
      message.error('不能删除自己的信息');
      return;
    }

    try {
      const response = await deleteEmployees(selectedRowKeys);
      if (response.data && response.data.code === 1) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        loadUsers();
      } else {
        throw new Error(response.data?.msg || '批量删除失败');
      }
    } catch (error) {
      console.error("批量删除用户失败", error);
      message.error('批量删除用户失败: ' + error.message);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    getCheckboxProps: (record) => ({
      disabled: record.employeeId === currentUser?.employeeId, // 禁用当前用户的选择框
      name: record.username,
    }),
  };

  const columns = [
    { title: '工号', dataIndex: 'employeeId', key: 'employeeId' },
    { title: '姓名', dataIndex: 'username', key: 'username' },
    { 
      title: '性别', 
      dataIndex: 'gender', 
      key: 'gender',
      render: (gender) => gender === 1 ? '男' : '女'
    },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '部门', 
      dataIndex: 'department', 
      key: 'department',
      render: (deptId) => {
        const dept = departments.find(d => d.deptId === deptId);
        return dept ? dept.deptName : '未知部门';
      }
    },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { 
      title: '账号权限', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => role === 1 ? '管理员' : '普通用户'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal('edit', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.employeeId)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Card title="员工信息">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索员工"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="选择部门"
            value={selectedDepartment}
            onChange={value => setSelectedDepartment(value)}
          >
            <Option value="">全部部门</Option>
            {departments.map(dept => (
              <Option key={dept.deptId} value={dept.deptId}>{dept.deptName}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={() => showModal('add')}>
            添加员工
          </Button>
          <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        </Space>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          rowKey="employeeId"
          loading={loading}
        />
      </Card>

      <Modal
        title={modalMode === 'add' ? '添加员工' : '编辑员工'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {modalMode === 'add' ? (
            <>
              <Form.Item
                name="employeeId"
                label="工号"
                rules={[{ required: true, message: '请输入工号' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="username"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select>
                  <Option value={1}>男</Option>
                  <Option value={2}>女</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="age"
                label="年龄"
                rules={[
                  { required: true, message: '请输入年龄' },
                  { type: 'number', min: 18, max: 100, message: '年龄必须在18到100之间' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input />
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select>
              {departments.map(dept => (
                <Option key={dept.deptId} value={dept.deptId}>
                  {dept.deptName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="position"
            label="职位"
            rules={[{ required: true, message: '请输入职位' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          {modalMode === 'edit' && (
            <Form.Item
              name="role"
              label="账号权限"
              rules={[{ required: true, message: '请选择账号权限' }]}
            >
              <Select>
                <Option value={0}>普通用户</Option>
                <Option value={1}>管理员</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default UserInfoPage;