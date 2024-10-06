import apiClient from "@/lib/interceptor";
import moment from 'moment';
// 查询部门公告
export const getAnnouncement = async (deptId?: number) => {
    const params = deptId ? { deptId } : {};
    const response = await apiClient.get('/announcement', { params });
    return response.data;
};

// 上传部门公告
export const uploadAnnouncement = (data: {
    deptId: number;
    title: string;
    content: string;
    publishTime: string;
}) => {
    const formattedData = {
        ...data,
        publishTime: moment(data.publishTime).format('YYYY-MM-DDTHH:mm:ss')
    };
    return apiClient.post('/announcement', formattedData);
};

// 更新部门公告
export const updateAnnouncement = (data: {
    id: number;
    deptId?: number;
    title?: string;
    content?: string;
    publishTime?: string;
}) => {
    return apiClient.patch('/announcement', data);
};

// 删除部门公告
export const deleteAnnouncement = (ids: string) => {
    return apiClient.delete(`/announcement/${ids}`);
};