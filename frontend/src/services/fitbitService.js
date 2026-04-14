import { authRequest } from '../lib/api';


/* ===================== FITBIT SERVICE ===================== */

const fitbitService = {

    // get heart rate for a given date (defaults to today)
    async getHeartRate(date = 'today') {

        return authRequest(
            `/api/fitbit/heart-rate/${date}`
        );
    },

    // get steps for a given date
    async getSteps(date = 'today') {

        return authRequest(
            `/api/fitbit/steps?date=${date}`
        );
    },

    // get sleep data for a given date
    async getSleep(date = 'today') {

        return authRequest(
            `/api/fitbit/sleep?date=${date}`
        );
    },

    // get combined dashboard data
    async getDashboard() {

        return authRequest(
            `/api/fitbit/dashboard`
        );
    }

};


export default fitbitService;