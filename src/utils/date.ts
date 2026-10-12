import dayjs from "dayjs";

// Formats a moment as the local YYYY-MM-DD key used by daily todo rules. Takes a
// timestamp too, so day grouping can work straight off stored numbers.
export function getLocalDateKey(date: Date | number | string = new Date()) {
  return dayjs(date).format("YYYY-MM-DD");
}

// Calculates how long the app should wait before running midnight updates.
export function getNextMidnightDelay() {
  const now = dayjs();
  const nextMidnight = now.add(1, "day").startOf("day");

  return nextMidnight.diff(now);
}

// A date picked from a day input becomes a real moment: today keeps the current
// time, any other day starts at midnight, since the time of day is unknown.
export function getTimestampForDateKey(dateKey: string, now = Date.now()) {
  if (!dateKey || !dayjs(dateKey).isValid()) return now;

  return dateKey === getLocalDateKey(now) ? now : dayjs(dateKey).startOf("day").valueOf();
}

// Replaces only the day of a timestamp, so editing a row's date keeps its time
// and the row does not jump to the top of that day.
export function getTimestampWithDateKey(timestamp: number, dateKey: string) {
  if (!dayjs(dateKey).isValid()) return timestamp;

  const day = dayjs(dateKey);

  return dayjs(timestamp).year(day.year()).month(day.month()).date(day.date()).valueOf();
}

export function getDateInputValue(dateValue: string | number | null) {
  if (dateValue === null) return "";

  const date = dayjs(dateValue);

  return date.isValid() ? date.format("YYYY-MM-DD") : "";
}
export function getTimeValue(dateValue: string | number | null) {
  if (dateValue === null) return "";

  const date = dayjs(dateValue);

  return date.isValid() ? date.format("HH:mm") : "";
}
