'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Space, Modal, Form, message, Popconfirm, DatePicker,Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { getAnnouncement, uploadAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/announcement';
import { getAllDepartments } from '@/lib/departments';
import Layout from '@/components/Layout';
import moment from 'moment';

const { TextArea } = Input;

const AnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchDepartments();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
        const response = await getAnnouncement();
        if (response.code === 1) {
            setAnnouncements(response.data);
        } else if (response.code === 0 && response.data === "该部门没有公告") {
            setAnnouncements([]);
            message.info(response.data);
        } else {
            throw new Error(response.msg || '获取公告失败');
        }
    } catch (error) {
        console.error('获取公告列表失败:', error);
        message.error('获取公告列表失败: ' + error.message);
    } finally {
        setLoading(false);
    }
};

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      if (response.data && response.data.code === 1) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      message.error('获取部门列表失败: ' + error.message);
    }
  };

  const showModal = (record = null) => {
    setEditingAnnouncement(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        publishTime: moment(record.publishTime)
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingAnnouncement) {
        handleEditAnnouncement(values);
      } else {
        handleAddAnnouncement(values);
      }
    });
  };

  const handleAddAnnouncement = async (values) => {
    try {
      if (!values.deptId) {
        throw new Error('请选择部门');
      }
  
      const formattedValues = {
        ...values,
        publishTime: values.publishTime.format('YYYY-MM-DDTHH:mm:ss')
      };
  
      console.log('Sending data:', formattedValues); // 用于调试
  
      const response = await uploadAnnouncement(formattedValues);
      
      console.log('Response:', response); // 用于调试
  
      if (response.data && response.data.code === 1) {
        message.success('添加公告成功');
        setModalVisible(false);
        fetchAnnouncements();
      } else {
        throw new Error(response.data?.msg || '添加失败');
      }
    } catch (error) {
      console.error('Error details:', error); // 用于调试
      message.error('添加公告失败: ' + error.message);
    }
  };

  const handleEditAnnouncement = async (values) => {
    try {
      const response = await updateAnnouncement({
        id: editingAnnouncement.id,
        ...values,
        publishTime: values.publishTime.format('YYYY-MM-DD HH:mm:ss')
      });
      if (response.data && response.data.code === 1) {
        message.success('更新公告成功');
        setModalVisible(false);
        fetchAnnouncements();
      } else {
        throw new Error(response.data?.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新公告失败: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteAnnouncement(id.toString());
      if (response.data && response.data.code === 1) {
        message.success('删除公告成功');
        fetchAnnouncements();
      } else {
        throw new Error(response.data?.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除公告失败: ' + error.message);
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '部门', 
      dataIndex: 'deptId', 
      key: 'deptId',
      render: (deptId) => {
        const dept = departments.find(d => d.deptId === deptId);
        return dept ? dept.deptName : '全体部门';
      }
    },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { 
      title: '发布时间', 
      dataIndex: 'publishTime', 
      key: 'publishTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个公告吗？"
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
        </Space>
      ),
    },
  ];

  const filteredAnnouncements = announcements.filter(
    announcement => announcement.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    announcement.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout>
      <Card title="公告管理">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索公告"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            添加公告
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={filteredAnnouncements}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingAnnouncement ? "编辑公告" : "添加公告"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item 
            name="deptId" 
            label="部门" 
            rules={[{ required: true, message: '请选择部门' }]}
            >
            <Select>
                {departments.map(dept => (
                <Option key={dept.deptId} value={dept.deptId}>{dept.deptName}</Option>
                ))}
            </Select>
            </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="publishTime" label="发布时间" rules={[{ required: true, message: '请选择发布时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AnnouncementManagementPage;