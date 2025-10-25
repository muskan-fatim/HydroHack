export const hydrationTool = {
  name: 'hydrationTool',
  description: 'Logs and checks user hydration habits',
  parameters: {
    type: 'object',
    properties: {
      lastDrinkTime: { type: 'string', description: 'ISO timestamp of last water intake' },
    },
  },
  execute: async ({ lastDrinkTime }: { lastDrinkTime: string }) => {
    const hoursSince = (Date.now() - new Date(lastDrinkTime).getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 2) return "Time to drink a glass of water!";
    return "You're well hydrated!";
  },
};
