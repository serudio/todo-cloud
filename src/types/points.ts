export type PointEntry = {
  id: string;
  // A millisecond timestamp: when the task was actually logged, not just which
  // day it fell on, so entries sort and group without parsing text.
  date: number;
  task: string;
  points: number;
};

// 'log' records points as they are earned; 'checklist' crosses off agreed tasks.
export type PointGoalMode = "log" | "checklist";

// A checklist task is worth its points once doneDate is set.
export type PointTask = {
  id: string;
  name: string;
  points: number;
  doneDate: number | null;
};

export type PointGoal = {
  id: string;
  mode: PointGoalMode;
  name: string;
  targetPoints: number;
  entries: PointEntry[];
  tasks: PointTask[];
  updatedAt: string | null;
};

export type PointGoalRow = {
  id: string;
  mode: unknown;
  name: unknown;
  target_points: unknown;
  entries: unknown;
  tasks: unknown;
  updated_at?: unknown;
};

export type TaskTotal = {
  task: string;
  points: number;
  count: number;
  lastPoints: number;
};

export type DayTotal = {
  // The start of that local day, as a timestamp.
  date: number;
  points: number;
  total: number;
};
