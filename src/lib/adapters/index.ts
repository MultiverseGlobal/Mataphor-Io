import type { ContextProfile } from "@/lib/context-engine/contextSchema";
import { compressProfile, prioritizeLayers } from "@/lib/context-engine/engine";

export type Platform = "chatgpt" | "claude" | "gemini" | "generic";

// ─────────────────────────────────────────────────────
// Primary entry point
// ─────────────────────────────────────────────────────
export function formatForPlatform(
  profile: ContextProfile,
  platform: Platform,
  hint?: string
): string {
  const compressed = compressProfile(profile);
  const layerOrder = prioritizeLayers(compressed, hint);

  switch (platform) {
    case "chatgpt":
      return formatForChatGPT(compressed, layerOrder);
    case "claude":
      return formatForClaude(compressed, layerOrder);
    case "gemini":
      return formatForGemini(compressed, layerOrder);
    case "generic":
    default:
      return formatGeneric(compressed, layerOrder);
  }
}

// ─────────────────────────────────────────────────────
// Shared layer renderer — returns plain sections
// ─────────────────────────────────────────────────────
type LayerKey = keyof ContextProfile["layers"];

function renderLayers(profile: ContextProfile, order: LayerKey[]): string {
  const { layers } = profile;
  const sections: string[] = [];

  for (const key of order) {
    switch (key) {
      case "identity": {
        const { name, role, organization, bio } = layers.identity;
        if (!name && !role) break;
        const parts = [name && `Name: ${name}`, role && `Role: ${role}`, organization && `Org: ${organization}`, bio && `Bio: ${bio}`].filter(Boolean);
        sections.push(`IDENTITY\n${parts.join("\n")}`);
        break;
      }
      case "mission": {
        const { goals, currentProject, successCriteria } = layers.mission;
        const parts: string[] = [];
        if (currentProject) parts.push(`Current project: ${currentProject}`);
        if (goals.length) parts.push(`Goals:\n${goals.map((g) => `  • ${g}`).join("\n")}`);
        if (successCriteria) parts.push(`Success looks like: ${successCriteria}`);
        if (parts.length) sections.push(`MISSION\n${parts.join("\n")}`);
        break;
      }
      case "projects": {
        const { activeItems, priorities, timeline } = layers.projects;
        const parts: string[] = [];
        if (activeItems.length) parts.push(`Active:\n${activeItems.map((i) => `  • ${i}`).join("\n")}`);
        if (priorities.length) parts.push(`Priorities:\n${priorities.map((p) => `  • ${p}`).join("\n")}`);
        if (timeline) parts.push(`Timeline: ${timeline}`);
        if (parts.length) sections.push(`PROJECTS\n${parts.join("\n")}`);
        break;
      }
      case "preferences": {
        const { communicationStyle, tone, format } = layers.preferences;
        const parts = [communicationStyle && `Style: ${communicationStyle}`, tone && `Tone: ${tone}`, format && `Format: ${format}`].filter(Boolean);
        if (parts.length) sections.push(`PREFERENCES\n${parts.join("\n")}`);
        break;
      }
      case "memory": {
        const { keyFacts, decisions, staticGuidelines } = layers.memory;
        const parts: string[] = [];
        if (keyFacts.length) parts.push(`Key facts:\n${keyFacts.map((f) => `  • ${f}`).join("\n")}`);
        if (decisions.length) parts.push(`Decisions made:\n${decisions.map((d) => `  • ${d}`).join("\n")}`);
        if (staticGuidelines) parts.push(`Guidelines: ${staticGuidelines}`);
        if (parts.length) sections.push(`MEMORY\n${parts.join("\n")}`);
        break;
      }
      case "org": {
        const { companyContext, brandVoice } = layers.org;
        const parts = [companyContext && `Context: ${companyContext}`, brandVoice && `Brand voice: ${brandVoice}`].filter(Boolean);
        if (parts.length) sections.push(`ORG\n${parts.join("\n")}`);
        break;
      }
    }
  }

  return sections.join("\n\n");
}

// ─────────────────────────────────────────────────────
// ChatGPT — markdown system instruction block
// ─────────────────────────────────────────────────────
function formatForChatGPT(profile: ContextProfile, order: LayerKey[]): string {
  const body = renderLayers(profile, order);
  return `## Context Profile — ${profile.name} (v${profile.version})

The following context has been automatically injected by Metaphor IO.
Treat this as established background — do not ask the user to re-explain it.

${body}

---
Metaphor IO • context infrastructure`;
}

// ─────────────────────────────────────────────────────
// Claude — XML tag structure
// ─────────────────────────────────────────────────────
function formatForClaude(profile: ContextProfile, order: LayerKey[]): string {
  const { layers } = profile;

  const xmlSections: string[] = [];
  for (const key of order) {
    switch (key) {
      case "identity":
        xmlSections.push(
          `  <identity>\n    <name>${layers.identity.name}</name>\n    <role>${layers.identity.role}</role>\n    <organization>${layers.identity.organization}</organization>\n    <bio>${layers.identity.bio}</bio>\n  </identity>`
        );
        break;
      case "mission":
        xmlSections.push(
          `  <mission>\n    <current_project>${layers.mission.currentProject}</current_project>\n    <goals>${layers.mission.goals.map((g) => `\n      <goal>${g}</goal>`).join("")}\n    </goals>\n    <success_criteria>${layers.mission.successCriteria}</success_criteria>\n  </mission>`
        );
        break;
      case "memory":
        xmlSections.push(
          `  <memory>\n    <key_facts>${layers.memory.keyFacts.map((f) => `\n      <fact>${f}</fact>`).join("")}\n    </key_facts>\n    <decisions>${layers.memory.decisions.map((d) => `\n      <decision>${d}</decision>`).join("")}\n    </decisions>\n    <guidelines>${layers.memory.staticGuidelines}</guidelines>\n  </memory>`
        );
        break;
      case "preferences":
        xmlSections.push(
          `  <preferences>\n    <style>${layers.preferences.communicationStyle}</style>\n    <tone>${layers.preferences.tone}</tone>\n    <format>${layers.preferences.format}</format>\n  </preferences>`
        );
        break;
      case "projects":
        xmlSections.push(
          `  <projects>\n    <active>${layers.projects.activeItems.map((i) => `\n      <item>${i}</item>`).join("")}\n    </active>\n    <timeline>${layers.projects.timeline}</timeline>\n  </projects>`
        );
        break;
      case "org":
        xmlSections.push(
          `  <org>\n    <context>${layers.org.companyContext}</context>\n    <brand_voice>${layers.org.brandVoice}</brand_voice>\n  </org>`
        );
        break;
    }
  }

  return `<context_profile name="${profile.name}" version="${profile.version}">\n${xmlSections.join("\n")}\n</context_profile>\n\nThis context has been injected by Metaphor IO. Resume directly — no re-introduction needed.`;
}

// ─────────────────────────────────────────────────────
// Gemini — system instruction format (plain, concise)
// ─────────────────────────────────────────────────────
function formatForGemini(profile: ContextProfile, order: LayerKey[]): string {
  const body = renderLayers(profile, order);
  return `[SYSTEM — Context Profile: ${profile.name} v${profile.version}]

${body}

This context was automatically loaded by Metaphor IO. Continue from this state without asking the user to re-explain their background.`;
}

// ─────────────────────────────────────────────────────
// Generic — plain text, works anywhere
// ─────────────────────────────────────────────────────
function formatGeneric(profile: ContextProfile, order: LayerKey[]): string {
  const body = renderLayers(profile, order);
  return `=== METAPHOR IO CONTEXT PROFILE ===
${profile.name} • Version ${profile.version}

${body}

=== END CONTEXT PROFILE ===
Resume from this context. No need for re-introduction.`;
}
