import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

// --- SCHEMAS ---

const userProfileSchema = z.object({
  userId: z.string(),
  weightKg: z.number().positive(),
  activityLevel: z.enum(["sedentary", "moderate", "active", "athlete"]),
  timezone: z.string(),
});

const waterGoalSchema = z.object({
  dailyGoalMl: z.number().int().positive(),
  reasoning: z.string(),
});

const reminderScheduleSchema = z.object({
  schedule: z.array(
    z.object({
      time: z.string().describe("HH:MM format for reminder"),
      amountMl: z.number().int().positive(),
      message: z.string().describe("The personalized reminder message"),
    })
  ),
  totalVolume: z.number().int().positive().describe("The sum of all amountsMl"),
});

// --- STEPS ---

const retrieveUserProfile = createStep({
  id: "retrieve-user-profile",
  description: "Fetches user details needed for water intake calculation",
  inputSchema: z.object({
    userId: z.string().describe("The ID of the user"),
  }),
  outputSchema: userProfileSchema,
  execute: async ({ inputData }) => {
    // --- MOCK IMPLEMENTATION ---
    if (inputData.userId === "user-123") {
      return {
        userId: "user-123",
        weightKg: 75,
        activityLevel: "moderate",
        timezone: "America/Los_Angeles",
      };
    }
    throw new Error(`User ${inputData.userId} not found`);
  },
});

const calculateWaterGoal = createStep({
  id: "calculate-water-goal",
  description: "Calculates the daily recommended water goal in ml",
  inputSchema: userProfileSchema,
  outputSchema: waterGoalSchema,
  execute: async ({ inputData }) => {
    const { weightKg, activityLevel } = inputData;
    let baseMl = weightKg * 30; // 30ml per kg is a common baseline

    // Adjust based on activity
    switch (activityLevel) {
      case "moderate":
        baseMl += 300;
        break;
      case "active":
        baseMl += 600;
        break;
      case "athlete":
        baseMl += 1000;
        break;
      // 'sedentary' uses baseMl
    }

    const dailyGoalMl = Math.round(baseMl / 100) * 100; // Round to nearest 100ml

    return {
      dailyGoalMl,
      reasoning: `Based on your weight (${weightKg}kg) and ${activityLevel} activity level, your base intake is ${
        weightKg * 30
      }ml. An additional ${
        dailyGoalMl - weightKg * 30
      }ml was added for activity.`,
    };
  },
});

const generateReminders = createStep({
  id: "generate-reminders",
  description: "Uses an agent to create a personalized hydration schedule",
  inputSchema: userProfileSchema.merge(waterGoalSchema), // Combine inputs from previous steps
  outputSchema: reminderScheduleSchema,
  execute: async ({ inputData, mastra }) => {
    const { dailyGoalMl, weightKg, activityLevel, timezone } = inputData;

    const agent = mastra?.getAgent("reminderAgent"); // Conceptual agent for generation
    if (!agent) {
      throw new Error("Reminder agent not found");
    }

    const prompt = `
      Create a detailed, personalized water intake schedule for a user with the following profile:
      - Daily Water Goal: ${dailyGoalMl}ml
      - Weight: ${weightKg}kg
      - Activity Level: ${activityLevel}
      - Timezone: ${timezone}

      Guidelines:
      1. Distribute the total daily goal (${dailyGoalMl}ml) into 5 to 8 separate drinking events.
      2. Reminders should start around 8:00 and end before 22:00 in the user's timezone.
      3. Larger amounts should be suggested after the main morning and afternoon activity periods.
      4. The total volume of all 'amountMl' fields must exactly equal ${dailyGoalMl}.
      5. The 'message' should be encouraging and personalized (e.g., "Time for 300ml, stay focused on your goal!").

      Output the schedule strictly as a JSON object that conforms to the 'reminderScheduleSchema' structure.
    `;

    // Agent executes the prompt and streams back the JSON schedule
    const response = await agent.generate(prompt);

    // Assume agent.generate returns the structured JSON output directly
    const scheduleData = JSON.parse(response.text);

    // Basic validation of the total volume before returning
    const calculatedTotal = scheduleData.schedule.reduce(
      (sum: number, item: { amountMl: number }) => sum + item.amountMl,
      0
    );
    if (calculatedTotal !== dailyGoalMl) {
      throw new Error("Agent failed to distribute the total volume correctly.");
    }

    return scheduleData;
  },
});

// --- WORKFLOW ---

const waterReminderWorkflow = createWorkflow({
  id: "water-reminder-workflow",
  inputSchema: z.object({
    userId: z
      .string()
      .describe("The ID of the user to generate a reminder schedule for"),
  }),
  outputSchema: reminderScheduleSchema,
})
  .then(retrieveUserProfile) // Output: userProfileSchema
  .then(calculateWaterGoal) // Output: waterGoalSchema (Input: userProfileSchema)
  .then(generateReminders); // Input: userProfileSchema + waterGoalSchema (implicitly merged by the framework)

waterReminderWorkflow.commit();

export { waterReminderWorkflow };
