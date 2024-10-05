'use client';

import React from 'react';
import { Button, Space } from 'antd';
import { useRouter } from 'next/navigation';

const NotFound = () => {
  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>您要查找的页面不存在</h2>
      <Space>
        <Button type="primary" onClick={goHome} className="action-button">
          返回首页
        </Button>
        <Button onClick={goBack} className="action-button">
          返回上一页
        </Button>
      </Space>
      <style jsx>{`
        .not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f0f2f5;
          font-family: 'Arial', sans-serif;
        }

        h1 {
          font-size: 120px;
          color: #1890ff;
          margin-bottom: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          font-size: 24px;
          color: #606266;
          margin-top: 20px;
          margin-bottom: 30px;
        }

        :global(.action-button) {
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        :global(.action-button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default NotFound;