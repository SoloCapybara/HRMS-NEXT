'use client';
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Avatar, 
  Button, List, ListItem, ListItemText, ListItemAvatar, 
  Chip, Box, Paper
} from '@mui/material';
import { 
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getUserInfo } from '@/lib/user';
import AppLayout from '@/components/Layout';

const DashboardPage = () => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo();
        if (response && response.data && response.data.code === 1) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const quickActions = [
    { title: '考勤打卡', icon: <AccessTimeIcon />, color: '#1890ff', type: 'attendance' },
    { title: '请假申请', icon: <EventIcon />, color: '#52c41a', type: 'leave' },
    { title: '报销申请', icon: <AttachMoneyIcon />, color: '#faad14', type: 'expense' },
    { title: '绩效自评', icon: <BarChartIcon />, color: '#722ed1', type: 'performance' },
    { title: '培训报名', icon: <BookIcon />, color: '#eb2f96', type: 'training' },
    { title: '薪资查询', icon: <AttachMoneyIcon />, color: '#f5222d', type: 'salary' },
  ];

  const announcements = [
    { id: 1, title: '系统正式上线', content: '今天系统正式上线，开始内测阶段。', date: '2023-11-01', type: 'success' },
    { id: 2, title: '功能完成通知', content: '所有功能都已完成，可以正常使用。', date: '2023-11-05', type: 'info' },
    { id: 3, title: '团建活动通知', content: '本周五下午将举行团建活动，请各位同事准时参加。', date: '2023-11-10', type: 'warning' }
  ];

  const todos = [
    { id: 1, title: '完成月度报告', dueDate: '2023-11-30', priority: 'high' },
    { id: 2, title: '安排团建活动', dueDate: '2023-11-15', priority: 'medium' },
    { id: 3, title: '员工培训计划制定', dueDate: '2023-12-01', priority: 'low' }
  ];

  const teamMembers = [
    { id: 1, name: '张三', position: '部门经理', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1' },
    { id: 2, name: '李四', position: '高级专员', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=2' },
    { id: 3, name: '王五', position: '专员', avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=3' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f5222d';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* 左侧栏 */}
          <Grid item xs={12} md={3}>
            {/* 欢迎卡片 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: '#1890ff', margin: '0 auto 16px' }}>
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5">{userInfo.username || '用户'}</Typography>
                <Typography color="textSecondary">{userInfo.position || '未知职位'}</Typography>
                <Typography color="textSecondary">{userInfo.department || '未知部门'}</Typography>
              </CardContent>
            </Card>

            {/* 日历模块 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">日历</Typography>
                <Typography>日历组件将在这里</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 中间栏 */}
          <Grid item xs={12} md={6}>
            {/* 快速操作模块 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>快速操作</Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action) => (
                    <Grid item xs={4} key={action.type}>
                      <Button
                        variant="contained"
                        startIcon={action.icon}
                        fullWidth
                        sx={{
                          height: '80px',
                          backgroundColor: action.color,
                          '&:hover': {
                            backgroundColor: action.color,
                            opacity: 0.9,
                          },
                          flexDirection: 'column',
                          textAlign: 'center',
                        }}
                      >
                        {action.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* 待办事项 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>待办事项</Typography>
                <List>
                  {todos.map((item) => (
                    <ListItem key={item.id} secondaryAction={
                      <Button variant="contained" size="small">完成</Button>
                    }>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <React.Fragment>
                            <Chip 
                              label={item.priority} 
                              size="small" 
                              sx={{ backgroundColor: getPriorityColor(item.priority), color: 'white', mr: 1 }} 
                            />
                            <Typography component="span" variant="body2" color="text.secondary">
                              截止日期：{item.dueDate}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* 公告板 */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>公告列表</Typography>
                <List>
                  {announcements.map((announcement) => (
                    <ListItem key={announcement.id}>
                      <ListItemText
                        primary={announcement.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2">
                              {announcement.content}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {announcement.date}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* 右侧栏 */}
          <Grid item xs={12} md={3}>
            {/* 个人信息概览 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>个人信息概览</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} /> 
                  <Typography>部门：{userInfo.department || '未知'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon sx={{ mr: 1 }} /> 
                  <Typography>职位：{userInfo.position || '未知'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} /> 
                  <Typography>入职日期：{userInfo.hireDate || '未知'}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* 团队成员 */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>团队成员</Typography>
                <List>
                  {teamMembers.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemAvatar>
                        <Avatar src={item.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={item.position}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};

export default DashboardPage;