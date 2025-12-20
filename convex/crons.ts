import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at midnight (or just periodically)
crons.daily(
    "clean-up-scheduled-deletions",
    { hourUTC: 0, minuteUTC: 0 },
    internal.users.deleteScheduledAccounts,
);

export default crons;
