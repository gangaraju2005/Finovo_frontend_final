/**
 * Health check service.
 * Verifies backend connectivity.
 */
import apiClient from './apiClient';

/**
 * Fetches a hello message from the Django backend.
 * @returns {Promise<string>} The message string from the API.
 */
const getHelloMessage = async () => {
    const response = await apiClient.get('/hello/');
    return response.data.message;
};

export default { getHelloMessage };
