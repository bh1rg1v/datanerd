const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Enhanced fetch wrapper that automatically manages auth headers and JSON content-types.
 * @param {string} endpoint - The relative API endpoint path (e.g. '/login').
 * @param {Object} options - Standard fetch options.
 * @returns {Promise<Response>}
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '': '/'}${endpoint}`;
    
    // Ensure headers exist
    options.headers = options.headers || {};
    
    // Automatically retrieve JWT from localStorage and inject into request headers
    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Auto content-type for objects
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, options);
        
        // Handle session expiration
        if (response.status === 401) {
            // Only redirect if there was a token that is now invalid/expired
            if (token && !endpoint.includes('/login')) {
                console.warn("Session expired. Clearing authorization cache and redirecting to login.");
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('admin_user_id');
                localStorage.removeItem('is_admin');
                localStorage.removeItem('user_name');
                alert("Your session has expired. Please log in again.");
                window.location.href = "login.html";
            }
        }
        
        return response;
    } catch (error) {
        console.error(`API Fetch Error [${url}]:`, error);
        throw error;
    }
}
