import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/../convex/_generated/api";
import { SemanticRouter } from "@/lib/agents/SemanticRouter";

const router = new SemanticRouter();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticatedNextjs();
    const token = await convexAuthNextjsToken();

    if (!authenticated || !token) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    convex.setAuth(token);

    const body = await request.json();
    const { source_platform, messages, structured_context, original_url } = body;

    let finalContext = structured_context;
    let combinedInput = "";

    // 1. If raw messages are provided, attempt LLM structuring via SemanticRouter
    if (messages && messages.length > 0) {
      combinedInput = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      try {
        // Retrieve active profile to get a userId context
        const profile = await convex.query(api.profiles.getActiveProfile);
        const userId = profile ? profile._id : "demo-user";
        
        const routerResult = await router.process({ userId, input: combinedInput });
        if (routerResult.success && routerResult.metadata) {
          finalContext = routerResult.metadata;
        }
      } catch (routerError) {
        console.error("Semantic Routing failed, falling back to local structure:", routerError);
      }
    }

    // 2. Fail-safe: Ensure we have some structured context
    if (!finalContext) {
      throw new Error("Invalid request: Neither raw messages nor structured_context was provided.");
    }

    // 3. Generate a slug if not present
    const slug = finalContext.slug || Math.random().toString(36).substring(2, 10);

    // Save to Convex
    const contextId = await convex.mutation(api.contexts.createContext, {
      sourcePlatform: source_platform,
      structuredContext: finalContext,
      originalUrl: original_url || undefined,
      rawContent: combinedInput || undefined,
      slug: slug,
    });

    // Tangibility Layer: Optional Notion Sync (Plugin Pattern)
    if (process.env.NOTION_TOKEN && finalContext.type) {
      try {
        const { pushToNotion } = await import("@/lib/notion");
        await pushToNotion(combinedInput || JSON.stringify(finalContext), finalContext.type);
      } catch (notionError) {
        console.error("Notion Sync failed (non-blocking):", notionError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: contextId, slug },
      intent: finalContext.type,
      summary: finalContext.summary
    });

  } catch (error: any) {
    console.error("Context API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
