export type WeeklyActivity = {
  id: string;
  name: string;
  // How many times it should happen in a week.
  target: number;
  // One millisecond timestamp per time it was done, oldest first. The count for
  // any week is read back out of these, so no reset has to run on Monday.
  doneDates: number[];
  sortOrder: number;
  // Out of the cloud for an hour, as a timestamp that simply passes.
  snoozedUntil: number | null;
  // The local date it was pushed out of today's cloud on, so tomorrow — being a
  // different date — brings it back without anything having to run.
  notTodayDate: string | null;
};

export type WeeklyActivityRow = {
  id: string;
  name: unknown;
  target: unknown;
  done_dates: unknown;
  sort_order: unknown;
  snoozed_until: unknown;
  not_today_date: unknown;
};

// One week of one activity, for the row of recent weeks under it.
export type WeeklyWeek = {
  // The start of that Monday, as a timestamp.
  weekStart: number;
  done: number;
  target: number;
};
