import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { SemanticRouter } from "@/lib/agents/SemanticRouter";

const router = new SemanticRouter();

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Get session to identify user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || "00000000-0000-0000-0000-000000000000"; // Fallback for testing

    const body = await request.json();
    const { source_platform, messages, structured_context, original_url } = body;

    let finalContext = structured_context;
    let combinedInput = "";

    // 1. If raw messages are provided, attempt LLM structuring via SemanticRouter
    if (messages && messages.length > 0) {
      combinedInput = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      try {
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

    // Save to Supabase
    const { data, error } = await supabase
      .from("contexts")
      .insert({
        user_id: userId,
        source_platform,
        original_url,
        structured_context: finalContext,
        raw_content: combinedInput || null
      })
      .select()
      .single();

    if (error) throw error;
    
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
      data,
      intent: finalContext.type,
      summary: finalContext.summary
    });

  } catch (error: any) {
    console.error("Context API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
