'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Tab,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { AccessTime, BarChart } from '@mui/icons-material';
import { postAttendance, getAttendanceRecords, getCheckInTime } from '@/lib/attendance';
import { getUserInfo } from '@/lib/user';
import Layout from '@/components/Layout';
import CalendarComponent from '@/components/CalendarComponent';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);
  const [lastClockTime, setLastClockTime] = useState('今日尚未打卡');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [canClockIn, setCanClockIn] = useState(true);
  const [canClockOut, setCanClockOut] = useState(false);
  const [canCheckInToday, setCanCheckInToday] = useState(true);
  const [recentRecords, setRecentRecords] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'checkInDate', label: '日期' },
    { id: 'onWorkTime', label: '上班时间' },
    { id: 'offDutyTime', label: '下班时间' },
    { id: 'workingTime', label: '工作时长' },
    { id: 'overTime', label: '加班时间' },
    { id: 'checkInStatus', label: '状态', format: (value) => getStatusText(value) },
    { id: 'circumstance', label: '特殊情况', format: (value) => getCircumstanceText(value) },
  ];

  const statusMapping = {
    1: { text: '上班中', class: 'working' },
    2: { text: '已下班', class: 'off-work' },
    3: { text: '未打卡', class: 'not-checked' },
    4: { text: '迟到', class: 'late' },
    5: { text: '早退', class: 'early-leave' },
    6: { text: '迟到加早退', class: 'late-early-leave' },
  };

  const circumstanceMapping = {
    1: '正常',
    2: '请假',
    3: '出差',
    4: '培训'
  };

  const getStatusText = (status) => {
    const statusInfo = statusMapping[status];
    return statusInfo ? statusInfo.text : '未知';
  };

  const getCircumstanceText = (circumstance) => {
    return circumstanceMapping[circumstance] || '未知';
  };

  const getCurrentPosition = () => {
    console.log('开始获取当前位置');
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('浏览器不支持地理位置');
        reject(new Error('浏览器不支持地理位置'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('成功获取地理位置');
            console.log('经度:', position.coords.longitude);
            console.log('纬度:', position.coords.latitude);
            resolve(position);
          },
          (error) => {
            console.error('获取地理位置失败:', error);
            reject(error);
          }
        );
      }
    });
  };

  const clockIn = async (type) => {
    console.log('开始打卡操作:', type);
    try {
      if (!userInfo.employeeId || !userInfo.department) {
        console.error('用户信息不完整:', userInfo);
        throw new Error('用户信息不完整，无法打卡');
      }
  
      let position;
      try {
        position = await getCurrentPosition();
        console.log('获取到地理位置:', position);
        console.log('经度:', position.coords.longitude);
        console.log('纬度:', position.coords.latitude);
      } catch (posError) {
        console.error('获取地理位置失败:', posError);
        // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.warning
        // 这里暂时使用 console.warn
        console.warn('无法获取地理位置，将使用默认位置');
        position = { coords: { latitude: 0, longitude: 0 } };
      }
  
      const now = new Date();
      const time = now.toLocaleTimeString('zh-CN', { hour12: false });
      const date = now.toISOString().split('T')[0];
  
      const attendanceData = {
        employeeId: userInfo.employeeId,
        deptId: userInfo.department,
        checkInDate: date,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        [type === 'in' ? 'onWorkTime' : 'offDutyTime']: time
      };
      
      console.log('准备发送的考勤数据:', attendanceData);
      console.log('考勤数据中的经度:', attendanceData.longitude);
      console.log('考勤数据中的纬度:', attendanceData.latitude);
      
      try {
        const response = await postAttendance(attendanceData);
        console.log('收到打卡响应:', response);
        
        if (response.data && response.data.code === 1) {
          setLastClockTime(time);
          if (type === 'in') {
            setClockedIn(true);
            setCanClockIn(false);
            setCanClockOut(true);
          } else {
            setClockedOut(true);
            setCanClockOut(false);
          }
          await getEmployeeAttendance();
          // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.success
          // 这里暂时使用 console.log
          console.log(`${type === 'in' ? '上班' : '下班'}打卡成功`);
        } else {
          throw new Error(response.data.msg || '打卡失败');
        }
      } catch (apiError) {
        console.error('API 请求失败:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('打卡失败:', error);
      let errorMessage = '打卡失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error.response) {
        console.error('错误响应:', error.response);
        if (error.response.data && error.response.data.msg) {
          errorMessage += ` - ${error.response.data.msg}`;
        }
      }
      // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.error
      // 这里暂时使用 console.error
      console.error(errorMessage);
    }
  };

  const getEmployeeAttendance = async () => {
    try {
      if (!userInfo.employeeId) {
        console.error('员工ID不存在:', userInfo);
        throw new Error('员工ID不存在');
      }
      const response = await getAttendanceRecords(userInfo.employeeId);
      console.log('获取到的考勤记录:', response);
      
      if (response.data && response.data.code === 1) {
        const records = response.data.data;
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = records.find(record => record.checkInDate === today);

        console.log('今日记录:', todayRecord);

        if (todayRecord) {
          setLastClockTime(todayRecord.onWorkTime || '今日尚未打卡');
          setClockedIn(!!todayRecord.onWorkTime);
          setClockedOut(!!todayRecord.offDutyTime && todayRecord.offDutyTime !== "00:00:00");
          setCanClockIn(!todayRecord.onWorkTime);
          setCanClockOut(!!todayRecord.onWorkTime && (!todayRecord.offDutyTime || todayRecord.offDutyTime === "00:00:00"));
        } else {
          setLastClockTime('今日尚未打卡');
          setClockedIn(false);
          setClockedOut(false);
          setCanClockIn(true);
          setCanClockOut(false);
        }

        records.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
        setRecentRecords(records.slice(0, 5));
      } else {
        throw new Error(response.data.msg || '获取考勤记录失败');
      }
    } catch (error) {
      console.error('获取考勤记录失败:', error);
      // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.error
      // 这里暂时使用 console.error
      console.error('获取考勤记录失败: ' + (error.message || '未知错误'));
    }
  };

  const updateCurrentTime = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('zh-CN'));
    setCurrentTime(now.toLocaleTimeString('zh-CN'));
  };

  const checkIfCanCheckInToday = async () => {
    try {
      if (!userInfo.department) {
        console.error('部门ID不存在:', userInfo);
        throw new Error('部门ID不存在');
      }
      const response = await getCheckInTime(userInfo.department);
      console.log('获取到的打卡时间设置:', response);
      if (response.data && response.data.code === 1) {
        const today = new Date();
        const startDate = new Date(response.data.data.setStartDate);
        const endDate = new Date(response.data.data.setEndDate);
        setCanCheckInToday(today >= startDate && today <= endDate);
      } else {
        throw new Error(response.data.msg || '检查打卡日失败');
      }
    } catch (error) {
      console.error('检查打卡日失败:', error);
      setCanCheckInToday(false);
      // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.error
      // 这里暂时使用 console.error
      console.error('检查打卡日失败: ' + (error.message || '未知错误'));
    }
  };

  const fetchUserInfo = async () => {
    console.log('开始获取用户信息');
    try {
      const response = await getUserInfo();
      console.log('获取到的用户信息:', response);
      if (response.data && response.data.code === 1 && response.data.data) {
        setUserInfo(response.data.data);
        console.log('用户信息已设置:', response.data.data);
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 使用 Material-UI 的 Snackbar 或 Alert 组件替代 message.error
      // 这里暂时使用 console.error
      console.error('获取用户信息失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('组件挂载，开始初始化');
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000);
    fetchUserInfo();

    return () => {
      console.log('组件卸载，清理定时器');
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (userInfo.employeeId) {
      checkIfCanCheckInToday();
      getEmployeeAttendance();
    }
  }, [userInfo]);

  const handleTabChange = (event, newValue) => {
    console.log('切换标签页:', newValue);
    setActiveTab(newValue);
  };

  return (
    <Layout>
      <Card>
        <Typography variant="h5" component="div" sx={{ p: 2 }}>
          考勤管理
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<AccessTime />} label="打卡" />
            <Tab icon={<BarChart />} label="考勤统计" />
          </Tabs>
        )}
        {!loading && (
          <>
            {activeTab === 0 && (
              <>
                <Grid container justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{currentDate}</Typography>
                    <Typography variant="h4">{currentTime}</Typography>
                  </Grid>
                </Grid>

                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <Grid item>
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!canClockIn || !canCheckInToday}
                      onClick={() => clockIn('in')}
                      sx={{ mr: 1 }}
                    >
                      上班打卡
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      disabled={!canClockOut || !canCheckInToday}
                      onClick={() => clockIn('out')}
                    >
                      下班打卡
                    </Button>
                  </Grid>
                </Grid>

                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Alert
                      severity="info"
                      icon={<AccessTime />}
                    >
                      <Typography variant="h6">打卡状态</Typography>
                      {!canCheckInToday && <Typography>今日无需打卡</Typography>}
                      {canCheckInToday && (
                        <>
                          <Typography>上次打卡时间：{lastClockTime}</Typography>
                          <Typography>
                            当前状态：
                            <span className={clockedIn && clockedOut ? 'status-complete' : clockedIn ? 'status-partial' : 'status-none'}>
                              {clockedIn && clockedOut ? '已签到' : clockedIn ? '部分签到' : '未签到'}
                            </span>
                          </Typography>
                        </>
                      )}
                    </Alert>
                  </Grid>
                </Grid>

                <Grid container sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6">最近打卡记录</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {columns.map((column) => (
                              <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentRecords.map((row) => (
                            <TableRow key={row.checkInDate}>
                              {columns.map((column) => (
                                <TableCell key={column.id}>
                                  {column.format ? column.format(row[column.id]) : row[column.id]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </>
            )}
            {activeTab === 1 && (
              <CalendarComponent attendanceRecords={recentRecords} />
            )}
          </>
        )}
      </Card>
    </Layout>
  );
};

export default AttendancePage;