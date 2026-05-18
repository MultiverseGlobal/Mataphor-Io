/**
 * Metaphor IO - Claude Content Script
 * Handles extraction and UI injection for Claude.ai
 */

console.log('Metaphor IO: Claude content script loaded');

// Configuration
const SELECTORS = {
    // These may need updates as Claude UI evolves
    messages: '.font-user-message, .font-claude-message, [data-testid="user-message"], [data-testid="assistant-message"]',
    header: 'header',
    input: 'div[contenteditable="true"]'
};

// Initialize
function init() {
    console.log('Metaphor IO: Initializing Claude integration');
    injectExportButton();
    setupMessageListener();
}

// Inject the Export button into the UI
function injectExportButton() {
    if (document.getElementById('metaphor-export-btn')) return;

    // Claude header is usually at the top
    const header = document.querySelector('header');
    if (!header) {
        setTimeout(injectExportButton, 2000);
        return;
    }

    const btn = document.createElement('button');
    btn.id = 'metaphor-export-btn';
    btn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #D97706; color: white; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export to Metaphor
        </div>
    `;
    btn.style.all = 'unset';
    btn.style.marginLeft = '12px';
    btn.style.cursor = 'pointer';

    btn.onclick = handleExport;

    header.appendChild(btn);
}

// Scrape messages and send to background script
async function handleExport() {
    console.log('Metaphor IO: Exporting Claude context...');
    const messageElements = document.querySelectorAll(SELECTORS.messages);
    
    if (messageElements.length === 0) {
        showNotification('No messages found to export.', 'error');
        return;
    }

    const messages = Array.from(messageElements).map(el => {
        const isUser = el.classList.contains('font-user-message') || el.getAttribute('data-testid') === 'user-message';
        return {
            role: isUser ? 'user' : 'assistant',
            content: el.textContent.trim()
        };
    }).filter(m => m.content);

    try {
        const response = await chrome.runtime.sendMessage({
            type: 'EXPORT_CONTEXT',
            data: {
                platform: 'claude',
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

// Paste formatted context into Claude input
function handleImport(data) {
    // Claude uses contenteditable divs
    const inputField = document.querySelector(SELECTORS.input);
    if (!inputField) {
        showNotification('Could not find Claude input field.', 'error');
        return;
    }

    inputField.focus();
    
    // For contenteditable, we can use document.execCommand or just innerText
    // innerText is safer for simple text injection
    inputField.innerText = data.formattedContent;
    
    // Trigger input events
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    
    showNotification('Context imported successfully!');
}

// Simple UI notification (Shared with ChatGPT script logic)
function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#ef4444' : '#d97706'};
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

    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Run init
init();

// Watch for navigation
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(injectExportButton, 2000);
    }
}).observe(document, { subtree: true, childList: true });
