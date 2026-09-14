import dayjs from "dayjs";
import type {
  DayTotal,
  PointEntry,
  PointGoal,
  PointGoalMode,
  PointGoalRow,
  PointTask,
  TaskTotal,
} from "../types/points";
import { getLocalDateKey } from "./date";

export const QUICK_POINTS = [1, 2, 5, 10];
export const FREQUENT_TASK_COUNT = 5;
export const DEFAULT_TARGET_POINTS = 200;

export const getGoalModeLabel = (mode: PointGoalMode) => (mode === "checklist" ? "checklist" : "points log");

export const getNewEntry = (task: string, points: number, date = getLocalDateKey()): PointEntry => ({
  id: crypto.randomUUID(),
  date,
  task,
  points,
});

export const getNewTask = (name: string, points: number): PointTask => ({
  id: crypto.randomUUID(),
  name,
  points,
  doneDate: null,
});

export const getTotalPoints = (entries: PointEntry[]) => entries.reduce((total, entry) => total + entry.points, 0);

// A crossed-off task is worth exactly what a logged entry is worth, so the charts
// and the progress ring can read both modes through the same shape.
export const getTaskEntries = (tasks: PointTask[]): PointEntry[] =>
  tasks.flatMap((task) =>
    task.doneDate ? [{ id: task.id, date: task.doneDate, task: task.name, points: task.points }] : [],
  );

export const getGoalEntries = (goal: Pick<PointGoal, "mode" | "entries" | "tasks">) =>
  goal.mode === "checklist" ? getTaskEntries(goal.tasks) : goal.entries;

// Unfinished first in their own order, finished last and most recent of those first.
export function getSortedTasks(tasks: PointTask[]): PointTask[] {
  const openTasks = tasks.filter((task) => !task.doneDate);
  const doneTasks = tasks
    .filter((task) => task.doneDate)
    .sort((first, second) => (second.doneDate ?? "").localeCompare(first.doneDate ?? ""));

  return [...openTasks, ...doneTasks];
}

export const getTasksTotalPoints = (tasks: PointTask[]) => tasks.reduce((total, task) => total + task.points, 0);

// Newest first, and stable within a day so a re-render never reshuffles rows.
export const getSortedEntries = (entries: PointEntry[]) =>
  [...entries].sort((first, second) => second.date.localeCompare(first.date));

export function getTaskTotals(entries: PointEntry[]): TaskTotal[] {
  const totalsByTask = new Map<string, TaskTotal>();

  // Entries are walked oldest first so lastPoints ends up holding the newest value.
  for (const entry of [...entries].sort((first, second) => first.date.localeCompare(second.date))) {
    const existingTotal = totalsByTask.get(entry.task);

    totalsByTask.set(entry.task, {
      task: entry.task,
      points: (existingTotal?.points ?? 0) + entry.points,
      count: (existingTotal?.count ?? 0) + 1,
      lastPoints: entry.points,
    });
  }

  return [...totalsByTask.values()].sort((first, second) => second.points - first.points);
}

// The tasks worth a one-tap button: whatever gets logged most often.
export const getFrequentTasks = (entries: PointEntry[], limit = FREQUENT_TASK_COUNT) =>
  [...getTaskTotals(entries)].sort((first, second) => second.count - first.count).slice(0, limit);

export const getTaskNames = (entries: PointEntry[]) => [...new Set(entries.map((entry) => entry.task))].sort();

// One row per day that has entries, carrying both that day's points and the
// running total, so a bar chart and a cumulative chart can share the same data.
export function getDayTotals(entries: PointEntry[]): DayTotal[] {
  const pointsByDate = new Map<string, number>();

  for (const entry of entries) {
    pointsByDate.set(entry.date, (pointsByDate.get(entry.date) ?? 0) + entry.points);
  }

  let runningTotal = 0;

  return [...pointsByDate.entries()]
    .sort((first, second) => first[0].localeCompare(second[0]))
    .map(([date, points]) => {
      runningTotal += points;

      return { date, points, total: runningTotal };
    });
}

export const formatDayLabel = (date: string) => dayjs(date).format("MMM D");

export function getProgress(entries: PointEntry[], targetPoints: number) {
  const total = getTotalPoints(entries);
  const target = Math.max(targetPoints, 1);

  return {
    total,
    remaining: Math.max(target - total, 0),
    ratio: Math.min(Math.max(total / target, 0), 1),
    isReached: total >= target,
  };
}

function parseTasks(tasks: unknown): PointTask[] {
  if (!Array.isArray(tasks)) return [];

  return tasks.flatMap((task) => {
    if (!task || typeof task !== "object") return [];

    const { id, name, points, doneDate } = task as Record<string, unknown>;
    if (typeof id !== "string" || typeof name !== "string") return [];
    if (typeof points !== "number" || !Number.isFinite(points)) return [];

    const isDone = typeof doneDate === "string" && dayjs(doneDate).isValid();

    return [{ id, name, points: Math.round(points), doneDate: isDone ? (doneDate as string) : null }];
  });
}

function parseEntries(entries: unknown): PointEntry[] {
  if (!Array.isArray(entries)) return [];

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const { id, date, task, points } = entry as Record<string, unknown>;
    if (typeof id !== "string" || typeof task !== "string") return [];
    if (typeof date !== "string" || !dayjs(date).isValid()) return [];
    if (typeof points !== "number" || !Number.isFinite(points)) return [];

    return [{ id, date, task, points: Math.round(points) }];
  });
}

export function parsePointGoal(row: PointGoalRow): PointGoal {
  const targetPoints =
    typeof row.target_points === "number" && Number.isFinite(row.target_points)
      ? Math.max(Math.round(row.target_points), 1)
      : DEFAULT_TARGET_POINTS;

  return {
    id: row.id,
    mode: row.mode === "checklist" ? "checklist" : "log",
    name: typeof row.name === "string" ? row.name : "",
    targetPoints,
    entries: parseEntries(row.entries),
    tasks: parseTasks(row.tasks),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}
