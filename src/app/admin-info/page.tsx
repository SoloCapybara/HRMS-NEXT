'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Space, Modal, Form, message, Popconfirm, Row, Col, Checkbox, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, SaveOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { fetchRoles, addRole, updateRole, deleteRole } from '@/lib/role';
import Layout from '@/components/Layout';
import styled from '@emotion/styled';

const { Option } = Select;
const { Title } = Typography;

const StyledCard = styled(Card)`
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const StyledTable = styled(Table)`
  .ant-table-row.selected-row {
    background-color: #e6f7ff;
    td {
      border-bottom: 2px solid #1890ff;
    }
  }
`;

const PermissionGroup = styled.div`
  background-color: #f0f2f5;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
`;

const PermissionItem = styled.div`
  margin-bottom: 8px;
`;

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [tempPermissions, setTempPermissions] = useState([]);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setTempPermissions(selectedRole.permissions.map(p => p.id));
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetchRoles();
      console.log(response)
      if (response.data && response.data.code === 1) {
        const rolesData = response.data.data.roles;
        const permissionsData = response.data.data.permissions;
        setAllRoles(rolesData);
        setRoles(rolesData);
        setPermissions(permissionsData);
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0]);
        }
      } else {
        message.error('获取角色数据失败');
      }
    } catch (error) {
      console.error("获取角色数据失败", error);
      message.error('获取角色数据失败，请检查网络或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filteredRoles = allRoles.filter(role => 
      role.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      role.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setRoles(filteredRoles);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setRoles(allRoles);
  };

  const showModal = (mode, role = null) => {
    setModalMode(mode);
    setEditingRole(role);
    if (mode === 'edit' && role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.id)
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (modalMode === 'add') {
        handleAddRole(values);
      } else {
        handleEditRole(values);
      }
    });
  };

  const handleAddRole = async (values) => {
    try {
      const response = await addRole(values);
      if (response.data && response.data.code === 1) {
        message.success('添加角色成功');
        setModalVisible(false);
        loadRoles();
      } else {
        throw new Error(response.data?.msg || '添加失败');
      }
    } catch (error) {
      console.error("添加角色失败", error);
      message.error('添加角色失败: ' + error.message);
    }
  };

  const handleEditRole = async (values) => {
    try {
      const updatedValues = {
        id: editingRole.id,
        ...values
      };
      
      const response = await updateRole(updatedValues);
      
      if (response.data && response.data.code === 1) {
        message.success('更新角色信息成功');
        setModalVisible(false);
        loadRoles();
      } else {
        throw new Error(response.data?.msg || '更新失败');
      }
    } catch (error) {
      console.error("更新角色信息失败", error);
      message.error('更新角色信息失败: ' + error.message);
    }
  };

  const handleDelete = async (roleId) => {
    try {
      const response = await deleteRole([roleId]);
      if (response.data && response.data.code === 1) {
        message.success('删除角色成功');
        loadRoles();
      } else {
        throw new Error(response.data?.msg || '删除失败');
      }
    } catch (error) {
      console.error("删除角色失败", error);
      message.error('删除角色失败: ' + error.message);
    }
  };

  const handleBatchDelete = async () => {
    const systemRoles = selectedRowKeys.filter(key => allRoles.find(role => role.id === key && role.isSystem));
    if (systemRoles.length > 0) {
      message.error('不能删除系统内置角色');
      return;
    }

    try {
      const response = await deleteRole(selectedRowKeys);
      if (response.data && response.data.code === 1) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        loadRoles();
      } else {
        throw new Error(response.data?.msg || '批量删除失败');
      }
    } catch (error) {
      console.error("批量删除角色失败", error);
      message.error('批量删除角色失败: ' + error.message);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handlePermissionChange = (permissionId, checked) => {
    setTempPermissions(prev => 
      checked ? [...prev, permissionId] : prev.filter(id => id !== permissionId)
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const updatedRole = {
        ...selectedRole,
        permissions: tempPermissions
      };
      const response = await updateRole(updatedRole);
      if (response.data && response.data.code === 1) {
        message.success('更新角色权限成功');
        loadRoles();
      } else {
        throw new Error(response.data?.msg || '更新失败');
      }
    } catch (error) {
      console.error("更新角色权限失败", error);
      message.error('更新角色权限失败: ' + error.message);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    getCheckboxProps: (record) => ({
      disabled: record.isSystem,
      name: record.name,
    }),
  };

  const groupPermissions = () => {
    const groups = {};
    permissions.forEach(permission => {
      const [groupName, permissionName] = permission.name.split('.');
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });
    return groups;
  };

  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
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
          {record.isSystem ? (
            <Tooltip title="系统内置角色不可删除">
              <Button icon={<LockOutlined />} disabled>
                删除
              </Button>
            </Tooltip>
          ) : (
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDelete(record.id)}
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
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <StyledCard title="角色管理" bordered={false}>
        <Row gutter={16}>
          <Col span={8}>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="搜索角色"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ width: 200 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
            <StyledTable
              rowSelection={rowSelection}
              columns={columns}
              dataSource={roles}
              rowKey="id"
              loading={loading}
              onRow={(record) => ({
                onClick: () => handleRoleSelect(record),
                className: record.id === selectedRole?.id ? 'selected-row' : ''
              })}
            />
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => showModal('add')}>
                添加角色
              </Button>
              <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
                批量删除
              </Button>
            </Space>
          </Col>
          <Col span={16}>
            <StyledCard 
              title={`角色权限 - ${selectedRole?.name || ''}`}
              extra={
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSavePermissions}
                  disabled={!selectedRole}
                >
                  保存权限
                </Button>
              }
              bordered={false}
            >
              {Object.entries(groupPermissions()).map(([groupName, groupPermissions]) => (
                <PermissionGroup key={groupName}>
                  <Title level={4}>{groupName}</Title>
                  {groupPermissions.map(permission => (
                    <PermissionItem key={permission.id}>
                      <Checkbox
                        checked={tempPermissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        disabled={!selectedRole}
                      >
                        {permission.name.split('.')[1]}
                      </Checkbox>
                      <Tooltip title={permission.description}>
                        <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                      </Tooltip>
                    </PermissionItem>
                  ))}
                </PermissionGroup>
              ))}
            </StyledCard>
          </Col>
        </Row>
      </StyledCard>

      <Modal
        title={modalMode === 'add' ? '添加角色' : '编辑角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select mode="multiple">
              {permissions.map(permission => (
                <Option key={permission.id} value={permission.id}>{permission.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default RoleManagementPage;