const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    console.log(config);
    

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        console.log(response);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }
        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

export const api = {
    // Auth endpoints
    login: (email, password) => 
        apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        }),

        validateToken: (token) =>
            apiRequest('/validate-token', {
                method: 'POST',
                body: JSON.stringify({ token }),
            }),
    
        // Airplane endpoints
        getAirplanes: () => apiRequest('/airplanes'),
        addAirplane: (data) =>
            apiRequest('/airplanes', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    
        // Company endpoints
        addCompany: (data) =>
            apiRequest('/company', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    
        // Worker endpoints
        getWorkers: () => apiRequest('/workers'),
        addWorker: (data) =>
            apiRequest('/workers', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    
        // Schedule endpoints
        getSchedule: () => apiRequest('/schedule'),
        addSchedule: (data) =>
            apiRequest('/schedule', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    
        // Test endpoints
        getTests: () => apiRequest('/tests'),
        getAvailableWorkers: (deptId) =>
            apiRequest('/test/workers', {
                method: 'POST',
                body: JSON.stringify({ dept_id: deptId }),
            }),
        assignTech: (testId, techId) =>
            apiRequest('/tests/assign-tech', {
                method: 'PATCH',
                body: JSON.stringify({ test_id: testId, tech_id: techId }),
            }),
    
        // Pilot endpoints
        getPilots: () => apiRequest('/pilot'),
        getAvailablePilots: () =>
            apiRequest('/pilot', {
                method: 'POST',
            }),
        assignPilot: (scheduleId, pilotId) =>
            apiRequest('/schedule/assign-pilot', {
                method: 'PATCH',
                body: JSON.stringify({ schedule_id: scheduleId, pilot_id: pilotId }),
            }),
    
        // Worker tasks
        getWorkerTasks: (techId) => {
            const endpoint = (techId === undefined || techId === null || techId === "")
                ? '/worker/tasks'
                : `/worker/tasks?tech_id=${techId}`;
            return apiRequest(endpoint);
        },
}