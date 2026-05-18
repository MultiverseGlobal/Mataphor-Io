import { BaseAgent } from "./BaseAgent";
import { AgentContext, AgentResult } from "./types";

export class RouterAgent extends BaseAgent {
  name = "RouterAgent";
  description = "Routes content to the appropriate destination";

  protected async execute(context: AgentContext): Promise<AgentResult> {
    const formatted = context.runtime
      ? await context.runtime.invoke("FormatterAgent", { ...context })
      : { success: true, output: context.input };
    const inputLower = formatted.output.toLowerCase();

    let destination = "Unsorted";
    let actionType = "save";

    if (inputLower.includes("function") || inputLower.includes("const ") || inputLower.includes("import ")) {
      destination = "GitHub";
      actionType = "create_gist";
    } else if (inputLower.includes("meeting") || inputLower.includes("todo")) {
      destination = "Notion";
      actionType = "create_page";
    } else if (inputLower.includes("hey") || inputLower.includes("team")) {
      destination = "Slack";
      actionType = "send_message";
    }

    return {
      success: true,
      output: `Routed content to ${destination}`,
      metadata: { destination, confidence: 0.85 },
      actions: [{ type: actionType, payload: { destination, content: formatted.output } }],
    };
  }
}
