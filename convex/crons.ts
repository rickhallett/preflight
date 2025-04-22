import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "send-reminder-emails",
  { hours: 1 },
  internal.reminders.sendReminderEmails,
  {}
);

export default crons;
