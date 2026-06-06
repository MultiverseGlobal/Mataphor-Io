import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { compressProfile, prioritizeLayers } from "../src/lib/context-engine/engine";
import type { ContextProfile } from "../src/lib/context-engine/contextSchema";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/v1/profile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // 1. Authenticate the API Key
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer mtphr_")) {
      return new Response("Unauthorized: Missing or invalid Bearer token", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const apiKeyRecord = await ctx.runQuery(api.apiKeys.getApiKey, { key: token });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return new Response("Unauthorized: Invalid or revoked API key", { status: 401 });
    }

    // 2. Fetch the user's active profile
    const profile = await ctx.runQuery(api.profiles.getActiveProfileByUserId, {
      userId: apiKeyRecord.userId,
    });

    if (!profile) {
      return new Response("No active profile found", { status: 404 });
    }

    // 3. Process the profile (optional formatting)
    const url = new URL(request.url);
    const hint = url.searchParams.get("hint") || undefined;
    const format = url.searchParams.get("format") || "json";

    // Extract exactly what we want to return
    const contextProfile: ContextProfile = {
      name: profile.name,
      is_active: profile.isActive,
      version: profile.version,
      layers: {
        identity: profile.identity,
        mission: profile.mission,
        projects: profile.projects,
        preferences: profile.preferences,
        memory: profile.memory,
        org: profile.org,
      }
    };

    const compressed = compressProfile(contextProfile);
    const order = prioritizeLayers(compressed, hint);

    // Update lastUsed timestamp async
    await ctx.runMutation(api.apiKeys.updateKeyLastUsed, { id: apiKeyRecord._id });

    return new Response(JSON.stringify({
      status: "success",
      data: {
        profile: compressed,
        priorityOrder: order
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Handle CORS preflight
http.route({
  path: "/api/v1/profile",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }),
});

// ─── POST /api/v1/transfer ──────────────────────────────────────────────────
// Platforms call this after successfully injecting context to log the event.
http.route({
  path: "/api/v1/transfer",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer mtphr_")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const apiKeyRecord = await ctx.runQuery(api.apiKeys.getApiKey, { key: token });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return new Response("Unauthorized: Invalid or revoked API key", { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { contextId, sourcePlatform, targetPlatform, transferTimeMs, manualFixesRequired } = body;

    if (!contextId || !sourcePlatform || !targetPlatform) {
      return new Response("Missing required fields: contextId, sourcePlatform, targetPlatform", { status: 400 });
    }

    const transferId = await ctx.runMutation(api.transfers.createTransfer, {
      userId: apiKeyRecord.userId,
      contextId,
      sourcePlatform,
      targetPlatform,
      transferTimeMs: typeof transferTimeMs === "number" ? transferTimeMs : undefined,
      manualFixesRequired: Boolean(manualFixesRequired),
    });

    return new Response(JSON.stringify({ status: "ok", transferId }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/v1/transfer",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }),
});

export default http;

