'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Card } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  FolderOutlined,
  BellOutlined,
  UserSwitchOutlined,
  KeyOutlined,
  BuildOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  RightOutlined
} from '@ant-design/icons';
import { getUserInfo } from '@/lib/user';
import Cookies from 'js-cookie';
import { css } from '@emotion/css';
import { useAuth } from '@/hooks/useAuth';
import { Spin } from 'antd';

const { Header, Sider, Content } = Layout;

const menuStyles = css`
  .ant-menu-item, .ant-menu-submenu-title {
    transition: all 0.3s ease;
    &:hover {
      background-color: #1890ff;
      color: #fff;
    }
  }
  .ant-menu-item-selected {
    background-color: #1890ff !important;
    &::after {
      border-right: 3px solid #fff;
    }
  }
`;

const buttonStyles = css`
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const contentStyles = css`
  .site-layout-background {
    background: #fff;
  }
  .content-wrapper {
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    overflow: hidden;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    // &:hover {
    //   box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    // }
  }
  .breadcrumb-container {
    padding: 12px 24px;
    background-color: #fff;
  }
  .content-card {
    background-color:rgb(227, 242, 253);
    border: none;
    border-radius: 0;
  }
`;

const breadcrumbStyles = css`
  .ant-breadcrumb {
    display: flex;
    align-items: center;
  }
  .ant-breadcrumb-link {
    color: #1890ff;
    text-decoration: none;
    &:last-child {
      color: #003a8c;
      font-weight: bold;
    }
  }
  .breadcrumb-separator {
    margin: 0 8px;
    color: #1890ff;
  }
`;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();


  


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo();
        if (response && response.data && response.data.code === 1) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error('获取用户信息时出错：', error);
      }
    };

    fetchUserInfo();
  }, []);


  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  

  const logout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const sideMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '系统首页', href: '/dashboard' },
    { key: 'clockIn', icon: <ClockCircleOutlined />, label: '考勤打卡', href: '/attendance' },
    { key: 'leaveRequest', icon: <CalendarOutlined />, label: '请假申请', href: '/leave-request' },
  ];

  if (userInfo.role === 1) {
    sideMenuItems.push(
      { key: 'announcementManagement', icon: <BellOutlined />, label: '公告管理', href: '/announcement-management' },
      {
        key: 'userManagement',
        icon: <TeamOutlined />,
        label: '用户管理',
        children: [
          { key: 'adminInfo', icon: <UserSwitchOutlined />, label: '管理员信息', href: '/admin-info' },
          { key: 'empInfo', icon: <UserOutlined />, label: '员工信息', href: '/user-info' },
          { key: 'empPwdManagement', icon: <KeyOutlined />, label: '员工密码管理', href: '/employee-password' },
        ],
      },
      {
        key: 'hrManagement',
        icon: <FolderOutlined />,
        label: '人事管理',
        children: [
          { key: 'departmentManagement', icon: <BuildOutlined />, label: '部门管理', href: '/department-management' },
          { key: 'attendanceManagement', icon: <CheckSquareOutlined />, label: '考勤管理', href: '/attendance-management' },
          { key: 'leaveApproval', icon: <CalendarOutlined />, label: '假期审批', href: '/approval/leave' },
          { key: 'setCheckInTime', icon: <SettingOutlined />, label: '考勤设置', href: '/set-check-in-time' },
        ],
      }
    );
  }

  const generateBreadcrumbItems = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    return [
      { href: '/dashboard', title: '首页' },
      ...pathSegments.map((segment, index) => ({
        href: `/${pathSegments.slice(0, index + 1).join('/')}`,
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
      })),
    ];
  };

  const breadcrumbItems = generateBreadcrumbItems();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => router.push('/profile')}>个人信息</Menu.Item>
      <Menu.Item key="changePassword" onClick={() => router.push('/change-password')}>修改密码</Menu.Item>
      <Menu.Item key="logout" onClick={logout}>退出登录</Menu.Item>
    </Menu>
  );

  const getSelectedKeys = (pathname: string) => {
    const path = pathname.split('/')[1];
    switch (path) {
      case 'dashboard':
        return ['home'];
      case 'attendance':
        return ['clockIn'];
      case 'leave-request':
        return ['leaveRequest'];
      case 'announcement-management':
        return ['announcementManagement'];
      case 'admin-info':
        return ['userManagement', 'adminInfo'];
      case 'user-info':
        return ['userManagement', 'empInfo'];
      case 'employee-password':
        return ['userManagement', 'empPwdManagement'];
      case 'department-management':
        return ['hrManagement', 'departmentManagement'];
      case 'attendance-management':
        return ['hrManagement', 'attendanceManagement'];
      case 'leave-approval':
        return ['hrManagement', 'leaveApproval'];
      case 'set-check-in-time':
        return ['hrManagement', 'setCheckInTime'];
      default:
        return ['home'];
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys(pathname)}
          defaultOpenKeys={['userManagement', 'hrManagement']}
          className={menuStyles}
        >
          {sideMenuItems.map((item) => 
            item.children ? (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.children.map((child) => (
                  <Menu.Item key={child.key} icon={child.icon}>
                    <Link href={child.href}>{child.label}</Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon}>
                <Link href={item.href}>{item.label}</Link>
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#001529' }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { color: '#fff', fontSize: '18px', padding: '0 24px', cursor: 'pointer' }
          })}
          <span style={{ marginLeft: '16px', color: '#fff' }}>人力资源管理系统</span>
          <div style={{ float: 'right', marginRight: '16px' }}>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="link" style={{ color: '#fff' }} className={buttonStyles}>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                <span style={{ marginLeft: '8px' }}>{userInfo.username}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          className={`site-layout-background ${contentStyles}`}
          style={{
            margin: '24px 16px',
            minHeight: 280,
          }}
        >
          <div className="content-wrapper">
            <div className={`${breadcrumbStyles} breadcrumb-container`}>
              <Breadcrumb separator={<RightOutlined className="breadcrumb-separator" />}>
                {breadcrumbItems.map((item, index) => (
                  <Breadcrumb.Item key={index}>
                    <Link href={item.href} className="ant-breadcrumb-link">{item.title}</Link>
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </div>
            <Card className="content-card">
              {children}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const DynamicLayout = dynamic(() => Promise.resolve(AppLayout), { ssr: false });

export default DynamicLayout;