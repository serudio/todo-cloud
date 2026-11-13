import { useEffect, useState } from "react";
import { getLocalDateKey, getNextMidnightDelay } from "../utils/date";

/**
 * Today's date, kept true while the page stays open.
 *
 * A tab is often left open for days, and plenty of what is shown is answering
 * "today": what has already been counted this morning, what was set aside
 * until tomorrow. Nothing re-renders at midnight on its own, so without this
 * the page would keep answering yesterday's question until it was touched.
 */
export function useToday() {
  const [today, setToday] = useState(getLocalDateKey);
  // The timer is re-armed from this rather than from the date, because the
  // date is not guaranteed to change when the timer fires: a clock that runs
  // a moment early would set the same day again, React would skip the render,
  // and nothing would ever arm the next one.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // A second past the hour, so the clock has certainly crossed it.
    const timeoutId = window.setTimeout(() => {
      setToday(getLocalDateKey());
      setTick((previousTick) => previousTick + 1);
    }, getNextMidnightDelay() + 1000);

    return () => window.clearTimeout(timeoutId);
  }, [tick]);

  return today;
}
