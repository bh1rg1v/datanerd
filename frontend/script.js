let totalAmount = 0;
let selectedDatasetIds = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch and render all datasets from the backend catalog
    loadDatasets();

    // 2. Fetch and render articles
    loadArticles();
    
    // 3. Setup checkout click listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});

/**
 * Fetch datasets from GET /api/datasets and render them dynamically on the homepage.
 */
async function loadDatasets() {
    const container = document.getElementById('datasets-container');
    if (!container) return;
    
    try {
        const response = await apiFetch('/datasets');
        if (!response.ok) {
            throw new Error(`Catalog request returned status: ${response.status}`);
        }
        
        const datasets = await response.json();
        
        // Sort datasets by price (ascending)
        datasets.sort((a, b) => a.price - b.price);
        
        if (datasets.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="color: var(--text-secondary);">No datasets available in the catalog at this time.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = ''; // Clear spinner
        
        datasets.forEach(dataset => {
            // Split descriptions by comma or newline to render bullet points cleanly
            const bullets = dataset.description.split(/,|\r?\n/).map(item => item.trim()).filter(Boolean);
            const bulletsHtml = bullets.map(b => `<li class="desc-bullet">${b}</li>`).join('');
            
            const cardHtml = `
                <div class="datacard" id="dataset-card-${dataset.id}">
                    <div class="titlebox">
                        <p>${escapeHtml(dataset.name)}</p>
                    </div>
                    <div class="description">
                        <ul>
                            ${bulletsHtml}
                        </ul>
                        <span class="price-tag">₹${dataset.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="select-box">
                        <label class="custom-checkbox">
                            <input type="checkbox" class="dataset-checkbox" data-price="${dataset.price}" data-id="${dataset.id}" data-name="${escapeHtml(dataset.name)}">
                            <span class="slider"></span>
                        </label>
                        <label>Select Dataset</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        // Register change listeners for new checkboxes
        setupCheckboxListeners();
        
    } catch (error) {
        console.error("Failed to load catalog datasets:", error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--accent-red); font-weight: 600;">Failed to load datasets from backend server.</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Ensure backend is running on http://127.0.0.1:8000</p>
            </div>
        `;
    }
}

/**
 * Configure dynamic checkbox change listeners to calculate cart totals.
 */
function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.dataset-checkbox');
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!totalAmountSpan || !checkoutBtn) return;
    
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const price = parseInt(e.target.getAttribute('data-price'));
            const datasetId = parseInt(e.target.getAttribute('data-id'));
            
            if (e.target.checked) {
                totalAmount += price;
                selectedDatasetIds.push(datasetId);
            } else {
                totalAmount -= price;
                selectedDatasetIds = selectedDatasetIds.filter(id => id !== datasetId);
            }
            
            totalAmountSpan.innerText = totalAmount.toLocaleString('en-IN');
            checkoutBtn.disabled = totalAmount === 0;
        });
    });
}

/**
 * Prompt the user to message on Reddit to purchase the selected datasets.
 * Copies the message to the clipboard and triggers a delayed redirection with a countdown.
 */
function handleCheckout() {
    if (totalAmount === 0) return;
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const statusMsg = document.getElementById('message');
    
    // Generate dynamic message content based on selection
    const checkedCheckboxes = document.querySelectorAll('.dataset-checkbox:checked');
    let msgLines = [];
    checkedCheckboxes.forEach(cb => {
        const name = cb.getAttribute('data-name');
        const price = parseInt(cb.getAttribute('data-price')).toLocaleString('en-IN');
        msgLines.push(`${name}: ₹${price}`);
    });
    
    const messageContent = `hey, I want the following datasets:\n\n` + 
                           msgLines.join('\n') + 
                           `\n\ntotal: ₹${totalAmount.toLocaleString('en-IN')}.\n\nlet me know how to move forward.`;

    if (checkoutBtn) {
        checkoutBtn.disabled = true;
    }

    if (statusMsg) {
        statusMsg.innerHTML = `
            <div style="margin-top: 1.5rem; padding: 1.5rem; border: var(--border-width) solid var(--border-color); background: var(--bg-focus); border-radius: var(--border-radius-md); text-align: left; box-shadow: var(--shadow-soft);">
                <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-green); font-family: var(--font-heading);">
                    ✓ Message Copied
                </p>
                <div id="countdown-container" style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-primary); line-height: 1.5;">
                    We've copied the message. <strong>Opening Reddit chat in <span id="reddit-countdown">10</span> seconds...</strong>
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.5;">
                    Once the Reddit tab loads, simply <strong>paste the message (Ctrl+V)</strong> into the chat box to purchase.
                </p>
                <textarea id="reddit-message-text" readonly style="width: 100%; height: 160px; border: var(--border-width) solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem; font-family: var(--font-body); font-size: 0.95rem; resize: none; background: var(--bg-primary); margin-bottom: 1.5rem; color: var(--text-primary); outline: none;">${escapeHtml(messageContent)}</textarea>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button id="copy-msg-btn" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; background: var(--accent-green); color: #fff; font-weight: 600; cursor: pointer; border-radius: var(--border-radius-sm); border: none;">
                        ✓ Auto-copied!
                    </button>
                    <a href="https://chat.reddit.com/user/t2_28jblv2vin" target="_blank" style="display: block; text-decoration: none; text-align: center; padding: 0.8rem; font-size: 0.95rem; font-weight: 600; background: var(--text-primary); color: var(--bg-primary); border-radius: var(--border-radius-sm);">
                        Open Reddit Chat Link
                    </a>
                </div>
            </div>
        `;

        // Write to clipboard automatically
        navigator.clipboard.writeText(messageContent)
            .then(() => {
                console.log("Successfully copied message draft to clipboard.");
            })
            .catch(err => {
                console.error("Auto-copy failed: ", err);
                const copyBtn = document.getElementById('copy-msg-btn');
                if (copyBtn) {
                    copyBtn.innerText = "Copy Message";
                    copyBtn.style.background = "var(--bg-secondary)";
                    copyBtn.style.color = "var(--bg-primary)";
                }
            });

        // Setup 10 seconds countdown
        let countdown = 10;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countEl = document.getElementById('reddit-countdown');
            if (countEl) {
                countEl.innerText = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                if (checkoutBtn) {
                    checkoutBtn.disabled = false;
                }
            }
        }, 1000);

        // Delayed redirection
        setTimeout(() => {
            const newWin = window.open("https://chat.reddit.com/user/t2_28jblv2vin", "_blank");
            const countdownContainer = document.getElementById('countdown-container');
            if (countdownContainer) {
                if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                    countdownContainer.innerHTML = `<span style="color: var(--accent-red); font-weight: 700; text-transform: uppercase;">⚠ Popup Blocked</span><br><span style="font-size: 0.9rem; color: var(--text-primary);">Please click 'Open Reddit Chat Link' below to message us.</span>`;
                } else {
                    countdownContainer.innerHTML = `<span style="color: var(--accent-green); font-weight: 700; text-transform: uppercase;">✓ Chat Opened</span><br><span style="font-size: 0.9rem; color: var(--text-primary);">Paste the message (Ctrl+V) in the Reddit chat tab.</span>`;
                }
            }
        }, 10000);

        // Add copy button manual click listener
        const copyBtn = document.getElementById('copy-msg-btn');
        if (copyBtn) {
            setTimeout(() => {
                if (copyBtn.innerText === "✓ Auto-copied!") {
                    copyBtn.innerText = "Copy Message";
                    copyBtn.style.background = "var(--bg-secondary)";
                    copyBtn.style.color = "var(--bg-primary)";
                }
            }, 3000);

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(messageContent)
                    .then(() => {
                        copyBtn.innerText = "✓ Copied!";
                        copyBtn.style.background = "#166534";
                        copyBtn.style.color = "#fff";
                        setTimeout(() => {
                            copyBtn.innerText = "Copy Message";
                            copyBtn.style.background = "var(--bg-secondary)";
                            copyBtn.style.color = "var(--bg-primary)";
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                        alert('Failed to copy text. Please select and copy manually.');
                    });
            });
        }
    }
}

/**
 * Reset cart status after successful checkout operation.
 */
function resetCart() {
    totalAmount = 0;
    selectedDatasetIds = [];
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (totalAmountSpan) totalAmountSpan.innerText = '0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    
    const checkboxes = document.querySelectorAll('.dataset-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
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
        
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
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