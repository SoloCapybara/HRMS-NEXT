'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, message } from 'antd';
import { resetEmployeePassword, fetchSingleEmployee } from '@/lib/user';
import Layout from '@/components/Layout';
import debounce from 'lodash/debounce';

const EmployeePasswordPage = () => {
  const [form] = Form.useForm();
  const [employeeData, setEmployeeData] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmployeeInfo = debounce(async (employeeId) => {
    if (!employeeId) return;

    setLoading(true);
    setEmployeeStatus('');
    try {
      const response = await fetchSingleEmployee(employeeId);
      setLoading(false);
      if (response.data && response.data.code === 1) {
        setEmployeeData(response.data.data);
        setEmployeeStatus('found');
      } else {
        setEmployeeData(null);
        setEmployeeStatus('not-found');
      }
    } catch (error) {
      setLoading(false);
      setEmployeeStatus('error');
      console.error('查询员工信息时出错', error);
    }
  }, 500);

  const onFinish = async (values) => {
    try {
      const response = await resetEmployeePassword(values.employeeId, values.newPassword);
      if (response.data && response.data.code === 1) {
        message.success('密码修改成功');
        form.resetFields();
        setEmployeeData(null);
        setEmployeeStatus('');
      } else {
        message.error(response.data.message || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码时出错', error);
      message.error('修改密码时出错，请稍后重试');
    }
  };

  const getAlertType = () => {
    switch (employeeStatus) {
      case 'found':
        return 'success';
      case 'not-found':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <Card title="员工密码管理" className="max-w-md mx-auto mt-8">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="employeeId"
            label="员工号"
            rules={[{ required: true, message: '请输入员工号' }]}
          >
            <Input onChange={(e) => fetchEmployeeInfo(e.target.value)} />
          </Form.Item>
          {employeeStatus && (
            <Alert
              message={
                employeeStatus === 'found'
                  ? `员工已找到 - 姓名：${employeeData?.username}`
                  : employeeStatus === 'not-found'
                  ? '未找到该员工，请确认输入的员工号是否正确。'
                  : '查询时出错，请稍后再试。'
              }
              type={getAlertType()}
              showIcon
              className="mb-4"
            />
          )}
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={employeeStatus !== 'found'}>
              提交
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              form.resetFields();
              setEmployeeData(null);
              setEmployeeStatus('');
            }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};

export default EmployeePasswordPage;