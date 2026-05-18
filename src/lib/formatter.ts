import { StructuredContext } from './contextSchema';

/**
 * Formats a structured context into a high-fidelity "Re-hydration Prompt"
 * designed to orient an AI or human collaborator.
 */
export function formatContextForImport(context: StructuredContext, targetPlatform: 'chatgpt' | 'claude'): string {
    const sections = [];

    // 1. Header & Identity
    sections.push(`--- METAPHOR IO CONTEXT BRIDGE ---`);
    sections.push(`CORE INTENT: ${context.coreIntent}`);
    
    if (context.summary) {
        sections.push(`SUMMARY: ${context.summary}`);
    }

    // 2. Cognitive Architecture
    if (context.architecture) {
        sections.push(`\n[ARCHITECTURAL BLUEPRINT]`);
        sections.push(context.architecture);
    }

    if (context.keyFacts.length > 0) {
        sections.push(`\n[KEY FACTS]`);
        context.keyFacts.forEach(fact => sections.push(`- ${fact}`));
    }

    if (context.decisions.length > 0) {
        sections.push(`\n[DECISIONS MADE]`);
        context.decisions.forEach(decision => sections.push(`- ${decision}`));
    }

    if (context.entities.stack.length > 0 || context.entities.projects.length > 0 || context.entities.constraints.length > 0) {
        sections.push(`\n[RELEVANT ENTITIES]`);
        if (context.entities.stack.length > 0) sections.push(`Stack: ${context.entities.stack.join(', ')}`);
        if (context.entities.projects.length > 0) sections.push(`Projects: ${context.entities.projects.join(', ')}`);
        if (context.entities.constraints.length > 0) {
            sections.push(`Constraints:`);
            context.entities.constraints.forEach(c => sections.push(`  ! ${c}`));
        }
    }

    // 3. Open Threads
    if (context.openQuestions.length > 0) {
        sections.push(`\n[OPEN QUESTIONS]`);
        context.openQuestions.forEach(q => sections.push(`? ${q}`));
    }

    // 4. Tone & Constraints
    if (context.toneConstraints) {
        sections.push(`\n[CONSTRAINTS/TONE]`);
        sections.push(context.toneConstraints);
    }

    // 5. The Orientation Directive
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

/**
 * Short-form summary for compact displays (e.g. extension popup)
 */
export function getShortSummary(context: StructuredContext): string {
    return context.summary || context.coreIntent.slice(0, 60) + '...';
}
