import { IAgent, AgentContext, AgentResult, AgentRuntime } from "./types";

type Factory = () => IAgent;

export class Orchestrator {
  private registry = new Map<string, Factory>();
  private maxDepth = 5;

  register(name: string, factory: Factory) {
    this.registry.set(name, factory);
  }

  async invoke(agentName: string, context: AgentContext, depth = 0): Promise<AgentResult> {
    if (depth > this.maxDepth) return { success: false, output: "Max depth exceeded" };
    const factory = this.registry.get(agentName);
    if (!factory) return { success: false, output: `Agent not found: ${agentName}` };
    const agent = factory();
    const runtime: AgentRuntime = {
      invoke: (name, ctx, options) => this.invoke(name, ctx, (options?.depth ?? depth) + 1),
    };
    const extended = { ...context, runtime };
    return agent.process(extended);
  }

  async runPipeline(names: string[], context: AgentContext): Promise<AgentResult> {
    let ctx = context;
    let last: AgentResult = { success: true, output: "" };
    for (const name of names) {
      const res = await this.invoke(name, ctx);
      last = res;
      ctx = { ...ctx, input: res.output, metadata: { ...(ctx.metadata ?? {}), ...(res.metadata ?? {}) } };
      if (!res.success) break;
    }
    return last;
  }
}
