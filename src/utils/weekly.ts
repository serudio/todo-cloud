import dayjs from "dayjs";
import type { Todo } from "../types/todo";
import type { WeeklyWeek } from "../types/weekly";
import { KEPT_WEEKS, SHOWN_WEEKS } from "../constants/weekly";
import { getLocalDateKey } from "./date";
import { getNewTodo } from "./todos";

export { DEFAULT_WEEKLY_TARGET, KEPT_WEEKS, MAX_WEEKLY_TARGET, SHOWN_WEEKS, WEEKLY_TARGETS } from "../constants/weekly";

/** A task the week wants a number of times rather than once. */
export const isWeeklyTodo = (todo: Todo) => todo.weeklyTarget !== null;

export const getWeeklyTodos = (todos: Todo[]) => todos.filter(isWeeklyTodo);

/** How many times a week it is asked for. One, for anything that is not weekly. */
export const getWeeklyTarget = (todo: Todo) => todo.weeklyTarget ?? 1;

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

export const getDoneThisWeek = (todo: Todo, now: number = Date.now()) =>
  getDoneInWeek(todo.weeklyDoneDates, getWeekStart(now));

export const isWeeklyDone = (todo: Todo, now: number = Date.now()) =>
  getDoneThisWeek(todo, now) >= getWeeklyTarget(todo);

/** Already counted once today, whatever is still owed for the rest of the week. */
export const isWeeklyDoneToday = (todo: Todo, now: number = Date.now()) => {
  const dayStart = dayjs(now).startOf("day").valueOf();
  const dayEnd = dayjs(dayStart).add(1, "day").valueOf();

  return todo.weeklyDoneDates.some((doneDate) => doneDate >= dayStart && doneDate < dayEnd);
};

/**
 * Drops anything older than the weeks worth keeping.
 *
 * Called on the way into the list rather than on the way out, so a task thins
 * out as it is used and a long-untouched one keeps whatever it had.
 */
export const pruneDoneDates = (doneDates: number[], now: number = Date.now()) => {
  const oldestKept = getPastWeekStart(KEPT_WEEKS - 1, now);

  return doneDates.filter((doneDate) => doneDate >= oldestKept).sort((first, second) => first - second);
};

/**
 * Counts one off.
 *
 * A quota is never "done" the way a task is — the week's count is read from
 * these timestamps — so this leaves `done` alone and only clears the two ways
 * it was being put off: having just done one, it is not being avoided.
 */
export const markWeeklyDone = (todo: Todo, at: number = Date.now()): Todo => ({
  ...todo,
  weeklyDoneDates: pruneDoneDates([...todo.weeklyDoneDates, at], at),
  snoozedUntil: null,
  notToday: false,
  notTodayDate: null,
});

/**
 * Takes back the most recent time it was done, for a mis-tap.
 *
 * Only within this week: last week's count is history, and a stray tap today
 * should not quietly eat it.
 */
export function undoWeeklyDone(todo: Todo, now: number = Date.now()): Todo {
  const weekStart = getWeekStart(now);
  const latest = todo.weeklyDoneDates.filter((doneDate) => doneDate >= weekStart).at(-1);

  if (latest === undefined) return todo;

  const index = todo.weeklyDoneDates.lastIndexOf(latest);

  return {
    ...todo,
    weeklyDoneDates: [...todo.weeklyDoneDates.slice(0, index), ...todo.weeklyDoneDates.slice(index + 1)],
  };
}

/**
 * Where the whole week stands.
 *
 * Each task counts for at most its own target, so reading twice as much as
 * planned cannot quietly stand in for the yoga that never happened — the bar
 * is "how much of the week is done", not "how much was done this week".
 */
export function getWeekTotals(todos: Todo[], now: number = Date.now()) {
  const weeklyTodos = getWeeklyTodos(todos);
  const done = weeklyTodos.reduce(
    (total, todo) => total + Math.min(getDoneThisWeek(todo, now), getWeeklyTarget(todo)),
    0,
  );
  const target = weeklyTodos.reduce((total, todo) => total + getWeeklyTarget(todo), 0);

  return { done, target, ratio: target ? done / target : 0, isDone: target > 0 && done >= target };
}

/**
 * This week day by day, Monday first: what was counted on each, which one is
 * today, and which have already gone.
 *
 * The week's total says how much is left; this says how it has been spread,
 * which is the other half of pacing a week — five things on Sunday is not the
 * same week as one a day.
 */
export function getWeekDays(todos: Todo[], now: number = Date.now()) {
  const weekStart = getWeekStart(now);
  const todayIndex = dayjs(now).startOf("day").diff(dayjs(weekStart), "day");
  const weeklyTodos = getWeeklyTodos(todos);

  return Array.from({ length: 7 }, (_unused, index) => {
    const dayStart = dayjs(weekStart).add(index, "day").valueOf();
    const dayEnd = dayjs(dayStart).add(1, "day").valueOf();
    const done = weeklyTodos.reduce(
      (total, todo) =>
        total + todo.weeklyDoneDates.filter((doneDate) => doneDate >= dayStart && doneDate < dayEnd).length,
      0,
    );

    return { dayStart, done, isToday: index === todayIndex, isPast: index < todayIndex };
  });
}

/** The weeks before this one, oldest first, for the history row. */
export function getRecentWeeks(todo: Todo, weeks = SHOWN_WEEKS, now: number = Date.now()): WeeklyWeek[] {
  return Array.from({ length: weeks }, (_unused, index) => {
    const weekStart = getPastWeekStart(weeks - index, now);

    return {
      weekStart,
      done: getDoneInWeek(todo.weeklyDoneDates, weekStart),
      target: getWeeklyTarget(todo),
    };
  });
}

/** Whether anything was ever logged in the weeks shown, so an empty row can be hidden. */
export const hasWeeklyHistory = (todo: Todo, now: number = Date.now()) =>
  todo.weeklyDoneDates.some((doneDate) => doneDate < getWeekStart(now));

export const formatWeekRange = (weekStart: number) =>
  `${dayjs(weekStart).format("D MMM")} – ${dayjs(weekStart).add(6, "day").format("D MMM")}`;

/** A new weekly task: an ordinary one, with a week's count on it. */
export const getNewWeeklyTodo = (target: number): Todo => ({
  ...getNewTodo(""),
  weeklyTarget: target,
  weeklyDoneDates: [],
});

/**
 * What is still owed today first, then what today is already done with, then
 * what the whole week is done with.
 *
 * Something counted today is not finished, but it is not this afternoon's
 * problem either, so it steps aside without going all the way down to where
 * the finished things live. Within each group the order they were added holds,
 * so the list only moves when something has actually happened.
 */
const getWeeklyRank = (todo: Todo, now: number) => {
  if (isWeeklyDone(todo, now)) return 2;

  return isWeeklyDoneToday(todo, now) ? 1 : 0;
};

export const sortWeeklyByRemaining = (todos: Todo[], now: number = Date.now()) =>
  [...todos].sort((first, second) => getWeeklyRank(first, now) - getWeeklyRank(second, now));

// Kept for the places that ask "is this one hidden for today", so the weekly
// screens read the same flags the cloud does rather than their own copy.
export const isWeeklyNotToday = (todo: Todo, today: string = getLocalDateKey()) =>
  todo.notToday && todo.notTodayDate === today;
