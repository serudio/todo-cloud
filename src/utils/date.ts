import dayjs from "dayjs";

// Formats a Date as the local YYYY-MM-DD key used by daily todo rules.
export function getLocalDateKey(date = new Date()) {
  return dayjs(date).format("YYYY-MM-DD");
}

// Calculates how long the app should wait before running midnight updates.
export function getNextMidnightDelay() {
  const now = dayjs();
  const nextMidnight = now.add(1, "day").startOf("day");

  return nextMidnight.diff(now);
}

export function getDateInputValue(dateValue: string | number | null) {
  if (dateValue === null) return "";

  const date = dayjs(dateValue);

  return date.isValid() ? date.format("YYYY-MM-DD") : "";
}
