import { useLayoutEffect, useRef, useState } from "react";

/**
 * For a wrapping row of chips cut to its first line: how many sit below it.
 *
 * Measured rather than guessed, since that depends on the names and the width
 * of the window, and measured again whenever either changes.
 */
export const useHiddenPastFirstRow = <Element extends HTMLElement>(dependency: unknown) => {
  const ref = useRef<Element>(null);
  const [hiddenCount, setHiddenCount] = useState(0);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const measure = () => {
      const children = Array.from(container.children) as HTMLElement[];
      const firstTop = children[0]?.offsetTop ?? 0;
      setHiddenCount(children.filter((child) => child.offsetTop > firstTop).length);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [dependency]);

  return { ref, hiddenCount };
};
