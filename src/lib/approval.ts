import apiClient from '@/lib/interceptor';

// 获取所有员工的请假申请
export const getLeaveRequest = (params) => {
  return apiClient.get('/approval', {
    params: {
      page: params.page,  // 修改这里
      pageSize: params.pageSize,  // 修改这里
      deptId: params.deptId,
      type: params.type,
      approvalStatus: params.approvalStatus,
    },
  });
};

// 提交审批请假结果
export const saveApproval = (approvalData) => {
  return apiClient.patch('/approval', approvalData);
};

// 提交审批销假结果
export const updateRevokeStatus = (revokeData) => {
  return apiClient.patch('/approval', revokeData);
};

// 提交审批延期结果
export const updateExtensionStatus = (ExtensionData) => {
  return apiClient.patch('/approval', ExtensionData);
};