/**
 * Axios HTTP client instance.
 * All requests inherit the base URL and default headers from here.
 */
import axios from 'axios';
import BASE_URL from '../constants/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
});

export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export default apiClient;
