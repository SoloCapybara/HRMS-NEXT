// src/lib/role.ts
import apiClient from '@/lib/interceptor';

export const fetchRoles = () => {
  return apiClient.get('/roles');
};

export const addRole = (roleData) => {
  return apiClient.post('/roles', roleData);
};

export const updateRole = (roleData) => {
  return apiClient.patch('/roles', roleData);
};

export const deleteRole = (roleIds) => {
  return apiClient.delete(`/roles/${roleIds.join(',')}`);
};

