const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (loginMessage) {
            loginMessage.innerText = "Signing in...";
            loginMessage.style.color = "var(--text-secondary)";
        }

        try {
            const response = await apiFetch('/login', {
                method: "POST",
                body: { email, password }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save token session
                Auth.saveSession(data);
                
                if (loginMessage) {
                    loginMessage.innerText = "Login successful! Redirecting...";
                    loginMessage.style.color = "var(--accent-green)";
                }
                
                setTimeout(() => {
                    if (Auth.isAdmin()) {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 1000);
            } else {
                if (loginMessage) {
                    loginMessage.innerText = data.detail || "Invalid email or password.";
                    loginMessage.style.color = "var(--accent-red)";
                }
            }
        } catch (error) {
            console.error("Login request failed:", error);
            if (loginMessage) {
                loginMessage.innerText = "Server communication error. Please try again.";
                loginMessage.style.color = "var(--accent-red)";
            }
        }
    });
}
