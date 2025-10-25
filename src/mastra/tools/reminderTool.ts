export const reminderTool = {
  name: 'reminderTool',
  description: 'Schedules and manages reminders for the user',
  parameters: {
    type: 'object',
    properties: {
      task: { type: 'string', description: 'What the reminder is about' },
      time: { type: 'string', description: 'When to remind (ISO date/time or human readable)' },
    },
    required: ['task', 'time'],
  },
  execute: async ({ task, time }: { task: string; time: string }) => {
    // In a real app, you’d integrate a scheduler or notification system
    // For now, just simulate storing and confirming the reminder
    return `✅ Reminder set: "${task}" at ${time}`;
  },
};
