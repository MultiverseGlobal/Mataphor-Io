import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Mapping intent types to specific Database IDs
const DATABASE_MAP: Record<string, string | undefined> = {
  "Task": process.env.NOTION_TASKS_DB_ID,
  "Resource": process.env.NOTION_RESOURCES_DB_ID,
  "CRM": process.env.NOTION_CRM_DB_ID,
  "Inbox": process.env.NOTION_INBOX_DB_ID,
};

export async function pushToNotion(content: string, type: string) {
  const databaseId = DATABASE_MAP[type] || DATABASE_MAP["Inbox"];
  
  if (!databaseId) {
    throw new Error(`No Database ID configured for type: ${type}`);
  }

  const title = content.split('\n')[0].substring(0, 100);

  // Note: Different databases might have different schemas. 
  // For Phase 1, we assume a basic 'Name' (title) property exists across all.
  return await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      // Optional: Add a 'MetaphorType' tag if the database supports it
      ...(type ? {
        "Category": {
          select: { name: type }
        }
      } : {})
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: content,
              },
            },
          ],
        },
      },
    ],
  });
}
