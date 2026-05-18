import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifyIntent(input: string) {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback for demo
    const lowInput = input.toLowerCase();
    if (lowInput.includes('rust') || lowInput.includes('architecture') || lowInput.includes('weave')) {
      return { 
        type: 'Blueprint', 
        summary: 'Low-level capture engine architecture for Project Weave',
        entities: { stack: ['rust', 'ipc'], projects: ['Weave'], people: ['User'] },
        priority: 'High',
        destination: 'Notion / Architecture' 
      };
    }
    if (lowInput.includes('buy') || lowInput.includes('todo')) return { type: 'Task', destination: 'Notion / Tasks' };
    if (input.startsWith('http')) return { type: 'Resource', destination: 'Notion / Resources' };
    return { type: 'Inbox', summary: 'General conversation capture', destination: 'Notion / Inbox' };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are Metaphor IO's Infrastructure Intelligence Layer. 
        Extract a high-fidelity structure from the AI conversation snippet.
        
        Intent Categories:
        - Task: Actionable todos or next steps.
        - Resource: Technical references, URLs, or data.
        - Decision: A choice made during the conversation.
        - Blueprint: Architectural design, code structure, or logic flows.
        - Inquiry: A core question that needs answering.

        Return ONLY JSON: 
        { 
          "type": "Task" | "Resource" | "Decision" | "Blueprint" | "Inquiry", 
          "summary": "One sentence summary",
          "entities": {
            "stack": ["rust", "nextjs", etc],
            "projects": ["Metaphor", "Weave", etc],
            "people": ["Sam", "User"]
          },
          "priority": "High" | "Medium" | "Low",
          "reason": "short explanation"
        }`
      },
      { role: "user", content: input }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  const destNames: Record<string, string> = {
    "Task": "Notion / Tasks",
    "Resource": "Notion / Resources",
    "Decision": "Notion / Vault",
    "Blueprint": "Notion / Architecture",
    "Inquiry": "Notion / Inbox"
  };

  return {
    ...result,
    destination: destNames[result.type] || "Notion / Inbox"
  };
}
