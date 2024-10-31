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
  RightOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  UserAddOutlined,
  ScheduleOutlined,
  PieChartOutlined
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
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    overflow: hidden;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
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
  const { isAuthenticated, isLoading, hasPermission, userRole } = useAuth();

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

  // 添加调试代码
  useEffect(() => {
    console.log('当前用户角色:', userRole);
    console.log('系统首页权限:', hasPermission('系统首页'));
    console.log('考勤打卡权限:', hasPermission('考勤打卡'));
    console.log('请假申请权限:', hasPermission('请假申请'));
    console.log('人事管理权限:', hasPermission('人事管理'));
  }, [userRole, hasPermission]);

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

  // 基础菜单项
let sideMenuItems = [];

// 先检查用户是否有基础权限
if (hasPermission('系统首页')) {
  sideMenuItems.push({ 
    key: 'home', 
    icon: <HomeOutlined />, 
    label: '系统首页', 
    href: '/dashboard', 
    permission: '系统首页'
  });
}

if (hasPermission('考勤打卡')) {
  sideMenuItems.push({ 
    key: 'clockIn', 
    icon: <ClockCircleOutlined />, 
    label: '考勤打卡', 
    href: '/attendance', 
    permission: '考勤打卡'
  });
}

if (hasPermission('请假申请')) {
  sideMenuItems.push({ 
    key: 'leaveRequest', 
    icon: <CalendarOutlined />, 
    label: '请假申请', 
    href: '/leave-request', 
    permission: '请假申请'
  });
}

// 公告管理
if (hasPermission('公告管理')) {
  sideMenuItems.push({ 
    key: 'announcementManagement', 
    icon: <BellOutlined />, 
    label: '公告管理', 
    href: '/announcement-management', 
    permission: '公告管理'
  });
}

// 用户管理
if (hasPermission('用户管理')) {
  sideMenuItems.push({
    key: 'userManagement',
    icon: <TeamOutlined />,
    label: '用户管理',
    permission: '用户管理',
    children: [
      { key: 'adminInfo', icon: <UserSwitchOutlined />, label: '权限管理', href: '/admin-info', permission: '用户管理' },
      { key: 'empInfo', icon: <UserOutlined />, label: '员工信息', href: '/user-info', permission: '用户管理' },
      { key: 'empPwdManagement', icon: <KeyOutlined />, label: '员工密码管理', href: '/employee-password', permission: '用户管理' },
    ],
  });
}

// 人事管理
if (hasPermission('人事管理')) {
  sideMenuItems.push({
    key: 'hrManagement',
    icon: <FolderOutlined />,
    label: '人事管理',
    permission: '人事管理',
    children: [
      { key: 'departmentManagement', icon: <BuildOutlined />, label: '部门管理', href: '/department-management', permission: '人事管理' },
      { key: 'attendanceManagement', icon: <CheckSquareOutlined />, label: '考勤管理', href: '/attendance-management', permission: '人事管理' },
      { key: 'leaveApproval', icon: <CalendarOutlined />, label: '假期审批', href: '/approval/leave', permission: '人事管理' },
      { key: 'setCheckInTime', icon: <SettingOutlined />, label: '考勤设置', href: '/set-check-in-time', permission: '人事管理' },
    ],
  });

  // 招聘管理（作为人事管理的一部分）
  sideMenuItems.push({
    key: 'recruitmentManagement',
    icon: <SolutionOutlined />,
    label: '招聘管理',
    permission: '人事管理',
    children: [
      { key: 'recruitmentPlan', icon: <FileSearchOutlined />, label: '招聘计划', href: '/recruitment/plan', permission: '人事管理' },
      { key: 'candidateManagement', icon: <UserAddOutlined />, label: '应聘管理', href: '/recruitment/candidates', permission: '人事管理' },
      { key: 'interviewManagement', icon: <ScheduleOutlined />, label: '面试管理', href: '/recruitment/interviews', permission: '人事管理' },
      { key: 'recruitmentAnalytics', icon: <PieChartOutlined />, label: '招聘分析', href: '/recruitment/analytics', permission: '人事管理' }
    ],
  });
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
    case 'recruitment':
      const subPath = pathname.split('/')[2];
      switch (subPath) {
        case 'plan':
          return ['recruitmentManagement', 'recruitmentPlan'];
        case 'candidates':
          return ['recruitmentManagement', 'candidateManagement'];
        case 'interviews':
          return ['recruitmentManagement', 'interviewManagement'];
        case 'analytics':
          return ['recruitmentManagement', 'recruitmentAnalytics'];
        default:
          return ['recruitmentManagement'];
      }
    default:
      return ['home'];
  }
};

const renderMenuItem = (item: any) => {
  return (
    <Menu.Item key={item.key} icon={item.icon}>
      <Link href={item.href}>{item.label}</Link>
    </Menu.Item>
  );
};

const renderSubMenu = (item: any) => {
  if (item.children) {
    return (
      <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
        {item.children.map(renderMenuItem)}
      </Menu.SubMenu>
    );
  }
  return null;
};

return (
  <Layout style={{ minHeight: '100vh' }}>
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys(pathname)}
        defaultOpenKeys={['userManagement', 'hrManagement', 'recruitmentManagement']}
        className={menuStyles}
      >
        {sideMenuItems.map((item) => 
          item.children ? renderSubMenu(item) : renderMenuItem(item)
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