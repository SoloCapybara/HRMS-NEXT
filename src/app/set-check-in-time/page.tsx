'use client';

import React, { useState } from 'react';
import { Card, Form, Input, DatePicker, TimePicker, Button, message } from 'antd';
import { setCheckInTime } from '@/lib/attendance';
import Layout from '@/components/Layout';

const { RangePicker } = DatePicker;

const SetCheckInTime: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const formData = {
        setDeptId: values.setDeptId,
        setStartDate: values.dateRange[0].format('YYYY-MM-DD'),
        setEndDate: values.dateRange[1].format('YYYY-MM-DD'),
        setStartTime: values.setStartTime.format('HH:mm'),
        setEndTime: values.setEndTime.format('HH:mm')
      };
      const response = await setCheckInTime(formData);
      if (response.data.code === 1) {
        message.success('打卡时间设置成功');
      } else {
        message.error('打卡时间设置失败: ' + response.data.msg);
      }
    } catch (error) {
      message.error('请求失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Card title="设置打卡时间" style={{ maxWidth: 600, margin: 'auto' }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="setDeptId"
            label="部门ID"
            rules={[{ required: true, message: '请输入部门ID' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="打卡日期范围"
            rules={[{ required: true, message: '请选择打卡日期范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="setStartTime"
            label="上班开始时间"
            rules={[{ required: true, message: '请选择上班开始时间' }]}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="setEndTime"
            label="上班结束时间"
            rules={[{ required: true, message: '请选择上班结束时间' }]}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              {isLoading ? '提交中...' : '提交'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};

export default SetCheckInTime;