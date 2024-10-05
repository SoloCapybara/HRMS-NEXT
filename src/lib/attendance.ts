import apiClient from '../lib/interceptor';
// 路径为:@/lib/attendance

// 考勤定位请求
export const postAttendance = (attendanceData: any) => {
  return apiClient.post('/attendance/location', attendanceData);
};

// 获取单个员工考勤记录
export const getAttendanceRecords = (employeeId: string) => {
  return apiClient.get(`/attendance/getRecords/${employeeId}`);
};

// 获取所有员工考勤记录
export const getAllAttendanceRecords = () => {
  return apiClient.get('/attendance/getRecords');
};

// 设置考勤打卡时间
export const setCheckInTime = (attendanceSettings: any) => {
  return apiClient.post('/attendance/setCheckInTime', attendanceSettings);
};

// 判断当天是否为打卡日
export const getCheckInTime = (deptId: string) => {
  return apiClient.get(`/attendance/getCheckInTime/${deptId}`);
};

// 获取请假记录
export const getLeaveRecords = (params: any) => {
  return apiClient.get('/attendance/leaveRecord', { params });
};

// 提交请假请求
export const postLeaveRequest = (leaveData: any) => {
  return apiClient.post('/attendance/leave', leaveData);
};

//修改请假原因
export const updateLeaveReason = (id: string, reason: string) => {
  return apiClient.patch('/attendance/updateLeaveRecord', { id, reason });
};

// 更新请假记录
export const updateLeaveRequest = (id: string, leaveData: any) => {
  return apiClient.patch(`/attendance/leaveRecord/${id}`, leaveData);
};

// 撤销请假记录
export const deleteLeaveRecords = (ids: string[]) => {
  return apiClient.delete(`/attendance/deleteLeaveRecord/${ids.join(',')}`);
};

// 提交销假请求
export const postRevokeRequest = (id: string) => {
  return apiClient.patch(`/attendance/cancelLeaveRecord/${id}`);
};

// 提交延假请求
export const postExtensionRequest = (formattedExtendForm: any) => {
  return apiClient.patch(`/attendance/leaveRecord/${formattedExtendForm.id}`, formattedExtendForm);
};


