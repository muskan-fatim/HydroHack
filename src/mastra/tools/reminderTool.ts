const schedule = require("node-schedule");
const notifier = require("node-notifier");

export const reminderTool = {
  name: "reminderTool",
  description: "Schedules and manages reminders for the user",
  parameters: {
    type: "object",
    properties: {
      task: { type: "string", description: "What the reminder is about" },
      time: {
        type: "string",
        description: "When to remind (ISO date/time or human readable)",
      },
    },
    required: ["task", "time"],
  },
  execute: async ({ task, time }: { task: string; time: string }) => {
    try {
      const reminderDate = new Date(time);
      if (isNaN(reminderDate.getTime())) {
        return "⚠️ Invalid date format. Please use ISO format like 2025-10-25T16:40:00.";
      }

      schedule.scheduleJob(reminderDate, function () {
        console.log(`⏰ Reminder: ${task}`);
        notifier.notify({
          title: "💧 Water Reminder",
          message: `Time to ${task}!`,
          sound: true,
          wait: false,
        });
      });

      return `✅ Reminder set for "${task}" at ${reminderDate.toLocaleString()}. You’ll get a desktop popup at that time.`;
    } catch (err) {
      return `❌ Failed to set reminder: ${err}`;
    }
  },
};
