(function() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
})();

/**
 * Session storage and authentication state helpers.
 */

const Auth = {
    /**
     * Store JWT token and user metadata in localStorage.
     * @param {Object} data - API response containing token and user profile.
     */
    saveSession(data) {
        if (!data || !data.access_token) return;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
        localStorage.setItem('user_name', data.name || 'User');
        if (data.is_admin) {
            localStorage.setItem('admin_user_id', data.user_id);
        }
    },

    /**
     * Clear active session variables and reload the page.
     */
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('admin_user_id');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('user_name');
        window.location.href = 'index.html';
    },

    /**
     * Check if user session exists.
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },

    /**
     * Check if active session belongs to an admin.
     * @returns {boolean}
     */
    isAdmin() {
        return localStorage.getItem('is_admin') === 'true';
    },

    /**
     * Retrieve the stored user's display name.
     * @returns {string}
     */
    getUserName() {
        return localStorage.getItem('user_name') || 'Member';
    },

    /**
     * Dynamically update pages' login/logout top navigation bar.
     */
    updateNavigation() {
        const topAuth = document.getElementById('top-auth');
        if (!topAuth) return;

        const theme = localStorage.getItem('theme') || 'light';
        const themeBtnHtml = `
            <button id="theme-toggle-btn" class="auth-btn" style="font-weight: 700; text-transform: uppercase;">
                ${theme === 'light' ? '☾ Dark' : '☀ Light'}
            </button>
        `;

        const globalNavHtml = `
            <a href="index.html" class="nav-link">Home</a>
            <a href="articles.html" class="nav-link">Articles</a>
        `;

        if (this.isAuthenticated()) {
            const userName = this.getUserName();
            const isAdminUser = this.isAdmin();
            
            let navHtml = globalNavHtml + `
                <span class="welcome-text">Welcome, <strong>${userName}</strong></span>
            `;
            
            if (isAdminUser) {
                // Determine if we're on the dashboard already
                const isDashboard = window.location.pathname.includes('admin.html');
                if (!isDashboard) {
                    navHtml += `<a href="admin.html" class="nav-link dashboard-link">Dashboard</a>`;
                }
            }
            
            navHtml += `
                <button id="logout-btn" class="auth-btn logout-btn">Logout</button>
            `;
            
            topAuth.innerHTML = navHtml + themeBtnHtml;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        } else {
            topAuth.innerHTML = globalNavHtml + `
                <a href="login.html" class="auth-btn">Login</a>
                <a href="signup.html" class="auth-btn signup-btn">Sign Up</a>
            ` + themeBtnHtml;
        }

        // Add theme button event listener
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const currentTheme = localStorage.getItem('theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
                this.updateNavigation();
            });
        }
    }
};

// Auto run navigation display update when content is loaded
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavigation();
});
