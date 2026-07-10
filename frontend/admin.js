document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial State Check: Show admin interface, but lock dataset registration until authenticated
    const restrictedContent = document.getElementById('admin-restricted-content');
    const deniedMessage = document.getElementById('admin-denied-message');
    
    // Always show the workspace to allow admin bootstrapping (setup & authentication)
    if (restrictedContent && deniedMessage) {
        restrictedContent.style.display = 'block';
        deniedMessage.style.display = 'none';
    }
    
    // Check if currently authenticated as admin
    checkAdminAuthStatus();
    
    // 2. Setup Action Listeners
    setupAdminActions();
});

/**
 * Verify if the user session is authenticated with administrator rights.
 * Unlocks the dataset management form if true.
 */
function checkAdminAuthStatus() {
    const datasetBox = document.getElementById('admin-dataset-box');
    const articleBox = document.getElementById('admin-article-box');
    
    if (!Auth.isAuthenticated() || !Auth.isAdmin()) {
        // Redirect to login if not admin
        window.location.href = "login.html";
        return;
    }

    if (!datasetBox) return;

    // Unlock dataset add controls
    datasetBox.style.opacity = '1';
    datasetBox.style.pointerEvents = 'all';
    if (articleBox) {
        articleBox.style.opacity = '1';
        articleBox.style.pointerEvents = 'all';
    }
}

/**
 * Bind click and submit handlers to the DOM elements.
 */
function setupAdminActions() {
    const setupAdminBtn = document.getElementById('setup-admin-btn');
    const setupMessage = document.getElementById('setup-message');
    
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginMessage = document.getElementById('admin-login-message');
    
    const addDatasetForm = document.getElementById('add-dataset-form');
    const addDatasetMessage = document.getElementById('add-dataset-message');

    // 1. Setup Admin Account bootstrapping
    if (setupAdminBtn) {
        setupAdminBtn.addEventListener('click', async () => {
            if (setupMessage) {
                setupMessage.innerText = "Initializing admin profile...";
                setupMessage.style.color = "var(--text-secondary)";
            }
            try {
                const response = await apiFetch('/admin/setup', { method: "POST" });
                const data = await response.json();
                
                if (setupMessage) {
                    setupMessage.innerText = data.message || "Admin setup complete.";
                    setupMessage.style.color = response.ok ? "var(--accent-green)" : "var(--text-primary)";
                }
            } catch (error) {
                console.error("Admin setup fail:", error);
                if (setupMessage) {
                    setupMessage.innerText = "Connection error while setting up admin.";
                    setupMessage.style.color = "var(--accent-red)";
                }
            }
        });
    }



    // 3. Add Dataset creation flow
    if (addDatasetForm) {
        addDatasetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!Auth.isAuthenticated() || !Auth.isAdmin()) {
                if (addDatasetMessage) {
                    addDatasetMessage.innerText = "Your admin session is invalid or expired. Please authenticate.";
                    addDatasetMessage.style.color = "var(--accent-red)";
                }
                return;
            }

            const name = document.getElementById('dataset-name').value;
            const description = document.getElementById('dataset-description').value;
            const price = parseInt(document.getElementById('dataset-price').value);

            if (addDatasetMessage) {
                addDatasetMessage.innerText = "Uploading dataset profile...";
                addDatasetMessage.style.color = "var(--text-secondary)";
            }

            try {
                const response = await apiFetch('/datasets', {
                    method: "POST",
                    body: { name, description, price }
                });

                const data = await response.json();
                if (response.ok) {
                    if (addDatasetMessage) {
                        addDatasetMessage.innerText = `Success! Added dataset "${data.name}" (ID: ${data.id})`;
                        addDatasetMessage.style.color = "var(--accent-green)";
                    }
                    addDatasetForm.reset();
                } else {
                    if (addDatasetMessage) {
                        addDatasetMessage.innerText = data.detail || "Failed to add dataset.";
                        addDatasetMessage.style.color = "var(--accent-red)";
                    }
                }
            } catch (error) {
                console.error("Upload failed:", error);
                if (addDatasetMessage) {
                    addDatasetMessage.innerText = "Connection error. Failed to register dataset.";
                    addDatasetMessage.style.color = "var(--accent-red)";
                }
            }
        });
    }

    // 4. Add Article creation flow
    const addArticleForm = document.getElementById('add-article-form');
    const addArticleMessage = document.getElementById('add-article-message');

    if (addArticleForm) {
        addArticleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!Auth.isAuthenticated() || !Auth.isAdmin()) {
                if (addArticleMessage) {
                    addArticleMessage.innerText = "Your admin session is invalid or expired. Please authenticate.";
                    addArticleMessage.style.color = "var(--accent-red)";
                }
                return;
            }

            const title = document.getElementById('article-title').value;
            const slug = document.getElementById('article-slug').value.trim();
            const content = document.getElementById('article-content').value;

            if (addArticleMessage) {
                addArticleMessage.innerText = "Publishing article...";
                addArticleMessage.style.color = "var(--text-secondary)";
            }

            try {
                const response = await apiFetch('/articles', {
                    method: "POST",
                    body: { id: slug, title, content }
                });

                const data = await response.json();
                if (response.ok) {
                    if (addArticleMessage) {
                        addArticleMessage.innerText = `Success! Published article "${data.title}"`;
                        addArticleMessage.style.color = "var(--accent-green)";
                    }
                    addArticleForm.reset();
                } else {
                    if (addArticleMessage) {
                        addArticleMessage.innerText = data.detail || "Failed to publish article.";
                        addArticleMessage.style.color = "var(--accent-red)";
                    }
                }
            } catch (error) {
                console.error("Publishing failed:", error);
                if (addArticleMessage) {
                    addArticleMessage.innerText = "Connection error. Failed to publish article.";
                    addArticleMessage.style.color = "var(--accent-red)";
                }
            }
        });
    }
}