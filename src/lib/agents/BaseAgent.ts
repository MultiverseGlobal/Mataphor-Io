import { IAgent, AgentContext, AgentResult } from "./types";

export abstract class BaseAgent implements IAgent {
  abstract name: string;
  abstract description: string;

  async process(context: AgentContext): Promise<AgentResult> {
    try {
      const result = await this.execute(context);
      return result;
    } catch (error: any) {
      return { success: false, output: `Error: ${error.message}` };
    }
  }

  protected abstract execute(context: AgentContext): Promise<AgentResult>;
}
