'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { changePassword } from '@/lib/user';
import Layout from '@/components/Layout';

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await changePassword(values.oldPassword, values.newPassword);
      if (response.data && response.data.code === 1) {
        message.success('密码修改成功');
        form.resetFields();
      } else {
        message.error(response.data.message || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码时出错', error);
      message.error('修改密码时出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <Card title="修改密码" className="shadow-lg">
          <Form
            form={form}
            name="changePassword"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('oldPassword') !== value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('新密码不能与旧密码相同'));
                  },
                }),
              ]}
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
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
                重置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default ChangePasswordPage;