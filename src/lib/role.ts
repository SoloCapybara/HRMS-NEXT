// src/lib/role.ts
import apiClient from '@/lib/interceptor';

//获取所有角色和所包含的权限以及所有权限
export const fetchRoles = () => {
  return apiClient.get('/roles');
};

//添加角色
export const addRole = (roleData) => {
  return apiClient.post('/roles', roleData);
};

//更新角色
export const updateRole = (roleData) => {
  return apiClient.patch('/roles', roleData);
};

//删除角色
export const deleteRole = (roleIds) => {
  return apiClient.delete(`/roles/${roleIds.join(',')}`);
};

