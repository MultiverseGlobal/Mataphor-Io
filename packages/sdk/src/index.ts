export interface MetaphorConfig {
  /** The API Key generated from the Metaphor IO Developer Portal */
  apiKey: string;
  /**
   * The base URL of the Metaphor IO instance.
   * Defaults to production: "https://metaphor-io.convex.cloud" or similar.
   */
  baseUrl?: string;
}

export interface ContextProfile {
  name: string;
  version: number;
  layers: {
    identity: any;
    mission: any;
    projects: any;
    preferences: any;
    memory: any;
    org: any;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    profile: ContextProfile;
    priorityOrder: string[];
  };
}

export class MetaphorClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: MetaphorConfig) {
    if (!config.apiKey) {
      throw new Error("MetaphorClient requires an apiKey.");
    }
    this.apiKey = config.apiKey;
    // For local dev, users can override baseUrl to http://127.0.0.1:3210
    this.baseUrl = config.baseUrl || "https://api.metaphor.io";
  }

  /**
   * Fetch the active Context Profile for the authenticated user.
   * 
   * @param hint - Optional keyword string to re-prioritize profile layers (e.g. "team", "project").
   * @returns The user's Context Profile and the prioritized layer ordering.
   */
  async getProfile(hint?: string): Promise<ProfileResponse> {
    const url = new URL(`${this.baseUrl}/api/v1/profile`);
    if (hint) {
      url.searchParams.set("hint", hint);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Metaphor API Error (${res.status}): ${text}`);
    }

    return await res.json();
  }

  // Future method placeholder
  async requestAccess(): Promise<void> {
    throw new Error("Metaphor IO OAuth/SSO flow not yet implemented in this SDK version.");
  }
}

/**
 * Convenience default export
 */
export default MetaphorClient;
