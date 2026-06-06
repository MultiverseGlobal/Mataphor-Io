import { z } from 'zod';

export const IdentitySchema = z.object({
  name: z.string().default(''),
  role: z.string().default(''),
  bio: z.string().default(''),
  organization: z.string().default(''),
});

export const MissionSchema = z.object({
  goals: z.array(z.string()).default([]),
  currentProject: z.string().default(''),
  successCriteria: z.string().default(''),
});

export const ProjectsSchema = z.object({
  activeItems: z.array(z.string()).default([]),
  priorities: z.array(z.string()).default([]),
  timeline: z.string().default(''),
});

export const PreferencesSchema = z.object({
  communicationStyle: z.string().default(''),
  tone: z.string().default(''),
  format: z.string().default(''),
});

export const MemorySchema = z.object({
  keyFacts: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  staticGuidelines: z.string().default(''),
});

export const OrgSchema = z.object({
  companyContext: z.string().default(''),
  brandVoice: z.string().default(''),
});

export const ContextProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().default('Default Profile'),
  is_active: z.boolean().default(true),
  version: z.number().int().positive().default(1),
  layers: z.object({
    identity: IdentitySchema.default({}),
    mission: MissionSchema.default({}),
    projects: ProjectsSchema.default({}),
    preferences: PreferencesSchema.default({}),
    memory: MemorySchema.default({}),
    org: OrgSchema.default({}),
  }).default({}),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type IdentityLayer = z.infer<typeof IdentitySchema>;
export type MissionLayer = z.infer<typeof MissionSchema>;
export type ProjectsLayer = z.infer<typeof ProjectsSchema>;
export type PreferencesLayer = z.infer<typeof PreferencesSchema>;
export type MemoryLayer = z.infer<typeof MemorySchema>;
export type OrgLayer = z.infer<typeof OrgSchema>;
export type ContextProfile = z.infer<typeof ContextProfileSchema>;

/**
 * Validate a raw object against the ContextProfile Zod schema.
 */
export function validateProfile(data: unknown): ContextProfile {
  return ContextProfileSchema.parse(data);
}

/**
 * Creates a clean, empty profile structure.
 */
export function createEmptyProfile(): ContextProfile {
  return {
    name: 'Default Profile',
    is_active: true,
    version: 1,
    layers: {
      identity: { name: '', role: '', bio: '', organization: '' },
      mission: { goals: [], currentProject: '', successCriteria: '' },
      projects: { activeItems: [], priorities: [], timeline: '' },
      preferences: { communicationStyle: '', tone: '', format: '' },
      memory: { keyFacts: [], decisions: [], staticGuidelines: '' },
      org: { companyContext: '', brandVoice: '' },
    },
  };
}

/**
 * Perform a deep merge of update data into an existing ContextProfile.
 */
export function mergeProfiles(
  existing: ContextProfile,
  updates: Partial<ContextProfile> & { layers?: Partial<ContextProfile['layers']> }
): ContextProfile {
  const mergedLayers = {
    identity: { ...existing.layers.identity, ...updates.layers?.identity },
    mission: {
      ...existing.layers.mission,
      ...updates.layers?.mission,
      goals: updates.layers?.mission?.goals ?? existing.layers.mission.goals,
    },
    projects: {
      ...existing.layers.projects,
      ...updates.layers?.projects,
      activeItems: updates.layers?.projects?.activeItems ?? existing.layers.projects.activeItems,
      priorities: updates.layers?.projects?.priorities ?? existing.layers.projects.priorities,
    },
    preferences: { ...existing.layers.preferences, ...updates.layers?.preferences },
    memory: {
      ...existing.layers.memory,
      ...updates.layers?.memory,
      keyFacts: updates.layers?.memory?.keyFacts ?? existing.layers.memory.keyFacts,
      decisions: updates.layers?.memory?.decisions ?? existing.layers.memory.decisions,
    },
    org: { ...existing.layers.org, ...updates.layers?.org },
  };

  return {
    ...existing,
    ...updates,
    layers: mergedLayers,
    version: updates.version ?? existing.version,
  };
}
