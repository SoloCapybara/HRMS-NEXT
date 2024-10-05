import apiClient from '@/lib/interceptor';

//路径为@/lib/user.ts
// 登录请求
export const login = (employeeId: string, password: string) => {
  return apiClient.post('/login', new URLSearchParams({
    employeeId: String(employeeId),
    password: password
  }));
};

// 用户获取自己信息
export const getUserInfo = () => {
  return apiClient.get('/getEmpInfo/personal');
};

// 用户修改个人信息
export const updateUserInfo = (userInfo: {
  gender: string;
  age: number;
  phoneNumber: string;
  email: string;
}) => {
  return apiClient.patch('/updateInfo', userInfo);
};

// 用户修改密码
export const changePassword = (oldPassword: string, newPassword: string) => {
  return apiClient.patch('/updatepwd', { oldPassword, newPassword });
};

// 管理员修改员工信息
export const updateEmployeeProfile = (
  employeeId: string,
  department: number,
  position: number,
  role: number
) => {
  return apiClient.patch('/updateProfile', {
    employeeId,
    department,
    position,
    role
  });
};

// 管理员重置员工密码
export const resetEmployeePassword = (employeeId: string, newPassword: string) => {
  return apiClient.patch('/resetpwd', { employeeId, newPassword });
};

// 获取所有员工信息
export const fetchEmployeeData = () => {
  return apiClient.get('/getEmpInfo');
};

// 查询单个员工信息
export const fetchSingleEmployee = (employeeId: string) => {
  return apiClient.get(`/getEmpInfo/${employeeId}`);
};

// 批量删除员工
export const deleteEmployees = (employeeIds: string[]) => {
  const ids = employeeIds.join(',');
  return apiClient.delete(`/deleteEmployees/${ids}`);
};

// 添加新员工
export const addEmployee = (employeeData: any) => {
  return apiClient.post('/addEmployee', employeeData);
};