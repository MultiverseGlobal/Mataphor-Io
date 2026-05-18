import { NextResponse } from "next/server";
import { SemanticRouter } from "@/lib/agents/SemanticRouter";
import { pushToNotion } from "@/lib/notion";

const router = new SemanticRouter();

export async function POST(request: Request) {
  try {
    const { text, action, intent } = await request.json();

    if (action === "detect") {
      const result = await router.process({ userId: "demo", input: text });
      return NextResponse.json(result);
    }

    if (action === "confirm") {
      // The pipe execution
      await pushToNotion(text, intent.type);
      return NextResponse.json({ success: true, message: "Successfully routed to Notion" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
