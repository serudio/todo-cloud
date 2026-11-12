import dayjs from "dayjs";
import type { WeeklyActivity, WeeklyActivityRow, WeeklyWeek } from "../types/weekly";

export const DEFAULT_WEEKLY_TARGET = 3;
export const MAX_WEEKLY_TARGET = 99;

// How much history is worth keeping: enough to see whether a habit is holding,
// not so much that the row grows forever.
export const KEPT_WEEKS = 12;

// The row of past weeks shown under an activity.
export const SHOWN_WEEKS = 6;

/**
 * The Monday that starts the week a moment falls in, as a local timestamp.
 *
 * dayjs numbers days from Sunday, so Sunday is six days into its week rather
 * than the first day of the next one.
 */
export function getWeekStart(date: number | Date = Date.now()) {
  const day = dayjs(date).startOf("day");

  return day.subtract((day.day() + 6) % 7, "day").valueOf();
}

export const getWeekEnd = (weekStart: number) => dayjs(weekStart).add(7, "day").valueOf();

/** The Monday of the week `weeksAgo` weeks before the one `date` falls in. */
export const getPastWeekStart = (weeksAgo: number, date: number | Date = Date.now()) =>
  dayjs(getWeekStart(date)).subtract(weeksAgo, "week").valueOf();

// Whole days left including today, so Monday reads as 7 and Sunday as 1.
export const getDaysLeftInWeek = (date: number = Date.now()) =>
  Math.max(1, dayjs(getWeekEnd(getWeekStart(date))).diff(dayjs(date).startOf("day"), "day"));

export const getDoneInWeek = (doneDates: number[], weekStart: number) =>
  doneDates.filter((doneDate) => doneDate >= weekStart && doneDate < getWeekEnd(weekStart)).length;

export const getDoneThisWeek = (activity: WeeklyActivity, now: number = Date.now()) =>
  getDoneInWeek(activity.doneDates, getWeekStart(now));

export const isWeeklyDone = (activity: WeeklyActivity, now: number = Date.now()) =>
  getDoneThisWeek(activity, now) >= activity.target;

/**
 * Drops anything older than the weeks worth keeping.
 *
 * Called on the way to the database rather than on the way back, so a row
 * thins out as it is used and a long-untouched one keeps whatever it had.
 */
export const pruneDoneDates = (doneDates: number[], now: number = Date.now()) => {
  const oldestKept = getPastWeekStart(KEPT_WEEKS - 1, now);

  return doneDates.filter((doneDate) => doneDate >= oldestKept).sort((first, second) => first - second);
};

export const markWeeklyDone = (activity: WeeklyActivity, at: number = Date.now()): WeeklyActivity => ({
  ...activity,
  doneDates: pruneDoneDates([...activity.doneDates, at], at),
});

/**
 * Takes back the most recent time it was done, for a mis-tap.
 *
 * Only within this week: last week's count is history, and a stray tap today
 * should not quietly eat it.
 */
export function undoWeeklyDone(activity: WeeklyActivity, now: number = Date.now()): WeeklyActivity {
  const weekStart = getWeekStart(now);
  const latest = activity.doneDates.filter((doneDate) => doneDate >= weekStart).at(-1);

  if (latest === undefined) return activity;

  const index = activity.doneDates.lastIndexOf(latest);

  return {
    ...activity,
    doneDates: [...activity.doneDates.slice(0, index), ...activity.doneDates.slice(index + 1)],
  };
}

/** The weeks before this one, oldest first, for the history row. */
export function getRecentWeeks(activity: WeeklyActivity, weeks = SHOWN_WEEKS, now: number = Date.now()): WeeklyWeek[] {
  return Array.from({ length: weeks }, (_unused, index) => {
    const weekStart = getPastWeekStart(weeks - index, now);

    return { weekStart, done: getDoneInWeek(activity.doneDates, weekStart), target: activity.target };
  });
}

/** Whether anything was ever logged in the weeks shown, so an empty row can be hidden. */
export const hasWeeklyHistory = (activity: WeeklyActivity, now: number = Date.now()) =>
  activity.doneDates.some((doneDate) => doneDate < getWeekStart(now));

export const formatWeekRange = (weekStart: number) =>
  `${dayjs(weekStart).format("D MMM")} – ${dayjs(weekStart).add(6, "day").format("D MMM")}`;

export const getNewWeeklyActivity = (sortOrder: number): Omit<WeeklyActivity, "id"> => ({
  name: "",
  target: DEFAULT_WEEKLY_TARGET,
  doneDates: [],
  sortOrder,
});

// A target typed into the box: whole, at least one, and not a number that would
// make the progress bar meaningless.
export const clampTarget = (value: number) =>
  Number.isFinite(value) ? Math.min(MAX_WEEKLY_TARGET, Math.max(1, Math.round(value))) : 1;

/**
 * Reads a row without trusting it. The column is jsonb, so anything could be in
 * there; a row that has been through an older version of the app, or none at
 * all, should still open rather than taking the page down with it.
 */
export function parseWeeklyActivity(row: WeeklyActivityRow): WeeklyActivity {
  const doneDates = Array.isArray(row.done_dates)
    ? row.done_dates.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    : [];

  return {
    id: row.id,
    name: typeof row.name === "string" ? row.name : "",
    target: typeof row.target === "number" ? clampTarget(row.target) : 1,
    doneDates: [...doneDates].sort((first, second) => first - second),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
  };
}

// Weekly things are a short, ordered list; the order they were put in is the
// order they are meant to be read in.
export const sortWeeklyActivities = (activities: WeeklyActivity[]) =>
  [...activities].sort((first, second) => first.sortOrder - second.sortOrder);
