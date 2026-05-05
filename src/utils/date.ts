import dayjs from "dayjs";

// Formats a Date as the local YYYY-MM-DD key used by daily todo rules.
export function getLocalDateKey(date = new Date()) {
  return dayjs(date).format("YYYY-MM-DD");
}
s;
