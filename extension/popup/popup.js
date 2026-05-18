/**
 * Metaphor IO - Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    const contextContainer = document.getElementById('context-container');
    const actionsSection = document.getElementById('actions');
    const importBtn = document.getElementById('import-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const statusMsg = document.getElementById('status-msg');

    // 1. Load the last captured context from local storage
    const { lastContext } = await chrome.storage.local.get('lastContext');

    if (lastContext) {
        renderContext(lastContext);
        actionsSection.style.display = 'block';
    }

    // 2. Handle Import
    importBtn.addEventListener('click', async () => {
        if (!lastContext) return;

        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';

        try {
            // Determine target platform based on current URL
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isClaude = tab.url?.includes('claude.ai');
            const isChatGPT = tab.url?.includes('chat.openai.com') || tab.url?.includes('chatgpt.com');
            
            const targetPlatform = isClaude ? 'claude' : (isChatGPT ? 'chatgpt' : null);

            if (!targetPlatform) {
                alert('Please open ChatGPT or Claude to import context.');
                return;
            }

            // Request the background script to format and inject
            const response = await chrome.runtime.sendMessage({
                type: 'IMPORT_TO_TAB',
                data: {
                    context: lastContext.structuredContext,
                    targetPlatform: targetPlatform
                }
            });

            if (response.success) {
                statusMsg.style.display = 'block';
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed: ' + error.message);
        } finally {
            importBtn.disabled = false;
            importBtn.textContent = 'Import to Current AI';
        }
    });

    // 3. Open Dashboard
    dashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    });

    function renderContext(ctx) {
        const sc = ctx.structuredContext;
        const time = new Date(ctx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format constraints list if available
        const constraintsHtml = sc.entities?.constraints?.length > 0
            ? `<div style="font-size: 11px; color: #fbbf24; margin-top: 6px; display: flex; flex-direction: column; gap: 2px;">
                <strong style="text-transform: uppercase; font-size: 9px; color: #f59e0b; letter-spacing: 0.05em;">Constraints:</strong>
                ${sc.entities.constraints.slice(0, 2).map(c => `<span style="background: rgba(251, 191, 36, 0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">! ${c}</span>`).join('')}
               </div>`
            : '';

        // Format architecture if available
        const archHtml = sc.architecture
            ? `<div style="font-size: 11px; color: #60a5fa; margin-top: 6px; display: flex; flex-direction: column; gap: 2px;">
                <strong style="text-transform: uppercase; font-size: 9px; color: #3b82f6; letter-spacing: 0.05em;">Architecture:</strong>
                <span style="background: rgba(59, 130, 246, 0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sc.architecture}</span>
               </div>`
            : '';
        
        contextContainer.innerHTML = `
            <div class="context-card">
                <div class="context-header">
                    <span class="platform-badge">${ctx.platform.toUpperCase()}</span>
                    <span style="color: var(--text-muted)">${time}</span>
                </div>
                <div class="context-summary">
                    ${sc.summary || sc.coreIntent?.slice(0, 80) || 'Untitled Context'}
                </div>
                <div class="meta-row">
                    <span class="meta-tag">${sc.type || 'Note'}</span>
                    ${sc.priority === 'High' ? '<span class="meta-tag" style="color: #f87171; background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.2);">HIGH PRIORITY</span>' : ''}
                    ${sc.entities?.stack?.slice(0, 2).map(tech => `<span class="meta-tag">${tech}</span>`).join('')}
                </div>
                ${archHtml}
                ${constraintsHtml}
            </div>
        `;
    }
});
