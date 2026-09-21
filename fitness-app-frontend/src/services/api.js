import axios from "axios";

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL:API_URL
});

api.interceptors.request.use((config) => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (userId) {
            config.headers['X-User-ID'] = userId;
        }
        return config;
    }
);


export const getActivities = () => api.get('/activities');
export const addActivity = (activity) => api.post('/activities', activity);
export const deleteActivity = async (id) => {
    // console.log(`Attempting to delete activity with ID: ${id}`);
    const activityResponse = await api.delete(`/activities/${id}`);
    // console.log('Activity deleted:', activityResponse.data);
    try {
        await api.delete(`/recommendations/activity/${id}`);
    } catch (error) {
        console.warn('Recommendation not found for activity, continuing delete:', error);
    }
    return activityResponse;
};
export const getActivityDetail = async (id) => {
    const [recommendationResponse, activitiesResponse] = await Promise.all([
        api.get(`/recommendations/activity/${id}`),
        api.get('/activities'),
    ]);

    const activities = Array.isArray(activitiesResponse?.data) ? activitiesResponse.data : [];
    const matchedActivity = activities.find((activity) => String(activity.id) === String(id));

    const mergedData = {
        ...(recommendationResponse?.data || {}),
        ...(matchedActivity || {}),
        id: matchedActivity?.id ?? recommendationResponse?.data?.activityId ?? id,
        activityId: matchedActivity?.id ?? recommendationResponse?.data?.activityId ?? id,
    };

    return {
        ...recommendationResponse,
        data: mergedData,
    };
};