import { BaseAgent } from "./BaseAgent";
import { AgentContext, AgentResult } from "./types";
import { classifyIntent } from "../llm";

export class SemanticRouter extends BaseAgent {
  name = "SemanticRouter";
  description = "Uses LLM to determine intent and routing for Metaphor IO";

  protected async execute(context: AgentContext): Promise<AgentResult> {
    const { input } = context;
    
    try {
      const intent = await classifyIntent(input);
      
      return {
        success: true,
        output: intent.summary || intent.type,
        metadata: { 
          type: intent.type,
          destination: intent.destination,
          entities: intent.entities,
          priority: intent.priority,
          summary: intent.summary,
          confidence: 0.98
        },
        actions: [{ 
          type: "route", 
          payload: { 
            destination: intent.destination, 
            type: intent.type,
            content: input,
            metadata: intent
          } 
        }],
      };
    } catch (error: any) {
      return {
        success: false,
        output: "Failed to classify intent",
        error: error.message
      };
    }
  }
}
