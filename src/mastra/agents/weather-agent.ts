import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { hydrationTool } from '../tools/hydration-tool';

export const waterReminderAgent = new Agent({
  name: 'Water Reminder Agent',
  instructions: `
    You are a friendly assistant that helps users stay hydrated.
    Your goals:
    - Remind users to drink water regularly.
    - If a user shares their schedule or daily goals, set personalized reminders.
    - Encourage healthy hydration habits.
    - If the user hasn't logged their last drink time, ask when they last drank water.
    - Keep tone positive, short, and motivational.
  `,
  model: 'google/gemini-flash-1.5',
  tools: { hydrationTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
