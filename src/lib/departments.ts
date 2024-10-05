import apiClient from '@/lib/interceptor';

// 获取所有的部门信息
export const getAllDepartments = () => {
  return apiClient.get('/department');
};

// 获取单个部门信息
export const getDepartment = (deptId: string) => {
  return apiClient.get(`/department/${deptId}`);
};

// 新增部门
export const addDepartment = (deptInfo: any) => {
  return apiClient.post('/department', deptInfo);
};

// 更新部门信息
export const updateDepartment = (newDeptInfo: any) => {
  return apiClient.patch('/department', newDeptInfo);
};

// 删除部门
export const deleteDepartment = (delDepts: string | string[]) => {
  const deptIds = Array.isArray(delDepts) ? delDepts.join(',') : delDepts;
  return apiClient.delete(`/department/${deptIds}`);
};