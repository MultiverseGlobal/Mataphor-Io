import type { Message, StructuredContext } from './contextSchema';

/**
 * Extract conversation context from ChatGPT HTML
 */
export function extractChatGPTContext(html: string): Message[] {
    const messages: Message[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const messageElements = doc.querySelectorAll('[data-message-author-role]');

    messageElements.forEach((element) => {
        const role = element.getAttribute('data-message-author-role');
        const content = element.textContent?.trim() || '';

        if (role && content) {
            messages.push({
                role: role as 'user' | 'assistant',
                content,
            });
        }
    });

    return messages;
}

/**
 * Extract conversation context from Claude HTML
 */
export function extractClaudeContext(html: string): Message[] {
    const messages: Message[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const messageElements = doc.querySelectorAll('.font-user-message, .font-claude-message, [data-testid="user-message"], [data-testid="assistant-message"]');

    messageElements.forEach((element) => {
        const isUser = element.classList.contains('font-user-message') || element.getAttribute('data-testid') === 'user-message';
        const content = element.textContent?.trim() || '';

        if (content) {
            messages.push({
                role: isUser ? 'user' : 'assistant',
                content,
            });
        }
    });

    return messages;
}

/**
 * Structure raw messages into rich context format using heuristics
 */
export function structureContext(messages: Message[]): StructuredContext {
    const context: StructuredContext = {
        coreIntent: '',
        summary: '',
        type: 'Note',
        priority: 'Low',
        architecture: '',
        entities: { stack: [], projects: [], constraints: [] },
        keyFacts: [],
        decisions: [],
        openQuestions: [],
        toneConstraints: '',
    };

    if (messages.length === 0) {
        return context;
    }

    // 1. Core Intent & Initial Summary
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
        context.coreIntent = firstUserMessage.content.slice(0, 500);
        const firstSentence = firstUserMessage.content.split(/[.!?]/)[0];
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

    // 3. Entity & Detail Extraction
    const techKeywords = [
        'React', 'Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'Node', 'Python', 
        'Docker', 'AWS', 'Vercel', 'PostgreSQL', 'Prisma', 'Zod', 'Framer Motion',
        'Capacitor', 'iOS', 'Android', 'Swift', 'Kotlin'
    ];

    const factPatterns = [
        /(?:^|\. )([A-Z][^.?!]+(?:is|are|was|were|means|refers to)[^.?!]+\.)/g,
        /(?:^|\. )((?:The|A|An) [^.?!]+(?:is|are)[^.?!]+\.)/g,
    ];

    const decisionPatterns = [
        /(?:^|\. )((?:I'll|We'll|Let's|I will|We will)[^.?!]+\.)/gi,
        /(?:^|\. )((?:I decided|We decided|I chose|We chose)[^.?!]+\.)/gi,
    ];

    messages.forEach((message) => {
        const content = message.content;

        // Tech Stack
        techKeywords.forEach(tech => {
            if (new RegExp(`\\b${tech}\\b`, 'i').test(content) && !context.entities.stack.includes(tech)) {
                context.entities.stack.push(tech);
            }
        });

        // Project Mentions (@ProjectName)
        const projectMatches = content.match(/@(\w+)/g);
        if (projectMatches) {
            projectMatches.forEach(p => {
                const name = p.slice(1);
                if (!context.entities.projects.includes(name)) {
                    context.entities.projects.push(name);
                }
            });
        }

        // Facts
        factPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && !context.keyFacts.includes(match[1])) {
                    context.keyFacts.push(match[1].trim());
                }
            }
        });

        // Decisions
        decisionPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && !context.decisions.includes(match[1])) {
                    context.decisions.push(match[1].trim());
                }
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
        const questionMatches = content.matchAll(/([^.?!]+\?)/g);
        for (const match of questionMatches) {
            if (match[1] && !context.openQuestions.includes(match[1])) {
                context.openQuestions.push(match[1].trim());
            }
        }
    });

    // 4. Tone Detection
    const hasTechnicalTerms = messages.some(m =>
        /(?:function|class|API|database|server|client|architecture|infrastructure)/i.test(m.content)
    );

    const toneIndicators: string[] = [];
    if (hasCode) toneIndicators.push('technical/code-heavy');
    if (hasTechnicalTerms) toneIndicators.push('developer-focused');
    context.toneConstraints = toneIndicators.join(', ') || 'conversational';

    // 5. Cleanup & Limits
    context.keyFacts = context.keyFacts.slice(0, 10);
    context.decisions = context.decisions.slice(0, 10);
    context.openQuestions = context.openQuestions.slice(0, 5);

    return context;
}

/**
 * Extract and structure context in one step
 */
export function extractAndStructure(html: string, platform: 'chatgpt' | 'claude'): StructuredContext {
    const messages = platform === 'chatgpt'
        ? extractChatGPTContext(html)
        : extractClaudeContext(html);

    return structureContext(messages);
}
