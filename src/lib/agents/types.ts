export interface AgentAction {
  type: string;
  payload: any;
}

export interface AgentResult {
  success: boolean;
  output: string;
  actions?: AgentAction[];
  metadata?: Record<string, any>;
}

export interface AgentRuntime {
  invoke: (agentName: string, context: AgentContext, options?: { depth?: number }) => Promise<AgentResult>;
}

export interface AgentContext {
  userId: string;
  input: string;
  metadata?: Record<string, any>;
  runtime?: AgentRuntime;
}

export interface IAgent {
  name: string;
  description: string;
  process(context: AgentContext): Promise<AgentResult>;
}
