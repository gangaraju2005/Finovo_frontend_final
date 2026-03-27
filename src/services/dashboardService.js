import apiClient from './apiClient';

/**
 * Fetch all aggregated dashboard data for the home screen.
 * Requires user to be authenticated (JWT token sent via interceptor).
 */
const getDashboardData = async () => {
    const response = await apiClient.get('/transactions/dashboard/');
    return response.data;
};

export default { getDashboardData };
