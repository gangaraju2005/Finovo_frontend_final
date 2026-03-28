/**
 * Auth service — handles all authentication API calls.
 */
import apiClient from './apiClient';

/**
 * Log in with email and password.
 */
const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login/', { email, password });
        return response.data;
    } catch (err) {
        if (!err.response) {
            // Network error — server unreachable
            throw new Error(
                'Cannot reach server.'
            );
        }
        throw err;
    }
};

/**
 * Register a new account.
 */
const register = async (fullName, username, email, mobileNumber, password, confirmPassword) => {
    try {
        console.log("DEBUG: Register baseURL =", apiClient.defaults.baseURL);
        console.log("DEBUG: Register URL =", apiClient.defaults.baseURL + '/auth/register/');
        const response = await apiClient.post('/auth/register/', {
            full_name: fullName,
            username,
            email,
            mobile_number: mobileNumber,
            password,
            confirm_password: confirmPassword,
        });
        return response.data;
    } catch (err) {
        console.log("DEBUG: Register error:", err.message);
        console.log("DEBUG: Register error code:", err.code);
        console.log("DEBUG: Register error response:", err.response?.status, err.response?.data);
        if (!err.response) {
            throw new Error(
                'Cannot reach server.'
            );
        }
        throw err;
    }
};

/**
 * Send OTP code to email.
 */
const sendOTP = async (email) => {
    try {
        const response = await apiClient.post('/auth/send-otp/', { email });
        return response.data;
    } catch (err) {
        throw err;
    }
};

/**
 * Verify OTP code.
 */
const verifyOTP = async (email, otp) => {
    try {
        const response = await apiClient.post('/auth/verify-email-otp/', { email, otp });
        return response.data;
    } catch (err) {
        throw err;
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password/', { email });
        return response.data;
    } catch (err) {
        throw err;
    }
};

const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await apiClient.post('/auth/reset-password/', {
            email,
            otp,
            new_password: newPassword
        });
        return response.data;
    } catch (err) {
        throw err;
    }
};

/**
 * Permanently delete the authenticated user's account and all their data.
 * @param {string} password — current password for confirmation
 */
const deleteAccount = async (password) => {
    const response = await apiClient.delete('/auth/delete-account/', {
        data: { password },
    });
    return response.data;
};

export default { login, register, sendOTP, verifyOTP, forgotPassword, resetPassword, deleteAccount };
