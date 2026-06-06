import type { ContextProfile } from "./contextSchema";

// ─────────────────────────────────────────────────────
// Token estimation (rough: 1 token ≈ 4 chars)
// ─────────────────────────────────────────────────────
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ─────────────────────────────────────────────────────
// compressProfile
// Trims array-based fields to fit within a token budget.
// Priority order: identity > mission > memory > projects > preferences > org
// ─────────────────────────────────────────────────────
export function compressProfile(
  profile: ContextProfile,
  tokenLimit: number = 800
): ContextProfile {
  const compressed = JSON.parse(JSON.stringify(profile)) as ContextProfile;
  const { layers } = compressed;

  const trimArrayField = (arr: string[], label: string): string[] => {
    const result: string[] = [];
    for (const item of arr) {
      const wouldBe = JSON.stringify([...result, item]);
      if (estimateTokens(wouldBe) > tokenLimit / 6) break;
      result.push(item);
    }
    return result;
  };

  layers.mission.goals = trimArrayField(layers.mission.goals, "goals");
  layers.memory.keyFacts = trimArrayField(layers.memory.keyFacts, "keyFacts");
  layers.memory.decisions = trimArrayField(layers.memory.decisions, "decisions");
  layers.projects.activeItems = trimArrayField(layers.projects.activeItems, "activeItems");
  layers.projects.priorities = trimArrayField(layers.projects.priorities, "priorities");

  // Truncate long strings
  const cap = (s: string, max = 300) => (s.length > max ? s.slice(0, max) + "…" : s);
  layers.identity.bio = cap(layers.identity.bio);
  layers.mission.successCriteria = cap(layers.mission.successCriteria);
  layers.preferences.communicationStyle = cap(layers.preferences.communicationStyle);
  layers.memory.staticGuidelines = cap(layers.memory.staticGuidelines);
  layers.org.companyContext = cap(layers.org.companyContext);

  return compressed;
}

// ─────────────────────────────────────────────────────
// prioritizeLayers
// Returns the layers sorted by relevance for a given context hint.
// ─────────────────────────────────────────────────────
type LayerKey = keyof ContextProfile["layers"];

const DEFAULT_PRIORITY: LayerKey[] = [
  "identity",
  "mission",
  "memory",
  "projects",
  "preferences",
  "org",
];

export function prioritizeLayers(
  profile: ContextProfile,
  hint?: string
): LayerKey[] {
  if (!hint) return DEFAULT_PRIORITY;

  const h = hint.toLowerCase();
  const order = [...DEFAULT_PRIORITY];

  // Reorder based on context hint keywords
  if (h.includes("org") || h.includes("team") || h.includes("company")) {
    order.unshift("org");
  } else if (h.includes("project") || h.includes("task") || h.includes("sprint")) {
    order.unshift("projects");
  } else if (h.includes("prefer") || h.includes("style") || h.includes("tone")) {
    order.unshift("preferences");
  }

  // Deduplicate
  return [...new Set(order)];
}

// ─────────────────────────────────────────────────────
// diffProfiles
// Returns which layer keys changed between two versions.
// ─────────────────────────────────────────────────────
export function diffProfiles(
  v1: ContextProfile,
  v2: ContextProfile
): LayerKey[] {
  const changed: LayerKey[] = [];
  const keys: LayerKey[] = ["identity", "mission", "projects", "preferences", "memory", "org"];

  for (const key of keys) {
    if (JSON.stringify(v1.layers[key]) !== JSON.stringify(v2.layers[key])) {
      changed.push(key);
    }
  }

  return changed;
}

// ─────────────────────────────────────────────────────
// incrementVersion — pure helper used by mutations
// ─────────────────────────────────────────────────────
export function incrementVersion(profile: ContextProfile): ContextProfile {
  return { ...profile, version: (profile.version ?? 1) + 1 };
}
