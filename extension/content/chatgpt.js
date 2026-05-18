/**
 * Metaphor IO - ChatGPT Content Script
 * Handles extraction and UI injection for ChatGPT
 */

console.log('Metaphor IO: ChatGPT content script loaded');

// Configuration
const SELECTORS = {
    messages: '[data-message-author-role]',
    header: 'header',
    input: '#prompt-textarea'
};

// Initialize
function init() {
    console.log('Metaphor IO: Initializing ChatGPT integration');
    injectExportButton();
    setupMessageListener();
}

// Inject the Export button into the UI
function injectExportButton() {
    // Check if button already exists
    if (document.getElementById('metaphor-export-btn')) return;

    // Find a suitable place in the header
    const header = document.querySelector('header');
    if (!header) {
        setTimeout(injectExportButton, 2000);
        return;
    }

    const btn = document.createElement('button');
    btn.id = 'metaphor-export-btn';
    btn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #00A67E; color: white; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Context
        </div>
    `;
    btn.style.all = 'unset';
    btn.style.marginLeft = '12px';
    btn.style.cursor = 'pointer';

    btn.onclick = handleExport;

    // Insert near the user profile/menu
    header.appendChild(btn);
}

// Scrape messages and send to background script
async function handleExport() {
    console.log('Metaphor IO: Exporting context...');
    const messageElements = document.querySelectorAll(SELECTORS.messages);
    
    if (messageElements.length === 0) {
        showNotification('No messages found to export.', 'error');
        return;
    }

    const messages = Array.from(messageElements).map(el => ({
        role: el.getAttribute('data-message-author-role'),
        content: el.textContent.trim()
    })).filter(m => m.content);

    try {
        const response = await chrome.runtime.sendMessage({
            type: 'EXPORT_CONTEXT',
            data: {
                platform: 'chatgpt',
                messages: messages,
                url: window.location.href
            }
        });

        if (response.success) {
            showNotification('Context exported successfully!');
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Metaphor IO: Export failed', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Setup listener for imports from background
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'IMPORT_CONTEXT') {
            handleImport(message.data);
            sendResponse({ success: true });
        }
    });
}

// Paste formatted context into ChatGPT input
function handleImport(data) {
    const textarea = document.querySelector(SELECTORS.input);
    if (!textarea) {
        showNotification('Could not find ChatGPT input field.', 'error');
        return;
    }

    // Clear and focus
    textarea.focus();
    textarea.value = data.formattedContent;
    
    // Trigger input event for React/Next.js to detect change
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    showNotification('Context imported successfully!');
}

// Simple UI notification
function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 8px;
        z-index: 99999;
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        transform: translateY(-20px);
        opacity: 0;
    `;
    notification.textContent = text;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);

    // Animate out
    setTimeout(() => {
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Run init
init();

// Watch for URL changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(injectExportButton, 2000);
    }
}).observe(document, { subtree: true, childList: true });
