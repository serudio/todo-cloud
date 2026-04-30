import { useState } from "react";

const MOBILE_PANEL_QUERY = "(max-width: 820px)";

export function useMobileCollapsedState() {
  return useState(() => {
    if (typeof window === "undefined") return false;

    return window.matchMedia(MOBILE_PANEL_QUERY).matches;
  });
}
