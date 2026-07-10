document.addEventListener("DOMContentLoaded", () => {
    loadArticles();
});

/**
 * Fetch articles from GET /api/articles and render them dynamically on the homepage.
 */
async function loadArticles() {
    const container = document.getElementById('articles-container');
    if (!container) return;
    
    try {
        const response = await apiFetch('/articles');
        if (!response.ok) {
            throw new Error(`Articles request returned status: ${response.status}`);
        }
        
        const articles = await response.json();
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary);">No articles published yet.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = ''; // Clear loading spinner
        
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        
        articles.forEach(article => {
            const dateObj = new Date(article.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Limit content preview to 150 characters
            const textContent = article.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
            const preview = textContent.length > 150 ? textContent.substring(0, 147) + '...' : textContent;
            
            const articleUrl = isLocal ? `article.html?id=${article.id}` : `/articles/${article.id}`;
            
            const cardHtml = `
                <a href="${articleUrl}" class="article-card">
                    <div class="article-card-header">
                        <span class="article-date">${formattedDate}</span>
                    </div>
                    <h3 class="article-title">${escapeHtml(article.title)}</h3>
                    <p class="article-preview">${escapeHtml(preview)}</p>
                    <span class="read-more">Read Article →</span>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    } catch (error) {
        console.error("Failed to load articles:", error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p style="color: var(--accent-red); font-weight: 600;">Failed to load articles from backend server.</p>
            </div>
        `;
    }
}

/**
 * Helper to escape HTML tags to avoid XSS issues.
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
