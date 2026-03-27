import apiClient from './apiClient';

/**
 * Fetch the authenticated user's full profile.
 */
const getProfile = async () => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
};

/**
 * Update the user profile.
 * @param {object} data - Partial — any of { first_name, last_name, monthly_savings_goal }
 */
const updateProfile = async (data, config = {}) => {
    const response = await apiClient.patch('/auth/profile/', data, config);
    return response.data;
};

export default { getProfile, updateProfile };
