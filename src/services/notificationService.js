import apiClient from './apiClient';

const getNotifications = async () => {
    const response = await apiClient.get('/transactions/notifications/');
    return response.data;
};

const markAsRead = async () => {
    const response = await apiClient.post('/transactions/notifications/read/');
    return response.data;
};

const toggleStar = async (id) => {
    const response = await apiClient.post(`/transactions/notifications/${id}/star/`);
    return response.data;
};

const clearNonStarred = async () => {
    const response = await apiClient.delete('/transactions/notifications/clear/');
    return response.data;
};

const bulkDelete = async (ids) => {
    const response = await apiClient.post('/transactions/notifications/bulk-delete/', { ids });
    return response.data;
};

export default {
    getNotifications,
    markAsRead,
    toggleStar,
    clearNonStarred,
    bulkDelete,
};

