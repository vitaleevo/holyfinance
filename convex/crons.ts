import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at midnight (or just periodically)
crons.daily(
    "clean-up-scheduled-deletions",
    { hourUTC: 0, minuteUTC: 0 },
    internal.users.deleteScheduledAccounts,
);

crons.daily(
    "check-goal-deadlines",
    { hourUTC: 1, minuteUTC: 0 },
    internal.goals.checkDeadlines,
);

crons.daily(
    "check-upcoming-debts",
    { hourUTC: 1, minuteUTC: 30 },
    internal.debts.checkUpcoming,
);

export default crons;
