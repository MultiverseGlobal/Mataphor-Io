import { BaseAgent } from "./BaseAgent";
import { AgentContext, AgentResult } from "./types";

export class FormatterAgent extends BaseAgent {
  name = "FormatterAgent";
  description = "Formats content";

  protected async execute(context: AgentContext): Promise<AgentResult> {
    const output = context.input.trim();
    return { success: true, output };
  }
}
