'use client';

import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/user';
import Cookies from 'js-cookie';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { Spin } from 'antd';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const onFinish = async (values: { employeeId: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values.employeeId, values.password);
      if (response && response.data && typeof response.data === 'object') {
        const { code, msg, data } = response.data;
        if (code === 1 && msg === 'success') {
          if (data && data.token) {
            Cookies.set('token', data.token, { expires: 7 });
          }
          message.success('登录成功');
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          message.error(`登录失败: ${msg || '未知错误'}`);
        }
      } else {
        message.error('服务器响应格式错误');
      }
    } catch (error: any) {
      message.error(`登录失败: ${error.message || '发生未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // 这将由 useEffect 钩子处理
  }

  // if (isLoading || isAuthenticated) {
  //   return null; // 或者返回一个加载指示器
  // }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5',
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          borderRadius: 8
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <LockOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <h2>人力资源管理系统</h2>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="employeeId"
            rules={[{ required: true, message: '请输入员工ID' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="员工ID" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;