import { NextResponse } from "next/server";
import { Orchestrator } from "@/lib/agents/Orchestrator";
import { RouterAgent } from "@/lib/agents/RouterAgent";
import { FormatterAgent } from "@/lib/agents/FormatterAgent";

const orchestrator = new Orchestrator();
orchestrator.register("RouterAgent", () => new RouterAgent());
orchestrator.register("FormatterAgent", () => new FormatterAgent());

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      const stripped = raw.replace(/^['"]|['"]$/g, "");
      try {
        body = JSON.parse(stripped);
      } catch {
        const params = new URLSearchParams(stripped);
        if (params.size > 0) {
          body = Object.fromEntries(params.entries());
        }
      }
    }
    if (!body || typeof body !== "object") {
      const url = new URL(request.url);
      const params = url.searchParams;
      body = {
        input: params.get("input"),
        agentName: params.get("agentName") ?? undefined,
        pipeline: params.getAll("pipeline"),
      };
    }
    const input: string = body.input;
    const agentName: string | undefined = body.agentName;
    const pipeline: string[] | undefined = body.pipeline;

    if (!input) return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 });

    const baseContext = { userId: "demo-user", input };

    const result = pipeline && pipeline.length > 0
      ? await orchestrator.runPipeline(pipeline, baseContext)
      : await orchestrator.invoke(agentName ?? "RouterAgent", baseContext);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
