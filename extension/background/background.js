/**
 * Background Service Worker
 * Handles context extraction, storage, and communication with Metaphor IO API
 */

const API_BASE_URL = 'http://localhost:3000/api';
const DASHBOARD_URL = 'http://localhost:3000/dashboard';

console.log('Metaphor IO: Background service worker initialized');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Metaphor IO: Received message:', message.type);

    if (message.type === 'EXPORT_CONTEXT') {
        handleExportContext(message.data)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((error) => {
                console.error('Export error:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep channel open for async response
    }

    if (message.type === 'GET_LAST_CONTEXT') {
        getLastContext()
            .then((context) => sendResponse({ success: true, data: context }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message.type === 'IMPORT_TO_TAB') {
        importToCurrentTab(message.data)
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function handleExportContext(data) {
    const { platform, messages, url } = data;

    console.log(`Metaphor IO: Processing ${messages.length} messages from ${platform}`);

    // Structure the context using simple heuristics
    const structuredContext = structureMessages(messages);

    console.log('Metaphor IO: Structured context:', structuredContext);

    // Store in chrome.storage for quick access
    await chrome.storage.local.set({
        lastContext: {
            platform,
            structuredContext,
            url,
            timestamp: Date.now()
        }
    });

    // Try to save to API (if user is logged in)
    try {
        await saveToAPI(platform, structuredContext, url, messages);
        console.log('Metaphor IO: Saved to API');
    } catch (error) {
        console.warn('Metaphor IO: Could not save to API (user may not be logged in):', error);
    }

    return { contextId: Date.now().toString(), platform };
}

function structureMessages(messages) {
    const context = {
        coreIntent: '',
        summary: '',
        type: 'Note',
        priority: 'Low',
        architecture: '',
        entities: { stack: [], projects: [], constraints: [] },
        keyFacts: [],
        decisions: [],
        openQuestions: [],
        toneConstraints: ''
    };

    if (messages.length === 0) return context;

    // 1. Core Intent & Initial Summary
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
        context.coreIntent = firstUserMsg.content.slice(0, 500);
        const firstSentence = firstUserMsg.content.split(/[.!?]/)[0];
        context.summary = firstSentence.length > 100 
            ? firstSentence.slice(0, 97) + '...' 
            : firstSentence.trim();
    }

    // 2. Global Heuristics (Classification & Priority)
    const hasCode = messages.some(m => m.content.includes('```'));
    const decisionWords = ['decided', 'chose', 'opted', 'selection', 'consensus', 'we will go with'];
    const taskWords = ['todo', 'task', 'implement', 'fix', 'build', 'create', 'setup', 'action item'];
    const priorityWords = ['asap', 'urgent', 'blocker', 'immediately', 'critical', 'high priority'];

    if (hasCode) {
        context.type = 'Blueprint';
    } else if (messages.some(m => decisionWords.some(w => m.content.toLowerCase().includes(w)))) {
        context.type = 'Decision';
    } else if (messages.some(m => taskWords.some(w => m.content.toLowerCase().includes(w)))) {
        context.type = 'Task';
    }

    if (messages.some(m => priorityWords.some(w => m.content.toLowerCase().includes(w)))) {
        context.priority = 'High';
    }

    // 3. Detail Extraction
    const techKeywords = [
        'React', 'Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'Node', 'Python', 
        'Docker', 'AWS', 'Vercel', 'PostgreSQL', 'Prisma', 'Zod', 'Framer Motion'
    ];

    messages.forEach(msg => {
        const content = msg.content;

        // Tech Stack
        techKeywords.forEach(tech => {
            if (new RegExp(`\\b${tech}\\b`, 'i').test(content) && !context.entities.stack.includes(tech)) {
                context.entities.stack.push(tech);
            }
        });

        // Constraints
        const constraintKeywords = ['must', 'should not', 'cannot', 'limited to', 'required', 'restriction'];
        if (constraintKeywords.some(kw => content.toLowerCase().includes(kw))) {
            const sentences = content.split(/[.!?]/);
            sentences.forEach(s => {
                if (constraintKeywords.some(kw => s.toLowerCase().includes(kw))) {
                    const cleanS = s.trim();
                    if (cleanS && !context.entities.constraints.includes(cleanS)) {
                        context.entities.constraints.push(cleanS);
                    }
                }
            });
        }

        // Architecture (Heuristic: Look for folder paths or component names)
        const archPatterns = [
            /(\w+\/\w+\.\w+)/g, // file paths
            /(\w+\s+component)/gi,
            /(architecture|infrastructure|database schema|folder structure)/gi
        ];
        archPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                const match = content.match(pattern);
                if (match && !context.architecture.includes(match[0])) {
                    context.architecture += (context.architecture ? '; ' : '') + match[0];
                }
            }
        });

        // Questions
        const questions = content.match(/[^.!?]+\?/g) || [];
        questions.forEach(q => {
            if (context.openQuestions.length < 5 && !context.openQuestions.includes(q.trim())) {
                context.openQuestions.push(q.trim());
            }
        });

        // Decisions (Heuristic)
        const decisions = content.match(/(?:I'll|We'll|Let's|I will|We will)[^.?!]+\./gi) || [];
        decisions.forEach(d => {
            if (context.decisions.length < 10 && !context.decisions.includes(d.trim())) {
                context.decisions.push(d.trim());
            }
        });
    });

    return context;
}

async function saveToAPI(platform, structuredContext, url, messages) {
    const response = await fetch(`${API_BASE_URL}/contexts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            source_platform: platform,
            structured_context: structuredContext,
            original_url: url,
            messages: messages
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

async function getLastContext() {
    const result = await chrome.storage.local.get('lastContext');
    return result.lastContext || null;
}

async function importToCurrentTab(data) {
    const { context, targetPlatform } = data;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
        throw new Error('No active tab found');
    }

    // Format the context into a prompt
    const formattedContent = formatContext(context, targetPlatform);

    // Send import message to content script
    await chrome.tabs.sendMessage(tab.id, {
        type: 'IMPORT_CONTEXT',
        data: { formattedContent }
    });
}

function formatContext(context, targetPlatform) {
    const sections = [];
    sections.push(`--- METAPHOR IO CONTEXT BRIDGE ---`);
    sections.push(`CORE INTENT: ${context.coreIntent}`);
    if (context.summary) sections.push(`SUMMARY: ${context.summary}`);

    // 2. Cognitive Architecture
    if (context.architecture) {
        sections.push(`\n[ARCHITECTURAL BLUEPRINT]`);
        sections.push(context.architecture);
    }

    if (context.keyFacts?.length > 0) {
        sections.push(`\n[KEY FACTS]`);
        context.keyFacts.forEach(fact => sections.push(`- ${fact}`));
    }

    if (context.decisions?.length > 0) {
        sections.push(`\n[DECISIONS MADE]`);
        context.decisions.forEach(decision => sections.push(`- ${decision}`));
    }

    if (context.entities?.stack?.length > 0 || context.entities?.projects?.length > 0 || context.entities?.constraints?.length > 0) {
        sections.push(`\n[RELEVANT ENTITIES]`);
        if (context.entities.stack?.length > 0) sections.push(`Stack: ${context.entities.stack.join(', ')}`);
        if (context.entities.projects?.length > 0) sections.push(`Projects: ${context.entities.projects.join(', ')}`);
        if (context.entities.constraints?.length > 0) {
            sections.push(`Constraints:`);
            context.entities.constraints.forEach(c => sections.push(`  ! ${c}`));
        }
    }

    // 3. Open Threads
    if (context.openQuestions?.length > 0) {
        sections.push(`\n[OPEN QUESTIONS]`);
        context.openQuestions.forEach(q => sections.push(`? ${q}`));
    }

    if (context.toneConstraints) {
        sections.push(`\n[TONE & STYLE]`);
        sections.push(context.toneConstraints);
    }

    sections.push(`\n--- END CONTEXT ---`);
    
    sections.push(`\n[ORIENTATION DIRECTIVE]`);
    if (targetPlatform === 'chatgpt') {
        sections.push(`ChatGPT, this is a HIGH-FIDELITY RE-HYDRATION. You are resuming a deep technical session. 
1. INTERNALIZE: Adopt the 'Decisions' and 'Key Facts' as immutable history.
2. ORIENT: Use the 'Architectural Blueprint' to map your current mental model.
3. EXECUTE: Do not summarize this input. Respond only with a technical confirmation of your orientation and propose the immediate next step for the 'Core Intent'.`);
    } else {
        sections.push(`Claude, you are receiving a COGNITIVE TRANSMISSION of a specific session state.
1. ASSIMILATE: The 'Decisions' and 'Architecture' provided are your ground truth for this project.
2. CONSTRAINTS: Strictly adhere to the 'Relevant Entities' and 'Constraints' listed.
3. RESPONSE: Acknowledge the architecture and decisions. Do not offer a general summary. Suggest the most efficient path forward for the 'Core Intent'.`);
    }

    return sections.join('\n');
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open dashboard
    chrome.tabs.create({ url: DASHBOARD_URL });
});
