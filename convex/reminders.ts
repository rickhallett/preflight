import { internalAction } from "./_generated/server";

export const sendReminderEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    // Stub for email sending logic
    console.log("Sending reminder emails...");
    return null;
  },
});
