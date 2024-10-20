'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/user';
import Cookies from 'js-cookie';
import { Form, Input, Button, message, Spin } from 'antd';
import { LockOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

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
          if (data) {
            Cookies.set('token', data, { expires: 7 });
            message.success('登录成功');
            await checkAuth();
            router.push('/dashboard');
          } else {
            throw new Error('登录响应中没有有效数据');
          }
        } else {
          message.error(`登录失败: ${msg || '未知错误'}`);
        }
      } else {
        message.error('服务器响应格式错误');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
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
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="illustration-wrapper">
          <Image src="/school-illustration.svg" alt="School illustration" width={500} height={500} />
        </div>
        <div className="login-form-wrapper">
          <div className="logo-wrapper">
            <BookOutlined className="logo-icon" />
            <h1>校园人力资源管理系统</h1>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="login-form"
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
          <p className="login-form-footer">
            © 2023 校园人力资源管理系统 版权所有
          </p>
        </div>
      </div>
      <style jsx global>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-box {
          display: flex;
          width: 1000px;
          height: 600px;
          background-color: white;
          border-radius: 15px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .illustration-wrapper {
          flex: 1;
          background-color: #f5f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-form-wrapper {
          flex: 1;
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .logo-wrapper {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo-icon {
          font-size: 48px;
          color: #1890ff;
        }
        h1 {
          font-size: 24px;
          color: #333;
          margin-top: 10px;
        }
        .login-form {
          max-width: 300px;
          margin: 0 auto;
        }
        .login-form-footer {
          text-align: center;
          margin-top: 20px;
          color: #888;
          font-size: 12px;
        }
        @media (max-width: 768px) {
          .login-box {
            flex-direction: column;
            width: 100%;
            height: auto;
          }
          .illustration-wrapper {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;