'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Avatar, 
  Button, List, ListItem, ListItemText, ListItemAvatar, 
  Chip, Box, Paper, IconButton, LinearProgress, Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  Info as InfoIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  WorkHistory as WorkHistoryIcon
} from '@mui/icons-material';
import { getUserInfo } from '@/lib/user';
import AppLayout from '@/components/Layout';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const DashboardPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [selectedDate, setSelectedDate] = useState(null);

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
    { title: '课程安排', icon: <BookIcon />, color: '#faad14', type: 'courses' },
    { title: '教学评估', icon: <BarChartIcon />, color: '#722ed1', type: 'evaluation' },
    { title: '教研活动', icon: <GroupIcon />, color: '#eb2f96', type: 'research' },
    { title: '工资查询', icon: <AttachMoneyIcon />, color: '#f5222d', type: 'salary' },
  ];

  const announcements = [
    { id: 1, title: '期末考试安排通知', content: '本学期期末考试将于12月20日开始。', date: '2023-12-01', type: 'success' },
    { id: 2, title: '教师培训通知', content: '下周将举办教学能力提升培训。', date: '2023-12-05', type: 'info' },
    { id: 3, title: '年终总结会议', content: '请各部门准备年终工作总结报告。', date: '2023-12-10', type: 'warning' }
  ];

  const todos = [
    { id: 1, title: '提交教学计划', dueDate: '2023-12-15', priority: 'high' },
    { id: 2, title: '批改学生作业', dueDate: '2023-12-10', priority: 'medium' },
    { id: 3, title: '准备教研材料', dueDate: '2023-12-20', priority: 'low' }
  ];

  // 新增：工作统计数据
  const workStats = [
    { title: '本月考勤', value: 22, total: 23, color: '#1890ff' },
    { title: '课时完成', value: 45, total: 48, color: '#52c41a' },
    { title: '教研参与', value: 8, total: 10, color: '#722ed1' }
  ];

  // 新增：最近活动
  const recentActivities = [
    { time: '09:00', action: '完成上午课程', type: 'course', color: '#1890ff' },
    { time: '14:30', action: '参加教研会议', type: 'meeting', color: '#52c41a' },
    { time: '16:00', action: '提交教学日志', type: 'report', color: '#722ed1' }
  ];

  // 新增：教学任务
  const teachingTasks = [
    { subject: '高等数学', progress: 75, students: 45, room: '教室A101' },
    { subject: '线性代数', progress: 60, students: 38, room: '教室B203' },
    { subject: '概率论', progress: 40, students: 42, room: '教室C305' }
  ];

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = dayjs(new Date(currentYear, currentMonth, 1));
    const lastDay = firstDay.endOf('month');

    for (let i = firstDay.day(); i > 0; i--) {
      days.push(firstDay.subtract(i, 'day'));
    }

    for (let i = 1; i <= lastDay.date(); i++) {
      days.push(dayjs(new Date(currentYear, currentMonth, i)));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(lastDay.add(i, 'day'));
    }

    return days;
  }, [currentYear, currentMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (date) => date.isSame(dayjs(), 'day');
  const isSelected = (date) => selectedDate && date.isSame(selectedDate, 'day');
  const isCurrentMonth = (date) => date.month() === currentMonth;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f5222d';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const calendarStyles = {
    calendarContainer: {
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      color: 'white',
    },
    monthTitle: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: 'white',
    },
    weekGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#f0f0f0',
      padding: '8px',
    },
    weekday: {
      textAlign: 'center',
      padding: '8px',
      fontWeight: 500,
      color: '#1890ff',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#f0f0f0',
      padding: '8px',
    },
    dayCell: {
      aspectRatio: '1',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      backgroundColor: '#fff',
      borderRadius: '4px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#e6f7ff',
        transform: 'scale(1.05)',
      },
    },
    today: {
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      color: '#fff',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(24,144,255,0.2)',
      '&:hover': {
        background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
      },
    },
    selected: {
      backgroundColor: '#e6f7ff',
      border: '2px solid #1890ff',
      fontWeight: 'bold',
    },
    otherMonth: {
      color: '#ccc',
      backgroundColor: '#fafafa',
    },
  };
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* 左侧栏 */}
          <Grid item xs={12} md={3}>
            {/* 欢迎卡片 */}
            <Card sx={{ mb: 2, borderRadius: 2, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', margin: '0 auto 16px' }}>
                  <PersonIcon sx={{ fontSize: 60, color: '#1890ff' }} />
                </Avatar>
                <Typography variant="h5" sx={{ color: 'white' }}>{userInfo.username || '教师'}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>{userInfo.position || '职位'}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>{userInfo.department || '院系'}</Typography>
              </CardContent>
            </Card>

            {/* 工作统计 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  工作统计
                </Typography>
                {workStats.map((stat, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{stat.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {stat.value}/{stat.total}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat.value / stat.total) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: `${stat.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                        }
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* 日历模块 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} />
                  考勤日历
                </Typography>
                <Box sx={calendarStyles.calendarContainer}>
                  <Box sx={calendarStyles.calendarHeader}>
                    <IconButton onClick={prevMonth} size="small" sx={{ color: 'white' }}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={calendarStyles.monthTitle}>
                      {currentYear}年{months[currentMonth]}
                    </Typography>
                    <IconButton onClick={nextMonth} size="small" sx={{ color: 'white' }}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>
                  <Box sx={calendarStyles.weekGrid}>
                    {weekdays.map((day, index) => (
                      <Box key={index} sx={calendarStyles.weekday}>
                        {day}
                      </Box>
                    ))}
                  </Box>
                  <Box sx={calendarStyles.daysGrid}>
                    {calendarDays.map((day, index) => (
                      <Box
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        sx={{
                          ...calendarStyles.dayCell,
                          ...(isToday(day) && calendarStyles.today),
                          ...(isSelected(day) && calendarStyles.selected),
                          ...(!isCurrentMonth(day) && calendarStyles.otherMonth),
                        }}
                      >
                        {day.date()}
                      </Box>
                    ))}
                  </Box>
                </Box>
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
                          background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${action.color}dd 0%, ${action.color} 100%)`,
                          },
                          flexDirection: 'column',
                          textAlign: 'center',
                          boxShadow: `0 4px 12px ${action.color}40`,
                        }}
                      >
                        {action.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* 教学任务 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  教学任务
                </Typography>
                {teachingTasks.map((task, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">{task.subject}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {task.students}名学生 | {task.room}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={task.progress}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)',
                        }
                      }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      课程进度: {task.progress}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* 待办事项 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  待办事项
                </Typography>
                <List>
                  {todos.map((item) => (
                    <ListItem key={item.id} secondaryAction={
                      <Button 
                        variant="contained" 
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                          }
                        }}
                      >
                        完成
                      </Button>
                    }>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <React.Fragment>
                            <Chip 
                              label={item.priority} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getPriorityColor(item.priority), 
                                color: 'white', 
                                mr: 1,
                                '& .MuiChip-label': { px: 2 }
                              }} 
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
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                  校园公告
                </Typography>
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
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  教师信息概览
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1 }} /> 
                  <Typography>院系：{userInfo.department || '未知'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon sx={{ mr: 1 }} /> 
                  <Typography>职称：{userInfo.position || '未知'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} /> 
                  <Typography>入职日期：{userInfo.hireDate || '未知'}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  今日活动
                </Typography>
                <List>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Box sx={{ 
                        width: '4px', 
                        height: '100%',
                        backgroundColor: activity.color,
                        borderRadius: '4px',
                        mr: 2
                      }} />
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* 工作记录 */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkHistoryIcon sx={{ mr: 1 }} />
                  工作记录
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">本周工作时长</Typography>
                    <Typography variant="h4" color="primary">38.5h</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">本月课时</Typography>
                    <Typography variant="h4" color="primary">45/48</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">教研活动</Typography>
                    <Typography variant="h4" color="primary">8次</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};

export default DashboardPage;