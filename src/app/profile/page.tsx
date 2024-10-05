'use client';

import React, { useState, useEffect } from 'react';
import { Card, Avatar, Row, Col, Input, Select, Button, Form, message, Divider, Typography } from 'antd';
import { UserOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import { getUserInfo, updateUserInfo } from '@/lib/user';
import Layout from '@/components/Layout';

const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [originalUserInfo, setOriginalUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [changedFields, setChangedFields] = useState([]);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await getUserInfo();
      if (response.data && response.data.code === 1) {
        const userData = response.data.data;
        userData.gender = Number(userData.gender);
        setUserInfo(userData);
        setOriginalUserInfo(JSON.parse(JSON.stringify(userData)));
        form.setFieldsValue(userData);
      } else {
        message.error('获取用户信息失败: ' + response.data.message);
      }
    } catch (error) {
      console.error('获取用户信息时发生错误:', error);
      message.error('获取用户信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      const response = await updateUserInfo(values);
      if (response.data && response.data.code === 1) {
        message.success('个人信息保存成功');
        setOriginalUserInfo(JSON.parse(JSON.stringify(values)));
        setChangedFields([]);
        setIsPhoneEditable(false);
        setIsEmailEditable(false);
      } else {
        message.error(response.data.message || '保存个人信息失败');
      }
    } catch (error) {
      console.error('更新个人信息时发生错误:', error);
      message.error('发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldChanged = (changedValues, allValues) => {
    const changedFieldNames = Object.keys(changedValues);
    setChangedFields(prev => [...new Set([...prev, ...changedFieldNames])]);
  };

  const cancelChanges = () => {
    form.setFieldsValue(originalUserInfo);
    setChangedFields([]);
    setIsPhoneEditable(false);
    setIsEmailEditable(false);
  };

  const togglePhoneEdit = () => {
    if (isPhoneEditable) {
      saveProfile();
    } else {
      setIsPhoneEditable(true);
      setChangedFields(prev => [...prev, 'phoneNumber']);
    }
  };

  const toggleEmailEdit = () => {
    if (isEmailEditable) {
      saveProfile();
    } else {
      setIsEmailEditable(true);
      setChangedFields(prev => [...prev, 'email']);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '20px', backgroundColor: '#e3f2fd', minHeight: '100vh', borderRadius: '20px' }}>
        <Row justify="center">
          <Col xs={24} md={16} lg={12}>
            <Card loading={loading} style={{ borderRadius: '15px' }}>
              <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#f5f5f5' }}>
                <Avatar size={100} icon={<UserOutlined />} src={userInfo?.avatarUrl} style={{ marginBottom: '16px', border: '4px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                <Title level={4}>{userInfo?.username}</Title>
                <Text type="secondary">{userInfo?.role === 1 ? '管理员' : '普通用户'}</Text>
              </div>
              <Divider />
              <Form form={form} onValuesChange={fieldChanged} onFinish={saveProfile}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="employeeId" label="工号">
                      <Input readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="username" label="用户名">
                      <Input readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="deptName" label="部门">
                      <Input readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="position" label="职位">
                      <Input readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="gender" label="性别">
                      <Select>
                        <Option value={1}>男</Option>
                        <Option value={2}>女</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="age" label="年龄">
                      <Input type="number" min={0} max={150} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="phoneNumber" label="电话号码">
                      <Input readOnly={!isPhoneEditable} suffix={
                        <Button icon={isPhoneEditable ? <CheckOutlined /> : <EditOutlined />} onClick={togglePhoneEdit} type="link" />
                      } />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="email" label="邮箱">
                      <Input readOnly={!isEmailEditable} suffix={
                        <Button icon={isEmailEditable ? <CheckOutlined /> : <EditOutlined />} onClick={toggleEmailEdit} type="link" />
                      } />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="center" style={{ marginTop: '24px' }}>
                  <Col>
                    <Button type="primary" htmlType="submit" loading={isLoading} style={{ marginRight: '8px' }}>保存</Button>
                    {(changedFields.length > 0 || isPhoneEditable || isEmailEditable) && (
                      <Button onClick={cancelChanges}>取消</Button>
                    )}
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default ProfilePage;