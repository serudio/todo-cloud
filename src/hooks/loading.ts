import { useEffect, useRef, useState } from "react";

/**
 * True while something is happening, and for at least a moment after it
 * started: a reload usually takes a fraction of a second, and a loader that
 * comes and goes faster than it can be read says nothing at all.
 */
export const useShownAtLeast = (isActive: boolean, minimumMs = 600) => {
  const [isShown, setIsShown] = useState(isActive);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      startedAtRef.current = Date.now();
      setIsShown(true);
      return;
    }

    const remaining = minimumMs - (Date.now() - startedAtRef.current);
    if (remaining <= 0) {
      setIsShown(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setIsShown(false), remaining);

    return () => window.clearTimeout(timeoutId);
  }, [isActive, minimumMs]);

  return isShown;
};
