import { z } from 'zod';

/**
 * 5-Part Context Structure Schema
 * 
 * This is the stable, model-agnostic format for storing conversation context.
 * Each part serves a specific purpose in preserving conversation state.
 */
export const StructuredContextSchema = z.object({
    // Primary goal or question being addressed
    coreIntent: z.string().min(1, 'Core intent is required'),

    // Key facts, definitions, data points, and constraints
    keyFacts: z.array(z.string()).default([]),

    // Decisions or choices made during the conversation
    decisions: z.array(z.string()).default([]),

    // Unresolved questions or items pending clarification
    openQuestions: z.array(z.string()).default([]),

    // Summary of the context
    summary: z.string().default(''),

    // Classification of the intent
    type: z.enum(['Blueprint', 'Decision', 'Task', 'Note']).default('Note'),

    // Urgency level
    priority: z.enum(['Low', 'Medium', 'High']).default('Low'),

    // High-level project structure or mental model
    architecture: z.string().default(''),

    // Extracted entities
    entities: z.object({
        stack: z.array(z.string()).default([]),
        projects: z.array(z.string()).default([]),
        constraints: z.array(z.string()).default([]),
    }).default({ stack: [], projects: [], constraints: [] }),

    // Tone, style, assumptions, or other conversational constraints
    toneConstraints: z.string().default(''),
});

export type StructuredContext = z.infer<typeof StructuredContextSchema>;

/**
 * Message type for raw conversation extraction
 */
export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

/**
 * Platform type
 */
export type Platform = 'chatgpt' | 'claude';

/**
 * Context metadata
 */
export interface ContextMetadata {
    id?: string;
    userId?: string;
    sourcePlatform: Platform;
    originalUrl?: string;
    createdAt?: string;
}

/**
 * Full context with metadata
 */
export interface FullContext extends ContextMetadata {
    structuredContext: StructuredContext;
}

/**
 * Validate structured context
 */
export function validateContext(data: unknown): StructuredContext {
    return StructuredContextSchema.parse(data);
}

/**
 * Create empty context template
 */
export function createEmptyContext(): StructuredContext {
    return {
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
}
