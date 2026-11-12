export type WeeklyActivity = {
  id: string;
  name: string;
  // How many times it should happen in a week.
  target: number;
  // One millisecond timestamp per time it was done, oldest first. The count for
  // any week is read back out of these, so no reset has to run on Monday.
  doneDates: number[];
  sortOrder: number;
};

export type WeeklyActivityRow = {
  id: string;
  name: unknown;
  target: unknown;
  done_dates: unknown;
  sort_order: unknown;
};

// One week of one activity, for the row of recent weeks under it.
export type WeeklyWeek = {
  // The start of that Monday, as a timestamp.
  weekStart: number;
  done: number;
  target: number;
};
