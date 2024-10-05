'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Input, Button, Tree, Form, Modal, message, Space, Popconfirm, List, Typography, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { getAllDepartments, addDepartment, updateDepartment, deleteDepartment } from '@/lib/departments';
import { fetchSingleEmployee } from '@/lib/user';
import Layout from '@/components/Layout';
import debounce from 'lodash/debounce';

const { Title, Text } = Typography;

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeItems, setTreeItems] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [formData, setFormData] = useState({
    deptId: '',
    deptName: '',
    deptNumber: '',
    deptLevel: 1,
    deptManagerId: '',
    deptManagerName: '',
    deptProfile: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [managerStatus, setManagerStatus] = useState('');
  const [parentDept, setParentDept] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const [form] = Form.useForm();
  const treeRef = useRef(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await getAllDepartments();
      if (response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
        setDepartments(response.data.data);
        const treeData = buildTreeItems(response.data.data);
        setTreeItems(treeData);
        setExpandedKeys(treeData.map(item => item.key));
      } else {
        throw new Error('无效的响应结构');
      }
    } catch (err) {
      setError('获取部门信息失败: ' + err.message);
      message.error('获取部门信息失败');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeItems = (departments) => {
    const idMap = new Map();
    departments.forEach(dept => idMap.set(dept.deptId, { ...dept, children: [] }));

    const rootItems = [];
    departments.forEach(dept => {
      const node = idMap.get(dept.deptId);
      if (dept.deptLevel === 1) {
        rootItems.push(node);
      } else if (dept.deptParentId && idMap.has(dept.deptParentId)) {
        const parent = idMap.get(dept.deptParentId);
        parent.children.push(node);
      }
    });

    const formatNode = (node) => ({
      key: node.deptId,
      title: node.deptName,
      level: node.deptLevel,
      deptNumber: node.deptNumber,
      children: node.children.map(formatNode)
    });

    return rootItems.map(formatNode);
  };

  const handleNodeClick = async (selectedKeys, info) => {
    const foundDepartment = departments.find(dept => dept.deptId === info.node.key);
    
    if (foundDepartment) {
      setSelectedDepartment({ ...foundDepartment });
      
      if (foundDepartment.deptManagerId && !foundDepartment.deptManagerName) {
        try {
          const response = await fetchSingleEmployee(foundDepartment.deptManagerId);
          if (response.data && response.data.code === 1 && response.data.data) {
            setSelectedDepartment(prev => ({
              ...prev,
              deptManagerName: response.data.data.username || '未知'
            }));
          }
        } catch (err) {
          setSelectedDepartment(prev => ({
            ...prev,
            deptManagerName: '获取失败'
          }));
        }
      }
    } else {
      setSelectedDepartment(null);
    }
  };

  const showAddDeptDialog = (parentData = null) => {
    setParentDept(parentData);
    const newFormData = {
      deptId: '',
      deptName: '',
      deptNumber: parentData ? `${parentData.deptNumber}-` : '',
      deptLevel: parentData ? parentData.level + 1 : 1,
      deptManagerId: '',
      deptManagerName: '',
      deptProfile: ''
    };
    setFormData(newFormData);
    setDialogTitle(parentData ? '添加子部门' : '添加根部门');
    setDialogVisible(true);
    setIsEditing(false);
    setManagerStatus('');
    form.setFieldsValue(newFormData);
  };

  const handleEdit = async (data) => {
    const selectedDept = departments.find(dept => dept.deptId === data.key) || {};
    setFormData({ ...selectedDept });
    setParentDept(departments.find(dept => dept.deptId === selectedDept.deptParentId) || null);
    setDialogTitle('编辑部门');
    setDialogVisible(true);
    setIsEditing(true);
    setManagerStatus('');
    form.setFieldsValue(selectedDept);
    if (selectedDept.deptManagerId) {
      await fetchManagerName(selectedDept.deptManagerId);
    }
  };

  const handleDelete = (data) => {
    setDeleteData(data);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteData) return;

    try {
      await deleteDepartment(deleteData.key);
      message.success('部门删除成功');
      await fetchDepartments();
      addRecentAction(`删除了部门：${deleteData.title}`);
    } catch (error) {
      message.error('删除部门失败：' + error.message);
    } finally {
      setDeleteDialogVisible(false);
      setDeleteData(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        deptParentId: parentDept ? parentDept.key : 0
      };

      if (isEditing) {
        submitData.deptId = formData.deptId;
      }

      // 检查部门编号是否已存在
      const isDeptNumberExist = departments.some(dept => dept.deptNumber === submitData.deptNumber && dept.deptId !== submitData.deptId);
      if (isDeptNumberExist) {
        message.error('部门编号已存在，请使用其他编号');
        return;
      }

      const response = isEditing
        ? await updateDepartment(submitData)
        : await addDepartment(submitData);

      if (response.data && response.data.code === 1) {
        message.success(isEditing ? '部门更新成功' : '部门添加成功');
        setDialogVisible(false);
        await fetchDepartments();
        addRecentAction(isEditing ? `更新了部门：${submitData.deptName}` : `添加了新部门：${submitData.deptName}`);
      } else {
        throw new Error(response.data.msg || '操作失败');
      }
    } catch (error) {
      message.error('提交部门信息失败：' + (error.response?.data?.msg || error.message));
    }
  };

  const fetchManagerName = async (managerId) => {
    if (!managerId) {
      form.setFieldsValue({ deptManagerName: '' });
      setManagerStatus('');
      return;
    }
    try {
      const response = await fetchSingleEmployee(managerId);
      if (response.data && response.data.code === 1 && response.data.data) {
        const managerName = response.data.data.username || '未知';
        form.setFieldsValue({ deptManagerName: managerName });
        setManagerStatus('found');
      } else {
        form.setFieldsValue({ deptManagerName: '' });
        setManagerStatus('not-found');
      }
    } catch (err) {
      form.setFieldsValue({ deptManagerName: '' });
      setManagerStatus('error');
    }
  };

  const onManagerIdInput = debounce((value) => {
    fetchManagerName(value);
  }, 500);

  const expandAllDepartments = () => {
    const allKeys = getAllKeys(treeItems);
    setExpandedKeys(allKeys);
  };

  const collapseAllDepartments = () => {
    setExpandedKeys([]);
  };

  const getAllKeys = (nodes) => {
    let keys = [];
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const addRecentAction = (description) => {
    const now = new Date();
    const timeString = now.toLocaleString();
    setRecentActions(prev => [{description, time: timeString}, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredTreeItems = React.useMemo(() => {
    if (!search) {
      return treeItems;
    }

    const filterTree = (nodes) => {
      return nodes.filter(node => {
        const matchesSearch = node.title.toLowerCase().includes(search.toLowerCase());
        const childrenMatch = node.children && filterTree(node.children).length > 0;
        return matchesSearch || childrenMatch;
      }).map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : []
      }));
    };

    return filterTree(treeItems);
  }, [treeItems, search]);

  const maxDeptLevel = Math.max(...departments.map(dept => dept.deptLevel));
  const rootDepartmentsCount = departments.filter(dept => dept.deptLevel === 1).length;

  return (
    <Layout>
      <Card title="部门管理" className="department-management-wrapper">
        <Row gutter={16}>
          <Col span={6}>
            <Card title="操作" className="mb-4">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showAddDeptDialog()} block>
                添加根部门
              </Button>
            </Card>

            <Card title="部门统计" className="mb-4">
              <List>
                <List.Item>
                  <Text>总部门数：</Text>
                  <Text strong>{departments.length}</Text>
                </List.Item>
                <List.Item>
                  <Text>最大部门层级：</Text>
                  <Text strong>{maxDeptLevel}</Text>
                </List.Item>
                <List.Item>
                  <Text>根部门数：</Text>
                  <Text strong>{rootDepartmentsCount}</Text>
                </List.Item>
              </List>
            </Card>

            <Card title="快速操作" className="mb-4">
              <Button icon={<ExpandOutlined />} onClick={expandAllDepartments} block className="mb-2">
                展开所有部门
              </Button>
              <Button icon={<CompressOutlined />} onClick={collapseAllDepartments} block>
                折叠所有部门
              </Button>
            </Card>

            <Card title="最近操作" className="mb-4">
              <List
                dataSource={recentActions}
                renderItem={item => (
                  <List.Item>
                    <Text>{item.description}</Text>
                    <br />
                    <Text type="secondary">{item.time}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {selectedDepartment && (
              <Card title="部门详情">
                <List>
                  <List.Item>
                    <Text>部门名称：</Text>
                    <Text strong>{selectedDepartment.deptName}</Text>
                  </List.Item>
                  <List.Item>
                    <Text>部门编号：</Text>
                    <Text strong>{selectedDepartment.deptNumber}</Text>
                  </List.Item>
                  <List.Item>
                    <Text>部门级别：</Text>
                    <Text strong>{selectedDepartment.deptLevel}</Text>
                  </List.Item>
                  <List.Item>
                    <Text>部门主管ID：</Text>
                    <Text strong>{selectedDepartment.deptManagerId}</Text>
                  </List.Item>
                  <List.Item>
                    <Text>部门主管姓名：</Text>
                    <Text strong>{selectedDepartment.deptManagerName}</Text>
                  </List.Item>
                  <List.Item>
                    <Text>部门描述：</Text>
                    <Text strong>{selectedDepartment.deptProfile}</Text>
                  </List.Item>
                </List>
              </Card>
            )}
          </Col>
          <Col span={18}>
            <Card title="部门列表">
              <Input
                placeholder="搜索部门"
                prefix={<SearchOutlined />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              {loading ? (
                <div>加载中...</div>
              ) : error ? (
                <Alert message={error} type="error" />
              ) : filteredTreeItems.length === 0 ? (
                <Alert message="没有可用的部门" type="info" />
              ) : (
                <Tree
                  ref={treeRef}
                  treeData={filteredTreeItems}
                  onSelect={handleNodeClick}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                  titleRender={(nodeData) => (
                    <Space>
                      <span>{nodeData.title}</span>
                      <Space>
                        <Button size="small" icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation(); showAddDeptDialog(nodeData); }} />
                        <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(nodeData); }} />
                        <Popconfirm
                          title="确定要删除这个部门吗？"
                          onConfirm={(e) => { e.stopPropagation(); handleDelete(nodeData); }}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button size="small" icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                      </Space>
                    </Space>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title={dialogTitle}
        open={dialogVisible}
        onOk={handleSubmit}
        onCancel={() => setDialogVisible(false)}
      >
        <Form form={form} layout="vertical" initialValues={formData}>
          <Form.Item name="deptName" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptNumber" label="部门编号" rules={[
            { required: true, message: '请输入部门编号' },
            () => ({
              validator(_, value) {
                if (!parentDept || value.startsWith(parentDept.deptNumber)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(`部门编号必须以父部门编号 ${parentDept.deptNumber} 开头`));
              },
            }),
          ]}>
            <Input disabled={isEditing} placeholder={parentDept ? `请输入以 ${parentDept.deptNumber} 开头的编号` : '请输入部门编号'} />
          </Form.Item>
          <Form.Item name="deptLevel" label="部门级别">
            <Input disabled />
          </Form.Item>
          <Form.Item name="deptManagerId" label="部门主管ID" rules={[{ required: true, message: '请输入部门主管ID' }]}>
            <Input onChange={(e) => onManagerIdInput(e.target.value)} />
          </Form.Item>
          <Form.Item name="deptManagerName" label="部门主管姓名">
            <Input disabled />
          </Form.Item>
          {managerStatus && (
            <Alert
              message={
                managerStatus === 'found'
                  ? `已找到主管 - 姓名：${form.getFieldValue('deptManagerName')}`
                  : managerStatus === 'not-found'
                  ? '未找到该主管，请确认输入的ID是否正确。'
                  : '查询主管信息时出错，请稍后再试。'
              }
              type={managerStatus === 'found' ? 'success' : managerStatus === 'not-found' ? 'warning' : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item name="deptProfile" label="部门描述" rules={[{ required: true, message: '请输入部门描述' }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认删除"
        open={deleteDialogVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      >
        <p>确定要删除这个部门吗？</p>
      </Modal>

      <style jsx global>{`
        

        .ant-card {
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .ant-tree {
          font-size: 16px;
        }

        .ant-tree-treenode {
          padding: 8px 0;
        }

        .ant-tree-node-content-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .ant-tree-node-content-wrapper:hover {
          background-color: #e6f7ff;
        }

        .ant-space {
          margin-left: 16px;
        }

        .mb-4 {
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .ant-tree {
            font-size: 14px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default DepartmentManagementPage;