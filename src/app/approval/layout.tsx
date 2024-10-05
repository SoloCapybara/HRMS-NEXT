'use client';

import React from 'react';
import { Tabs } from 'antd';
import Layout from '@/components/Layout';
import Link from 'next/link';

const { TabPane } = Tabs;

export default function ApprovalLayout({ children }) {
  return (
    <Layout>
      <Tabs defaultActiveKey="leave">
        <TabPane tab={<Link href="/approval/leave">请假审批</Link>} key="leave" />
        <TabPane tab={<Link href="/approval/revoke">销假审批</Link>} key="revoke" />
        <TabPane tab={<Link href="/approval/extend">延假审批</Link>} key="extend" />
      </Tabs>
      {children}
    </Layout>
  );
}