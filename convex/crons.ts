import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Daily cleanup of expired trash (projects deleted > 30 days ago).
 * Runs at 02:00 AM UTC.
 */
crons.daily(
  "purge-expired-trash",
  { hourUTC: 2, minuteUTC: 0 },
  internal.functions.storage.cleanup.purgeExpiredTrash
);

export default crons;
