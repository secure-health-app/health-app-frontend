import { authRequest } from '../lib/api';

const fitbitService = {
    async getHeartRate(date = 'today') {
        return authRequest(`/api/fitbit/heart-rate/${date}`);
    },

    async getSteps(date = 'today') {
    return authRequest(`/api/fitbit/steps?date=${date}`);
    },

    async getSleep(date = 'today') {
    return authRequest(`/api/fitbit/sleep?date=${date}`);
    },

    async getDashboard() {
        return authRequest(`/api/fitbit/dashboard`);
    }
};

export default fitbitService;