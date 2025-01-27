import axios from 'axios';

// Set the base URL for all requests
const BASE_URL = 'http://localhost:3000/api/admin';

// Centralized logging function
const logError = (message) => {
    console.error(message);
};

// Helper function to handle API calls
const apiCall = async (method, endpoint, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            data,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            logError(`API call error (${error.response.status}): ${error.response.data.message || error.response.statusText}`);
            throw error.response.data;
        } else {
            logError(`Network error: ${error.message}`);
            throw error;
        }
    }
};

// API functions for admin routes
const getAllUsers = async () => {
    try {
        const response = await apiCall('get', '/users');
        if (response.length === 0) {
            logError('No users found');
        }
        return response || [];
    } catch (error) {
        logError('Failed to fetch users');
        throw error; // Rethrow to handle it in the calling function
    }
};

const deleteUser = async (userId) => {
    if (!userId) throw new Error('Invalid user ID');
    return apiCall('delete', `/users/${userId}`);
};

const updateUser = async (userId, updates) => {
    if (!userId || !updates) throw new Error('Invalid user ID or updates');
    return apiCall('put', `/users/${userId}`, updates);
};

// SOS
const getAllSOS = async () => {
    try {
        const response = await apiCall('get', '/sos');
        if (response.length === 0) {
            logError('No SOS records found');
        }
        return response || [];
    } catch (error) {
        logError('Failed to fetch SOS records');
        throw error;
    }
};

const deleteSOS = (sosId) => apiCall('delete', `/sos/${sosId}`);

const getActiveSOS = async () => {
    const response = await apiCall('get', '/sos/active');
    return response.data || []; // Return response.data directly
};

const getEmergencyTrends = async () => {
    try {
        const response = await apiCall('get', '/sos/trends');
        if (response.success && Array.isArray(response.data)) {
            return response.data; // Return the data directly
        } else {
            console.log('No emergency trends found');
            return []; // Return an empty array if no trends found
        }
    } catch (error) {
        console.error('Error fetching emergency trends:', error);
        return []; // Return an empty array on error
    }
};


// Circles
const getAllCircles = async () => {
    const response = await apiCall('get', '/circles');
    if (response.success && response.data && response.data.length > 0) {
        return response.data;
    } else {
        console.log('No circles found');
        return [];
    }
};

const deleteCircle = (circleId) => apiCall('delete', `/circles/${circleId}`);

// User Cards
const getAllUserCards = async () => {
    try {
        console.log('Fetching user cards...');
        const response = await apiCall('get', '/user-cards');
        
        console.log('API Response:', response); // Log the raw API response
        
        if (response && response.length === 0) {
            console.log('No user cards found');
        } else if (Array.isArray(response)) {
            console.log(`Fetched ${response.length} user cards.`);
        } else {
            console.log('Unexpected response format:', response);
        }
        
        return response || [];
    } catch (error) {
        console.error('Error fetching user cards:', error);
        return [];
    }
};

// Group all exports into a single object and assign it to a variable
const api = {
    getAllUsers,
    deleteUser,
    updateUser,
    getAllSOS,
    deleteSOS,
    getActiveSOS,
    getEmergencyTrends,
    getAllCircles,
    deleteCircle,
    getAllUserCards,
};

// Export the api object as default
export default api;
