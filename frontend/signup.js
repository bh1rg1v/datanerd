const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (signupMessage) {
            signupMessage.innerText = "Registering user...";
            signupMessage.style.color = "var(--text-secondary)";
        }

        try {
            const response = await apiFetch('/signup', {
                method: "POST",
                body: { name, email, password }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save session (API signup returns access_token)
                Auth.saveSession(data);
                
                if (signupMessage) {
                    signupMessage.innerText = "Account created successfully! Redirecting...";
                    signupMessage.style.color = "var(--accent-green)";
                }
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                if (signupMessage) {
                    signupMessage.innerText = data.detail || "Registration failed. Try a different email.";
                    signupMessage.style.color = "var(--accent-red)";
                }
            }
        } catch (error) {
            console.error("Signup request failed:", error);
            if (signupMessage) {
                signupMessage.innerText = "Server communication error. Please try again.";
                signupMessage.style.color = "var(--accent-red)";
            }
        }
    });
}
