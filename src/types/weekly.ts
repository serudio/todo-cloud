// One week of one weekly task, for the row of recent weeks under it.
export type WeeklyWeek = {
  // The start of that Monday, as a timestamp.
  weekStart: number;
  done: number;
  target: number;
};
