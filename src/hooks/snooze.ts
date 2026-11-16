import { useEffect, useState } from "react";
import type { Todo } from "../types/todo";

/**
 * The time to judge snoozes against, moved on when the earliest one runs out.
 *
 * Nothing else re-renders when an hour has passed, so without this a snoozed
 * task would stay put away until something unrelated touched the page.
 */
export function useSnoozeClock(todos: Todo[]) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const nextExpiry = todos
      .map((todo) => todo.snoozedUntil)
      .filter((expiresAt): expiresAt is number => typeof expiresAt === "number" && expiresAt > now)
      .sort((first, second) => first - second)[0];

    if (!nextExpiry) return;

    const timeoutId = window.setTimeout(() => setNow(Date.now()), Math.max(0, nextExpiry - now));

    return () => window.clearTimeout(timeoutId);
  }, [now, todos]);

  return [now, setNow] as const;
}
